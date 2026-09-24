"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export type DealerRole = "DEALER_MAKER" | "DEALER_CHECKER";

export function useDealerRole() {
  const auth = useAuth();
  const [overrideRole, setOverrideRole] = useState<DealerRole | null>(null);

  // Sync state from localStorage for local preview/testing
  useEffect(() => {
    const savedRole = localStorage.getItem("dfp_dealer_role") as DealerRole;
    if (savedRole) {
      setOverrideRole(savedRole);
    }
  }, []);

  // Determine active role from Auth Context or explicit override
  const authRole = (auth?.user as any)?.role || (auth?.user as any)?.subRole;
  const currentRole: DealerRole =
    overrideRole || (authRole === "DEALER_CHECKER" ? "DEALER_CHECKER" : "DEALER_MAKER");

  const switchRole = (newRole: DealerRole) => {
    localStorage.setItem("dfp_dealer_role", newRole);
    setOverrideRole(newRole);
    window.location.reload();
  };

  return {
    role: currentRole,
    isMaker: currentRole === "DEALER_MAKER",
    isChecker: currentRole === "DEALER_CHECKER",
    switchRole,
    user: auth?.user,
  };
}