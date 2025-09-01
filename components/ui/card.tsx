import React from 'react';
import { cn } from '@/src/utils';

export type CardProps = React.HTMLAttributes<HTMLDivElement>;
export function Card({ className, ...props }: CardProps) {
  return <div className={cn('rounded-lg border bg-white text-gray-900 shadow-sm', className)} {...props} />;
}

export type CardContentProps = React.HTMLAttributes<HTMLDivElement>;
export function CardContent({ className, ...props }: CardContentProps) {
  return <div className={cn('p-6', className)} {...props} />;
}

export default Card;
