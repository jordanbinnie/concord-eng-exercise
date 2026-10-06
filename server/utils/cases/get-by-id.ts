import { and, eq } from "drizzle-orm";
import { caseAdvisors, cases, users } from "../../db/schema";
import type { PrivateContext } from "../../trpc";
import { caseAccess } from "./access";
import { caseQuery, withCaseReview } from "./query";

/** Fetches one accessible case with its advisors and review reasons, returning an error object if unavailable. */
export async function getCaseById(ctx: PrivateContext, id: string) {
  const [record] = await caseQuery(ctx).where(
    and(caseAccess(ctx), eq(cases.id, id))
  );
  if (!record) {
    return {
      success: false as const,
      error: {
        code: "NOT_FOUND",
        message: "This case is unavailable or you do not have access.",
      },
    };
  }
  const advisors = await ctx.db
    .select({ id: users.id, name: users.fullName })
    .from(caseAdvisors)
    .innerJoin(users, eq(caseAdvisors.userId, users.id))
    .where(eq(caseAdvisors.caseId, record.id))
    .orderBy(users.fullName);
  return {
    success: true as const,
    data: { ...withCaseReview(record), advisors },
  };
}
