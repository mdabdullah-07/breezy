import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ChevronDown, MapPin, Sparkles } from "lucide-react";
import heroImg from "@/assets/breezy/farmhouse-1.jpg";
import { HeroParticles } from "@/components/three/HeroParticles";
import { Button } from "@/components/ui/button";
import { bookingModal } from "@/store/bookingModal";

export function Hero() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!titleRef.current) return;
    const letters = titleRef.current.querySelectorAll<HTMLSpanElement>(".ltr");
    gsap.fromTo(
      letters,
      { y: 60, opacity: 0, rotateX: -90 },
      {
        y: 0,
        opacity: 1,
        rotateX: 0,
        duration: 0.9,
        stagger: 0.035,
        ease: "back.out(1.6)",
        delay: 0.3,
      },
    );

    const onScroll = () => {
      if (bgRef.current) {
        const y = window.scrollY * 0.35;
        bgRef.current.style.transform = `translate3d(0, ${y}px, 0) scale(1.08)`;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const title = "The Comfort Stay with Nature";

  return (
    <section className="relative isolate flex min-h-[100svh] items-center overflow-hidden">
      {/* Parallax bg */}
      <div
        ref={bgRef}
        className="absolute inset-0 -z-10 will-change-transform"
        style={{
          backgroundImage: `url(${heroImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div
        className="absolute inset-0 -z-10"
        style={{ background: "var(--gradient-hero)" }}
      />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-48 bg-gradient-to-t from-background to-transparent" />

      <HeroParticles />

      <div className="relative z-20 mx-auto w-full max-w-6xl px-6 pt-32 pb-20 text-cream md:pt-40">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-cream/30 bg-cream/10 px-4 py-1.5 text-sm backdrop-blur"
        >
          <MapPin className="size-3.5" />
          🌴 Devipattinam, Tamil Nadu
        </motion.div>

        <h1
          ref={titleRef}
          className="font-display text-5xl leading-[1.05] font-semibold tracking-tight text-balance md:text-7xl lg:text-[5.5rem]"
          style={{ perspective: "800px" }}
        >
          {title.split(" ").map((word, wi) => (
            <span key={wi} className="mr-3 inline-block whitespace-nowrap">
              {word.split("").map((ch, ci) => (
                <span
                  key={ci}
                  className="ltr inline-block opacity-0"
                  style={{ display: "inline-block" }}
                >
                  {ch}
                </span>
              ))}
            </span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="mt-6 max-w-2xl text-lg text-cream/85 md:text-xl"
        >
          A private 2-acre farmhouse retreat with a pool, BBQ, campfire, and
          coconut groves — minutes from the beach.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className="mt-8 flex flex-wrap items-center gap-4"
        >
          <div className="inline-flex items-center gap-2 rounded-full bg-gold/95 px-5 py-2 text-sm font-semibold text-forest shadow-warm">
            <Sparkles className="size-4" />
            Starting from ₹1,499/day
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.6 }}
          className="mt-8 flex flex-wrap gap-3"
        >
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Button
              size="lg"
              onClick={() => bookingModal.open()}
              className="h-14 rounded-full bg-terra px-8 text-base font-semibold text-primary-foreground shadow-warm hover:bg-terra/90"
            >
              Book Now
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="h-14 rounded-full border-cream/40 bg-transparent px-8 text-base font-semibold text-cream backdrop-blur hover:bg-cream/10 hover:text-cream"
            >
              <a href="#gallery">Explore Property</a>
            </Button>
          </motion.div>
        </motion.div>

        <motion.a
          href="#about"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-cream/70"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            className="grid size-10 place-items-center rounded-full border border-cream/40"
          >
            <ChevronDown className="size-5" />
          </motion.div>
        </motion.a>
      </div>
    </section>
  );
}
