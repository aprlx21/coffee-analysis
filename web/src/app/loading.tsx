import { CoffeeRunningLoader } from "@/components/coffee-running-loader";

export default function Loading() {
  return (
    <div className="flex min-h-[calc(100vh-8rem)] w-full items-center justify-center p-4">
      <div className="rounded-3xl border border-border/80 glass-strong p-6 shadow-glass-lg sm:p-8">
        <CoffeeRunningLoader
          size="lg"
          title="Đang tải dữ liệu quán cafe..."
          subtitle="Cappuccino Ninja đang phi nước đại mang menu đến bạn ☕"
        />
      </div>
    </div>
  );
}
