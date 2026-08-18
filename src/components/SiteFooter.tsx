import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Clock, Instagram, Mail, MapPin, Phone } from "lucide-react";

import { storeSettingsQuery } from "@/lib/queries";

export function SiteFooter() {
  const { data: settings } = useQuery(storeSettingsQuery);

  return (
    <footer className="mt-20 bg-ink text-ink-foreground">
      <div className="container-page grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="flex items-center gap-2 font-display text-2xl">
            <span aria-hidden="true">👟</span>
            {settings?.store_name ?? "Micro Shoe Mart"}
          </p>
          <p className="mt-1 font-display text-lg text-primary-foreground/70">
            {settings?.tagline ?? "Step Into Your Style"}
          </p>
          <p className="mt-5 flex max-w-sm items-start gap-2 text-sm text-ink-foreground/70">
            <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {settings?.address ??
              "RTC Busstand Road, Koilkuntla, Nandyal District, Andhra Pradesh - 518134"}
          </p>
          <div className="mt-4 flex flex-col gap-2 text-sm text-ink-foreground/70">
            {settings?.phone && (
              <a
                href={`tel:${settings.phone}`}
                className="flex items-center gap-2 transition-colors hover:text-ink-foreground"
              >
                <Phone className="size-4" aria-hidden="true" />
                {settings.phone}
              </a>
            )}
            {settings?.email && (
              <a
                href={`mailto:${settings.email}`}
                className="flex items-center gap-2 transition-colors hover:text-ink-foreground"
              >
                <Mail className="size-4" aria-hidden="true" />
                {settings.email}
              </a>
            )}
            {settings?.opening_hours && (
              <span className="flex items-center gap-2">
                <Clock className="size-4" aria-hidden="true" />
                {settings.opening_hours}
              </span>
            )}
            {settings?.instagram_url && (
              <a
                href={settings.instagram_url}
                target="_blank"
                rel="noreferrer noopener"
                className="flex items-center gap-2 transition-colors hover:text-ink-foreground"
              >
                <Instagram className="size-4" aria-hidden="true" />
                Follow us on Instagram
              </a>
            )}
          </div>
        </div>

        <nav aria-label="Shop links">
          <h2 className="eyebrow text-ink-foreground/50">Shop</h2>
          <ul className="mt-4 space-y-2 text-sm text-ink-foreground/75">
            {[
              { label: "All footwear", to: "/shop" as const },
              { label: "Men", to: "/men" as const },
              { label: "Women", to: "/women" as const },
              { label: "Kids", to: "/kids" as const },
              { label: "Offers", to: "/offers" as const },
              { label: "Wishlist", to: "/wishlist" as const },
            ].map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="transition-colors hover:text-ink-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="eyebrow text-ink-foreground/50">Store &amp; policies</h2>
          <ul className="mt-4 space-y-2 text-sm text-ink-foreground/75">
            <li>
              <Link to="/about" className="transition-colors hover:text-ink-foreground">
                About the store
              </Link>
            </li>
            <li>
              <Link to="/contact" className="transition-colors hover:text-ink-foreground">
                Contact &amp; directions
              </Link>
            </li>
          </ul>
          {settings?.delivery_info && (
            <p className="mt-5 text-xs leading-relaxed text-ink-foreground/60">
              {settings.delivery_info}
            </p>
          )}
          {settings?.policies && (
            <p className="mt-3 text-xs leading-relaxed text-ink-foreground/60">
              {settings.policies}
            </p>
          )}
        </div>
      </div>
      <div className="border-t border-white/10 py-5">
        <div className="container-page flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-xs text-ink-foreground/50">
          <p>
            © {new Date().getFullYear()} {settings?.store_name ?? "Micro Shoe Mart"}, Koilkuntla.
            Orders are confirmed on WhatsApp.
          </p>
          <p className="tracking-wide">
            Crafted by{" "}
            <a
              href="https://intraspherelabs.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-primary-foreground border-b border-primary pb-0.5 hover:text-primary transition-colors"
            >
              INTRASPHERE LABS
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
