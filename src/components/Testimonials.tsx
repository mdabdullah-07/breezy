import { motion } from "framer-motion";
import { Star } from "lucide-react";

const reviews = [
  {
    name: "Priya & Family",
    text: "Absolutely magical weekend! The pool, the campfire, the breeze — everything was perfect for our family reunion.",
  },
  {
    name: "Karthik R.",
    text: "Hosted my 30th here. The team was super flexible, and the dining hall is gorgeous at night with the lights.",
  },
  {
    name: "Anjali Menon",
    text: "Loved how peaceful it felt. Coconut groves, the beach 5 mins away, and the kids never wanted to leave.",
  },
];

export function Testimonials() {
  return (
    <section className="gradient-forest relative px-6 py-24 text-cream md:py-32">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <span className="text-sm font-semibold tracking-[0.2em] text-gold uppercase">
            Guest Stories
          </span>
          <h2 className="mt-3 font-display text-4xl font-semibold md:text-5xl">
            Loved by every guest
          </h2>
        </motion.div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {reviews.map((r, i) => (
            <motion.div
              key={r.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ rotateY: 6, rotateX: -3, scale: 1.02 }}
              style={{ transformStyle: "preserve-3d", perspective: "1000px" }}
              className="glass-dark rounded-3xl p-7"
            >
              <div className="flex gap-1 text-gold">
                {Array.from({ length: 5 }).map((_, k) => (
                  <Star key={k} className="size-4 fill-current" />
                ))}
              </div>
              <p className="mt-4 leading-relaxed text-cream/90">"{r.text}"</p>
              <div className="mt-5 font-display text-lg font-semibold">
                {r.name}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
