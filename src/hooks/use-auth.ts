import { api } from "@/convex/_generated/api";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth, useQueries } from "convex/react";
import { useSessionStore } from "@/store/session-store";
import { useCallback } from "react";

/**
 * Identity for the workstation.
 *
 * Two sources are combined: the real Convex identity (email OTP / anonymous)
 * and the persisted mock session written at sign-in while the enterprise
 * directory API is under construction. `signOut` clears both so a refresh can
 * never resurrect a session the user just ended.
 *
 * The Convex user query runs through `useQueries` rather than `useQuery`:
 * `useQuery` re-throws any server error during render (e.g. when federated
 * JWT identity resolution fails on the published deployment), which blanked
 * the whole workstation behind the error boundary. `useQueries` surfaces the
 * same reactive data with the failure exposed as a result `status` instead —
 * the app then degrades to the signed-out experience and the auth flow
 * recovers normally.
 */
export function useAuth() {
  const { isLoading: isAuthLoading, isAuthenticated } = useConvexAuth();
  const results = useQueries({
    currentUser: { query: api.users.currentUser, args: {} },
  });
  const user = results.currentUser?.data ?? undefined;

  const session = useSessionStore((state) => state.session);
  const clearSession = useSessionStore((state) => state.clearSession);
  const { signIn, signOut } = useAuthActions();

  const isLoading =
    (isAuthLoading || results.currentUser?.status === "Loading") &&
    session === null;

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
