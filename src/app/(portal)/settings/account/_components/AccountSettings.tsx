"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ICON_STROKE_WIDTH } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

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

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [changingPw, setChangingPw] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);

    const fd = new FormData(e.currentTarget);
    const name = fd.get("name")?.toString().trim() || null;

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ name, updated_at: new Date().toISOString() })
      .eq("id", profile.id);

    setSaving(false);

    if (updateError) {
      toast.error(updateError.message);
      return;
    }

    toast.success("Profile updated");
    router.refresh();
  }

  async function handlePasswordChange() {
    if (newPw.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (newPw !== confirmPw) {
      toast.error("Passwords do not match");
      return;
    }

    setChangingPw(true);
    try {
      const supabase = createClient();

      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password: currentPw,
      });

      if (signInErr) {
        toast.error("Current password is incorrect");
        return;
      }

      const { error } = await supabase.auth.updateUser({ password: newPw });
      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Password updated");
      setCurrentPw("");
      setNewPw("");
      setConfirmPw("");
    } catch {
      toast.error("Failed to update password");
    } finally {
      setChangingPw(false);
    }
  }

  return (
    <div className="space-y-6">
      <form
        onSubmit={handleSubmit}
        className="max-w-lg space-y-5 rounded-xl border border-border bg-card p-5"
      >
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={email} disabled className="mt-1.5 opacity-60" />
          <p className="text-caption text-muted-foreground mt-1">
            Contact support to change your email address.
          </p>
        </div>

        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            name="name"
            defaultValue={profile.name ?? ""}
            placeholder="John Smith"
            className="mt-1.5"
          />
        </div>

        <div>
          <Label>Role</Label>
          <Input
            value={profile.dealership_role.charAt(0).toUpperCase() + profile.dealership_role.slice(1)}
            disabled
            className="mt-1.5 opacity-60"
          />
        </div>

        <Button type="submit" disabled={saving}>
          {saving && <Loader2 size={14} className="mr-1.5 animate-spin" />}
          Save Changes
        </Button>
      </form>

      {/* Password change */}
      <div className="max-w-lg rounded-xl border border-border bg-card p-5 space-y-5">
        <h3 className="text-heading-4">Change Password</h3>
        <div>
          <Label htmlFor="current_pw">Current Password</Label>
          <div className="relative mt-1.5">
            <Input
              id="current_pw"
              type={showPw ? "text" : "password"}
              value={currentPw}
              onChange={(e) => setCurrentPw(e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              tabIndex={-1}
            >
              {showPw ? <EyeOff size={14} strokeWidth={ICON_STROKE_WIDTH} /> : <Eye size={14} strokeWidth={ICON_STROKE_WIDTH} />}
            </button>
          </div>
        </div>
        <div>
          <Label htmlFor="new_pw">New Password</Label>
          <Input id="new_pw" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} className="mt-1.5" />
          <p className="text-caption text-muted-foreground mt-1">Minimum 8 characters</p>
        </div>
        <div>
          <Label htmlFor="confirm_pw">Confirm New Password</Label>
          <Input id="confirm_pw" type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} className="mt-1.5" />
        </div>
        <Button
          onClick={handlePasswordChange}
          disabled={changingPw || !currentPw || !newPw || !confirmPw}
          variant="outline"
        >
          {changingPw && <Loader2 size={14} className="mr-1.5 animate-spin" />}
          Update Password
        </Button>
      </div>
    </div>
  );
}
