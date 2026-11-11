import Image from "next/image";
import Link from "next/link";
import { Compass, Map } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[75vh] max-w-xl flex-col items-center justify-center px-4 py-12 text-center">
      <div className="w-full rounded-3xl border border-border/80 glass-strong p-8 shadow-glass-lg">
        {/* Animated Ninja */}
        <div className="mx-auto mb-4 flex flex-col items-center justify-center">
          <div className="animate-coffee-run relative size-28 select-none">
            <Image
              src="/cappuccino-ninja.png"
              alt="Cappuccino Ninja 404"
              width={112}
              height={112}
              priority
              className="drop-shadow-lg"
            />
          </div>
          <div className="animate-coffee-shadow mt-1 h-2.5 w-24 rounded-[50%] bg-foreground/20 blur-[2px]" />
        </div>

        <p className="font-mono text-5xl font-extrabold tracking-wider text-primary">404</p>
        <h1 className="mt-3 font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
          Không tìm thấy trang này
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed font-medium text-muted-foreground">
          Cappuccino Ninja đã lùng sục khắp các con ngõ phố Tây An Thượng nhưng không tìm thấy quán hoặc đường dẫn bạn
          yêu cầu!
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className={cn(buttonVariants({ variant: "default", size: "lg" }), "font-bold shadow-glass-sm")}
          >
            <Compass className="mr-1.5 size-4 stroke-[2.5]" />
            Về trang Khám phá
          </Link>
          <Link href="/ban-do" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "font-bold")}>
            <Map className="mr-1.5 size-4 stroke-[2.5]" />
            Xem bản đồ
          </Link>
        </div>
      </div>
    </div>
  );
}
