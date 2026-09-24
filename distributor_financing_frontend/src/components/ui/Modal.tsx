'use client';

import { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const SIZES: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-md',
  md: 'max-w-xl',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
};

export function Modal({ open, onClose, title, description, children, footer, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative w-full ${SIZES[size]} bg-white rounded-2xl border border-slate-200/80 shadow-xl max-h-[90vh] flex flex-col`}
      >
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-100">
          <div>
            <div id="modal-title" className="text-lg font-black text-slate-900 tracking-tight">
              {title}
            </div>
            {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="h-9 w-9 shrink-0 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto">{children}</div>

        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/60 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function ModalButton({
  variant = 'primary',
  className = '',
  loading = false,
  disabled,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'danger'; loading?: boolean }) {
  const styles = {
    primary: 'bg-[#1F4DA8] text-white hover:bg-[#3A6FD8] shadow-sm shadow-[#1F4DA8]/30',
    secondary: 'bg-white text-[#1E293B] border border-[#E2E8F0] hover:bg-[#F7F9FC]',
    outline: 'bg-white text-[#1E293B] border border-[#E2E8F0] hover:bg-[#F7F9FC]',
    danger: 'bg-[#DC2626] text-white hover:bg-red-700 shadow-sm shadow-[#DC2626]/30',
  }[variant];

  return (
    <button
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${styles} ${className}`}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      )}
      {children}
    </button>
  );
}
