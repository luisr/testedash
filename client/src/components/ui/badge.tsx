import { cn } from "@/lib/utils";
import { type VariantProps, cva } from "class-variance-authority";

const badgeVariants = cva(
  "badge",
  {
    variants: {
      variant: {
        default: "badge-primary",
        secondary: "badge-secondary",
        destructive: "badge-destructive",
        outline: "badge-outline",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };