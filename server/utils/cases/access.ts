import { and, eq, exists, sql } from "drizzle-orm";
import { caseAdvisors, cases } from "../../db/schema";
import type { PrivateContext } from "../../trpc";

/** Limits every case query to the signed-in user's company, ownership, or assignments. */
export function caseAccess({ db, user }: PrivateContext) {
  if (user.role === "beneficiary") {
    return eq(cases.beneficiaryUserId, user.id);
  }
  if (user.role === "hr") {
    return user.companyId ? eq(cases.companyId, user.companyId) : sql`false`;
  }
  if (user.role === "advisor") {
    return exists(
      db
        .select({ id: caseAdvisors.id })
        .from(caseAdvisors)
        .where(
          and(
            eq(caseAdvisors.caseId, cases.id),
            eq(caseAdvisors.userId, user.id)
          )
        )
    );
  }
  return sql`false`;
}
