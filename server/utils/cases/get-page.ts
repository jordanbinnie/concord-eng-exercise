import { and, asc, desc, type SQL, sql } from "drizzle-orm";
import type { z } from "zod";
import { cases, companies, users, visaTypes } from "../../db/schema";
import type { PrivateContext } from "../../trpc";
import { caseAccess } from "./access";
import {
  caseAttentionFilter,
  caseMonitoringFilter,
  caseSearchFilter,
  caseStatusFilter,
} from "./filters";
import type { casePageInput } from "./inputs";
import { caseCountQuery, caseQuery, withCaseReview } from "./query";

/** Allows sorting only by known SQL expressions, with the case ID breaking ties between pages. */
function caseOrder(
  sort: z.infer<typeof casePageInput>["sort"],
  attentionText: SQL,
  deadline: SQL
) {
  if (!sort) {
    return [asc(cases.createdAt), asc(cases.id)];
  }
  const columns = {
    "Employee ID": users.employeeId,
    Name: users.fullName,
    Email: users.email,
    Company: companies.name,
    "Visa type": visaTypes.name,
    Status: cases.status,
    "Needs attention": attentionText,
  };
  const direction = sort.desc ? desc : asc;
  if (sort.id === "Deadline") {
    return [sql`${direction(deadline)} nulls last`, asc(cases.id)];
  }
  return [
    sql`${direction(sql`lower(${columns[sort.id]})`)} nulls last`,
    asc(cases.id),
  ];
}

/** Counts matching records in PostgreSQL and fetches only the requested page of authorized cases. */
export async function getCasePage(
  ctx: PrivateContext,
  input: z.infer<typeof casePageInput>
) {
  const now = new Date();
  const attention = caseAttentionFilter(now);
  const monitoring = caseMonitoringFilter(now);
  const where = and(
    caseAccess(ctx),
    caseSearchFilter(input.search, attention.text),
    caseStatusFilter(input.status),
    input.group === "overdue" ? monitoring.overdue : undefined,
    input.group === "needs-action" ? monitoring.needsAction : undefined,
    input.needsAttention ? monitoring.needsAttention : undefined
  );
  const [totals] = await caseCountQuery(ctx).where(where);
  // If records were removed since the last request, return the last available page.
  const pageCount = Math.ceil(totals.total / input.pageSize);
  const pageIndex = Math.min(
    input.cursor ?? input.pageIndex,
    Math.max(0, pageCount - 1)
  );
  const records = await caseQuery(ctx)
    .where(where)
    .orderBy(...caseOrder(input.sort, attention.text, monitoring.deadline))
    .limit(input.pageSize)
    .offset(pageIndex * input.pageSize);
  return {
    success: true as const,
    data: records.map((record) => withCaseReview(record, now)),
    total: totals.total,
    pageIndex,
    pageSize: input.pageSize,
    pageCount,
    nextCursor: pageIndex + 1 < pageCount ? pageIndex + 1 : undefined,
  };
}
