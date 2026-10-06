import { initTRPC, TRPCError } from "@trpc/server";
import type { Database } from "./db/client";
import type { users } from "./db/schema";

export type Context = {
  db: Database;
  // The request context resolves this from the allowed demo-user header.
  // Missing, unknown, or disabled demo identities produce null.
  user: typeof users.$inferSelect | null;
};

export type PrivateContext = Context & { user: NonNullable<Context["user"]> };

const trpc = initTRPC.context<Context>().create();
export const router = trpc.router;

// Public procedures are available before selecting a user (for example, the switcher).
export const publicProcedure = trpc.procedure;

/**
 * Requires a resolved user before a query or mutation can run.
 * For now this is a fake login supplied by resolveDevUser, not a real session.
 * Later, the request context can resolve a verified session without changing these procedures.
 */
export const privateProcedure = publicProcedure.use(function requireUser({
  ctx,
  next,
}) {
  if (!ctx.user) {
    // tRPC catches this and returns a structured UNAUTHORIZED response.
    // TanStack Query exposes it as query.error; the protected resolver never runs.
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Select a demo user to continue.",
    });
  }

  // Passing the narrowed user makes ctx.user non-null inside private procedures.
  // Authentication alone does not grant access to every case: caseAccess still scopes queries.
  return next({ ctx: { user: ctx.user } });
});
