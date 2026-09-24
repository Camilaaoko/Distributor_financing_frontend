import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  delta: string;
  trend: 'positive' | 'negative';
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  href?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  delta,
  trend,
  icon: Icon,
  iconBg,
  iconColor,
  href,
  className = '',
}: StatCardProps) {
  const content = (
    <div
      className={`bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-5 transition-all duration-200 ${
        href ? 'hover:border-[#1F4DA8]/50 hover:shadow-md hover:-translate-y-0.5 cursor-pointer' : ''
      } ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
          <Icon size={20} />
        </div>
        <div className="text-sm font-semibold text-[#64748B] group-hover:text-slate-900 transition-colors">{label}</div>
      </div>
      <div className="text-2xl font-bold text-[#1E293B] mt-3">{value}</div>
      <div className={`text-xs font-semibold mt-1 ${trend === 'positive' ? 'text-[#F58220]' : 'text-[#DC2626]'}`}>
        {trend === 'positive' ? '↑' : '↓'} {delta} vs last month
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block group">
        {content}
      </Link>
    );
  }

  return content;
}
