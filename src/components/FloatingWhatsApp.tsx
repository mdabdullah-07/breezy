import { MessageCircle } from "lucide-react";
import { whatsappLink } from "@/lib/booking";

export function FloatingWhatsApp() {
  return (
    <a
      href={whatsappLink("Hi Breezy Corner! I'd like to book the farmhouse.")}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat on WhatsApp"
      className="animate-pulse-ring fixed right-5 bottom-5 z-30 grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-warm transition-transform hover:scale-110"
    >
      <MessageCircle className="size-6" />
    </a>
  );
}
