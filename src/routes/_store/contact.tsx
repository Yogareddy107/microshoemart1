import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Clock, Instagram, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { whatsappLink } from "@/lib/format";
import { storeSettingsQuery } from "@/lib/queries";

const TITLE = "Contact Micro Shoe Mart — Koilkuntla, Nandyal";
const DESCRIPTION =
  "Call, WhatsApp or visit Micro Shoe Mart at RTC Busstand Road, Koilkuntla, Nandyal District, Andhra Pradesh - 518134.";

export const Route = createFileRoute("/_store/contact")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { data: settings } = useQuery(storeSettingsQuery);
  const address =
    settings?.address ??
    "RTC Busstand Road, Koilkuntla, Nandyal District, Andhra Pradesh - 518134";

  return (
    <div className="container-page py-14 sm:py-20">
      <p className="eyebrow text-primary">Contact</p>
      <h1 className="mt-2 font-display text-4xl sm:text-5xl">We're on RTC Busstand Road</h1>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <p className="flex items-start gap-3 text-base">
            <MapPin className="mt-1 size-5 shrink-0 text-primary" aria-hidden="true" />
            {address}
          </p>
          {settings?.phone && (
            <p className="flex items-center gap-3">
              <Phone className="size-5 text-primary" aria-hidden="true" />
              <a href={`tel:${settings.phone}`} className="hover:text-primary">
                {settings.phone}
              </a>
            </p>
          )}
          {settings?.email && (
            <p className="flex items-center gap-3">
              <Mail className="size-5 text-primary" aria-hidden="true" />
              <a href={`mailto:${settings.email}`} className="hover:text-primary">
                {settings.email}
              </a>
            </p>
          )}
          {settings?.opening_hours && (
            <p className="flex items-center gap-3">
              <Clock className="size-5 text-primary" aria-hidden="true" />
              {settings.opening_hours}
            </p>
          )}
          {settings?.instagram_url && (
            <p className="flex items-center gap-3">
              <Instagram className="size-5 text-primary" aria-hidden="true" />
              <a
                href={settings.instagram_url}
                target="_blank"
                rel="noreferrer noopener"
                className="hover:text-primary"
              >
                @micro__shoe_mart
              </a>
            </p>
          )}
          <div className="flex flex-wrap gap-3 pt-4">
            <Button asChild>
              <a
                href={whatsappLink(
                  settings?.whatsapp_number,
                  "Hi Micro Shoe Mart, I have a question about footwear.",
                )}
                target="_blank"
                rel="noreferrer noopener"
              >
                <MessageCircle className="size-4" /> Chat on WhatsApp
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
                target="_blank"
                rel="noreferrer noopener"
              >
                Open in Maps
              </a>
            </Button>
          </div>
        </div>
        <iframe
          title="Micro Shoe Mart location map"
          className="h-80 w-full rounded-2xl border border-border"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.google.com/maps?q=${encodeURIComponent(address)}&output=embed`}
        />
      </div>
    </div>
  );
}
