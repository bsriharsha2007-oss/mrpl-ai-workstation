/**
 * Global shell state (Zustand).
 *
 * Holds only presentation state that several distant surfaces must agree on:
 * sidebar collapse, overlays, dashboard preview role and the floating AI
 * assistant. Server data stays in TanStack Query.
 */

import type { Role } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UiState {
  sidebarCollapsed: boolean;
  mobileNavOpen: boolean;
  commandOpen: boolean;
  notificationsOpen: boolean;
  assistantOpen: boolean;
  /**
   * Frontend-only role preview used to demonstrate the three dashboards before
   * backend RBAC lands. `null` means "use the role from the user record".
   */
  rolePreview: Role | null;
  recentSearches: string[];
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setMobileNavOpen: (open: boolean) => void;
  setCommandOpen: (open: boolean) => void;
  toggleCommand: () => void;
  setNotificationsOpen: (open: boolean) => void;
  toggleNotifications: () => void;
  setAssistantOpen: (open: boolean) => void;
  toggleAssistant: () => void;
  setRolePreview: (role: Role | null) => void;
  pushRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      mobileNavOpen: false,
      commandOpen: false,
      notificationsOpen: false,
      assistantOpen: false,
      rolePreview: null,
      recentSearches: [],
      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),
      setCommandOpen: (commandOpen) => set({ commandOpen }),
      toggleCommand: () => set((state) => ({ commandOpen: !state.commandOpen })),
      setNotificationsOpen: (notificationsOpen) => set({ notificationsOpen }),
      toggleNotifications: () =>
        set((state) => ({ notificationsOpen: !state.notificationsOpen })),
      setAssistantOpen: (assistantOpen) => set({ assistantOpen }),
      toggleAssistant: () =>
        set((state) => ({ assistantOpen: !state.assistantOpen })),
      setRolePreview: (rolePreview) => set({ rolePreview }),
      pushRecentSearch: (query) =>
        set((state) => {
          const trimmed = query.trim();
          if (!trimmed) return state;
          const next = [
            trimmed,
            ...state.recentSearches.filter((item) => item !== trimmed),
          ].slice(0, 8);
          return { recentSearches: next };
        }),
      clearRecentSearches: () => set({ recentSearches: [] }),
    }),
    {
      name: "mrpl.workstation.ui",
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        rolePreview: state.rolePreview,
        recentSearches: state.recentSearches,
      }),
    },
  ),
);

export const ROLE_LABELS: Record<Role, string> = {
  employee: "Refinery Employee",
  manager: "Department Manager",
  admin: "Enterprise Administrator",
};
