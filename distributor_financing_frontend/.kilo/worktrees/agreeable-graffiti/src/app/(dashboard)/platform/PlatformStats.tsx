import { Landmark, Users, Clock3, UserCog, LogIn, HeartPulse } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { platformStatCards } from '@/lib/mock/platform-admin';

const STAT_ICONS = {
  banks: { icon: Landmark, bg: 'bg-blue-50', color: 'text-[#1F4DA8]' },
  users: { icon: Users, bg: 'bg-blue-50', color: 'text-[#1F4DA8]' },
  pending: { icon: Clock3, bg: 'bg-blue-50', color: 'text-[#1F4DA8]' },
  platformUsers: { icon: UserCog, bg: 'bg-blue-50', color: 'text-[#1F4DA8]' },
  logins: { icon: LogIn, bg: 'bg-blue-50', color: 'text-[#1F4DA8]' },
  health: { icon: HeartPulse, bg: 'bg-blue-50', color: 'text-[#1F4DA8]' },
} as const;

export function PlatformStats() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {platformStatCards.map((stat) => {
        const { icon, bg, color } = STAT_ICONS[stat.icon];
        return (
          <StatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            delta={stat.delta}
            trend={stat.trend}
            icon={icon}
            iconBg={bg}
            iconColor={color}
          />
        );
      })}
    </div>
  );
}