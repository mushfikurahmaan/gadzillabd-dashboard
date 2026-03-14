"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Birdhouse,
  Package,
  Box,
  Bell,
  ShoppingCart,
  Heart,
  Users,
  ListTodo,
  ChevronDown,
  ChevronRight,
  PanelRightOpen,
  PanelRightClose,
  Search,
  LogOut,
  ExternalLink,
  KeyRound,
  Palette,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { useAuth } from "@/context/AuthContext";
import { useBranding, defaultBranding } from "@/context/BrandingContext";
import { useSearchModal } from "@/context/SearchModalContext";
import { useNavCounts } from "@/hooks/useNavCounts";
import { cn } from "@/lib/utils";
import { useState } from "react";

function logoUrl(url: string | null): string | null {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  const base = process.env.NEXT_PUBLIC_API_URL || "";
  return base ? `${base.replace(/\/$/, "")}${url.startsWith("/") ? "" : "/"}${url}` : url;
}

const MAIN_NAV = [
  { href: "/", label: "Home", icon: Birdhouse, countKey: null as keyof NavCounts | null },
  { href: "/orders", label: "Orders", icon: Package, countKey: "orders" as keyof NavCounts | null },
  { href: "/products", label: "Products", icon: Box, countKey: "products" as keyof NavCounts | null },
  { href: "/notifications", label: "Notifications", icon: Bell, countKey: "notifications" as keyof NavCounts | null },
  { href: "/carts", label: "Carts", icon: ShoppingCart, countKey: "carts" as keyof NavCounts | null },
  { href: "/wishlist", label: "Wishlist", icon: Heart, countKey: "wishlist" as keyof NavCounts | null },
];

export interface NavCounts {
  orders: number;
  products: number;
  notifications: number;
  carts: number;
  wishlist: number;
  categories: number;
  brands: number;
  contacts: number;
}

