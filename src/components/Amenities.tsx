import { motion } from "framer-motion";

const amenities = [
  { icon: "🏊", name: "Swimming Pool", desc: "Adult + baby pool" },
  { icon: "🔥", name: "BBQ Setup", desc: "Grill under the stars" },
  { icon: "🌙", name: "Mini Campfire", desc: "Cozy evenings" },
  { icon: "🍳", name: "Equipped Kitchen", desc: "Cook your favorites" },
  { icon: "🏖️", name: "Beach Nearby", desc: "Just 5 minutes away" },
  { icon: "🅿️", name: "Spacious Parking", desc: "Multiple vehicles" },
  { icon: "🏸", name: "Badminton Court", desc: "Net + rackets" },
  { icon: "🎡", name: "Kids Play Zone", desc: "Slides & swings" },
  { icon: "🎲", name: "Indoor Games", desc: "Carrom, chess, cards" },
  { icon: "🍽️", name: "Covered Dining", desc: "Open-air feasts" },
  { icon: "🙏", name: "Prayer Space", desc: "Quiet corner" },
  { icon: "🍛", name: "Catering", desc: "On request" },
];

export function Amenities() {
  return (
    <section id="amenities" className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <span className="text-sm font-semibold tracking-[0.2em] text-terra uppercase">
            Everything Included
          </span>
          <h2 className="mt-3 font-display text-4xl font-semibold text-forest md:text-5xl">
            12+ premium amenities
          </h2>
        </motion.div>

        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-5 lg:grid-cols-4">
          {amenities.map((a, i) => (
            <motion.div
              key={a.name}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{
                delay: (i % 4) * 0.08 + Math.floor(i / 4) * 0.1,
                type: "spring",
                stiffness: 120,
              }}
              whileHover={{
                y: -6,
                rotate: -1,
                transition: { type: "spring", stiffness: 300 },
              }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-soft transition-colors hover:border-terra"
            >
              <motion.div
                whileHover={{ scale: 1.2, rotate: 8 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="text-4xl"
              >
                {a.icon}
              </motion.div>
              <h3 className="mt-3 font-display text-lg font-semibold text-forest">
                {a.name}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{a.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
