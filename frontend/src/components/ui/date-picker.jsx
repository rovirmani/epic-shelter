"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const DatePicker = React.forwardRef(({ className, value, onChange, ...props }, ref) => {
  const [date, setDate] = React.useState(value || new Date())

  const handleDateChange = (e) => {
    const newDate = new Date(e.target.value)
    setDate(newDate)
    onChange?.(newDate)
  }

  const handleTimeChange = (e) => {
    const [hours, minutes, seconds] = e.target.value.split(':').map(Number)
    const newDate = new Date(date)
    newDate.setHours(hours, minutes, seconds)
    setDate(newDate)
    onChange?.(newDate)
  }

  const inputClassName = "bg-transparent px-3 py-2 border rounded-md border-gray-200 text-gray-800 placeholder-gray-400 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-colors"

  return (
    <div className={cn("flex gap-4 items-center", className)} {...props}>
      <input
        type="date"
        value={date.toISOString().split('T')[0]}
        onChange={handleDateChange}
        className={inputClassName}
      />
      <input
        type="time"
        step="1"
        value={date.toTimeString().split(' ')[0]}
        onChange={handleTimeChange}
        className={inputClassName}
      />
    </div>
  )
})

DatePicker.displayName = "DatePicker"

export { DatePicker }
