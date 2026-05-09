import { useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { CheckCircle2, Home, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { whatsappLink } from "@/lib/booking";

import { z } from "zod";

const successSearchSchema = z.object({
  msg: z.string().optional(),
});

export const Route = createFileRoute("/booking/success")({
  validateSearch: successSearchSchema,
  head: () => ({
    meta: [
      { title: "Booking Confirmed — Breezy Corner Farm House" },
      {
        name: "description",
        content: "Your booking request has been sent. We'll confirm shortly.",
      },
    ],
  }),
  component: SuccessPage,
});

function SuccessPage() {
  const { msg } = Route.useSearch();
  const whatsappMsg = msg || "Hi Breezy Corner! I'd like to follow up on my booking.";
  
  useEffect(() => {
    const end = Date.now() + 1200;
    const colors = ["#C4713D", "#D4A853", "#4A7A5A", "#1A3A2A"];
    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 70,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 70,
        origin: { x: 1 },
        colors,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  }, []);

  return (
    <main className="grid min-h-screen place-items-center bg-background px-6 py-16">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 180 }}
        className="w-full max-w-lg rounded-3xl border border-border bg-card p-10 text-center shadow-warm"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 220 }}
          className="mx-auto grid size-20 place-items-center rounded-full bg-emerald-500/15 text-emerald-600"
        >
          <CheckCircle2 className="size-12" />
        </motion.div>
        <h1 className="mt-6 font-display text-3xl font-semibold text-forest md:text-4xl">
          Booking request sent!
        </h1>
        <p className="mt-3 text-muted-foreground">
          We've received your details. Our team will confirm your stay on
          WhatsApp shortly. 🌿
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            asChild
            className="h-12 rounded-full bg-[#25D366] text-white hover:bg-[#1fb858]"
          >
            <a
              href={whatsappLink(whatsappMsg)}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle className="mr-2 size-4" />
              Open WhatsApp
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-12 rounded-full"
          >
            <Link to="/">
              <Home className="mr-2 size-4" />
              Back to home
            </Link>
          </Button>
        </div>
      </motion.div>
    </main>
  );
}
