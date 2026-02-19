import type { DealershipRole, SystemRole } from "./dealership";

export type Profile = {
  id: string;
  email: string;
  name: string | null;
  pending_email: string | null;
  system_role: SystemRole;
  dealership_role: DealershipRole;
  dealership_id: string | null;
  invited_by: string | null;
  joined_at: string | null;
  last_activity_at: string | null;
  created_at: string;
  updated_at: string;
};

export type UserInvitation = {
  id: string;
  dealership_id: string;
  email: string;
  token: string;
  invited_by: string;
  expires_at: string;
  accepted_at: string | null;
  failed_attempts: number;
  created_at: string;
};
