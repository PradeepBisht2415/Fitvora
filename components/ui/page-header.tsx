import * as React from 'react';
import { cn } from '@/lib/utils';

export interface PageHeaderProps {
  title: string;
  description?: string;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  badge,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 pb-6 md:flex-row md:items-center md:justify-between',
        className
      )}
    >
      <div className="space-y-1.5">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-extrabold tracking-tight text-forest-green md:text-3xl">
            {title}
          </h1>
          {badge}
        </div>
        {description && (
          <p className="max-w-2xl text-sm leading-relaxed text-muted-text md:text-base">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-3">{actions}</div>
      )}
    </div>
  );
}
