import * as React from "react"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    let classes = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
    
    switch(variant) {
      case "default":
        classes += " bg-primary text-white hover:opacity-90"
        break
      case "outline":
        classes += " border border-input bg-background hover:bg-gray-100 hover:text-gray-900 text-primary border-primary/20"
        break
      case "destructive":
        classes += " bg-red-500 text-white hover:bg-red-600"
        break
      case "ghost":
        classes += " hover:bg-gray-100 hover:text-gray-900"
        break
      case "secondary":
        classes += " bg-accent text-white hover:opacity-90"
        break
    }

    switch(size) {
      case "default":
        classes += " h-10 px-4 py-2"
        break
      case "sm":
        classes += " h-9 rounded-md px-3"
        break
      case "lg":
        classes += " h-11 rounded-md px-8"
        break
      case "icon":
        classes += " h-10 w-10"
        break
    }

    if (className) {
        classes += ` ${className}`
    }

    return (
      <button
        className={classes}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
