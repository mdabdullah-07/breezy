export const WHATSAPP_NUMBER = "918940086749";
export const PHONES = ["+918940086749", "+919361594033", "+918608453911"];
export const INSTAGRAM = "breezy_farmstay";
export const ADDRESS =
  "Rahim Durai Estate, Zamindar Valasai, Kadarkarai Salai, Devipattinam, RMD District – 623514";

export type PackageType = "day_visit" | "night_stay" | "event";

export const PACKAGES: Record<
  PackageType,
  { name: string; price: number; capacity: number; tagline: string; popular?: boolean }
> = {
  day_visit: {
    name: "Day Visit",
    price: 2500,
    capacity: 15,
    tagline: "Up to 15 guests · 9 AM – 6 PM",
  },
  night_stay: {
    name: "Day & Night Stay",
    price: 3000,
    capacity: 30,
    tagline: "Up to 30 guests · 24 hours",
    popular: true,
  },
  event: {
    name: "Event / Party",
    price: 7999,
    capacity: 50,
    tagline: "Up to 50 guests · Full property",
  },
};


export function buildWhatsAppMessage(opts: {
  name: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  time: string;
  guests: number;
  totalDays: number;
  packageType: PackageType;
  total: number;
  specialRequest?: string;
}) {
  const pkg = PACKAGES[opts.packageType];
  const isEvent = opts.packageType === "event";
  
  const lines = [
    "*NEW BOOKING REQUEST - BREEZY CORNER* 🌿",
    "",
    "*Customer Details:*",
    "👤 *Name:* " + opts.name,
    "📞 *Phone:* " + opts.phone,
    "",
    "*Stay Details:*",
    "📅 *Check-in:* " + opts.checkIn,
    "📅 *Check-out:* " + opts.checkOut,
    "⏰ *Timing:* " + opts.time,
    "👥 *Guest Count:* " + opts.guests,
    "⏳ *Total Duration:* " + (opts.totalDays === 1 ? "1 Day (24h)" : `${opts.totalDays} Days`),
    "",
    "*Plan Selection:*",
    "📦 *Package:* " + pkg.name,
    "💰 *Total Price:* ₹" + opts.total.toLocaleString("en-IN"),
    "",
    ...(opts.specialRequest ? ["📝 *Special Request:* " + opts.specialRequest, ""] : []),
    "━━━━━━━━━━━━━━━",
    "Please confirm my booking availability. Looking forward to your response!",
    "━━━━━━━━━━━━━━━",
  ];
  return lines.join("\n");
}

export function whatsappLink(message: string) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
