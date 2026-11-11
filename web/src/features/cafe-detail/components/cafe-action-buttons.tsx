import { ExternalLink, Globe, MapPin, Phone } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CafeActionButtonsProps {
  mapsLink: string | null;
  phone: string | null;
  website: string | null;
  className?: string;
}

export function CafeActionButtons({ mapsLink, phone, website, className }: CafeActionButtonsProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2.5", className)}>
      {mapsLink ? (
        <a
          href={mapsLink}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonVariants({ variant: "default", size: "default" }),
            "gap-2 text-xs font-bold tracking-wider uppercase",
          )}
        >
          <MapPin className="size-4 stroke-[2.5]" />
          <span>Mở Google Maps</span>
          <ExternalLink className="size-3.5 stroke-[2.5]" />
        </a>
      ) : null}

      {phone ? (
        <a
          href={`tel:${phone}`}
          className={cn(
            buttonVariants({ variant: "outline", size: "default" }),
            "gap-2 text-xs font-bold tracking-wider uppercase",
          )}
        >
          <Phone className="size-4 stroke-[2.5]" />
          <span>Gọi điện: {phone}</span>
        </a>
      ) : null}

      {website ? (
        <a
          href={website}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            buttonVariants({ variant: "outline", size: "default" }),
            "gap-2 text-xs font-bold tracking-wider uppercase",
          )}
        >
          <Globe className="size-4 stroke-[2.5]" />
          <span>Trang web</span>
          <ExternalLink className="size-3.5 stroke-[2.5]" />
        </a>
      ) : null}
    </div>
  );
}
