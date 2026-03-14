"use client";

import { useState, useRef, useEffect } from "react";
import api from "@/lib/api";
import { useBranding, defaultBranding } from "@/context/BrandingContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function logoUrl(url: string | null): string | null {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  const base = process.env.NEXT_PUBLIC_API_URL || "";
  return base ? `${base.replace(/\/$/, "")}${url.startsWith("/") ? "" : "/"}${url}` : url;
}

export default function SettingsPage() {
  const { branding, isLoading, refetch } = useBranding();
  const [adminName, setAdminName] = useState(defaultBranding.admin_name);
  const [adminSubtitle, setAdminSubtitle] = useState(defaultBranding.admin_subtitle);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [clearLogo, setClearLogo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (branding) {
      setAdminName(branding.admin_name);
      setAdminSubtitle(branding.admin_subtitle);
    }
  }, [branding]);

  const currentLogoUrl = logoUrl(branding?.logo_url ?? null);
  const previewUrl = logoFile ? URL.createObjectURL(logoFile) : currentLogoUrl;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append("admin_name", adminName || defaultBranding.admin_name);
      formData.append("admin_subtitle", adminSubtitle || defaultBranding.admin_subtitle);
      if (logoFile) formData.append("logo", logoFile);
      if (clearLogo) formData.append("clear_logo", "true");

      await api.patch("/api/admin/branding/", formData);
      await refetch();
      setLogoFile(null);
      setClearLogo(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setMessage({ type: "success", text: "Branding saved." });
    } catch {
      setMessage({ type: "error", text: "Failed to save branding." });
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Branding</h1>
      <p className="text-muted-foreground">
        Set your dashboard logo, admin name, and subtitle. These appear in the sidebar header.
      </p>

      <form onSubmit={handleSubmit}>
        <Card className="max-w-xl">
          <CardHeader>
            <CardTitle>Sidebar branding</CardTitle>
            <CardDescription>Logo is shown rounded in the sidebar and mobile header.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Logo */}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Logo
              </label>
              <div className="flex flex-wrap items-center gap-4">
                {previewUrl && !clearLogo ? (
                  <div className="relative size-20 overflow-hidden rounded-full border border-border bg-muted">
                    <img
                      src={previewUrl}
                      alt="Logo preview"
                      className="size-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex size-20 items-center justify-center rounded-full border border-dashed border-border bg-muted text-muted-foreground">
                    No logo
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="text-sm file:mr-2 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-primary-foreground"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      setLogoFile(f || null);
                      if (f) setClearLogo(false);
                    }}
                  />
                  {currentLogoUrl && (
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={clearLogo}
                        onChange={(e) => {
                          setClearLogo(e.target.checked);
                          if (e.target.checked) setLogoFile(null);
                        }}
                      />
                      Remove logo
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="admin_name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Admin name
              </label>
              <Input
                id="admin_name"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="e.g. Gadzilla"
                className="max-w-md"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="admin_subtitle" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Admin subtitle
              </label>
              <Input
                id="admin_subtitle"
                value={adminSubtitle}
                onChange={(e) => setAdminSubtitle(e.target.value)}
                placeholder="e.g. Admin dashboard"
                className="max-w-md"
              />
            </div>

            {message && (
              <p
                className={
                  message.type === "success" ? "text-sm text-green-600" : "text-sm text-destructive"
                }
              >
                {message.text}
              </p>
            )}

            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save branding"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
