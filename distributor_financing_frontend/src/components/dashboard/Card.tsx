'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';

export function Card({
  title,
  action,
  children,
  className = '',
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-5 ${className}`}>
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-[#1E293B]">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function ViewAllLink({ href }: { href?: string }) {
  const router = useRouter();

  const handleClick = () => {
    if (href) {
      router.push(href);
    }
  };

  if (!href) {
    return (
      <span className="text-xs font-semibold text-[#1F4DA8]">
        View All
      </span>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="text-xs font-semibold text-[#1F4DA8] hover:text-[#3A6FD8] transition-colors cursor-pointer"
    >
      View All
    </button>
  );
}