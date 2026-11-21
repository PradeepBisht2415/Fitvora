import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'bg-forest-green text-white hover:bg-forest-green-dark',
        secondary:
          'bg-pale-green text-forest-green border border-pale-green-dark',
        fresh:
          'bg-fresh-green text-white hover:bg-fresh-green-hover',
        outline:
          'border border-border-soft text-dark-text bg-white',
        destructive:
          'bg-red-100 text-red-800 border border-red-200',
        amber:
          'bg-amber-100 text-amber-900 border border-amber-200',
        sky:
          'bg-sky-100 text-sky-900 border border-sky-200',
        neutral:
          'bg-slate-100 text-slate-700 border border-slate-200',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export type BadgeProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof badgeVariants>;

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
