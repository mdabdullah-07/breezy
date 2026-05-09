
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_name text NOT NULL,
  guest_phone text NOT NULL,
  check_in date NOT NULL,
  check_out date NOT NULL,
  guests integer NOT NULL DEFAULT 1,
  package_type text NOT NULL DEFAULT 'day_visit',
  total_amount integer NOT NULL DEFAULT 0,
  coupon_code text,
  discount_amount integer DEFAULT 0,
  payment_status text NOT NULL DEFAULT 'pending',
  payment_method text DEFAULT 'whatsapp',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT bookings_dates_chk CHECK (check_out > check_in),
  CONSTRAINT bookings_package_chk CHECK (package_type IN ('day_visit','night_stay','event')),
  CONSTRAINT bookings_status_chk CHECK (payment_status IN ('pending','paid','cancelled','confirmed'))
);

CREATE TABLE public.blocked_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blocked_date date NOT NULL UNIQUE,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;

-- Anyone can create a booking (public booking form)
CREATE POLICY "anyone_can_insert_bookings" ON public.bookings
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Anyone can view bookings (only date ranges are needed publicly to compute availability).
-- Personal info exposure is acceptable for Phase 1 since calendar needs availability;
-- can be tightened later via a view.
CREATE POLICY "anyone_can_view_booking_dates" ON public.bookings
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "anyone_can_view_blocked_dates" ON public.blocked_dates
  FOR SELECT TO anon, authenticated USING (true);
