import Link from "next/link";
import { Compass, Map } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 py-12 text-center">
      <div className="w-full rounded-xl glass p-8 shadow-glass-card">
        <p className="font-mono text-6xl font-bold text-foreground">404</p>
        <h1 className="mt-3 font-heading text-2xl font-bold tracking-tight text-foreground">
          Không tìm thấy trang này
        </h1>
        <p className="mt-2 text-sm font-medium text-muted-foreground">
          Quán hoặc đường dẫn bạn mở không có trong dữ liệu 115 quán cafe An Thượng.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className={cn(buttonVariants({ variant: "default" }))}>
            <Compass className="stroke-[2.5]" />
            Về trang Khám phá
          </Link>
          <Link href="/ban-do" className={cn(buttonVariants({ variant: "outline" }))}>
            <Map className="stroke-[2.5]" />
            Xem bản đồ
          </Link>
        </div>
      </div>
    </div>
  );
}
