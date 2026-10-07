import { and, asc, count, eq, isNull, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import {
  beneficiaryProfiles,
  cases,
  caseTasks,
  companies,
  jurisdictions,
  users,
  visaTypes,
} from "../../db/schema";
import type { PrivateContext } from "../../trpc";
import { getCaseAttention } from "./attention";
import { getCaseMonitoring } from "./monitoring";
import { getProfileCompletion } from "./profile-completion";

// Select only the data needed by the case views.
export const caseFields = {
  id: cases.id,
  reference: cases.reference,
  status: cases.status,
  expiresAt: cases.expiresAt,
  filedAt: cases.filedAt,
  approvedAt: cases.approvedAt,
  updatedAt: cases.updatedAt,
  createdAt: cases.createdAt,
  passportExpiry: beneficiaryProfiles.passportExpiry,
  nationality: beneficiaryProfiles.nationality,
  jobTitle: beneficiaryProfiles.jobTitle,
  department: beneficiaryProfiles.department,
  workLocation: beneficiaryProfiles.workLocation,
  company: companies.name,
  beneficiary: users.fullName,
  beneficiaryUserId: users.id,
  email: users.email,
  employeeId: users.employeeId,
  visaType: visaTypes.name,
  country: jurisdictions.code,
};

/** Builds the shared case projection; callers apply access rules before fetching records. */
export function caseQuery(ctx: PrivateContext) {
  const taskOwner = alias(users, "task_owner");
  const nextTask = ctx.db
    .select({
      id: caseTasks.id,
      title: caseTasks.title,
      description: caseTasks.description,
      targetDate: caseTasks.targetDate,
      ownerName: taskOwner.fullName,
      ownerRole: taskOwner.role,
    })
    .from(caseTasks)
    .leftJoin(taskOwner, eq(caseTasks.assignedToUserId, taskOwner.id))
    .where(and(eq(caseTasks.caseId, cases.id), isNull(caseTasks.completedAt)))
    .orderBy(
      sql`${caseTasks.targetDate} asc nulls last`,
      asc(caseTasks.createdAt),
      asc(caseTasks.id)
    )
    .limit(1)
    .as("next_task");
  return ctx.db
    .select({
      ...caseFields,
      nextTask: {
        id: nextTask.id,
        title: nextTask.title,
        description: nextTask.description,
        targetDate: nextTask.targetDate,
        ownerName: nextTask.ownerName,
        ownerRole: nextTask.ownerRole,
      },
    })
    .from(cases)
    .innerJoin(companies, eq(cases.companyId, companies.id))
    .innerJoin(users, eq(cases.beneficiaryUserId, users.id))
    .leftJoin(visaTypes, eq(cases.visaTypeId, visaTypes.id))
    .leftJoin(jurisdictions, eq(visaTypes.jurisdictionId, jurisdictions.id))
    .leftJoin(beneficiaryProfiles, eq(users.id, beneficiaryProfiles.userId))
    .leftJoinLateral(nextTask, sql`true`);
}

/** Counts the same joined rows without retrieving case details. */
export function caseCountQuery(ctx: PrivateContext) {
  return ctx.db
    .select({ total: count() })
    .from(cases)
    .innerJoin(companies, eq(cases.companyId, companies.id))
    .innerJoin(users, eq(cases.beneficiaryUserId, users.id))
    .leftJoin(visaTypes, eq(cases.visaTypeId, visaTypes.id))
    .leftJoin(beneficiaryProfiles, eq(users.id, beneficiaryProfiles.userId));
}

/** Uses the same calculated profile completion for the displayed percentage and review flags. */
export function withCaseReview(
  record: Awaited<ReturnType<typeof caseQuery>>[number],
  now = new Date()
) {
  const profileCompletion = getProfileCompletion(record);
  const attention = getCaseAttention({ ...record, profileCompletion }, now);
  return {
    ...record,
    profileCompletion,
    attention,
    monitoring: getCaseMonitoring(record, attention, now),
  };
}
