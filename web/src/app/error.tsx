"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function GlobalErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  const isDatabaseError =
    error.message?.includes("DATABASE_URL") ||
    error.message?.includes("connection") ||
    error.message?.includes("postgres");

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mx-auto max-w-lg rounded-xl border-2 border-border bg-card p-6 shadow-hard-card sm:p-8">
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-lg border-2 border-border bg-destructive text-primary-foreground shadow-hard">
          <AlertTriangle className="size-8" />
        </div>

        <h1 className="font-heading text-2xl font-extrabold tracking-tight sm:text-3xl">Đã xảy ra lỗi tải trang</h1>

        <p className="mt-3 text-sm font-medium text-muted-foreground sm:text-base">
          {isDatabaseError
            ? "Chưa thể kết nối tới cơ sở dữ liệu Supabase. Vui lòng đảm bảo biến môi trường DATABASE_URL hoặc SUPABASE_DB_URL đã được cấu hình trong phần Settings của dự án trên Vercel."
            : error.message || "Hệ thống gặp sự cố không mong muốn trong khi xử lý yêu cầu."}
        </p>

        {error.digest && <p className="mt-2 font-mono text-xs text-muted-foreground">Mã lỗi: {error.digest}</p>}

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Button onClick={() => reset()} variant="default" className="gap-2">
            <RefreshCw className="size-4" />
            Thử lại
          </Button>

          <Button asChild variant="outline">
            <Link href="/" className="gap-2">
              <Home className="size-4" />
              Về trang chủ
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
