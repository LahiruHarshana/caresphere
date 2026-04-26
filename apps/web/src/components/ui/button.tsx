import * as React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary" | "soft";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    let classes =
      "inline-flex items-center justify-center whitespace-nowrap font-bold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

    switch (variant) {
      case "default":
        classes +=
          " bg-gradient-to-r from-primary to-primary-600 text-white hover:shadow-lg hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] rounded-xl";
        break;
      case "outline":
        classes +=
          " border-2 border-primary/30 bg-white text-primary hover:bg-primary hover:text-white hover:border-primary active:scale-[0.98] rounded-xl";
        break;
      case "soft":
        classes +=
          " bg-primary-50 text-primary border border-primary-100 hover:bg-primary-100 hover:shadow-md hover:shadow-primary/20 active:scale-[0.98] rounded-xl";
        break;
      case "destructive":
        classes +=
          " bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg hover:shadow-red-500/40 hover:scale-[1.02] active:scale-[0.98] rounded-xl";
        break;
      case "ghost":
        classes +=
          " hover:bg-gray-100 hover:text-gray-900 active:scale-[0.98] rounded-xl";
        break;
      case "secondary":
        classes +=
          " bg-gradient-to-r from-accent to-accent-500 text-white hover:shadow-lg hover:shadow-accent/40 hover:scale-[1.02] active:scale-[0.98] rounded-xl";
        break;
    }

    switch (size) {
      case "default":
        classes += " h-11 px-6 py-2.5 rounded-xl text-base";
        break;
      case "sm":
        classes += " h-9 px-4 rounded-lg text-sm";
        break;
      case "lg":
        classes += " h-14 px-10 rounded-2xl text-lg";
        break;
      case "icon":
        classes += " h-11 w-11 rounded-xl";
        break;
    }

    if (className) {
      classes += ` ${className}`;
    }

    return (
      <button className={classes} ref={ref} {...props} />
    );
  }
);
Button.displayName = "Button";

export { Button };