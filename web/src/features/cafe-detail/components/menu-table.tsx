import { AlertTriangle, Coffee, ExternalLink, UtensilsCrossed } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { MenuGroup } from "@/server/db/types";
import { cn } from "@/lib/utils";

import { formatPrice, formatPriceRange, getPriceComparison } from "../benchmark-data";

interface MenuTableProps {
  menu: MenuGroup[];
  mapsLink: string | null;
  className?: string;
}

export function MenuTable({ menu, mapsLink, className }: MenuTableProps) {
  const totalItems = menu.reduce((acc, g) => acc + g.items.length, 0);

  // Empty State chuẩn Neubrutalism
  if (!menu || menu.length === 0 || totalItems === 0) {
    return (
      <div
        data-slot="menu-empty-state"
        className={cn(
          "flex flex-col items-center justify-center rounded-xl glass p-8 text-center shadow-glass-card sm:p-12",
          className,
        )}
      >
        <div className="mb-4 flex size-16 items-center justify-center rounded-lg border border-border bg-primary font-bold text-primary-foreground shadow-glass">
          <UtensilsCrossed className="size-8 stroke-[2.5]" />
        </div>

        <h3 className="font-heading text-xl font-bold text-foreground sm:text-2xl">Quán chưa có dữ liệu menu OCR</h3>

        <p className="mt-2 max-w-md text-sm leading-relaxed font-medium text-muted-foreground">
          Hiện tại chưa có hình ảnh thực đơn hoặc dữ liệu trích xuất giá tự động cho quán này. Bạn có thể xem hình ảnh
          trực tiếp do khách hàng đăng tải trên Google Maps.
        </p>

        {mapsLink ? (
          <a
            href={mapsLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-border bg-primary px-4 py-2.5 text-xs font-bold tracking-wider text-primary-foreground uppercase shadow-glass hover:-translate-y-0.5 active:translate-y-0"
          >
            <span>Xem ảnh thực đơn trên Google Maps</span>
            <ExternalLink className="size-3.5 stroke-[2.5]" />
          </a>
        ) : null}
      </div>
    );
  }

  return (
    <div data-slot="menu-section" className={cn("rounded-xl glass p-4 shadow-glass-card sm:p-6", className)}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
        <div className="flex items-center gap-2">
          <Coffee className="size-5 stroke-[2.5] text-foreground" />
          <h2 className="font-heading text-lg font-bold text-foreground">
            Bảng giá thực đơn tiêu biểu ({totalItems} món)
          </h2>
        </div>

        <Badge variant="secondary" className="border border-border text-xs font-bold">
          DỮ LIỆU OCR MENU
        </Badge>
      </div>

      <div className="mt-6 space-y-8">
        {menu.map((group) => {
          if (group.items.length === 0) return null;

          return (
            <div key={group.key} className="space-y-3">
              {/* Group Title Badge */}
              <div className="flex items-center gap-2">
                <span className="inline-block rounded-md border border-border bg-primary px-3 py-1 font-heading text-xs font-bold tracking-wider text-primary-foreground uppercase shadow-glass-sm">
                  {group.label}
                </span>
                <span className="text-xs font-semibold text-muted-foreground">({group.items.length} món)</span>
              </div>

              {/* Items Grid/List */}
              <div className="grid gap-2.5 sm:grid-cols-2">
                {group.items.map((item) => {
                  const comparison = getPriceComparison(item.canonicalId, item.priceMin, item.priceMax);

                  return (
                    <div
                      key={item.canonicalId}
                      className="bg-surface flex flex-col justify-between rounded-lg border border-border p-3.5 shadow-glass-sm transition-transform hover:-translate-y-0.5 hover:shadow-glass-lg"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-heading text-sm font-bold text-foreground">{item.displayName}</span>

                            {item.matchUncertain ? (
                              <span
                                title="Món có độ tin cậy OCR cần đối chiếu thêm"
                                className="py-0.2 inline-flex items-center gap-0.5 rounded border border-border bg-destructive/15 px-1 text-[10px] font-bold text-destructive"
                              >
                                <AlertTriangle className="size-2.5 stroke-[2.5]" />
                                Cần đối chiếu
                              </span>
                            ) : null}
                          </div>
                        </div>

                        {/* Price Display in Geist Mono */}
                        <div className="shrink-0 text-right">
                          <span className="font-mono text-sm font-bold tracking-tight text-foreground sm:text-base">
                            {formatPriceRange(item.priceMin, item.priceMax)}
                          </span>
                        </div>
                      </div>

                      {/* Relative Benchmark Comparison */}
                      {comparison ? (
                        <div className="mt-2.5 flex items-center justify-end border-t border-border/40 pt-2 text-right">
                          {comparison.status === "cheaper" ? (
                            <span className="inline-flex items-center gap-1 rounded border border-border bg-[#A3E635]/30 px-1.5 py-0.5 font-mono text-[10px] font-bold text-foreground">
                              ↓ {Math.abs(comparison.diffPct)}% so với khu vực
                            </span>
                          ) : comparison.status === "higher" ? (
                            <span className="inline-flex items-center gap-1 rounded border border-border bg-destructive/15 px-1.5 py-0.5 font-mono text-[10px] font-bold text-destructive">
                              ↑ {comparison.diffPct}% so với khu vực
                            </span>
                          ) : (
                            <span className="font-mono text-[10px] font-medium text-muted-foreground">
                              ≈ trung vị ({formatPrice(comparison.median)})
                            </span>
                          )}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-md border border-border bg-muted/60 p-3 text-xs font-medium text-muted-foreground">
        💡 <strong>Ghi chú:</strong> Giá đồ uống được bóc tách tự động từ hình ảnh thực đơn công khai của quán qua công
        nghệ OCR. Giá thực tế tại quán có thể thay đổi tùy thời điểm hoặc kích cỡ đồ uống.
      </div>
    </div>
  );
}
