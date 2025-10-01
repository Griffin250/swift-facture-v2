import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-primary to-primary-glow text-primary-foreground elegant-shadow hover:shadow-xl hover:scale-105 hover:-translate-y-0.5",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:scale-105",
        outline:
          "border-2 border-primary/20 bg-background hover:bg-primary/5 hover:text-primary hover:border-primary/40 hover:scale-105",
        secondary:
          "bg-gradient-to-r from-secondary to-secondary/80 text-secondary-foreground hover:shadow-lg hover:scale-105",
        accent:
          "bg-gradient-to-r from-accent to-accent/90 text-accent-foreground accent-shadow hover:shadow-xl hover:scale-105 hover:-translate-y-0.5",
        ghost: "hover:bg-accent/10 hover:text-accent-foreground hover:scale-105",
        link: "text-primary underline-offset-4 hover:underline hover:text-secondary",
      },
      size: {
        default: "h-11 px-6 py-3",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-14 rounded-xl px-10 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    (<Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />)
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }
