import { useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { bookingModal } from "@/store/bookingModal";
import { breezyImages } from "@/assets/breezy";

const poolImg = breezyImages.farmhouse8;
const archImg = breezyImages.farmhouse9;
const diningImg = breezyImages.farmhouse10;

const stats = [
  { n: 50, suffix: "+", label: "Happy Guests" },
  { n: 12, suffix: "+", label: "Amenities" },
  { n: 5, suffix: "★", label: "Rated" },
  { n: 2, suffix: " Acres", label: "Of Greenery" },
];

function Counter({ to, suffix }: { to: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  useEffect(() => {
    if (!inView || !ref.current) return;
    const el = ref.current;
    const duration = 1400;
    const start = performance.now();
    const animate = (t: number) => {
      const p = Math.min((t - start) / duration, 1);
      el.textContent = Math.floor(p * to).toString();
      if (p < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [inView, to]);
  return (
    <>
      <span ref={ref}>0</span>
      <span>{suffix}</span>
    </>
  );
}

export function About() {
  return (
    <section id="about" className="relative px-6 py-24 md:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
        >
          <span className="text-sm font-semibold tracking-[0.2em] text-terra uppercase">
            Welcome to Breezy Corner
          </span>
          <h2 className="mt-3 font-display text-4xl font-semibold text-forest md:text-5xl">
            A private retreat where{" "}
            <em className="text-terra not-italic">comfort meets nature</em>.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            Tucked into the coconut groves of Devipattinam, our farmhouse offers
            a curated escape — sun-drenched pool days, slow dinners under
            string lights, and crackling campfires by the sea breeze. Perfect
            for families, friends, and unforgettable celebrations.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label}>
                <div className="font-display text-3xl font-semibold text-forest md:text-4xl">
                  <Counter to={s.n} suffix={s.suffix} />
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          <Button
            onClick={() => bookingModal.open()}
            className="mt-10 h-12 rounded-full bg-forest px-7 text-cream hover:bg-forest/90"
          >
            Reserve Your Stay
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-2 gap-4"
        >
          <motion.img
            src={poolImg}
            alt="Pool"
            loading="lazy"
            className="aspect-[3/4] h-full w-full rounded-3xl object-cover shadow-soft"
            whileHover={{ scale: 1.03, rotate: -1 }}
          />
          <div className="flex flex-col gap-4">
            <motion.img
              src={archImg}
              alt="Garden arch"
              loading="lazy"
              className="aspect-square w-full rounded-3xl object-cover shadow-soft"
              whileHover={{ scale: 1.03, rotate: 1 }}
            />
            <motion.img
              src={diningImg}
              alt="Dining"
              loading="lazy"
              className="aspect-square w-full rounded-3xl object-cover shadow-soft"
              whileHover={{ scale: 1.03, rotate: -1 }}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
