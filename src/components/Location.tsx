import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { ADDRESS } from "@/lib/booking";

const distances = [
  { label: "Beach", value: "5 min" },
  { label: "Bus Stand", value: "2 km" },
  { label: "Ramanathapuram", value: "20 km" },
  { label: "Rameswaram", value: "55 km" },
];

export function Location() {
  return (
    <section className="px-6 py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <span className="text-sm font-semibold tracking-[0.2em] text-terra uppercase">
            Find Us
          </span>
          <h2 className="mt-3 font-display text-4xl font-semibold text-forest md:text-5xl">
            By the coast in Devipattinam
          </h2>
          <p className="mt-4 flex items-start gap-2 text-muted-foreground">
            <MapPin className="mt-1 size-5 shrink-0 text-terra" />
            <span>{ADDRESS}</span>
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4">
            {distances.map((d) => (
              <div
                key={d.label}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <div className="text-sm text-muted-foreground">{d.label}</div>
                <div className="mt-1 font-display text-2xl font-semibold text-forest">
                  {d.value}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="aspect-[4/3] overflow-hidden rounded-3xl shadow-soft"
        >
          <iframe
            src="https://www.google.com/maps?q=Devipattinam,Tamil+Nadu&output=embed"
            className="size-full border-0"
            loading="lazy"
            title="Breezy Corner Farm House location"
          />
        </motion.div>
      </div>
    </section>
  );
}
