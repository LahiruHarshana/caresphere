import * as React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    let classes =
      "inline-flex items-center justify-center whitespace-nowrap font-bold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

    switch (variant) {
      case "default":
        classes +=
          " bg-primary text-white hover:bg-primary-600 hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98]";
        break;
      case "outline":
        classes +=
          " border-2 border-input bg-background hover:bg-primary hover:text-white hover:border-primary active:scale-[0.98]";
        break;
      case "destructive":
        classes +=
          " bg-red-500 text-white hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/30 active:scale-[0.98]";
        break;
      case "ghost":
        classes +=
          " hover:bg-gray-100 hover:text-gray-900 active:scale-[0.98]";
        break;
      case "secondary":
        classes +=
          " bg-accent text-white hover:bg-accent-600 hover:shadow-lg hover:shadow-accent/30 active:scale-[0.98]";
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