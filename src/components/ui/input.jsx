import * as React from "react"

import { cn } from "@/lib/utils"


const Input = (({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "py-1 px-4 outline-none ring-1 w-full focus:ring-blue-500 ring-gray-400 text-black bg-gray-100 rounded-md",
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input }

