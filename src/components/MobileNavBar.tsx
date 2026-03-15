"use client";

import { Menu, Search } from "lucide-react";
import { useSearchModal } from "@/context/SearchModalContext";
import { Button } from "@/components/ui/button";

interface MobileNavBarProps {
  onMenuClick: () => void;
}

export default function MobileNavBar({ onMenuClick }: MobileNavBarProps) {
  const { setOpen: setSearchOpen } = useSearchModal();

  return (
    <div className="flex h-14 items-center justify-between border-b border-border bg-background px-4 md:hidden">
      <Button variant="ghost" size="icon" aria-label="Open menu" onClick={onMenuClick}>
        <Menu className="size-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Search"
        onClick={() => setSearchOpen(true)}
        className="shrink-0 text-muted-foreground hover:text-foreground"
      >
        <Search className="size-5" />
      </Button>
    </div>
  );
}
