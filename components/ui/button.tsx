import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        default:
          'bg-forest-green text-white hover:bg-forest-green-dark shadow-sm hover:shadow',
        fresh:
          'bg-fresh-green text-white hover:bg-fresh-green-hover shadow-sm hover:shadow',
        secondary:
          'bg-pale-green text-forest-green hover:bg-pale-green-dark border border-pale-green-dark',
        outline:
          'border border-border-soft bg-white hover:bg-pale-green/40 hover:border-forest-green/30 text-dark-text',
        ghost:
          'hover:bg-pale-green/50 text-dark-text hover:text-forest-green',
        link:
          'text-forest-green underline-offset-4 hover:underline p-0 h-auto font-medium',
        destructive:
          'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm',
      },
      size: {
        default: 'h-11 px-5 py-2.5',
        sm: 'h-9 rounded-lg px-3.5 text-xs',
        lg: 'h-13 rounded-2xl px-7 text-base font-bold',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
