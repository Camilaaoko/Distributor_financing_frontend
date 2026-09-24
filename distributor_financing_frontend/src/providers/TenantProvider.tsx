'use client';

import React, { createContext, useContext, useState } from 'react';
import { Tenant } from '@/lib/types';

interface TenantContextValue {
  tenant: Tenant | null;
  setTenant: (tenant: Tenant | null) => void;
}

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(null);

  return (
    <TenantContext.Provider value={{ tenant, setTenant }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenantContext() {
  const ctx = useContext(TenantContext);
  if (!ctx) throw new Error('useTenantContext must be used within a TenantProvider');
  return ctx;
}
