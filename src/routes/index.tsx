import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Hero } from "@/components/Hero";
import { About } from "@/components/About";
import { Gallery } from "@/components/Gallery";
import { Amenities } from "@/components/Amenities";
import { Pricing } from "@/components/Pricing";
import { Testimonials } from "@/components/Testimonials";
import { Location } from "@/components/Location";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";
import { BookingCalendarModal } from "@/components/BookingCalendarModal";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <About />
        <Gallery />
        <Amenities />
        <Pricing />
        <Testimonials />
        <Location />
        <Contact />
      </main>
      <Footer />
      <FloatingWhatsApp />
      <BookingCalendarModal />
      <Toaster position="top-center" richColors />
    </>
  );
}
