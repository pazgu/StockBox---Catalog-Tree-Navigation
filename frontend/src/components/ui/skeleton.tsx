import { cn } from "../../lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
  "bg-accent animate-pulse [animation-duration:2.5s] rounded-md",
  className
)}

      {...props}
    />
  )
}

export { Skeleton }
