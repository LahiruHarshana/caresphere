import * as React from "react"

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => {
    let classes = "text-sm font-medium leading-none text-slate-700 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
    if (className) {
        classes += ` ${className}`
    }
    return (
      <label
        ref={ref}
        className={classes}
        {...props}
      />
    )
  }
)
Label.displayName = "Label"

export { Label }
