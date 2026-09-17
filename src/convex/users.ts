import { getAuthUserId } from "@convex-dev/auth/server";
import { query } from "./_generated/server";

/**
 * Get the current signed in user. Returns null if the user is not signed in.
 *
 * Total function: it must NEVER throw. Convex's React useQuery re-throws any
 * server error during render, which would blank the whole workstation behind
 * the error boundary — e.g. when JWT identity resolution fails on the
 * published deployment (federated-token validation is performed lazily inside
 * getAuthUserId and can raise for transient JWKS/network reasons). Degrading
 * to `null` renders the signed-out experience instead, which the auth flow
 * recovers from naturally. The real cause is logged to the Convex dashboard.
 */
export const currentUser = query({
  args: {},
  handler: async (ctx) => {
    let userId: ReturnType<typeof ctx.db.normalizeId<"users">> | null = null;
    try {
      userId = await getAuthUserId(ctx);
    } catch (error) {
      console.error("[users:currentUser] identity resolution failed:", error);
      return null;
    }
    if (userId === null) return null;
    try {
      return await ctx.db.get(userId);
    } catch (error) {
      console.error("[users:currentUser] user lookup failed:", error);
      return null;
    }
  },
});
