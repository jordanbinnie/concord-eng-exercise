import { and, asc, desc, eq, isNull, sql } from "drizzle-orm";
import {
  caseAdvisors,
  caseEvents,
  cases,
  caseTasks,
  users,
} from "../../db/schema";
import type { PrivateContext } from "../../trpc";
import { caseAccess } from "./access";
import { caseQuery, withCaseReview } from "./query";

/** Fetches one accessible case with its advisors and review reasons, returning an error object if unavailable. */
export async function getCaseById(ctx: PrivateContext, id: string) {
  const [record] = await caseQuery(ctx).where(
    and(
      caseAccess(ctx),
      id.startsWith("CASE-") ? eq(cases.reference, id) : eq(cases.id, id)
    )
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
  const [tasks, events] = await Promise.all([
    ctx.db
      .select({
        id: caseTasks.id,
        title: caseTasks.title,
        description: caseTasks.description,
        targetDate: caseTasks.targetDate,
        ownerName: users.fullName,
        ownerRole: users.role,
      })
      .from(caseTasks)
      .leftJoin(users, eq(caseTasks.assignedToUserId, users.id))
      .where(
        and(eq(caseTasks.caseId, record.id), isNull(caseTasks.completedAt))
      )
      .orderBy(
        sql`${caseTasks.targetDate} asc nulls last`,
        asc(caseTasks.createdAt),
        asc(caseTasks.id)
      ),
    ctx.db
      .select({
        id: caseEvents.id,
        title: caseEvents.title,
        actorName: users.fullName,
        occurredAt: caseEvents.occurredAt,
      })
      .from(caseEvents)
      .leftJoin(users, eq(caseEvents.actorUserId, users.id))
      .where(eq(caseEvents.caseId, record.id))
      .orderBy(desc(caseEvents.occurredAt), desc(caseEvents.id)),
  ]);
  return {
    success: true as const,
    data: { ...withCaseReview(record), advisors, tasks, events },
  };
}
