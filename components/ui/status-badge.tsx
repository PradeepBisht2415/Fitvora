import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export type FitvoraStatus =
  | 'pending_review'
  | 'approved'
  | 'needs_info'
  | 'not_suitable'
  | 'active'
  | 'expired'
  | 'draft'
  | 'published'
  | 'archived'
  | 'invited'
  | 'registered'
  | 'paused'
  | 'inactive'
  | 'normal'
  | 'premium'
  | (string & {});

interface StatusConfig {
  label: string;
  variant: 'default' | 'secondary' | 'fresh' | 'outline' | 'destructive' | 'amber' | 'sky' | 'neutral';
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
  pending_review: { label: 'Pending Review', variant: 'amber' },
  approved: { label: 'Approved', variant: 'fresh' },
  needs_info: { label: 'Needs Info', variant: 'sky' },
  not_suitable: { label: 'Not Suitable', variant: 'destructive' },
  active: { label: 'Active', variant: 'fresh' },
  expired: { label: 'Expired', variant: 'neutral' },
  draft: { label: 'Draft', variant: 'neutral' },
  published: { label: 'Published', variant: 'default' },
  archived: { label: 'Archived', variant: 'neutral' },
  invited: { label: 'Invited', variant: 'secondary' },
  registered: { label: 'Registered', variant: 'sky' },
  paused: { label: 'Paused', variant: 'amber' },
  inactive: { label: 'Inactive', variant: 'neutral' },
  normal: { label: 'Normal Plan (₹499)', variant: 'secondary' },
  premium: { label: 'Premium Plan (₹999)', variant: 'default' },
};

export interface StatusBadgeProps {
  status: FitvoraStatus;
  className?: string;
  customLabel?: string;
}

export function StatusBadge({ status, className, customLabel }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] || {
    label: customLabel || status.replace(/_/g, ' '),
    variant: 'outline',
  };

  return (
    <Badge
      variant={config.variant}
      className={cn('capitalize font-medium shadow-none', className)}
    >
      {customLabel || config.label}
    </Badge>
  );
}
