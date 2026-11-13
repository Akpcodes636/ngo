-- ============================================================================
-- Healthy Golden Years
-- 003: One-time donation hardening
--
-- Requires 001_donation_idempotency.sql and 002_donation_verification.sql.
-- Safe to run once on top of them. Does not delete any donation rows.
--
-- Summary
--   1. One-time donations only: frequency defaults to 'one-time' and new rows
--      cannot be 'monthly'. claim_donation_attempt no longer takes p_frequency
--      (the application stopped sending it, which made every call fail).
--   2. Records GlobalPay's charge model: amount_from_merchant (what we asked
--      for) is compared to our amount; paid_amount may be higher when the
--      customer bears the fee (ChargeCustomer).
--   3. New 'payment_failed' status for transactions GlobalPay reports Failed.
--      A later Successful requery still wins (the provider is authoritative).
--   4. Requery throttling per donation (protects the verify endpoint).
--   5. Stale 'initializing' attempts become 'initialization_unknown'.
--   6. Transactional outbox row written in the same transaction that marks a
--      donation successful (for receipts / notifications).
--   7. Stronger merchant reference randomness (64 bits instead of 32).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Columns
-- ----------------------------------------------------------------------------

alter table public.donation_attempts
    add column if not exists amount_from_merchant numeric(12, 2),
    add column if not exists charge_bearer text,
    add column if not exists last_provider_status text,
    add column if not exists last_requery_at timestamptz,
    add column if not exists payment_failed_at timestamptz;

-- ----------------------------------------------------------------------------
-- 2. One-time donations only
-- ----------------------------------------------------------------------------

alter table public.donation_attempts
    alter column frequency set default 'one-time';

alter table public.donation_attempts
    drop constraint if exists donation_attempts_frequency_check;

-- NOT VALID: enforced for every new or updated row without failing the
-- migration if historical test rows contain 'monthly'.
alter table public.donation_attempts
    add constraint donation_attempts_frequency_one_time
    check (frequency = 'one-time') not valid;

-- ----------------------------------------------------------------------------
-- 3. Status values
-- ----------------------------------------------------------------------------

alter table public.donation_attempts
    drop constraint if exists donation_attempts_status_check;

alter table public.donation_attempts
    add constraint donation_attempts_status_check
    check (
        status in (
            'initializing',
            'initialization_unknown',
            'initialized',
            'payment_failed',
            'successful',
            'failed',
            'expired'
        )
    );

-- A successful donation must carry a provider-confirmed NGN amount that
-- matches the amount we created. NOT VALID so rows written by 002 (which did
-- not record amount_from_merchant) do not block the migration.
alter table public.donation_attempts
    drop constraint if exists donation_attempts_successful_consistency;

alter table public.donation_attempts
    add constraint donation_attempts_successful_consistency
    check (
        status <> 'successful'
        or (
            amount_from_merchant = amount
            and paid_amount >= amount
            and paid_currency = 'NGN'
            and verified_at is not null
        )
    ) not valid;

-- ----------------------------------------------------------------------------
-- 4. Indexes
-- ----------------------------------------------------------------------------

-- One GlobalPay transaction can belong to only one donation.
drop index if exists public.idx_donation_attempts_globalpay_reference;

create unique index if not exists uq_donation_attempts_globalpay_reference
    on public.donation_attempts (globalpay_reference)
    where globalpay_reference is not null;

-- Reconciliation scans.
create index if not exists idx_donation_attempts_reconcile
    on public.donation_attempts (status, created_at)
    where status in ('initializing', 'initialization_unknown', 'initialized');

-- ----------------------------------------------------------------------------
-- 5. Transactional outbox (receipts / notifications)
-- ----------------------------------------------------------------------------

create table if not exists public.donation_outbox (
    id bigint generated always as identity primary key,
    donation_attempt_id uuid not null
        references public.donation_attempts (id),
    event_type text not null
        check (event_type in ('donation.successful')),
    created_at timestamptz not null default now(),
    processed_at timestamptz,
    attempts integer not null default 0,
    last_error text,
    constraint donation_outbox_once_per_event
        unique (donation_attempt_id, event_type)
);

create index if not exists idx_donation_outbox_unprocessed
    on public.donation_outbox (created_at)
    where processed_at is null;

alter table public.donation_outbox enable row level security;

revoke all on public.donation_outbox from public, anon, authenticated;

grant select, insert, update on public.donation_outbox to service_role;

-- ----------------------------------------------------------------------------
-- 6. claim_donation_attempt (one-time only, no p_frequency)
-- ----------------------------------------------------------------------------

drop function if exists public.claim_donation_attempt(
    text, text, numeric, text, jsonb
);

create or replace function public.claim_donation_attempt(
    p_idempotency_key text,
    p_request_fingerprint text,
    p_amount numeric,
    p_request_payload jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_attempt public.donation_attempts%rowtype;
    v_decision text;
begin
    if p_idempotency_key is null
       or p_idempotency_key !~ '^[A-Za-z0-9._:-]{16,200}$' then
        raise exception 'Invalid idempotency key';
    end if;

    if p_request_fingerprint is null
       or p_request_fingerprint !~ '^[a-f0-9]{64}$' then
        raise exception 'Invalid request fingerprint';
    end if;

    if p_amount is null
       or p_amount < 100
       or p_amount > 999999.99
       or p_amount <> round(p_amount, 2) then
        raise exception 'Invalid donation amount';
    end if;

    if p_request_payload is null
       or jsonb_typeof(p_request_payload) <> 'object' then
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
            substr(replace(gen_random_uuid()::text, '-', ''), 1, 16),
        p_amount,
        'one-time',
        p_request_payload,
        'initializing',
        now()
    )
    on conflict (idempotency_key) do nothing
    returning * into v_attempt;

    if found then
        v_decision := 'created';
    else
        select *
        into v_attempt
        from public.donation_attempts
        where idempotency_key = p_idempotency_key
        for update;

        if not found then
            raise exception 'Donation attempt could not be retrieved';
        end if;

        -- An attempt stuck in 'initializing' (e.g. the server crashed after
        -- claiming it) may or may not have reached GlobalPay. Never retry it
        -- automatically; flag it for reconciliation instead.
        if v_attempt.status = 'initializing'
           and v_attempt.initialization_started_at
               < now() - interval '5 minutes' then
            update public.donation_attempts
            set status = 'initialization_unknown',
                last_error_code = 'INITIALIZATION_STALE',
                updated_at = now()
            where id = v_attempt.id
            returning * into v_attempt;
        end if;

        if v_attempt.request_fingerprint <> p_request_fingerprint then
            v_decision := 'payload_conflict';
        else
            v_decision := case v_attempt.status
                when 'initialized' then 'existing_initialized'
                when 'initializing' then 'in_progress'
                when 'initialization_unknown' then 'reconcile_required'
                when 'successful' then 'already_paid'
                when 'payment_failed' then 'payment_failed'
                else 'terminal'
            end;
        end if;
    end if;

    return jsonb_build_object(
        'decision', v_decision,
        'attempt', jsonb_build_object(
            'id', v_attempt.id,
            'merchant_reference', v_attempt.merchant_reference,
            'amount', v_attempt.amount,
            'status', v_attempt.status,
            'checkout_url', v_attempt.checkout_url
        )
    );
end;
$$;

-- ----------------------------------------------------------------------------
-- 7. complete_donation_initialization
--    Also accepts 'initialization_unknown': if GlobalPay definitely returned
--    a checkout URL, recording it is always correct.
-- ----------------------------------------------------------------------------

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
    if p_checkout_url is null
       or p_checkout_url !~ '^https://checkout\.globalpay\.ng/' then
        return false;
    end if;

    update public.donation_attempts
    set
        checkout_url = p_checkout_url,
        globalpay_reference = coalesce(p_globalpay_reference, globalpay_reference),
        provider_response_code = p_provider_response_code,
        status = 'initialized',
        last_error_code = null,
        initialization_completed_at = now(),
        updated_at = now()
    where idempotency_key = p_idempotency_key
      and merchant_reference = p_merchant_reference
      and status in ('initializing', 'initialization_unknown', 'initialized');

    get diagnostics v_updated = row_count;

    return v_updated > 0;
