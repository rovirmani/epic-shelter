import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Container } from "@/components/ui/container"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}) {
  return (
    <Container className={className}>
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn(
          "p-3",
          "rdp",
          "[&_.rdp-vhidden]:hidden",
          "[&_.rdp-button_focus-visible]:ring-2",
          "[&_.rdp-button_focus-visible]:ring-offset-2",
          "[&_.rdp-button_focus-visible]:ring-purple-500",
          "[&_.rdp-button:hover:not([disabled])]:bg-gray-100",
          "[&_.rdp-button:hover:not([disabled])]:dark:bg-gray-800",
          "[&_.rdp-button:focus-visible:not([disabled])]:bg-gray-100",
          "[&_.rdp-button:focus-visible:not([disabled])]:dark:bg-gray-800",
          "[&_.rdp-button[aria-selected]:not([disabled])]:bg-purple-500",
          "[&_.rdp-button[aria-selected]:not([disabled])]:text-white",
          "[&_.rdp-button[aria-selected]:focus-visible:not([disabled])]:bg-purple-500",
          "[&_.rdp-button[aria-selected]:hover:not([disabled])]:bg-purple-600",
          "[&_.rdp-button[disabled]]:text-gray-400",
          "[&_.rdp-button[disabled]]:cursor-not-allowed",
          "[&_.rdp-button[disabled]]:opacity-50",
          "[&_.rdp-day_today]:font-bold",
          "[&_.rdp-day_today]:border",
          "[&_.rdp-day_today]:border-gray-300",
          "[&_.rdp-day_today]:dark:border-gray-600"
        )}
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center px-8",
          caption_label: "text-sm font-medium",
          nav: "flex items-center",
          nav_button: cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
          ),
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell: "text-gray-500 rounded-md w-9 font-normal text-[0.8rem] dark:text-gray-400",
          row: "flex w-full mt-2",
          cell: cn(
            "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
            "first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md"
          ),
          day: cn(
            buttonVariants({ variant: "ghost" }),
            "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
          ),
          day_selected:
            "bg-purple-500 text-white hover:bg-purple-600 hover:text-white focus:bg-purple-600 focus:text-white",
          day_today: "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-100",
          day_outside: "text-gray-400 opacity-50 dark:text-gray-500",
          day_disabled: "text-gray-400 opacity-50 dark:text-gray-500",
          day_range_middle:
            "aria-selected:bg-gray-100 aria-selected:text-gray-900",
          day_hidden: "invisible",
          ...classNames,
        }}
        components={{
          IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
          IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
        }}
        {...props}
      />
    </Container>
  )
}

Calendar.displayName = "Calendar"

export { Calendar }
