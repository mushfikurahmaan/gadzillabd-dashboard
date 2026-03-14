"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import api from "@/lib/api";
import type { Branding } from "@/types";

interface BrandingState {
  branding: Branding | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

const defaultBranding: Branding = {
  logo_url: null,
  admin_name: "Gadzilla",
  admin_subtitle: "Admin dashboard",
};

const BrandingContext = createContext<BrandingState | undefined>(undefined);

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<Branding | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBranding = useCallback(async () => {
    try {
      const { data } = await api.get<Branding>("/api/admin/branding/");
      setBranding(data);
    } catch {
      setBranding(defaultBranding);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBranding();
  }, [fetchBranding]);

  return (
    <BrandingContext.Provider value={{ branding, isLoading, refetch: fetchBranding }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const ctx = useContext(BrandingContext);
  if (!ctx) throw new Error("useBranding must be used within BrandingProvider");
  return ctx;
}

export { defaultBranding };
