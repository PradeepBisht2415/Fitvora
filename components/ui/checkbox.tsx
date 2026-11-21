'use client';

import * as React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface CheckboxProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  id?: string;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export function Checkbox({
  checked = false,
  onCheckedChange,
  id,
  disabled = false,
  className,
  children,
}: CheckboxProps) {
  return (
    <label
      htmlFor={id}
      className={cn(
        'inline-flex items-start gap-2.5 cursor-pointer select-none',
        disabled && 'cursor-not-allowed opacity-50',
        className
      )}
    >
      <button
        type="button"
        role="checkbox"
        id={id}
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onCheckedChange?.(!checked)}
        className={cn(
          'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-border-soft transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fresh-green',
          checked
            ? 'bg-forest-green text-white border-forest-green'
            : 'bg-white hover:bg-pale-green/40'
        )}
      >
        {checked && <Check className="h-3.5 w-3.5 stroke-[3]" />}
      </button>
      {children && <span className="text-sm leading-tight text-dark-text">{children}</span>}
    </label>
  );
}
