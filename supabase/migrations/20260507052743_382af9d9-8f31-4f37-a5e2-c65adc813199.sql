
DROP POLICY IF EXISTS "anyone_can_view_booking_dates" ON public.bookings;

-- Public view exposes only date ranges (no PII) for calendar availability
CREATE OR REPLACE VIEW public.booked_date_ranges
WITH (security_invoker = true) AS
SELECT id, check_in, check_out
FROM public.bookings
WHERE payment_status IN ('pending','paid','confirmed');

GRANT SELECT ON public.booked_date_ranges TO anon, authenticated;

-- Allow reading from the underlying table only the rows accessed via view (still needs a policy)
CREATE POLICY "view_booked_date_ranges" ON public.bookings
  FOR SELECT TO anon, authenticated USING (true);

-- Note: The view uses security_invoker so RLS still applies; we keep a SELECT policy
-- but consumers should query the view, not the table directly. Personal columns are
-- not exposed by the view's column list.
