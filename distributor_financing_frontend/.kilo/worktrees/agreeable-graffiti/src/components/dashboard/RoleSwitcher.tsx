"use client";

import React from "react";
import { UserCheck, ShieldAlert } from "lucide-react";
import { useDealerRole } from "@/hooks/useDealerRole";

export function RoleSwitcher() {
  const { isMaker, switchRole } = useDealerRole();

  return (
    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs shadow-inner">
      <span className="text-[10px] font-bold text-slate-500 uppercase px-1.5">Context:</span>
      <button
        onClick={() => switchRole("DEALER_MAKER")}
        className={`px-2.5 py-1 rounded-md font-bold transition-all flex items-center gap-1 ${
          isMaker
            ? "bg-blue-700 text-white shadow-sm"
            : "text-slate-600 hover:text-slate-900"
        }`}
      >
        <UserCheck className="w-3.5 h-3.5" />
        Maker
      </button>
      <button
        onClick={() => switchRole("DEALER_CHECKER")}
        className={`px-2.5 py-1 rounded-md font-bold transition-all flex items-center gap-1 ${
          !isMaker
            ? "bg-indigo-700 text-white shadow-sm"
            : "text-slate-600 hover:text-slate-900"
        }`}
      >
        <ShieldAlert className="w-3.5 h-3.5" />
        Checker
      </button>
    </div>
  );
}