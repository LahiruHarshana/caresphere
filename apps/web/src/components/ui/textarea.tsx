import * as React from "react"

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    let classes = "flex min-h-[80px] w-full border border-gray-200 bg-white px-4 py-3 text-sm text-neutral ring-offset-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:border-primary focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50 rounded-sm"
    if (className) {
        classes += ` ${className}`
    }
    return (
      <textarea
        className={classes}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }