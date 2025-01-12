import { cn } from "@/lib/utils"

export function Container({ children, className }) {
  return (
    <div className={cn(
      "bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm",
      className
    )}>
      {children}
    </div>
  )
}
