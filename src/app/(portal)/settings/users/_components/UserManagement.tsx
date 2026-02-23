"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Send, MoreHorizontal, UserPlus, Clock, CheckCircle2, XCircle, Users, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ICON_STROKE_WIDTH } from "@/lib/constants";
import { formatRelative } from "@/lib/utils/format-date";
import { toast } from "sonner";

type Profile = {
  id: string;
  name: string | null;
  email: string;
  dealership_role: string;
  joined_at: string | null;
  last_activity_at: string | null;
};

type Invitation = {
  id: string;
  email: string;
  token: string;
  expires_at: string;
  accepted_at: string | null;
  created_at: string;
};

type Props = {
  currentUserId: string;
  currentRole: string;
  users: Profile[];
  dealershipId: string;
  maxUsers: number;
  activeUsersCount: number;
};

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  manager: "Manager",
  user: "User",
};

const ROLE_COLORS: Record<string, string> = {
  owner: "bg-violet-500/10 text-violet-400",
  manager: "bg-blue-500/10 text-blue-400",
  user: "bg-muted text-muted-foreground",
};

export function UserManagement({ currentUserId, currentRole, users: initialUsers, dealershipId, maxUsers, activeUsersCount: initialCount }: Props) {
  const [users, setUsers] = useState(initialUsers);
  const [activeCount, setActiveCount] = useState(initialCount);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("user");
  const [inviting, setInviting] = useState(false);

  const isOwner = currentRole === "owner";

  const fetchInvitations = useCallback(async () => {
    try {
      const res = await fetch("/api/invitations");
      if (res.ok) {
        const data = await res.json();
        setInvitations(data.invitations ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInvitations(); }, [fetchInvitations]);

  const pendingInvitations = invitations.filter((inv) => !inv.accepted_at && new Date(inv.expires_at) > new Date());
  const usedSeats = users.length;
  const reservedSeats = pendingInvitations.length;
  const totalClaimed = usedSeats + reservedSeats;
  const seatsAvailable = maxUsers - totalClaimed;
  const isFull = seatsAvailable <= 0;

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    if (isFull) {
      toast.error("No seats available. Upgrade your plan for more team members.");
      return;
    }
    setInviting(true);
    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail("");
      fetchInvitations();
    } catch {
      toast.error("Failed to send invitation");
    } finally {
      setInviting(false);
    }
  };

  const handleResend = async (id: string) => {
    try {
      const res = await fetch(`/api/invitations/${id}`, { method: "POST" });
      if (!res.ok) { toast.error("Failed to resend"); return; }
      toast.success("Invitation resent");
      fetchInvitations();
    } catch {
      toast.error("Failed to resend");
    }
  };

  const handleCancel = async (id: string) => {
    try {
      const res = await fetch(`/api/invitations/${id}`, { method: "DELETE" });
      if (!res.ok) { toast.error("Failed to cancel"); return; }
      toast.success("Invitation cancelled");
      fetchInvitations();
    } catch {
      toast.error("Failed to cancel");
    }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      const res = await fetch(`/api/users/${userId}/role`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, dealership_role: role } : u));
      toast.success("Role updated");
    } catch {
      toast.error("Failed to update role");
    }
  };

  const handleRemove = async (userId: string, name: string | null) => {
    if (!confirm(`Remove ${name || "this user"} from the dealership?`)) return;
    try {
      const res = await fetch(`/api/users/${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error); return; }
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setActiveCount((c) => Math.max(0, c - 1));
      toast.success("User removed");
    } catch {
      toast.error("Failed to remove user");
    }
  };

  void dealershipId;

  const owner = users.find((u) => u.dealership_role === "owner");
  const nonOwners = users.filter((u) => u.dealership_role !== "owner");

  return (
    <div className="space-y-6">
      {/* Seat counter */}
      <div className="flex items-center justify-between rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
            <Users size={16} className="text-primary" strokeWidth={ICON_STROKE_WIDTH} />
          </div>
          <div>
            <p className="text-body-sm font-medium">
              {usedSeats} of {maxUsers} seats used
              {reservedSeats > 0 && (
                <span className="text-muted-foreground font-normal"> ({reservedSeats} pending)</span>
              )}
            </p>
            <p className="text-caption text-muted-foreground">
              {isFull
                ? "All seats occupied. Upgrade your plan for more."
                : `${seatsAvailable} seat${seatsAvailable !== 1 ? "s" : ""} available`}
            </p>
          </div>
        </div>
        {/* Seat usage bar */}
        <div className="hidden sm:flex items-center gap-3 w-36">
          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${isFull ? "bg-destructive" : "bg-primary"}`}
              style={{ width: `${Math.min(100, (totalClaimed / maxUsers) * 100)}%` }}
            />
          </div>
          <span className="text-caption text-muted-foreground tabular-nums">{totalClaimed}/{maxUsers}</span>
        </div>
      </div>

      {/* Invite form */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <UserPlus size={16} strokeWidth={ICON_STROKE_WIDTH} className="text-muted-foreground" />
          <h3 className="text-heading-4">Invite Team Member</h3>
        </div>
        {isFull ? (
          <p className="text-body-sm text-muted-foreground">
            You&apos;ve reached your seat limit. Upgrade your plan to invite more team members.
          </p>
        ) : (
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Input
                placeholder="email@example.com"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleInvite()}
              />
            </div>
            {isOwner && (
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            )}
            <Button onClick={handleInvite} disabled={inviting || !inviteEmail.trim()}>
              {inviting ? <Loader2 size={14} className="mr-1.5 animate-spin" /> : <Send size={14} className="mr-1.5" />}
              Invite
            </Button>
          </div>
        )}
      </div>

      {/* Primary admin (owner) */}
      {owner && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <h3 className="text-heading-4">Primary Admin</h3>
          </div>
          <div className="flex items-center gap-3 px-5 py-3.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-500/10 shrink-0">
              <Crown size={14} className="text-violet-400" strokeWidth={ICON_STROKE_WIDTH} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-body-sm font-medium truncate">
                {owner.name || owner.email}
                {owner.id === currentUserId && <span className="text-caption text-muted-foreground ml-1.5">(you)</span>}
              </p>
              <p className="text-caption text-muted-foreground truncate">{owner.email}</p>
            </div>
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${ROLE_COLORS.owner}`}>
              Owner
            </span>
          </div>
        </div>
      )}

      {/* Team members (non-owner) */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h3 className="text-heading-4">Team Members</h3>
        </div>
        {nonOwners.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-body-sm text-muted-foreground">No team members yet. Invite someone to get started.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {nonOwners.map((u) => (
              <div key={u.id} className="flex items-center gap-3 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-body-sm font-medium truncate">
                    {u.name || u.email}
                    {u.id === currentUserId && <span className="text-caption text-muted-foreground ml-1.5">(you)</span>}
                  </p>
                  <p className="text-caption text-muted-foreground truncate">{u.email}</p>
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${ROLE_COLORS[u.dealership_role] || ROLE_COLORS.user}`}>
                  {ROLE_LABELS[u.dealership_role] || u.dealership_role}
                </span>
                {u.joined_at && (
                  <span className="text-caption text-muted-foreground hidden sm:block w-24 text-right">
                    {formatRelative(u.joined_at)}
                  </span>
                )}
                {isOwner && u.id !== currentUserId && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-xs"><MoreHorizontal size={14} /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {["manager", "user"]
                        .filter((r) => r !== u.dealership_role)
                        .map((r) => (
                          <DropdownMenuItem key={r} onClick={() => handleRoleChange(u.id, r)}>
                            Make {ROLE_LABELS[r]}
                          </DropdownMenuItem>
                        ))}
                      <DropdownMenuItem onClick={() => handleRemove(u.id, u.name)} className="text-destructive">
                        Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending invitations */}
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 size={20} className="animate-spin text-muted-foreground" /></div>
      ) : pendingInvitations.length > 0 ? (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <h3 className="text-heading-4">Pending Invitations</h3>
          </div>
          <div className="divide-y divide-border">
            {pendingInvitations.map((inv) => (
              <div key={inv.id} className="flex items-center gap-3 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-body-sm font-medium truncate">{inv.email}</p>
                  <p className="text-caption text-muted-foreground">
                    Sent {formatRelative(inv.created_at)}
                  </p>
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-400 flex items-center gap-1">
                  <Clock size={10} /> Pending
                </span>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="xs" onClick={() => handleResend(inv.id)}>Resend</Button>
                  <Button variant="ghost" size="xs" onClick={() => handleCancel(inv.id)} className="text-destructive">Cancel</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* Expired invitations (separate, collapsed) */}
      {!loading && invitations.filter((inv) => !inv.accepted_at && new Date(inv.expires_at) <= new Date()).length > 0 && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-3 border-b border-border">
            <h3 className="text-heading-4 text-muted-foreground">Expired Invitations</h3>
          </div>
          <div className="divide-y divide-border">
            {invitations
              .filter((inv) => !inv.accepted_at && new Date(inv.expires_at) <= new Date())
              .map((inv) => (
                <div key={inv.id} className="flex items-center gap-3 px-5 py-3 opacity-60">
                  <div className="flex-1 min-w-0">
                    <p className="text-body-sm truncate">{inv.email}</p>
                  </div>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 flex items-center gap-1">
                    <XCircle size={10} /> Expired
                  </span>
                  <Button variant="ghost" size="xs" onClick={() => handleCancel(inv.id)} className="text-destructive">Remove</Button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
