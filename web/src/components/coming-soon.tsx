import Link from "next/link";
import * as React from "react";
import { ArrowLeft, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ComingSoonProps {
  title: string;
  description: string;
  badgeText?: string;
  icon?: React.ReactNode;
  plannedMilestone?: string;
  showHomeButton?: boolean;
}

export function ComingSoon({
  title,
  description,
  badgeText = "SẮP RA MẮT",
  icon,
  plannedMilestone = "MVP v0.1",
  showHomeButton = true,
}: ComingSoonProps) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg rounded-xl glass p-6 text-center shadow-glass-card sm:p-10">
        <div className="mb-4 flex items-center justify-center gap-2">
          <Badge variant="default" className="px-3 py-1 text-xs font-bold tracking-wider uppercase">
            {badgeText}
          </Badge>
          {plannedMilestone && (
            <Badge variant="secondary" className="px-3 py-1 text-xs font-bold">
              <Clock className="mr-1 size-3 stroke-[2.5]" />
              {plannedMilestone}
            </Badge>
          )}
        </div>

        {icon ? (
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-lg border border-border bg-primary text-primary-foreground shadow-glass sm:size-20">
            {icon}
          </div>
        ) : (
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-lg border border-border bg-primary text-3xl font-bold text-primary-foreground shadow-glass sm:size-20">
            ☕
          </div>
        )}

        <h1 className="mb-3 font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h1>

        <p className="mx-auto mb-8 max-w-md text-sm leading-relaxed font-medium text-muted-foreground sm:text-base">
          {description}
        </p>

        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          {showHomeButton && (
            <Link href="/" className={cn(buttonVariants({ variant: "default" }), "cursor-pointer font-bold")}>
              <ArrowLeft className="mr-1.5 size-4 stroke-[2.5]" />
              VỀ TRANG KHÁM PHÁ
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
