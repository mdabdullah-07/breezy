import { motion } from "framer-motion";
import { breezyImages } from "@/assets/breezy";

const items = [
  { src: breezyImages.farmhouse2, label: "Private Entry", span: "md:col-span-2 md:row-span-2" },
  { src: breezyImages.farmhouse3, label: "Main Villa", span: "" },
  { src: breezyImages.farmhouse4, label: "Garden & Pool", span: "" },
  { src: breezyImages.farmhouse5, label: "Night View", span: "md:row-span-2" },
  { src: breezyImages.farmhouse6, label: "Lounge Area", span: "md:col-span-2" },
  { src: breezyImages.farmhouse7, label: "Greenery", span: "" },
];

export function Gallery() {
  return (
    <section
      id="gallery"
      className="relative gradient-forest px-6 py-24 text-cream md:py-32"
    >
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          className="text-center"
        >
          <span className="text-sm font-semibold tracking-[0.2em] text-gold uppercase">
            Visual Tour
          </span>
          <h2 className="mt-3 font-display text-4xl font-semibold md:text-5xl">
            Step inside the breeze
          </h2>
          <p className="mt-4 text-cream/70">
            Every corner crafted to slow you down.
          </p>
        </motion.div>

        <div className="mt-14 grid auto-rows-[200px] grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 md:auto-rows-[220px]">
          {items.map((it, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.07, duration: 0.6 }}
              className={`group relative overflow-hidden rounded-3xl shadow-soft ${it.span}`}
            >
              <img
                src={it.src}
                alt={it.label}
                loading="lazy"
                className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest/80 via-transparent to-transparent opacity-80" />
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: i * 0.3 }}
                className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-cream/15 px-3 py-1.5 text-xs font-medium backdrop-blur"
              >
                {it.label}
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
