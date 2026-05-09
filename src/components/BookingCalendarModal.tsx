import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Info,
  Loader2,
  MessageCircle,
  MessageSquare,
  Users,
  X,
} from "lucide-react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isToday,
  startOfMonth,
  startOfToday,
} from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import {
  buildWhatsAppMessage,
  PACKAGES,
  whatsappLink,
  type PackageType,
} from "@/lib/booking";
import { bookingModal, useBookingModal } from "@/store/bookingModal";

type Range = { from: Date | null; to: Date | null };

function dateKey(d: Date) {
  return format(d, "yyyy-MM-dd");
}

async function fetchUnavailable(): Promise<Set<string>> {
  const set = new Set<string>();
  const [bookings, blocked] = await Promise.all([
    supabase.from("booked_date_ranges").select("check_in,check_out"),
    supabase.from("blocked_dates").select("blocked_date"),
  ]);
  if (bookings.data) {
    for (const b of bookings.data) {
      if (b.check_in === b.check_out) {
        // Same day booking (Day Visit) occupies the entire day
        set.add(dateKey(new Date(b.check_in)));
      } else {
        const days = eachDayOfInterval({
          start: new Date(b.check_in),
          end: new Date(b.check_out),
        });
        // Night stay occupies all nights from check-in up to (but not including) check-out morning
        for (const d of days.slice(0, -1)) set.add(dateKey(d));
      }
    }
  }
  if (blocked.data) {
    for (const b of blocked.data) {
      if (b.blocked_date) set.add(b.blocked_date);
    }
  }
  return set;
}

