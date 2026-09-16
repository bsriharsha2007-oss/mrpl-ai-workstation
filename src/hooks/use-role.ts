import { useAuth } from "@/hooks/use-auth";
import { PROFILES } from "@/services/mock/data";
import { useSessionStore } from "@/store/session-store";
import { ROLE_LABELS, useUiStore } from "@/store/ui-store";
import type { Role, UserProfile } from "@/types";
import { type Capability, can } from "@/utils/rbac";
import { useCallback, useMemo } from "react";

/** Maps the stored user role onto a workstation dashboard personality. */
export function normalizeRole(raw?: string | null): Role {
  if (raw === "admin") return "admin";
  if (raw === "member") return "manager";
  return "employee";
}

export interface RoleSession {
  /** Effective personality driving navigation and dashboards. */
  role: Role;
  /** Role recorded at sign-in (session, then the user account). */
  assignedRole: Role;
  /** True when an administrator is previewing another dashboard. */
  isPreview: boolean;
  roleLabel: string;
  profile: UserProfile;
  initials: string;
  setPreview: (role: Role | null) => void;
  can: (capability: Capability) => boolean;
}

/**
 * Resolves who the workstation is signing in as.
 *
 * The persisted mock session written at sign-in is the primary source of the
 * assigned role (until the directory API lands); the Convex user record is the
 * fallback. Administrators can preview the other two dashboards from the top
 * navigation — the UI labels that state explicitly.
 */
export function useRole(): RoleSession {
  const { user } = useAuth();
  const session = useSessionStore((state) => state.session);
  const rolePreview = useUiStore((state) => state.rolePreview);
  const setRolePreview = useUiStore((state) => state.setRolePreview);

  const assignedRole = useMemo(
    () =>
      session?.role ??
      normalizeRole((user as { role?: string } | null)?.role),
    [session, user],
  );

  const role = rolePreview ?? assignedRole;
  const profile = useMemo(() => {
    const base = PROFILES[role];
    const name =
      session?.name?.trim() || user?.name?.trim() || base.name;
    const email =
      session?.email?.trim() || user?.email?.trim() || base.email;
    return { ...base, name, email };
  }, [role, session, user]);

  const setPreview = useCallback(
    (next: Role | null) => setRolePreview(next),
    [setRolePreview],
  );

  return {
    role,
    assignedRole,
    isPreview: role !== assignedRole,
    roleLabel: ROLE_LABELS[role],
    profile,
    initials: profile.avatarInitials,
    setPreview,
    can: (capability: Capability) => can(role, capability),
  };
}
