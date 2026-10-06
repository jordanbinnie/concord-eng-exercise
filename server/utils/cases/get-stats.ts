import { count, eq, inArray, type SQL, sql } from "drizzle-orm";
import { beneficiaryProfiles, cases } from "../../db/schema";
import type { PrivateContext } from "../../trpc";
import { caseAccess } from "./access";
import { caseAttentionFilter, normalizedStatus } from "./filters";

/** Counts one group in PostgreSQL without loading the matching records into the API. */
function countWhere(condition: SQL | undefined) {
  return sql<number>`count(*) filter (where ${condition})`.mapWith(Number);
}

/** Supplies dashboard totals across all accessible cases, independently of the table's page and search. */
export async function getCaseStats(ctx: PrivateContext) {
  const attention = caseAttentionFilter(new Date());
  const [summary] = await ctx.db
    .select({
      total: count(),
      needsAttention: countWhere(attention.condition),
      preAssessment: countWhere(eq(normalizedStatus, "pre-assessment")),
      inProgress: countWhere(
        inArray(normalizedStatus, ["in progress", "rfe issued"])
      ),
      filed: countWhere(eq(normalizedStatus, "filed")),
      approved: countWhere(eq(normalizedStatus, "approved")),
    })
    .from(cases)
    .leftJoin(
      beneficiaryProfiles,
      eq(cases.beneficiaryUserId, beneficiaryProfiles.userId)
    )
    .where(caseAccess(ctx));
  return summary;
}
