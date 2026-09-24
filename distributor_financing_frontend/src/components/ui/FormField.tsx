import { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: ReactNode;
}

export function FormField({ label, htmlFor, required, hint, error, className = '', children }: FormFieldProps) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="block text-xs font-bold uppercase tracking-wide text-slate-500 mb-1.5">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-rose-500 font-semibold mt-1">{error}</p>
      ) : hint ? (
        <p className="text-xs text-slate-400 mt-1">{hint}</p>
      ) : null}
    </div>
  );
}


const baseInputClass =
  'w-full rounded-xl border border-[#E2E8F0] bg-white px-3.5 py-2.5 text-sm text-[#1E293B] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1F4DA8]/40 focus:border-[#1F4DA8] transition-colors';

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${baseInputClass} ${props.className ?? ''}`} />;
}

export function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={`${baseInputClass} ${props.className ?? ''}`}>
      {children}
    </select>
  );
}
