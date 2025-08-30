import React from 'react';
import { cn } from '@/lib/utils';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'ghost';
  size?: 'default' | 'icon';
};

export function Button({ className, variant = 'default', size = 'default', ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  const variants = {
    default: 'bg-gray-900 text-white hover:bg-gray-800',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700',
  } as const;
  const sizes = {
    default: 'h-9 px-4 py-2',
    icon: 'h-9 w-9',
  } as const;
  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}

export default Button;
