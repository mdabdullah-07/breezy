import { Leaf } from "lucide-react";

export function Footer() {
  return (
    <footer className="gradient-forest px-6 py-12 text-cream/80">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
        <div className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-full bg-terra text-cream">
            <Leaf className="size-4" />
          </span>
          <div>
            <div className="font-display text-base font-semibold text-cream">
              Breezy Corner Farm House
            </div>
            <div className="text-xs">The Comfort Stay with Nature</div>
          </div>
        </div>
        <div className="flex flex-col items-center gap-2 md:items-end">
          <div className="text-xs">
            © {new Date().getFullYear()} Breezy Corner. All rights reserved.
          </div>
          <a href="/admin" className="text-[10px] opacity-30 hover:opacity-100 transition-opacity">
            Admin Login
          </a>
        </div>
      </div>
    </footer>
  );
}
