import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("animate-pulse rounded-lg border-2 border-border bg-muted", className)}
      {...props}
    />
  )
}

export { Skeleton }
