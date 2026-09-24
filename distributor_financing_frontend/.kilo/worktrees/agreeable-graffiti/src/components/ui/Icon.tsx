"use client";

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface IconProps extends React.SVGAttributes<SVGSVGElement> {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  size?: 16 | 20 | 24 | 32 | 48 | 64;
  'aria-label'?: string;
}

const sizeClasses = {
  16: 'w-4 h-4',
  20: 'w-5 h-5',
  24: 'w-6 h-6',
  32: 'w-8 h-8',
  48: 'w-12 h-12',
  64: 'w-16 h-16',
};

export const Icon = forwardRef<SVGSVGElement, IconProps>(
  ({ icon: IconComponent, size = 24, className, 'aria-label': ariaLabel, ...props }, ref) => {
    return (
      <IconComponent
        ref={ref}
        className={cn(sizeClasses[size], className)}
        aria-label={ariaLabel}
        aria-hidden={!ariaLabel}
        {...props}
      />
    );
  }
);

Icon.displayName = 'Icon';