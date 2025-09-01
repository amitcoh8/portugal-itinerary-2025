import React from 'react';
import { cn } from '@/src/utils';

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: 'default' | 'outline';
};

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const base = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors';
  const variants = {
    default: 'bg-gray-900 text-white border-transparent',
    outline: 'bg-transparent text-current',
  } as const;
  return <span className={cn(base, variants[variant], className)} {...props} />;
}

export default Badge;
