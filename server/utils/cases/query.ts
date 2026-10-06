import { count, eq } from "drizzle-orm";
import {
  beneficiaryProfiles,
  cases,
  companies,
  users,
  visaTypes,
} from "../../db/schema";
import type { PrivateContext } from "../../trpc";
import { getCaseAttention } from "./attention";
import { getProfileCompletion } from "./profile-completion";

// Select only the data needed by the case views.
export const caseFields = {
  id: cases.id,
  status: cases.status,
  expiresAt: cases.expiresAt,
  filedAt: cases.filedAt,
  updatedAt: cases.updatedAt,
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
};

/** Builds the shared case projection; callers apply access rules before fetching records. */
export function caseQuery(ctx: PrivateContext) {
  return ctx.db
    .select(caseFields)
    .from(cases)
    .innerJoin(companies, eq(cases.companyId, companies.id))
    .innerJoin(users, eq(cases.beneficiaryUserId, users.id))
    .leftJoin(visaTypes, eq(cases.visaTypeId, visaTypes.id))
    .leftJoin(beneficiaryProfiles, eq(users.id, beneficiaryProfiles.userId));
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
  return {
    ...record,
    profileCompletion,
    attention: getCaseAttention({ ...record, profileCompletion }, now),
  };
}
