
-- ============================================================================
-- Healthy Golden Years
-- Donation idempotency and payment initialization
-- ============================================================================

-- 1. Store each logical donation attempt.
-- One idempotency key can identify only one donation.

create table if not exists public.donation_attempts (
    id uuid primary key default gen_random_uuid(),

    idempotency_key text not null unique,
    request_fingerprint text not null,

    merchant_reference text not null unique,
    globalpay_reference text,

    amount numeric(12, 2) not null
        check (amount >= 100 and amount <= 999999.99),

    frequency text not null
        check (frequency in ('one-time', 'monthly')),

    -- Contains donor details needed for payment initialization.
    -- Access is restricted to the server-side service role.
    request_payload jsonb not null,

    checkout_url text,

    status text not null default 'initializing'
        check (
            status in (
                'initializing',
                'initialization_unknown',
                'initialized',
                'successful',
                'failed',
                'expired'
            )
        ),

    provider_response_code text,
    last_error_code text,

    initialization_started_at timestamptz,
    initialization_completed_at timestamptz,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint donation_idempotency_key_length
        check (char_length(idempotency_key) between 16 and 200),

    constraint donation_fingerprint_format
        check (request_fingerprint ~ '^[a-f0-9]{64}$')
);

-- 2. Indexes for operational queries.

create index if not exists idx_donation_attempts_status
    on public.donation_attempts (status);

create index if not exists idx_donation_attempts_created_at
    on public.donation_attempts (created_at desc);

create index if not exists idx_donation_attempts_globalpay_reference
    on public.donation_attempts (globalpay_reference);

-- 3. Restrict direct database access.
-- The Next.js server will use the Supabase service role.

alter table public.donation_attempts enable row level security;

revoke all on public.donation_attempts
    from anon, authenticated;

grant select, insert, update
    on public.donation_attempts
    to service_role;

-- ============================================================================
-- 4. Atomically claim a donation attempt.
--
-- Possible decisions:
-- created               - This request created the record.
-- existing_initialized  - An existing checkout URL can be reused.
-- in_progress           - Another request is initializing this donation.
-- reconcile_required    - The previous provider request has an unknown result.
-- already_paid          - This donation has already been paid.
-- payload_conflict      - The same key was submitted with different details.
-- terminal              - The attempt is failed or expired and needs review.
-- ============================================================================

