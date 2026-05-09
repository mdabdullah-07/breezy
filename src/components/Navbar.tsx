import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Leaf, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { bookingModal } from "@/store/bookingModal";
import { cn } from "@/lib/utils";

const links = [
  { to: "#about", label: "About" },
  { to: "#gallery", label: "Gallery" },
  { to: "#amenities", label: "Amenities" },
  { to: "#pricing", label: "Pricing" },
  { to: "#contact", label: "Contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const logoRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-all duration-300",
        scrolled ? "py-2" : "py-4",
      )}
    >
      <div
        className={cn(
          "mx-auto flex max-w-7xl items-center justify-between rounded-full px-5 transition-all duration-300",
          scrolled
            ? "glass mx-3 py-2 shadow-soft md:mx-auto"
            : "py-3 text-cream",
        )}
      >
        <Link to="/" className="flex items-center gap-2">
          <span
            ref={logoRef}
            className="grid size-9 place-items-center rounded-full bg-terra text-cream shadow-warm transition-transform hover:rotate-12"
          >
            <Leaf className="size-5" />
          </span>
          <span
            className={cn(
              "font-display text-lg font-semibold tracking-tight",
              scrolled ? "text-forest" : "text-cream",
            )}
          >
            Breezy Corner
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <a
              key={l.to}
              href={l.to}
              className={cn(
                "text-sm font-medium transition-colors hover:text-terra",
                scrolled ? "text-forest" : "text-cream/90",
              )}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => bookingModal.open()}
            size="sm"
            className="hidden rounded-full bg-terra px-5 font-semibold text-primary-foreground hover:bg-terra/90 hover:shadow-warm md:inline-flex"
          >
            Book Now
          </Button>
          <button
            className={cn(
              "grid size-10 place-items-center rounded-full md:hidden",
              scrolled ? "text-forest" : "text-cream",
            )}
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {open && (
        <div className="glass mx-3 mt-2 flex flex-col gap-3 rounded-2xl p-5 md:hidden">
          {links.map((l) => (
            <a
              key={l.to}
              href={l.to}
              onClick={() => setOpen(false)}
              className="text-base font-medium text-forest"
            >
              {l.label}
            </a>
          ))}
          <Button
            onClick={() => {
              setOpen(false);
              bookingModal.open();
            }}
            className="rounded-full bg-terra text-primary-foreground"
          >
            Book Now
          </Button>
        </div>
      )}
    </header>
  );
}
