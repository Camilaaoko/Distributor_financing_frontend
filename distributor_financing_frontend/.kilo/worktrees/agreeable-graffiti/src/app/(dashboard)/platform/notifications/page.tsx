import { PlatformNotificationsClient } from './PlatformNotificationsClient';

export default function PlatformNotificationsPage() {
  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Notifications</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Pending approvals, new registrations, and security alerts across the platform.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 max-w-2xl">
        <PlatformNotificationsClient />
      </div>
    </div>
  );
}
