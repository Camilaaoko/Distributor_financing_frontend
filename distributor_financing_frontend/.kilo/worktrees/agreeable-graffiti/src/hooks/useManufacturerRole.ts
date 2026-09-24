"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

export type ManufacturerRole = "MANUFACTURER_MAKER" | "MANUFACTURER_CHECKER";

export function useManufacturerRole() {
  const auth = useAuth();
  const [overrideRole, setOverrideRole] = useState<ManufacturerRole | null>(null);

  useEffect(() => {
    const savedRole = localStorage.getItem("dfp_manufacturer_role") as ManufacturerRole;
    if (savedRole) {
      setOverrideRole(savedRole);
    }
  }, []);

  const authRole = (auth?.user as any)?.role || (auth?.user as any)?.subRole;
  const currentRole: ManufacturerRole =
    overrideRole || (authRole === "MANUFACTURER_CHECKER" ? "MANUFACTURER_CHECKER" : "MANUFACTURER_MAKER");

  const switchRole = (newRole: ManufacturerRole) => {
    localStorage.setItem("dfp_manufacturer_role", newRole);
    setOverrideRole(newRole);
    window.location.reload();
  };

  return {
    role: currentRole,
    isMaker: currentRole === "MANUFACTURER_MAKER",
    isChecker: currentRole === "MANUFACTURER_CHECKER",
    switchRole,
    user: auth?.user,
  };
}