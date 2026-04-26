import * as React from "react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "destructive" | "soft" | "filled" | "outline-light";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    let classes =
      "inline-flex items-center justify-center whitespace-nowrap font-body transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50";

    switch (variant) {
      case "default":
        classes +=
          " bg-neutral text-white hover:bg-neutral-800 rounded-sm";
        break;
      case "filled":
        classes +=
          " bg-primary text-white hover:bg-primary-700 rounded-sm";
        break;
      case "outline":
        classes +=
          " border border-neutral text-neutral bg-transparent hover:bg-neutral hover:text-white rounded-sm";
        break;
      case "outline-light":
        classes +=
          " border border-white/30 text-white bg-transparent hover:bg-white/10 rounded-full";
        break;
      case "soft":
        classes +=
          " bg-primary-50 text-primary border border-primary-100 hover:bg-primary-100 rounded-sm";
        break;
      case "destructive":
        classes +=
          " bg-red-600 text-white hover:bg-red-700 rounded-sm";
        break;
      case "ghost":
        classes +=
          " hover:bg-gray-100 text-neutral rounded-sm";
        break;
    }

    switch (size) {
      case "default":
        classes += " h-11 px-6 py-2.5 text-sm";
        break;
      case "sm":
        classes += " h-9 px-4 text-xs";
        break;
      case "lg":
        classes += " h-14 px-10 text-base";
        break;
      case "icon":
        classes += " h-11 w-11 rounded-sm";
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