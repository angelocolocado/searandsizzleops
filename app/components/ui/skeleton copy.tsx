import { cn } from "cn"

function SkeletonMui({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        // Base container (malinaw na background para sa Light mode)
        "relative overflow-hidden rounded-md bg-orange-100/100 dark:bg-zinc-800",
        
        // Smooth shimmer overlay
        "after:absolute after:inset-0",
        "after:animate-[shimmer_2s_infinite_linear]",
        "after:bg-gradient-to-r after:from-transparent after:via-white/90 dark:after:via-white/10 after:to-transparent",
        className
      )}
      {...props}
    />
  )
}

export { SkeletonMui }