create or replace function public.claim_donation_attempt(
    p_idempotency_key text,
    p_request_fingerprint text,
    p_amount numeric,
    p_frequency text,
    p_request_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_attempt public.donation_attempts%rowtype;
    v_inserted boolean := false;
    v_decision text;
begin
    if p_idempotency_key is null
       or char_length(p_idempotency_key) < 16
       or char_length(p_idempotency_key) > 200 then
        raise exception 'Invalid idempotency key';
    end if;

    if p_request_fingerprint !~ '^[a-f0-9]{64}$' then
        raise exception 'Invalid request fingerprint';
    end if;

    if p_amount < 100 or p_amount > 999999.99 then
        raise exception 'Invalid donation amount';
    end if;

    if p_frequency not in ('one-time', 'monthly') then
        raise exception 'Invalid donation frequency';
    end if;

    if jsonb_typeof(p_request_payload) <> 'object' then
        raise exception 'Invalid donation payload';
    end if;

    insert into public.donation_attempts (
        idempotency_key,
        request_fingerprint,
        merchant_reference,
        amount,
        frequency,
        request_payload,
        status,
        initialization_started_at
    )
    values (
        p_idempotency_key,
        p_request_fingerprint,
        'hgyi_' ||
            floor(extract(epoch from clock_timestamp()) * 1000)::bigint ||
            '_' ||
            substr(replace(gen_random_uuid()::text, '-', ''), 1, 8),
        p_amount,
        p_frequency,
        p_request_payload,
        'initializing',
        now()
    )
    on conflict (idempotency_key) do nothing
    returning * into v_attempt;

    v_inserted := found;

    if v_inserted then
        v_decision := 'created';
    else
        -- Lock the existing record while deciding what to do.
        select *
        into v_attempt
        from public.donation_attempts
        where idempotency_key = p_idempotency_key
        for update;

        if not found then
            raise exception 'Donation attempt could not be retrieved';
        end if;

        if v_attempt.request_fingerprint <> p_request_fingerprint then
            v_decision := 'payload_conflict';

        else
            case v_attempt.status
                when 'initialized' then
                    v_decision := 'existing_initialized';

                when 'initializing' then
                    v_decision := 'in_progress';

                when 'initialization_unknown' then
                    v_decision := 'reconcile_required';

                when 'successful' then
                    v_decision := 'already_paid';

                else
                    v_decision := 'terminal';
            end case;
        end if;
    end if;

    return jsonb_build_object(
        'decision', v_decision,
        'attempt', jsonb_build_object(
            'id', v_attempt.id,
            'idempotency_key', v_attempt.idempotency_key,
            'merchant_reference', v_attempt.merchant_reference,
            'globalpay_reference', v_attempt.globalpay_reference,
            'amount', v_attempt.amount,
            'frequency', v_attempt.frequency,
            'status', v_attempt.status,
            'checkout_url', v_attempt.checkout_url
        )
    );
end;
$$;

-- ============================================================================
-- 5. Save a successfully created GlobalPay checkout link.
-- Safe to call again for the same attempt.
-- ============================================================================

create or replace function public.complete_donation_initialization(
    p_idempotency_key text,
    p_merchant_reference text,
    p_checkout_url text,
    p_globalpay_reference text default null,
    p_provider_response_code text default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_updated integer;
begin
    update public.donation_attempts
    set
        checkout_url = p_checkout_url,
        globalpay_reference = p_globalpay_reference,
        provider_response_code = p_provider_response_code,
        status = 'initialized',
        initialization_completed_at = now(),
        updated_at = now()
    where idempotency_key = p_idempotency_key
      and merchant_reference = p_merchant_reference
      and status in ('initializing', 'initialized');

    get diagnostics v_updated = row_count;

    return v_updated > 0;
end;
$$;

-- ============================================================================
-- 6. Mark an uncertain provider response.
-- Never automatically retry an unknown initialization.
-- ============================================================================

create or replace function public.mark_donation_initialization_unknown(
    p_idempotency_key text,
    p_merchant_reference text,
    p_error_code text default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_updated integer;
begin
    update public.donation_attempts
    set
        status = 'initialization_unknown',
        last_error_code = p_error_code,
        updated_at = now()
    where idempotency_key = p_idempotency_key
      and merchant_reference = p_merchant_reference
      and status in ('initializing', 'initialization_unknown');

    get diagnostics v_updated = row_count;

    return v_updated > 0;
end;
$$;

-- ============================================================================
-- 7. Record a definitive initialization failure.
-- A failed attempt is not automatically retried.
-- ============================================================================

create or replace function public.fail_donation_initialization(
    p_idempotency_key text,
    p_merchant_reference text,
    p_error_code text default null,
    p_provider_response_code text default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_updated integer;
begin
    update public.donation_attempts
    set
        status = 'failed',
        last_error_code = p_error_code,
        provider_response_code = p_provider_response_code,
        updated_at = now()
    where idempotency_key = p_idempotency_key
      and merchant_reference = p_merchant_reference
      and status = 'initializing';

    get diagnostics v_updated = row_count;

    return v_updated > 0;
end;
$$;

-- ============================================================================
-- 8. Restrict RPC execution to the server-side service role.
-- ============================================================================

revoke all on function public.claim_donation_attempt(
    text, text, numeric, text, jsonb
) from public, anon, authenticated;

revoke all on function public.complete_donation_initialization(
    text, text, text, text, text
) from public, anon, authenticated;

revoke all on function public.mark_donation_initialization_unknown(
    text, text, text
) from public, anon, authenticated;

revoke all on function public.fail_donation_initialization(
    text, text, text, text
) from public, anon, authenticated;

grant execute on function public.claim_donation_attempt(
    text, text, numeric, text, jsonb
) to service_role;

grant execute on function public.complete_donation_initialization(
    text, text, text, text, text
) to service_role;

grant execute on function public.mark_donation_initialization_unknown(
    text, text, text
) to service_role;

grant execute on function public.fail_donation_initialization(
    text, text, text, text
) to service_role;
