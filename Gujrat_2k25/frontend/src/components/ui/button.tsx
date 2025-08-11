import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-300 focus-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-primary text-primary-foreground hover:scale-105 hover:shadow-glow active:scale-95",
        hero: "glass-button text-lg font-semibold px-8 py-4 h-auto",
        accent: "bg-gradient-accent text-accent-foreground hover:scale-105 hover:shadow-accent-glow active:scale-95",
        destructive: "bg-error text-primary-foreground hover:bg-error/90 hover:scale-105 active:scale-95",
        outline: "border border-glass-border glass-surface text-foreground hover:bg-secondary/50 hover:scale-105 active:scale-95",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:scale-105 active:scale-95",
        ghost: "hover:bg-secondary/50 hover:text-foreground hover:scale-105 active:scale-95",
        link: "text-primary underline-offset-4 hover:underline hover:text-primary-glow",
        glass: "glass-surface text-foreground border-glass-border hover:bg-secondary/30 hover:scale-105 active:scale-95",
      },
      size: {
        default: "h-11 px-6 py-3",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-13 rounded-xl px-8 text-base",
        xl: "h-16 rounded-2xl px-12 text-lg font-semibold",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