end;
$$;

-- ----------------------------------------------------------------------------
-- 8. begin_donation_requery
--    Atomically decides whether we may call GlobalPay for this donation now.
--    Throttles repeated verification requests for the same reference.
-- ----------------------------------------------------------------------------

create or replace function public.begin_donation_requery(
    p_merchant_reference text,
    p_min_interval_seconds integer default 10
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_attempt public.donation_attempts%rowtype;
    v_allowed boolean := false;
    v_reason text;
begin
    select *
    into v_attempt
    from public.donation_attempts
    where merchant_reference = p_merchant_reference
    for update;

    if not found then
        return jsonb_build_object('found', false);
    end if;

    if v_attempt.status = 'successful' then
        v_reason := 'already_successful';
    elsif v_attempt.status in ('failed', 'expired') then
        -- 'failed' here means GlobalPay rejected creating the payment link,
        -- so no payment can exist for this reference.
        v_reason := 'terminal';
    elsif v_attempt.last_requery_at is not null
          and v_attempt.last_requery_at
              > now() - make_interval(secs => greatest(p_min_interval_seconds, 0)) then
        v_reason := 'throttled';
    else
        v_allowed := true;
        v_reason := 'allowed';

        update public.donation_attempts
        set last_requery_at = now()
        where id = v_attempt.id;
    end if;

    return jsonb_build_object(
        'found', true,
        'allowed', v_allowed,
        'reason', v_reason,
        'merchant_reference', v_attempt.merchant_reference,
        'amount', v_attempt.amount,
        'status', v_attempt.status,
        'amount_paid', v_attempt.paid_amount
    );
end;
$$;

-- ----------------------------------------------------------------------------
-- 9. record_donation_requery_result
--    Records a non-successful provider answer. 'Failed' moves the attempt to
--    payment_failed; it never overwrites a successful donation.
-- ----------------------------------------------------------------------------

create or replace function public.record_donation_requery_result(
    p_merchant_reference text,
    p_provider_status text,
    p_payment_failed boolean default false,
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
        last_provider_status = left(p_provider_status, 50),
        last_error_code = coalesce(p_error_code, last_error_code),
        status = case
            when p_payment_failed
                 and status in ('initializing', 'initialization_unknown', 'initialized')
            then 'payment_failed'
            else status
        end,
        payment_failed_at = case
            when p_payment_failed
                 and status in ('initializing', 'initialization_unknown', 'initialized')
            then now()
            else payment_failed_at
        end,
        updated_at = now()
    where merchant_reference = p_merchant_reference
      and status <> 'successful';

    get diagnostics v_updated = row_count;

    return v_updated > 0;
end;
$$;

-- ----------------------------------------------------------------------------
-- 10. complete_donation_payment (replaces the 002 version)
--
--   * Amount check uses amount_from_merchant (what GlobalPay says we asked
--     for). paid_amount may exceed it when the customer bears the fee.
--   * Only the documented status value 'Successful' is accepted.
--   * Idempotent: a repeat call for an already-successful donation returns
--     true only if the provider data is consistent with what was stored.
--   * A provider-confirmed payment is recorded even if our row was in
--     initialization_unknown / payment_failed / failed / expired: money that
--     GlobalPay confirms for our unique reference and exact amount must never
--     be silently dropped. The previous status is preserved in last_error_code
--     for review.
--   * Writes the outbox event in the same transaction.
-- ----------------------------------------------------------------------------

drop function if exists public.complete_donation_payment(
    text, numeric, text, text, text
);

create or replace function public.complete_donation_payment(
    p_merchant_reference text,
    p_amount_from_merchant numeric,
    p_paid_amount numeric,
    p_currency text,
    p_transaction_status text,
    p_charge_bearer text default null,
    p_retrieval_reference_number text default null,
    p_globalpay_reference text default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
    v_attempt public.donation_attempts%rowtype;
    v_previous_status text;
begin
    if p_merchant_reference is null
       or p_amount_from_merchant is null
       or p_paid_amount is null
       or p_currency is null
       or upper(trim(p_currency)) <> 'NGN'
       or p_transaction_status is null
       or lower(trim(p_transaction_status)) <> 'successful'
    then
        return false;
    end if;

    select *
    into v_attempt
    from public.donation_attempts
    where merchant_reference = p_merchant_reference
    for update;

    if not found then
        return false;
    end if;

    -- Our stored amount is authoritative.
    if p_amount_from_merchant <> v_attempt.amount
       or p_paid_amount < v_attempt.amount then
        return false;
    end if;

    -- A GlobalPay reference recorded at initialization must match.
    if p_globalpay_reference is not null
       and v_attempt.globalpay_reference is not null
       and p_globalpay_reference <> v_attempt.globalpay_reference then
        return false;
    end if;

    if v_attempt.status = 'successful' then
        return coalesce(v_attempt.amount_from_merchant, v_attempt.paid_amount)
               = p_amount_from_merchant;
    end if;

    v_previous_status := v_attempt.status;

    update public.donation_attempts
    set
        status = 'successful',
        amount_from_merchant = p_amount_from_merchant,
        paid_amount = p_paid_amount,
        paid_currency = 'NGN',
        charge_bearer = left(p_charge_bearer, 50),
        transaction_status = trim(p_transaction_status),
        last_provider_status = trim(p_transaction_status),
        retrieval_reference_number = p_retrieval_reference_number,
        globalpay_reference = coalesce(globalpay_reference, p_globalpay_reference),
        last_error_code = case
            when v_previous_status in ('initialized', 'initializing')
            then last_error_code
            else 'PAID_FROM_' || upper(v_previous_status)
        end,
        verified_at = now(),
        updated_at = now()
    where id = v_attempt.id;

    insert into public.donation_outbox (donation_attempt_id, event_type)
    values (v_attempt.id, 'donation.successful')
    on conflict (donation_attempt_id, event_type) do nothing;

    return true;
end;
$$;

-- ----------------------------------------------------------------------------
-- 11. Reconciliation candidates
-- ----------------------------------------------------------------------------

create or replace function public.list_donations_to_reconcile(
    p_limit integer default 25
)
returns table (merchant_reference text)
language sql
security definer
set search_path = ''
as $$
    select d.merchant_reference
    from public.donation_attempts d
    where d.status in ('initializing', 'initialization_unknown', 'initialized')
      and d.created_at > now() - interval '7 days'
      and d.created_at < now() - interval '2 minutes'
      and (d.last_requery_at is null
           or d.last_requery_at < now() - interval '10 minutes')
    order by d.created_at
    limit least(greatest(p_limit, 1), 100);
$$;

-- ----------------------------------------------------------------------------
-- 12. Permissions: service role only
-- ----------------------------------------------------------------------------

revoke all on function public.claim_donation_attempt(text, text, numeric, jsonb)
    from public, anon, authenticated;
revoke all on function public.complete_donation_initialization(text, text, text, text, text)
    from public, anon, authenticated;
revoke all on function public.begin_donation_requery(text, integer)
    from public, anon, authenticated;
revoke all on function public.record_donation_requery_result(text, text, boolean, text)
    from public, anon, authenticated;
revoke all on function public.complete_donation_payment(text, numeric, numeric, text, text, text, text, text)
    from public, anon, authenticated;
revoke all on function public.list_donations_to_reconcile(integer)
    from public, anon, authenticated;

grant execute on function public.claim_donation_attempt(text, text, numeric, jsonb)
    to service_role;
grant execute on function public.complete_donation_initialization(text, text, text, text, text)
    to service_role;
grant execute on function public.begin_donation_requery(text, integer)
    to service_role;
grant execute on function public.record_donation_requery_result(text, text, boolean, text)
    to service_role;
grant execute on function public.complete_donation_payment(text, numeric, numeric, text, text, text, text, text)
    to service_role;
grant execute on function public.list_donations_to_reconcile(integer)
    to service_role;
