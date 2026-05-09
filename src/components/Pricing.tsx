import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PACKAGES, type PackageType } from "@/lib/booking";
import { bookingModal } from "@/store/bookingModal";
import { breezyImages } from "@/assets/breezy";

const packageImages: Record<PackageType, string> = {
  day_visit: breezyImages.farmhouse11,
  night_stay: breezyImages.farmhouse12,
  event: breezyImages.farmhouse13,
};

const features: Record<PackageType, string[]> = {
  day_visit: [
    "Pool & gardens access",
    "BBQ + outdoor seating",
    "Indoor games",
    "Parking included",
  ],
  night_stay: [
    "Everything in Day Visit",
    "Overnight stay",
    "Campfire setup",
    "Bedrooms + linens",
  ],
  event: [
    "Full property exclusive",
    "Up to 50 guests",
    "Dining area + kitchen",
    "Catering on request",
  ],
};

export function Pricing() {
  return (
    <section id="pricing" className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <span className="text-sm font-semibold tracking-[0.2em] text-terra uppercase">
            Simple Pricing
          </span>
          <h2 className="mt-3 font-display text-4xl font-semibold text-forest md:text-5xl">
            Pick your stay
          </h2>
          <p className="mt-4 text-muted-foreground">
            Transparent pricing. Reach out on WhatsApp for custom requests.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {(Object.keys(PACKAGES) as PackageType[]).map((key, i) => {
            const p = PACKAGES[key];
            const isPopular = !!p.popular;
            return (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 40, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -8 }}
                className={`relative overflow-hidden rounded-3xl border p-7 shadow-soft transition-shadow hover:shadow-warm ${
                  isPopular
                    ? "border-transparent text-cream"
                    : "border-border bg-card"
                }`}
              >
                {/* Background Image with Overlay */}
                <div className="absolute inset-0 -z-10">
                  <img src={packageImages[key]} className="size-full object-cover" alt="" />
                  <div className={`absolute inset-0 ${isPopular ? 'bg-forest/85' : 'bg-white/95'}`} />
                </div>
                {isPopular && (
                  <div className="absolute top-5 right-5 inline-flex items-center gap-1 rounded-full bg-cream/95 px-3 py-1 text-xs font-bold text-terra">
                    <Sparkles className="size-3" /> Most Popular
                  </div>
                )}
                <h3
                  className={`font-display text-2xl font-semibold ${isPopular ? "text-cream" : "text-forest"}`}
                >
                  {p.name}
                </h3>
                <p
                  className={`mt-1 text-sm ${isPopular ? "text-cream/80" : "text-muted-foreground"}`}
                >
                  {p.tagline}
                </p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span
                    className={`font-display text-5xl font-semibold ${isPopular ? "text-cream" : "text-forest"}`}
                  >
                    ₹{p.price.toLocaleString("en-IN")}
                  </span>
                  <span
                    className={`text-sm ${isPopular ? "text-cream/70" : "text-muted-foreground"}`}
                  >
                    {key === "night_stay"
                      ? "/night"
                      : key === "event"
                        ? " onwards"
                        : ""}
                  </span>
                </div>

                {key === "event" && (
                  <p
                    className={`mt-2 text-xs ${isPopular ? "text-cream/80" : "text-terra"}`}
                  >
                    * Final price varies based on guest count & add-ons.
                  </p>
                )}

                <ul className="mt-6 space-y-3">
                  {features[key].map((f) => (
                    <li
                      key={f}
                      className={`flex items-center gap-2 text-sm ${isPopular ? "text-cream/95" : "text-foreground/80"}`}
                    >
                      <Check className="size-4 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => bookingModal.open()}
                  className={`mt-7 h-12 w-full rounded-full font-semibold ${
                    isPopular
                      ? "bg-cream text-terra hover:bg-cream/90"
                      : "bg-forest text-cream hover:bg-forest/90"
                  }`}
                >
                  Book Now
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
