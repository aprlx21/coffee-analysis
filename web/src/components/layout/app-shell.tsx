"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { BarChart3, Calculator, Compass, Database, Lightbulb, Map, Sparkles } from "lucide-react";

import { ThemeSegmented, ThemeToggle } from "@/components/theme-toggle";
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
  { label: "Định giá", href: "/dinh-gia", icon: Calculator },
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

        {/* Footer actions on rail: Theme Toggle & MVP label */}
        <div className="flex flex-col items-center gap-3">
          <ThemeToggle />
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
        <div className="flex items-center gap-2">
          <ThemeToggle className="size-8" />
          <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
            ĐÀ NẴNG
          </span>
        </div>
      </header>

      {/* ======================================================== */}
      {/* Main Content Area (offset 72px on desktop, pb on mobile)  */}
      {/* ======================================================== */}
      <div className="flex min-h-screen flex-col md:pl-[72px]">
        <main className="flex-1 pb-20 md:pb-8">{children}</main>

        <footer className="border-t border-border bg-card/60 px-4 py-8 text-xs font-medium text-muted-foreground backdrop-blur-md">
          <div className="mx-auto flex max-w-5xl flex-col gap-8">
            {/* Top row: Brand summary, metadata & data source badge */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="flex size-6 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground shadow-glass-sm">
                    ☕
                  </span>
                  <span className="font-heading text-sm font-bold text-foreground">Cafe An Thượng</span>
                </div>
                <p className="max-w-md text-xs text-muted-foreground">
                  Nền tảng tra cứu và phân tích thị trường quán cafe tại khu phố Tây An Thượng (Mỹ An, Ngũ Hành Sơn, Đà
                  Nẵng).
                </p>
              </div>

              {/* Data badge */}
              <div className="flex items-center gap-2 self-start rounded-xl border border-border/80 bg-muted/60 px-3 py-2 text-xs font-medium text-foreground shadow-glass-sm sm:self-auto">
                <Database className="size-4 shrink-0 stroke-[2.2] text-primary" />
                <span className="text-[11px] leading-tight">
                  <strong className="font-semibold text-foreground">
                    Dữ liệu Google Maps & Menu OCR An Thượng, Đà Nẵng
                  </strong>
                  <br />
                  <span className="text-muted-foreground">Cập nhật T11/2026 • 115 quán cafe</span>
                </span>
              </div>
            </div>

            {/* Middle row: Navigation links and Theme picker */}
            <div className="grid grid-cols-2 gap-6 border-t border-border/60 pt-6 sm:grid-cols-4">
              <div>
                <div className="font-heading text-xs font-bold tracking-wider text-foreground uppercase">Tra cứu</div>
                <ul className="mt-2.5 space-y-2 text-xs">
                  <li>
                    <Link href="/" className="transition-colors hover:text-primary">
                      Khám phá danh sách
                    </Link>
                  </li>
                  <li>
                    <Link href="/ban-do" className="transition-colors hover:text-primary">
                      Bản đồ tương tác
                    </Link>
                  </li>
                  <li>
                    <Link href="/hoi-ai" className="transition-colors hover:text-primary">
                      Trợ lý AI An Thượng
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <div className="font-heading text-xs font-bold tracking-wider text-foreground uppercase">
                  Phân tích F&B
                </div>
                <ul className="mt-2.5 space-y-2 text-xs">
                  <li>
                    <Link href="/phan-tich" className="transition-colors hover:text-primary">
                      Thị trường & Giá cả
                    </Link>
                  </li>
                  <li>
                    <Link href="/dinh-gia" className="transition-colors hover:text-primary">
                      Định giá mặt bằng
                    </Link>
                  </li>
                  <li>
                    <Link href="/insights" className="transition-colors hover:text-primary">
                      Insights kinh doanh
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <div className="font-heading text-xs font-bold tracking-wider text-foreground uppercase">
                  Tiện ích phổ biến
                </div>
                <ul className="mt-2.5 space-y-2 text-xs">
                  <li>
                    <Link href="/?facility=laptop" className="transition-colors hover:text-primary">
                      Làm việc laptop & Wifi
                    </Link>
                  </li>
                  <li>
                    <Link href="/?facility=ac" className="transition-colors hover:text-primary">
                      Có điều hòa / Máy lạnh
                    </Link>
                  </li>
                  <li>
                    <Link href="/?facility=pet" className="transition-colors hover:text-primary">
                      Thân thiện thú cưng
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <div className="font-heading text-xs font-bold tracking-wider text-foreground uppercase">Giao diện</div>
                <div className="mt-2.5">
                  <ThemeSegmented />
                </div>
              </div>
            </div>

            {/* Bottom copyright & attribution */}
            <div className="flex flex-col items-center justify-between gap-2 border-t border-border/60 pt-6 text-[11px] text-muted-foreground sm:flex-row">
              <div>© 2026 Cafe An Thượng. Dự án nghiên cứu F&B phi thương mại.</div>
              <div>Xây dựng trên nền tảng Next.js 16, React 19, Tailwind CSS v4 & Supabase.</div>
            </div>
          </div>
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
