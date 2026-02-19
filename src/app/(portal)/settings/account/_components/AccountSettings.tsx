"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { createClient } from "@/lib/supabase/client";

type Profile = {
  id: string;
  name: string | null;
  email: string;
  system_role: string;
  dealership_role: string;
};

export function AccountSettings({
  profile,
  email,
}: {
  profile: Profile;
  email: string;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const fd = new FormData(e.currentTarget);
    const name = fd.get("name")?.toString().trim() || null;

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ name, updated_at: new Date().toISOString() })
      .eq("id", profile.id);

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSuccess(true);
    router.refresh();
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Account Settings"
        description="Manage your personal account information."
      />

      {success && (
        <Alert>
          <AlertDescription>Your profile has been updated.</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form
        onSubmit={handleSubmit}
        className="max-w-lg space-y-6 rounded-xl border border-border bg-card p-6"
      >
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={email} disabled className="opacity-60" />
          <p className="text-caption text-muted-foreground">
            Contact support to change your email address.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            defaultValue={profile.name ?? ""}
            placeholder="John Smith"
          />
        </div>

        <div className="space-y-1.5">
          <Label>Role</Label>
          <Input
            value={profile.dealership_role.charAt(0).toUpperCase() + profile.dealership_role.slice(1)}
            disabled
            className="opacity-60"
          />
        </div>

        <Button type="submit" disabled={saving}>
          {saving ? (
            <LoadingSpinner size={18} className="text-primary-foreground" />
          ) : (
            "Save Changes"
          )}
        </Button>
      </form>
    </div>
  );
}
