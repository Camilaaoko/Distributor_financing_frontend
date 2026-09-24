"use client";

import React, { forwardRef } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'whistleblower';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  asChild?: boolean;
}

const variantStyles = {
  primary: 'bg-[var(--color-emtech-accent)] hover:bg-[var(--color-secondary-light)] text-white shadow-sm hover:shadow-md',
  secondary: 'bg-[var(--color-emtech-blue)] hover:bg-[var(--color-primary-dark)] text-white shadow-sm hover:shadow-md',
  outline: 'border-2 border-[var(--color-emtech-blue)] text-[var(--color-emtech-blue)] hover:bg-[var(--color-emtech-blue)] hover:text-white',
  ghost: 'text-[var(--color-emtech-blue)] hover:bg-slate-100',
  whistleblower: 'bg-[var(--color-emtech-accent)] hover:bg-[var(--color-secondary-light)] text-white shadow-sm hover:shadow-md font-semibold',
};

const sizeStyles = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3.5 text-base',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, asChild = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    
    // When using asChild, we only render the single child element (no loading spinner wrapper)
    if (asChild) {
      return (
        <Comp
          ref={ref}
          className={cn(
            'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-emtech-orange)] focus-visible:ring-offset-2',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            variantStyles[variant],
            sizeStyles[size],
            className
          )}
          disabled={disabled || loading}
          {...props}
        >
          {children}
        </Comp>
      );
    }

    return (
      <Comp
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-emtech-orange)] focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </Comp>
    );
  }
);

Button.displayName = 'Button';