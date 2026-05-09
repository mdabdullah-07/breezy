import { motion } from "framer-motion";
import { Instagram, MapPin, MessageCircle, Phone } from "lucide-react";
import {
  ADDRESS,
  INSTAGRAM,
  PHONES,
  WHATSAPP_NUMBER,
  whatsappLink,
} from "@/lib/booking";

const cards = [
  {
    icon: Phone,
    title: "Call",
    body: PHONES.join("\n"),
    href: `tel:${PHONES[0]}`,
  },
  {
    icon: MessageCircle,
    title: "WhatsApp",
    body: `+${WHATSAPP_NUMBER}`,
    href: whatsappLink("Hi Breezy Corner! I'd like to know more about booking."),
  },
  {
    icon: MapPin,
    title: "Address",
    body: ADDRESS,
    href: "https://www.google.com/maps?q=Devipattinam,Tamil+Nadu",
  },
  {
    icon: Instagram,
    title: "Instagram",
    body: `@${INSTAGRAM}`,
    href: `https://instagram.com/${INSTAGRAM}`,
  },
];

export function Contact() {
  return (
    <section id="contact" className="px-6 py-24 md:py-32">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <span className="text-sm font-semibold tracking-[0.2em] text-terra uppercase">
            Reach Out
          </span>
          <h2 className="mt-3 font-display text-4xl font-semibold text-forest md:text-5xl">
            Let's plan your stay
          </h2>
        </motion.div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c, i) => (
            <motion.a
              key={c.title}
              href={c.href}
              target={c.href.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              className="block rounded-3xl border border-border bg-card p-6 shadow-soft transition-shadow hover:shadow-warm"
            >
              <div className="grid size-12 place-items-center rounded-2xl bg-terra/10 text-terra">
                <c.icon className="size-6" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-forest">
                {c.title}
              </h3>
              <p className="mt-1 text-sm whitespace-pre-line text-muted-foreground">
                {c.body}
              </p>
            </motion.a>
          ))}
        </div>

        <div className="mt-14 flex justify-center">
          <a
            href={whatsappLink(
              "Hi Breezy Corner! I'd like to know more about booking.",
            )}
            target="_blank"
            rel="noreferrer"
            className="inline-flex animate-pulse-ring items-center gap-3 rounded-full bg-[#25D366] px-8 py-4 font-semibold text-white shadow-warm"
          >
            <MessageCircle className="size-5" />
            Chat on WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
