import * as React from "react"
import { forwardRef } from "react"

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>

interface InputRef extends React.InputHTMLAttributes<HTMLInputElement> {
  dark?: boolean
}

const Input = forwardRef<HTMLInputElement, InputRef>(
  ({ className, dark, ...props }, ref) => {
    let classes = dark
      ? "flex h-11 w-full border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/30 transition-all duration-300 focus-visible:outline-none focus-visible:border-[#0d9488] focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 rounded-sm"
      : "flex h-11 w-full border border-gray-200 bg-white px-4 py-3 text-sm text-neutral ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 transition-all duration-300 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 rounded-sm"
    if (className) {
      classes += ` ${className}`
    }
    return (
      <input
        type={props.type}
        className={classes}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }