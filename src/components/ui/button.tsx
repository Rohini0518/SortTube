import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-heading text-sm font-bold transition-all duration-200 ease-out min-h-[48px] px-6 disabled:opacity-40 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        primary:
          "bg-accent text-accent-foreground border-2 border-foreground pop-shadow",
        secondary:
          "bg-transparent text-foreground border-2 border-foreground hover:bg-tertiary",
        ghost: "bg-transparent text-foreground border-2 border-transparent hover:bg-muted",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  showArrow?: boolean;
}

function Button({
  className,
  variant,
  showArrow,
  children,
  ref,
  ...props
}: ButtonProps & { ref?: React.Ref<HTMLButtonElement> }) {
  return (
    <button ref={ref} className={cn(buttonVariants({ variant }), className)} {...props}>
      {children}
      {showArrow && variant !== "secondary" && (
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-foreground/95 text-accent">
          <ArrowRight className="h-3.5 w-3.5" strokeWidth={2.5} />
        </span>
      )}
    </button>
  );
}

export { Button, buttonVariants };
