"use client";

import { Menu } from "lucide-react";
import { useBranding, defaultBranding } from "@/context/BrandingContext";
import { Button } from "@/components/ui/button";

interface MobileNavBarProps {
  onMenuClick: () => void;
}

export default function MobileNavBar({ onMenuClick }: MobileNavBarProps) {
  const { branding } = useBranding();
  const adminName = branding?.admin_name ?? defaultBranding.admin_name;

  return (
    <div className="flex h-14 items-center justify-between border-b border-border bg-background px-4 md:hidden">
      <Button variant="ghost" size="icon" aria-label="Open menu" onClick={onMenuClick}>
        <Menu className="size-5" />
      </Button>
      <span className="text-sm font-semibold text-foreground">{adminName}</span>
      <div className="w-9" />
    </div>
  );
}
