import * as React from 'react';
import Link from 'next/link';
import { type LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
  variant?: 'card' | 'inline';
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  variant = 'card',
}: EmptyStateProps) {
  const content = (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        variant === 'card'
          ? 'rounded-2xl border border-dashed border-border-soft bg-white/70 p-8 md:p-12'
          : 'py-8',
        className
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-pale-green text-forest-green shadow-inner">
        <Icon className="h-7 w-7 stroke-[1.75]" />
      </div>
      <h3 className="mb-2 text-lg font-bold text-forest-green">{title}</h3>
      <p className="mb-6 max-w-md text-sm leading-relaxed text-muted-text">
        {description}
      </p>
      {action && (
        <div>
          {action.href ? (
            <Link href={action.href}>
              <Button variant="default">{action.label}</Button>
            </Link>
          ) : (
            <Button variant="default" onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );

  return content;
}
