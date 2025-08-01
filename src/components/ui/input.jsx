import * as React from "react"

import { cn } from "@/lib/utils"


const Input = (({ className, type, ref, ...props }) => {
  return (
    <input
      type={type}
      className={cn(
        "rounded-md py-1 px-4 outline-none ring-1 w-full focus:ring-blue-500 ring-gray-400 text-black bg-white",
        className,
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input }

