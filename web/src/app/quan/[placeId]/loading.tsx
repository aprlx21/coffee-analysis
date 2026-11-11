import { CoffeeRunningLoader } from "@/components/coffee-running-loader";

export default function CafeDetailLoading() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-5xl items-center justify-center px-4 py-8 md:py-12">
      <div className="w-full max-w-md rounded-3xl border border-border/80 glass-strong p-8 shadow-glass-lg">
        <CoffeeRunningLoader
          size="md"
          title="Đang tải thông tin quán cafe..."
          subtitle="Cappuccino Ninja đang bóc tách menu & tiện ích quán ☕"
        />
      </div>
    </div>
  );
}
