import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

import { advertisementsQuery } from "@/lib/queries";
import type { Advertisement } from "@/lib/types";

function AdItem({ ad }: { ad: Advertisement }) {
  const content = (
    <span className="inline-flex items-center gap-2 px-6 text-xs font-medium tracking-wide sm:text-sm">
      <Sparkles className="size-3.5 shrink-0 opacity-70" aria-hidden="true" />
      <span className="font-semibold uppercase tracking-[0.12em]">{ad.title}</span>
      <span className="opacity-40">•</span>
      <span className="opacity-90">{ad.message}</span>
    </span>
  );

  if (ad.link && ad.link.startsWith("/")) {
    return (
      <Link to={ad.link} className="transition-opacity hover:opacity-70">
        {content}
      </Link>
    );
  }
  if (ad.link) {
    return (
      <a
        href={ad.link}
        target="_blank"
        rel="noreferrer noopener"
        className="transition-opacity hover:opacity-70"
      >
        {content}
      </a>
    );
  }
  return content;
}

export function AnnouncementBar() {
  const { data: ads, isPending } = useQuery(advertisementsQuery);

  if (isPending) {
    return (
      <div className="bg-ink py-2">
        <div className="container-page">
          <div className="skeleton-block h-3.5 w-64 opacity-30" />
        </div>
      </div>
    );
  }

  if (!ads || ads.length === 0) return null;

  const duration = `${Math.max(20, ads.length * 11)}s`;

  return (
    <div
      className="overflow-hidden border-y border-white/10 bg-ink py-2 text-ink-foreground"
      role="region"
      aria-label="Store announcements"
    >
      <div
        className="flex w-max animate-marquee items-center whitespace-nowrap hover:[animation-play-state:paused]"
        style={{ "--marquee-duration": duration } as React.CSSProperties}
      >
        {[0, 1].map((copy) => (
          <div key={copy} className="flex items-center" aria-hidden={copy === 1}>
            {ads.map((ad) => (
              <AdItem key={`${copy}-${ad.id}`} ad={ad} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