function SidebarContent({
  collapsed,
  onNavigate,
  onToggle,
}: {
  collapsed: boolean;
  onNavigate?: () => void;
  onToggle?: () => void;
}) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { branding } = useBranding();
  const { setOpen: setSearchOpen } = useSearchModal();
  const { counts, formatCount } = useNavCounts();
  const [usersOpen, setUsersOpen] = useState(false);
  const [celeryOpen, setCeleryOpen] = useState(false);

  const adminName = branding?.admin_name ?? defaultBranding.admin_name;
  const adminSubtitle = branding?.admin_subtitle ?? defaultBranding.admin_subtitle;
  const resolvedLogoUrl = logoUrl(branding?.logo_url ?? null);
  const initial = adminName.charAt(0).toUpperCase();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const handleLinkClick = () => {
    onNavigate?.();
  };

  return (
    <>
      {/* Header: when collapsed show only toggle button; when expanded show logo + name + subtitle + toggle */}
      <div className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border px-3">
        {collapsed ? (
          onToggle ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="flex shrink-0 text-muted-foreground hover:text-foreground md:flex"
              aria-label="Expand sidebar"
            >
              <PanelRightClose className="size-5" />
            </Button>
          ) : (
            <span className="size-9 shrink-0" />
          )
        ) : (
          <>
            {resolvedLogoUrl ? (
              <img
                src={resolvedLogoUrl}
                alt=""
                className="size-10 shrink-0 rounded-full object-cover"
              />
            ) : (
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {initial}
              </span>
            )}
            <div className="min-w-0 flex-1">
              <span className="block truncate text-base font-semibold text-foreground">
                {adminName}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {adminSubtitle}
              </span>
            </div>
          </>
        )}
        {!collapsed && onToggle && (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onToggle}
            className="hidden shrink-0 text-muted-foreground hover:text-foreground md:flex"
            aria-label="Collapse sidebar"
          >
            <PanelRightOpen className="size-4" />
          </Button>
        )}
      </div>

      {/* Search: on mobile use inline input; on desktop open modal */}
      {!collapsed && (
        <div className="px-3 py-3">
          {/* Mobile: real search input (no popup) */}
          <div className="relative md:hidden">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search apps and mo..."
              className="h-9 rounded-lg bg-muted/50 pl-9"
              aria-label="Search"
            />
          </div>
          {/* Desktop: trigger opens search modal */}
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="relative hidden h-9 w-full items-center gap-2 overflow-hidden rounded-lg bg-muted/50 pl-9 pr-2 text-left text-sm text-muted-foreground transition-colors hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring md:flex"
            aria-label="Open search"
          >
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 shrink-0 text-muted-foreground pointer-events-none" />
            <span className="min-w-0 flex-1 truncate pr-0">Search apps and more</span>
            <TooltipProvider delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <kbd className="shrink-0 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    Ctrl+K
                  </kbd>
                </TooltipTrigger>
                <TooltipContent side="bottom">Search shortcut</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav
        className={cn(
          "flex-1 space-y-1 overflow-y-auto px-2 pb-4",
          collapsed && "pt-2"
        )}
      >
        {!collapsed && (
          <p className="px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Navigation
          </p>
        )}
        {MAIN_NAV.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleLinkClick}
              className={cn(
                "flex min-h-[44px] items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors md:min-h-0",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="size-5 shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.countKey &&
                    counts != null &&
                    counts[item.countKey] > 0 && (
                      <Badge
                        className="h-5 min-w-5 rounded-full border-0 bg-red-50 px-1.5 text-xs font-medium text-red-700"
                      >
                        {formatCount(counts[item.countKey])}
                      </Badge>
                    )}
                </>
              )}
            </Link>
          );
        })}

        {/* Collapsible: Users & Groups */}
        <Collapsible open={usersOpen} onOpenChange={setUsersOpen}>
          <CollapsibleTrigger
            onClick={() => {
              if (collapsed && onToggle) {
                onToggle();
                setUsersOpen(true);
              }
            }}
            className={cn(
              "flex min-h-[44px] w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground md:min-h-0",
              collapsed && "justify-center px-2"
            )}
          >
            <Users className="size-5 shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1 truncate text-left">Categories & Brands</span>
                <ChevronRight
                  className={cn("size-4 shrink-0 transition-transform", usersOpen && "rotate-90")}
                />
              </>
            )}
          </CollapsibleTrigger>
          <CollapsibleContent>
            {!collapsed && (
              <div className="ml-4 mt-1 space-y-0.5 border-l border-border pl-2">
                <Link
                  href="/categories"
                  onClick={handleLinkClick}
                  className="block rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  Categories
                </Link>
                <Link
                  href="/brands"
                  onClick={handleLinkClick}
                  className="block rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  Brands
                </Link>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>

        {/* Collapsible: Celery Tasks */}
        <Collapsible open={celeryOpen} onOpenChange={setCeleryOpen}>
          <CollapsibleTrigger
            onClick={() => {
              if (collapsed && onToggle) {
                onToggle();
                setCeleryOpen(true);
              }
            }}
            className={cn(
              "flex min-h-[44px] w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground md:min-h-0",
              collapsed && "justify-center px-2"
            )}
          >
            <ListTodo className="size-5 shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1 truncate text-left">More</span>
                <ChevronRight
                  className={cn("size-4 shrink-0 transition-transform", celeryOpen && "rotate-90")}
                />
              </>
            )}
          </CollapsibleTrigger>
          <CollapsibleContent>
            {!collapsed && (
              <div className="ml-4 mt-1 space-y-0.5 border-l border-border pl-2">
                <Link
                  href="/contacts"
                  onClick={handleLinkClick}
                  className="block rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  Contacts
                </Link>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </nav>

      {/* User card */}
      <div className="shrink-0 border-t border-border p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-accent",
                collapsed && "justify-center"
              )}
              aria-label="User menu"
            >
              <Avatar className="size-9 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                  SE
                </AvatarFallback>
              </Avatar>
              {!collapsed && (
                <>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      Sample Example
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      sample@example.com
                    </p>
                  </div>
                  <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56" side="top">
            <DropdownMenuItem asChild>
              <Link href="/settings" className="flex cursor-pointer items-center gap-2" onClick={handleLinkClick}>
                <Palette className="size-4" />
                Branding
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="/" className="flex cursor-pointer items-center gap-2">
                <ExternalLink className="size-4" />
                View site
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <button className="flex w-full cursor-pointer items-center gap-2">
                <KeyRound className="size-4" />
                Change password
              </button>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={logout}
              className="cursor-pointer"
            >
              <LogOut className="size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onNavigate?: () => void;
}

export default function Sidebar({ collapsed, onToggle, onNavigate }: SidebarProps) {
  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-border bg-background transition-[width] duration-300 md:flex",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <SidebarContent
        collapsed={collapsed}
        onNavigate={onNavigate}
        onToggle={onToggle}
      />
    </aside>
  );
}

export { SidebarContent };
