"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { BarChart3, Compass, Lightbulb, Map, Sparkles } from "lucide-react";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

export const APP_NAV_ITEMS: NavItem[] = [
  { label: "Khám phá", href: "/", icon: Compass },
  { label: "Bản đồ", href: "/ban-do", icon: Map },
  { label: "Hỏi AI", href: "/hoi-ai", icon: Sparkles },
  { label: "Phân tích", href: "/phan-tich", icon: BarChart3 },
  { label: "Insights", href: "/insights", icon: Lightbulb },
];

function isItemActive(pathname: string, href: string): boolean {
  if (href === "/") {
    return pathname === "/";
  }
  return pathname.startsWith(href);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-foreground">
      {/* ======================================================== */}
      {/* Desktop Left Icon Rail (>= 768px, 72px fixed)           */}
      {/* ======================================================== */}
      <aside
        aria-label="Sidebar Navigation"
        className="fixed inset-y-0 left-0 z-40 hidden w-[72px] flex-col items-center justify-between glass-strong py-5 md:flex"
      >
        <div className="flex flex-col items-center gap-6">
          {/* Logo ☕ */}
          <Link
            href="/"
            aria-label="Cafe An Thượng - Trang chủ"
            className="group flex size-12 items-center justify-center rounded-2xl border border-transparent bg-primary text-2xl font-bold text-primary-foreground shadow-glass transition-all duration-200 hover:-translate-y-0.5 hover:shadow-glass-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            ☕
          </Link>

          {/* Navigation Items */}
          <TooltipProvider delay={100}>
            <nav className="flex flex-col items-center gap-3">
              {APP_NAV_ITEMS.map((item) => {
                const active = isItemActive(pathname, item.href);
                const Icon = item.icon;
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger
                      render={
                        <Link
                          href={item.href}
                          aria-label={item.label}
                          className={cn(
                            "group relative flex size-12 items-center justify-center rounded-2xl transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            active
                              ? "border border-border bg-primary text-primary-foreground shadow-glass"
                              : "text-muted-foreground hover:-translate-y-0.5 hover:bg-card hover:text-foreground hover:shadow-glass-sm",
                          )}
                        />
                      }
                    >
                      <Icon className="size-5 stroke-[2.2]" />
                      {item.badge && (
                        <span className="absolute -top-1 -right-1 flex h-4 items-center justify-center rounded-full border border-border bg-destructive px-1 text-[9px] font-bold text-destructive-foreground uppercase shadow-glass-sm">
                          {item.badge}
                        </span>
                      )}
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={12}>
                      <span className="font-bold">{item.label}</span>
                      {item.badge && (
                        <span className="py-0.2 ml-1 rounded border border-border bg-destructive px-1 text-[9px] font-bold text-destructive-foreground uppercase">
                          {item.badge}
                        </span>
                      )}
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </nav>
          </TooltipProvider>
        </div>

        {/* Footer version label on rail */}
        <div className="flex flex-col items-center">
          <span className="font-mono text-[10px] font-bold text-muted-foreground">MVP</span>
        </div>
      </aside>

      {/* ======================================================== */}
      {/* Mobile Top Brand Bar (< 768px)                           */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between glass-strong px-4 md:hidden">
        <Link href="/" className="flex items-center gap-2.5 outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <div className="flex size-8 items-center justify-center rounded-xl bg-primary text-base font-bold text-primary-foreground shadow-glass-sm">
            ☕
          </div>
          <span className="font-heading text-base font-bold tracking-tight text-foreground">Cafe An Thượng</span>
        </Link>
        <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
          ĐÀ NẴNG
        </span>
      </header>

      {/* ======================================================== */}
      {/* Main Content Area (offset 72px on desktop, pb on mobile)  */}
      {/* ======================================================== */}
      <div className="flex min-h-screen flex-col md:pl-[72px]">
        <main className="flex-1 pb-20 md:pb-8">{children}</main>

        <footer className="border-t border-border bg-card/40 px-4 py-6 text-center text-xs font-medium text-muted-foreground">
          <div className="mx-auto max-w-5xl">Cafe An Thượng · Dữ liệu F&B khu phố Tây An Thượng, Đà Nẵng</div>
        </footer>
      </div>

      {/* ======================================================== */}
      {/* Mobile Bottom Navigation (< 768px, fixed bottom)         */}
      {/* ======================================================== */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around glass-strong px-1 pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        {APP_NAV_ITEMS.map((item) => {
          const active = isItemActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              className={cn(
                "group relative flex flex-1 flex-col items-center justify-center py-1 transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring",
                active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <div
                className={cn(
                  "relative flex size-8 items-center justify-center rounded-lg transition-all",
                  active ? "bg-primary text-primary-foreground shadow-glass-sm" : "text-muted-foreground",
                )}
              >
                <Icon className="size-4 stroke-[2.2]" />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 flex size-2 rounded-full border border-border bg-destructive" />
                )}
              </div>
              <span
                className={cn(
                  "mt-0.5 text-[10px] leading-tight",
                  active ? "font-bold text-foreground" : "font-medium text-muted-foreground",
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
