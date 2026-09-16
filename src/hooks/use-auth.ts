import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQuery } from "convex/react";
import { useSessionStore } from "@/store/session-store";
import { useCallback } from "react";

/**
 * Identity for the workstation.
 *
 * Two sources are combined: the real Convex identity (email OTP / anonymous)
 * and the persisted mock session written at sign-in while the enterprise
 * directory API is under construction. `signOut` clears both so a refresh can
 * never resurrect a session the user just ended.
 */
export function useAuth() {
  const { isLoading: isAuthLoading, isAuthenticated } = useConvexAuth();
  const user = useQuery(api.users.currentUser);
  const session = useSessionStore((state) => state.session);
  const clearSession = useSessionStore((state) => state.clearSession);
  const { signIn, signOut } = useAuthActions();

  const isLoading = isAuthLoading || user === undefined;

  const isAuthenticatedAny = isAuthenticated || session !== null;

  const signOutEverywhere = useCallback(async () => {
    clearSession();
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  }, [clearSession, signOut]);

  return {
    isLoading,
    isAuthenticated: isAuthenticatedAny,
    user,
    session,
    signIn,
    signOut: signOutEverywhere,
  };
}
