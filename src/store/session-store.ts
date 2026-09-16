/**
 * Mock authenticated session (Zustand + localStorage).
 *
 * Until the enterprise directory API ships, the workstation keeps a local
 * session record written at sign-in time. It drives role-based redirects and
 * survives page refreshes; the real backend will replace `startSession` with
 * the identity returned by the gateway without touching the UI.
 */

import type { Role } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface WorkstationSession {
  email: string;
  name?: string;
  role: Role;
  /** How the session was created — demo sessions never hit the directory. */
  provider: "email-otp" | "anonymous";
  remember: boolean;
  signedInAt: string;
}

interface SessionState {
  session: WorkstationSession | null;
  startSession: (session: WorkstationSession) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      session: null,
      startSession: (session) => set({ session }),
      clearSession: () => set({ session: null }),
    }),
    {
      name: "mrpl.workstation.session",
    },
  ),
);

/** Route the signed-in role lands on after authentication. */
export const ROLE_LANDING: Record<Role, string> = {
  employee: "/dashboard",
  manager: "/dashboard",
  admin: "/dashboard",
};

export const ROLE_ENTRY_LABELS: Record<Role, string> = {
  employee: "Operator / Engineer",
  manager: "Department Manager",
  admin: "Administrator",
};