export function BookingCalendarModal() {
  const open = useBookingModal();
  const [month, setMonth] = useState<Date>(startOfMonth(new Date()));
  const [unavailable, setUnavailable] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState<Range>({ from: null, to: null });
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [packageType, setPackageType] = useState<PackageType>("night_stay");
  const [guests, setGuests] = useState(2);
  
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [checkInTime, setCheckInTime] = useState("10:00 AM");
  const [checkOutTime, setCheckOutTime] = useState("06:00 PM");
  const [specialRequests, setSpecialRequests] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetchUnavailable()
      .then(setUnavailable)
      .catch(() => toast.error("Could not load availability"))
      .finally(() => setLoading(false));
  }, [open]);

  useEffect(() => {
    if (!open) {
      // reset on close
      setRange({ from: null, to: null });
      setHoverDate(null);
    }
  }, [open]);

  useEffect(() => {
    if (packageType === "night_stay") {
      setCheckOutTime(checkInTime);
    }
  }, [checkInTime, packageType]);

  const today = startOfToday();

  const days = useMemo(() => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const all = eachDayOfInterval({ start, end });
    const pad = start.getDay(); // Sun=0
    return { pad, all };
  }, [month]);

  const isUnavailable = (d: Date) => unavailable.has(dateKey(d));
  const isPast = (d: Date) => isBefore(d, today) && !isSameDay(d, today);

  const inHoverRange = (d: Date) => {
    if (!range.from || range.to) return false;
    if (!hoverDate || !isAfter(hoverDate, range.from)) return false;
    return isAfter(d, range.from) && isBefore(d, hoverDate);
  };
  const inSelectedRange = (d: Date) => {
    if (!range.from || !range.to) return false;
    return isAfter(d, range.from) && isBefore(d, range.to);
  };

  function rangeHasUnavailable(from: Date, to: Date) {
    if (isSameDay(from, to)) return unavailable.has(dateKey(from));
    const days = eachDayOfInterval({ start: from, end: to });
    // exclude check-out morning
    return days.slice(0, -1).some((d) => unavailable.has(dateKey(d)));
  }

  function onClickDay(d: Date) {
    if (isPast(d) || isUnavailable(d)) return;
    
    // If it's the first click or we already have a full range, start a new range
    if (!range.from || (range.from && range.to)) {
      setRange({ from: d, to: null });
      if (packageType === "day_visit") {
        // For day visits, default to same day check-out
        setRange({ from: d, to: d });
      } else {
        toast("Now select your check-out date", { duration: 1800 });
      }
      return;
    }

    // If second click is before check-in, reset check-in
    if (isBefore(d, range.from)) {
      setRange({ from: d, to: null });
      return;
    }

    // Check for availability in the range (only if different days)
    if (!isSameDay(d, range.from) && rangeHasUnavailable(range.from, d)) {
      toast.error("Some dates in this range are not available");
      const el = document.getElementById("calendar-grid");
      el?.classList.add("animate-shake");
      setTimeout(() => el?.classList.remove("animate-shake"), 500);
      return;
    }

    setRange({ from: range.from, to: d });
  }

  const nights = useMemo(() => {
    if (!range.from || !range.to) return 0;
    return Math.max(
      1,
      Math.round(
        (range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24),
      ),
    );
  }, [range]);

  const pkg = PACKAGES[packageType];
  const baseTotal = pkg.price * Math.max(nights, 1);
  const discount = 0;
  const total = baseTotal;

  const canSubmit =
    range.from && range.to && name.trim().length > 1 && phone.trim().length >= 8;

  async function submit(method: "whatsapp") {
    if (!canSubmit) {
      toast.error("Please complete name, phone, and dates");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from("bookings").insert({
        guest_name: name.trim(),
        guest_phone: phone.trim(),
        whatsapp_number: whatsappNumber.trim() || phone.trim(),
        check_in: dateKey(range.from!),
        check_out: dateKey(range.to!),
        check_in_time: checkInTime,
        check_out_time: checkOutTime,
        guests,
        package_type: packageType,
        total_amount: total,
        special_requests: specialRequests.trim(),
        status: "pending",
        payment_status: "pending",
        payment_method: method,
      });
      if (error) throw error;

      const msg = buildWhatsAppMessage({
        name: name.trim(),
        phone: phone.trim(),
        checkIn: format(range.from!, "EEE, dd MMM yyyy"),
        checkOut: format(range.to!, "EEE, dd MMM yyyy"),
        time: `${checkInTime} to ${checkOutTime}`,
        guests,
        totalDays: nights,
        packageType,
        total,
        specialRequest: specialRequests.trim(),
      });
      const url = whatsappLink(msg);

      // Open WhatsApp and head to confirmation
      window.open(url, "_blank");
      bookingModal.close();
      
      // Navigate to success page using TanStack Router
      window.location.assign(`/booking/success?msg=${encodeURIComponent(msg)}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Booking failed";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-forest/70 backdrop-blur-md"
          onClick={() => bookingModal.close()}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 240 }}
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-x-0 bottom-0 max-h-[95svh] overflow-y-auto rounded-t-3xl bg-background shadow-2xl md:inset-4 md:bottom-4 md:rounded-3xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background/90 px-5 py-4 backdrop-blur">
              <div>
                <div className="text-xs font-semibold tracking-widest text-terra uppercase">
                  Reserve your stay
                </div>
                <h2 className="font-display text-2xl font-semibold text-forest">
                  Pick your dates
                </h2>
              </div>
              <button
                onClick={() => bookingModal.close()}
                aria-label="Close"
                className="grid size-10 place-items-center rounded-full hover:bg-muted"
              >
                <X />
              </button>
            </div>

            <div className="grid gap-8 p-5 md:grid-cols-[1fr_360px] md:p-8">
              {/* Calendar */}
              <div>
                {/* Month nav */}
                <div className="mb-4 flex items-center justify-between">
                  <button
                    onClick={() => setMonth(addMonths(month, -1))}
                    className="grid size-10 place-items-center rounded-full hover:bg-muted disabled:opacity-30"
                    disabled={isBefore(addMonths(month, -1), startOfMonth(today))}
                  >
                    <ChevronLeft />
                  </button>
                  <motion.div
                    key={month.toString()}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-display text-xl font-semibold text-forest"
                  >
                    {format(month, "MMMM yyyy")}
                  </motion.div>
                  <button
                    onClick={() => setMonth(addMonths(month, 1))}
                    className="grid size-10 place-items-center rounded-full hover:bg-muted"
                  >
                    <ChevronRight />
                  </button>
                </div>

                {/* Legend */}
                <div className="mb-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <Legend color="bg-emerald-500" label="Available" />
                  <Legend color="bg-rose-500" label="Booked" />
                  <Legend color="bg-amber-500" label="Check-in" />
                  <Legend color="bg-violet-500" label="Check-out" />
                  <Legend color="bg-sky-500" label="Stay" />
                </div>

                {/* Weekday labels */}
                <div className="mb-2 grid grid-cols-7 text-center text-xs font-semibold text-muted-foreground">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                    (d) => (
                      <div key={d}>{d}</div>
                    ),
                  )}
                </div>

                <div
                  id="calendar-grid"
                  className="relative grid grid-cols-7 gap-1.5 sm:gap-2"
                >
                  {loading && (
                    <div className="absolute inset-0 z-10 grid place-items-center bg-background/60 backdrop-blur-sm">
                      <Loader2 className="size-6 animate-spin text-terra" />
                    </div>
                  )}
                  {Array.from({ length: days.pad }).map((_, i) => (
                    <div key={`pad-${i}`} />
                  ))}
                  {days.all.map((d) => {
                    const past = isPast(d);
                    const unavail = isUnavailable(d);
                    const isCheckIn =
                      range.from && isSameDay(d, range.from);
                    const isCheckOut = range.to && isSameDay(d, range.to);
                    const inSel = inSelectedRange(d);
                    const inHover = inHoverRange(d);
                    const isFree = !past && !unavail;

                    let classes =
                      "relative aspect-square min-h-[44px] rounded-lg sm:rounded-xl text-sm font-medium grid place-items-center transition-all border ";
                    if (past || unavail) {
                      classes +=
                        "bg-rose-500/90 text-white border-rose-600 cursor-not-allowed";
                    } else if (isCheckIn) {
                      classes +=
                        "bg-amber-500 text-white border-amber-600 shadow-warm scale-105";
                    } else if (isCheckOut) {
                      classes +=
                        "bg-violet-500 text-white border-violet-600 shadow-warm scale-105";
                    } else if (inSel) {
                      classes += "bg-sky-500 text-white border-sky-600";
                    } else if (inHover) {
                      classes += "bg-sky-300 text-white border-sky-400";
                    } else if (isFree) {
                      classes +=
                        "bg-emerald-500/90 text-white border-emerald-600 hover:scale-110 hover:shadow-warm cursor-pointer";
                    }
                    if (isToday(d)) classes += " ring-2 ring-gold ring-offset-1";

                    return (
                      <motion.button
                        key={dateKey(d)}
                        type="button"
                        whileTap={{ scale: 0.92 }}
                        onMouseEnter={() => setHoverDate(d)}
                        onMouseLeave={() =>
                          setHoverDate((h) => (h === d ? null : h))
                        }
                        onClick={() => onClickDay(d)}
                        disabled={past || unavail}
                        className={classes}
                        title={
                          past
                            ? "Past date"
                            : unavail
                              ? "Already booked"
                              : "Available — click to select"
                        }
                      >
                        {format(d, "d")}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Summary */}
              <motion.aside
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-3xl border border-border bg-card p-6 shadow-soft"
              >
                <h3 className="font-display text-xl font-semibold text-forest">
                  Booking summary
                </h3>

                <div className="mt-4 space-y-2 text-sm">
                  <Row
                    label="Check-in"
                    value={
                      range.from
                        ? format(range.from, "EEE, dd MMM")
                        : "Select a date"
                    }
                  />
                  <Row
                    label="Check-out"
                    value={
                      range.to
                        ? format(range.to, "EEE, dd MMM")
                        : "Select a date"
                    }
                  />
                  <Row 
                    label="Duration" 
                    value={
                      !range.from || !range.to 
                        ? "—" 
                        : packageType === "day_visit" && isSameDay(range.from, range.to)
                          ? "Day Visit"
                          : `${nights} ${nights === 1 ? "Day / 24h" : "Days"}`
                    } 
                  />
                </div>

                <div className="mt-5 space-y-3">
                  <div>
                    <Label className="text-xs">Package</Label>
                    <div className="mt-1 grid grid-cols-3 gap-1.5">
                      {(Object.keys(PACKAGES) as PackageType[]).map((k) => (
                        <button
                          key={k}
                          onClick={() => setPackageType(k)}
                          className={cn(
                            "rounded-lg border px-2 py-2 text-xs font-medium transition",
                            packageType === k
                              ? "border-terra bg-terra text-cream"
                              : "border-border bg-background hover:border-terra/50",
                          )}
                        >
                          {PACKAGES[k].name}
                        </button>
                      ))}
                    </div>
                  </div>



                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2" htmlFor="name">
                        <Users className="size-3" /> Guest Name
                      </Label>
                      <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Full name"
                        className="rounded-xl border-border/60 bg-background/50 focus:border-terra/50 focus:ring-terra/20 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2" htmlFor="phone">
                        <MessageCircle className="size-3" /> Contact Phone
                      </Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91…"
                        type="tel"
                        className="rounded-xl border-border/60 bg-background/50 focus:border-terra/50 focus:ring-terra/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2" htmlFor="whatsapp">
                        <MessageSquare className="size-3" /> WhatsApp
                      </Label>
                      <Input
                        id="whatsapp"
                        value={whatsappNumber}
                        onChange={(e) => setWhatsappNumber(e.target.value)}
                        placeholder="Optional"
                        type="tel"
                        className="rounded-xl border-border/60 bg-background/50 focus:border-terra/50 focus:ring-terra/20 transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <Users className="size-3" /> Guest Count
                      </Label>
                      <div className="flex items-center rounded-xl border border-border/60 bg-background/50 h-10 overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setGuests(Math.max(1, guests - 1))}
                          className="px-4 py-1 hover:bg-muted transition-colors text-lg"
                        >
                          −
                        </button>
                        <div className="flex flex-1 items-center justify-center gap-1.5 text-sm font-bold">
                          {guests}
                        </div>
                        <button
                          type="button"
                          onClick={() => setGuests(Math.min(50, guests + 1))}
                          className="px-4 py-1 hover:bg-muted transition-colors text-lg"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <Clock className="size-3" /> Check-in Time
                      </Label>
                      <select
                        value={checkInTime}
                        onChange={(e) => setCheckInTime(e.target.value)}
                        className="flex h-10 w-full rounded-xl border border-border/60 bg-background/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terra/20 transition-all cursor-pointer"
                      >
                        <option>10:00 AM</option>
                        <option>11:00 AM</option>
                        <option>12:00 PM</option>
                        <option>01:00 PM</option>
                        <option>02:00 PM</option>
                        <option>03:00 PM</option>
                        <option>04:00 PM</option>
                        <option>05:00 PM</option>
                        <option>06:00 PM</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <Clock className="size-3" /> Check-out Time
                      </Label>
                      <select
                        value={checkOutTime}
                        onChange={(e) => setCheckOutTime(e.target.value)}
                        disabled={packageType === "night_stay"}
                        className="flex h-10 w-full rounded-xl border border-border/60 bg-background/50 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terra/20 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <option>04:00 PM</option>
                        <option>05:00 PM</option>
                        <option>06:00 PM</option>
                        {packageType === "night_stay" && <option value={checkInTime}>{checkInTime} (24h)</option>}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2" htmlFor="requests">
                      <Info className="size-3" /> Special Requests
                    </Label>
                    <textarea
                      id="requests"
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      placeholder="Any specific requirements for your stay?"
                      className="flex min-h-[80px] w-full rounded-xl border border-border/60 bg-background/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-terra/20 transition-all"
                    />
                  </div>

                  {packageType === "event" && (
                    <div className="rounded-lg border border-gold/40 bg-gold/10 p-3 text-xs text-forest">
                      <p className="font-semibold">Event / Party note</p>
                      <p className="mt-1 text-foreground/80">
                        Pricing for events may vary based on the number of
                        guests, setup, and add-ons. Final quote will be shared
                        on WhatsApp after we confirm your details.
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-5 space-y-1 border-t border-border pt-4 text-sm">
                  <Row
                    label={`${pkg.name} × ${nights || 1}`}
                    value={`₹${baseTotal.toLocaleString("en-IN")}`}
                  />
                  {discount > 0 && (
                    <Row
                      label="Discount"
                      value={`− ₹${discount.toLocaleString("en-IN")}`}
                    />
                  )}
                  <div className="flex items-baseline justify-between pt-2">
                    <div className="text-sm text-muted-foreground">Total</div>
                    <div className="font-display text-2xl font-semibold text-forest">
                      ₹{total.toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>

                <Button
                  onClick={() => submit("whatsapp")}
                  disabled={!canSubmit || submitting}
                  className="mt-5 h-12 w-full rounded-full bg-[#25D366] font-semibold text-white hover:bg-[#1fb858]"
                >
                  {submitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <>
                      <MessageCircle className="mr-2 size-4" />
                      Confirm via WhatsApp
                    </>
                  )}
                </Button>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Online payment coming soon
                </p>
              </motion.aside>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="inline-flex items-center gap-1.5">
      <span className={cn("inline-block size-3 rounded-sm", color)} />
      {label}
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
