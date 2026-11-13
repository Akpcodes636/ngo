
-- Store the details returned by GlobalPay during verification.
alter table public.donation_attempts
  add column if not exists paid_amount numeric(12, 2),
  add column if not exists paid_currency text,
  add column if not exists transaction_status text,
  add column if not exists retrieval_reference_number text,
  add column if not exists verified_at timestamptz;

-- Atomically mark a donation as successful after server-side verification.
create or replace function public.complete_donation_payment(
  p_merchant_reference text,
  p_paid_amount numeric,
  p_currency text,
  p_transaction_status text,
  p_retrieval_reference_number text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_attempt public.donation_attempts%rowtype;
begin
  if p_merchant_reference is null
     or length(trim(p_merchant_reference)) = 0
     or p_paid_amount is null
     or p_currency is null
     or upper(trim(p_currency)) <> 'NGN'
     or p_transaction_status is null
     or lower(trim(p_transaction_status)) not in ('success', 'successful')
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

  -- The same verified payment can be checked more than once safely.
  if v_attempt.status = 'successful' then
    return
      v_attempt.paid_amount = p_paid_amount
      and v_attempt.paid_currency = upper(trim(p_currency));
  end if;

  -- Only attempts that may legitimately have reached GlobalPay
  -- can transition to successful.
  if v_attempt.status not in (
    'initialized',
    'initialization_unknown',
    'initializing'
  ) then
    return false;
  end if;

  -- The amount paid must match the amount originally requested.
  if v_attempt.amount <> p_paid_amount then
    return false;
  end if;

  update public.donation_attempts
  set
    status = 'successful',
    paid_amount = p_paid_amount,
    paid_currency = upper(trim(p_currency)),
    transaction_status = trim(p_transaction_status),
    retrieval_reference_number = p_retrieval_reference_number,
    verified_at = now(),
    updated_at = now()
  where id = v_attempt.id;

  return true;
end;
$$;

revoke all on function public.complete_donation_payment(
  text, numeric, text, text, text
) from public, anon, authenticated;

grant execute on function public.complete_donation_payment(
  text, numeric, text, text, text
) to service_role;
