'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

type ToastVariant = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  variant: ToastVariant;
  message: string;
}

interface ToastContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastVariant, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
};

const STYLES: Record<ToastVariant, string> = {
  success: 'bg-[#16A34A] text-white',
  error: 'bg-[#DC2626] text-white',
  info: 'bg-[#1F4DA8] text-white',
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((variant: ToastVariant, message: string) => {
    const id = `toast_${Math.random().toString(36).slice(2, 9)}`;
    setToasts((prev) => [...prev, { id, variant, message }]);
    setTimeout(() => dismiss(id), 4500);
  }, [dismiss]);

  const success = useCallback((message: string) => push('success', message), [push]);
  const error = useCallback((message: string) => push('error', message), [push]);
  const info = useCallback((message: string) => push('info', message), [push]);
  // Keep the context value stable while the visible toast list changes. Consumers
  // can safely use it in effect/callback dependencies without refetching in a loop.
  const value = useMemo<ToastContextValue>(() => ({ success, error, info }), [success, error, info]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2.5 w-full max-w-sm">
        {toasts.map((t) => {
          const Icon = ICONS[t.variant];
          return (
            <div
              key={t.id}
              role="status"
              className={`flex items-start gap-2.5 rounded-xl px-4 py-3 shadow-lg shadow-slate-900/10 animate-in fade-in slide-in-from-bottom-2 duration-200 ${STYLES[t.variant]}`}
            >
              <Icon size={18} className="shrink-0 mt-0.5" />
              <p className="text-sm font-medium flex-1">{t.message}</p>
              <button
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                className="shrink-0 opacity-70 hover:opacity-100"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
