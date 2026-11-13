-- Donation state-machine tests. Run ONLY against a local/throwaway database
-- that has migrations 001-003 applied, e.g.:
--   psql "$LOCAL_DB_URL" -v ON_ERROR_STOP=1 -f supabase/tests/donation_flow.test.sql
-- Everything runs in a transaction that is rolled back at the end.

begin;

set local role service_role;

do $$
declare
    r jsonb;
    ref text;
    ref2 text;
    ok boolean;
    n integer;
    fp text := repeat('a', 64);
    fp2 text := repeat('b', 64);
begin
    -- 1. Claim / idempotency ------------------------------------------------
    r := public.claim_donation_attempt('test-key-0000000001', fp, 10000, '{"x":1}');
    assert r->>'decision' = 'created', 'first claim creates';
    ref := r->'attempt'->>'merchant_reference';
    assert ref ~ '^hgyi_\d{13}_[a-f0-9]{16}$', 'reference format: ' || ref;

    r := public.claim_donation_attempt('test-key-0000000001', fp, 10000, '{"x":1}');
    assert r->>'decision' = 'in_progress', 'concurrent retry while initializing';
    assert r->'attempt'->>'merchant_reference' = ref, 'same reference returned';

    r := public.claim_donation_attempt('test-key-0000000001', fp2, 20000, '{"x":2}');
    assert r->>'decision' = 'payload_conflict', 'same key, different payload';

    select count(*) into n from public.donation_attempts where idempotency_key = 'test-key-0000000001';
    assert n = 1, 'exactly one row per idempotency key';

    assert (select frequency from public.donation_attempts where merchant_reference = ref) = 'one-time';

    -- 2. Amount validation in the database ---------------------------------
    begin
        perform public.claim_donation_attempt('test-key-0000000002', fp, 99.99, '{}');
        assert false, 'amount below minimum must raise';
    exception when raise_exception then null;
    end;
    begin
        perform public.claim_donation_attempt('test-key-0000000003', fp, 100.001, '{}');
        assert false, 'sub-kobo amount must raise';
    exception when raise_exception then null;
    end;
    begin
        perform public.claim_donation_attempt('test-key-0000000004', fp, 1000000, '{}');
        assert false, 'amount above max must raise';
    exception when raise_exception then null;
    end;

    -- 3. Initialization completion -----------------------------------------
    ok := public.complete_donation_initialization('test-key-0000000001', ref, 'https://evil.example/pay', 'GP1', '0000');
    assert ok = false, 'non-GlobalPay checkout URL rejected';

    ok := public.complete_donation_initialization('test-key-0000000001', ref, 'https://checkout.globalpay.ng/pay?txnRef=GP1', 'GP1', '0000');
    assert ok, 'initialization completed';

    r := public.claim_donation_attempt('test-key-0000000001', fp, 10000, '{"x":1}');
    assert r->>'decision' = 'existing_initialized', 'retry reuses checkout';
    assert r->'attempt'->>'checkout_url' = 'https://checkout.globalpay.ng/pay?txnRef=GP1';

    -- 4. Requery throttling ------------------------------------------------
    r := public.begin_donation_requery(ref, 10);
    assert (r->>'allowed')::boolean, 'first requery allowed';
    r := public.begin_donation_requery(ref, 10);
    assert not (r->>'allowed')::boolean and r->>'reason' = 'throttled', 'second requery throttled';
    r := public.begin_donation_requery(ref, 0);
    assert (r->>'allowed')::boolean, 'webhook/reconcile bypass';
    r := public.begin_donation_requery('hgyi_0000000000000_ffffffffffffffff', 10);
    assert not (r->>'found')::boolean, 'unknown reference not found';

    -- 5. Failed then successful --------------------------------------------
    ok := public.record_donation_requery_result(ref, 'Failed', true, null);
    assert (select status from public.donation_attempts where merchant_reference = ref) = 'payment_failed';

    r := public.claim_donation_attempt('test-key-0000000001', fp, 10000, '{"x":1}');
    assert r->>'decision' = 'payment_failed', 'claim after failed payment';

    -- 6. Payment completion guards -----------------------------------------
    assert not public.complete_donation_payment(ref, 9999, 9999, 'NGN', 'Successful'), 'amount mismatch';
    assert not public.complete_donation_payment(ref, 10000, 9999, 'NGN', 'Successful'), 'underpaid';
    assert not public.complete_donation_payment(ref, 10000, 10000, 'USD', 'Successful'), 'currency mismatch';
    assert not public.complete_donation_payment(ref, 10000, 10000, 'NGN', 'success'), 'undocumented status';
    assert not public.complete_donation_payment(ref, 10000, 10000, 'NGN', 'Pending'), 'pending status';
    assert not public.complete_donation_payment(ref, 10000, 10000, 'NGN', 'Successful', 'ChargeMerchant', 'RRN', 'OTHER-GP-REF'), 'globalpay reference mismatch';
    assert not public.complete_donation_payment('hgyi_0000000000000_ffffffffffffffff', 10000, 10000, 'NGN', 'Successful'), 'unknown reference';

    assert (select status from public.donation_attempts where merchant_reference = ref) = 'payment_failed', 'guards changed nothing';
    select count(*) into n from public.donation_outbox;
    assert n = 0, 'no outbox rows before success';

    -- Provider is authoritative: a later Successful overrides payment_failed.
    ok := public.complete_donation_payment(ref, 10000, 10107.50, 'NGN', 'Successful', 'ChargeCustomer', 'RRN1', 'GP1');
    assert ok, 'successful completion';

    -- Duplicate verifications are idempotent and do not duplicate outbox rows.
    assert public.complete_donation_payment(ref, 10000, 10107.50, 'NGN', 'Successful', 'ChargeCustomer', 'RRN1', 'GP1');
    assert public.complete_donation_payment(ref, 10000, 10107.50, 'NGN', 'Successful', 'ChargeCustomer', 'RRN1', 'GP1');
    select count(*) into n from public.donation_outbox;
    assert n = 1, 'exactly one outbox event';

    assert not public.complete_donation_payment(ref, 20000, 20000, 'NGN', 'Successful'), 'cannot re-complete with another amount';

    ok := public.record_donation_requery_result(ref, 'Failed', true, null);
    assert not ok, 'Failed requery cannot downgrade a successful donation';
    assert (select status from public.donation_attempts where merchant_reference = ref) = 'successful';
    assert (select last_error_code from public.donation_attempts where merchant_reference = ref) = 'PAID_FROM_PAYMENT_FAILED';

    r := public.claim_donation_attempt('test-key-0000000001', fp, 10000, '{"x":1}');
    assert r->>'decision' = 'already_paid';

    r := public.begin_donation_requery(ref, 0);
    assert not (r->>'allowed')::boolean and r->>'reason' = 'already_successful', 'no requery after success';

    -- 7. Stale initializing => reconcile_required ---------------------------
    r := public.claim_donation_attempt('test-key-0000000005', fp, 5000, '{}');
    ref2 := r->'attempt'->>'merchant_reference';
    update public.donation_attempts
       set initialization_started_at = now() - interval '10 minutes'
     where merchant_reference = ref2;
    r := public.claim_donation_attempt('test-key-0000000005', fp, 5000, '{}');
    assert r->>'decision' = 'reconcile_required', 'stale initializing is never retried';

    -- 8. Constraints --------------------------------------------------------
    begin
        insert into public.donation_attempts (idempotency_key, request_fingerprint, merchant_reference, amount, frequency, request_payload)
        values ('test-key-0000000006', fp, 'hgyi_x_1', 1000, 'monthly', '{}');
        assert false, 'monthly must be rejected';
    exception when check_violation then null;
    end;

    begin
        update public.donation_attempts set globalpay_reference = 'GP1' where merchant_reference = ref2;
        assert false, 'globalpay_reference must be unique';
    exception when unique_violation then null;
    end;

    begin
        update public.donation_attempts set status = 'successful' where merchant_reference = ref2;
        assert false, 'successful without verified amount must be rejected';
    exception when check_violation then null;
    end;

    raise notice 'ALL DONATION FLOW TESTS PASSED';
end;
$$;

-- 9. anon / authenticated have no access --------------------------------------

set local role anon;
do $$
begin
    begin
        perform 1 from public.donation_attempts limit 1;
        assert false, 'anon must not read donation_attempts';
    exception when insufficient_privilege then null;
    end;
    begin
        perform public.begin_donation_requery('x', 0);
        assert false, 'anon must not execute RPCs';
    exception when insufficient_privilege then null;
    end;
    begin
        perform 1 from public.donation_outbox limit 1;
        assert false, 'anon must not read donation_outbox';
    exception when insufficient_privilege then null;
    end;
    raise notice 'ANON ACCESS DENIED AS EXPECTED';
end;
$$;

reset role;
set local role authenticated;
do $$
begin
    begin
        perform public.complete_donation_payment('x', 1, 1, 'NGN', 'Successful');
        assert false, 'authenticated must not execute RPCs';
    exception when insufficient_privilege then null;
    end;
    begin
        perform 1 from public.donation_attempts limit 1;
        assert false, 'authenticated must not read donation_attempts';
    exception when insufficient_privilege then null;
    end;
    raise notice 'AUTHENTICATED ACCESS DENIED AS EXPECTED';
end;
$$;

rollback;
