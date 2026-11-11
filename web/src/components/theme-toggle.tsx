"use client";

import * as React from "react";
import { Laptop, Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { useTheme, type Theme } from "./theme-provider";

const THEME_OPTIONS: { id: Theme; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "light", label: "Sáng", icon: Sun },
  { id: "dark", label: "Tối", icon: Moon },
  { id: "system", label: "Hệ thống", icon: Laptop },
];

const emptySubscribe = () => () => {};

function useIsClient() {
  return React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const isClient = useIsClient();

  const nextTheme: Theme = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";

  const handleToggle = () => {
    setTheme(nextTheme);
  };

  const getLabel = () => {
    if (theme === "light") return "Giao diện: Sáng (Click để chuyển Tối)";
    if (theme === "dark") return "Giao diện: Tối (Click để chuyển Hệ thống)";
    return `Giao diện: Hệ thống (${resolvedTheme === "dark" ? "Đang tối" : "Đang sáng"}) (Click để chuyển Sáng)`;
  };

  // Render neutral placeholder during SSR to avoid hydration mismatch
  if (!isClient) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled
        aria-label="Đổi giao diện Sáng / Tối"
        className={cn("size-10 rounded-xl glass text-muted-foreground", className)}
      >
        <Sun className="size-4 opacity-50" />
      </Button>
    );
  }

  const CurrentIcon = theme === "light" ? Sun : theme === "dark" ? Moon : Laptop;

  return (
    <TooltipProvider delay={150}>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleToggle}
              aria-label={getLabel()}
              className={cn(
                "relative size-10 rounded-xl glass text-foreground shadow-glass-sm transition-all duration-200 outline-none hover:-translate-y-0.5 hover:text-primary hover:shadow-glass focus-visible:ring-2 focus-visible:ring-ring",
                className,
              )}
            />
          }
        >
          <CurrentIcon className="size-4.5 stroke-[2.2] text-foreground transition-transform duration-200 hover:rotate-12" />
          {theme === "system" && (
            <span
              className="absolute -top-0.5 -right-0.5 flex size-2 rounded-full border border-border bg-primary"
              title="Theo hệ thống"
            />
          )}
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={10}>
          <span className="text-xs font-semibold">{getLabel()}</span>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function ThemeSegmented({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const isClient = useIsClient();

  if (!isClient) {
    return (
      <div className={cn("inline-flex items-center gap-1 rounded-xl glass p-1 shadow-glass-sm", className)}>
        {THEME_OPTIONS.map((opt) => (
          <span
            key={opt.id}
            className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-muted-foreground opacity-50"
          >
            <opt.icon className="size-3.5" />
            <span>{opt.label}</span>
          </span>
        ))}
      </div>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label="Chọn giao diện"
      className={cn(
        "inline-flex items-center gap-1 rounded-xl border border-border/60 glass p-1 shadow-glass-sm",
        className,
      )}
    >
      {THEME_OPTIONS.map((opt) => {
        const active = theme === opt.id;
        const Icon = opt.icon;
        return (
          <button
            key={opt.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setTheme(opt.id)}
            className={cn(
              "flex h-8 cursor-pointer items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring",
              active
                ? "border border-border/80 bg-primary text-primary-foreground shadow-glass-sm"
                : "text-muted-foreground hover:bg-card/60 hover:text-foreground",
            )}
          >
            <Icon className="size-3.5 stroke-[2.2]" />
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
