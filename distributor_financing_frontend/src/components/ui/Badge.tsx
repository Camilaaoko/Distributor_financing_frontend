"use client";

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'cyan' | 'purple';
  size?: 'sm' | 'md';
  dot?: boolean;
}

const variantStyles = {
  default: 'bg-slate-100 text-slate-700',
  primary: 'bg-[var(--color-emtech-navy)] text-white',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  cyan: 'bg-sky-50 text-sky-700',
  purple: 'bg-purple-50 text-purple-700',
};

const sizeStyles = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'default', size = 'md', dot, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1.5 font-medium rounded-full',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {dot && <span className={cn('w-1.5 h-1.5 rounded-full', variant === 'default' && 'bg-slate-400', variant === 'primary' && 'bg-white', variant === 'success' && 'bg-emerald-500', variant === 'warning' && 'bg-amber-500', variant === 'cyan' && 'bg-sky-500', variant === 'purple' && 'bg-purple-500')} />}
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';