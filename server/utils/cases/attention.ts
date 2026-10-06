import type { ProfileCompletion } from "./profile-completion";

export const STALE_CASE_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;
export const ACTIVE_STATUSES = [
  "pre-assessment",
  "in progress",
  "filed",
  "rfe issued",
];
export const UNFILED_STATUSES = ["pre-assessment", "in progress"];

type AttentionInput = {
  status: string | null;
  passportExpiry: string | null;
  expiresAt: string | null;
  profileCompletion: ProfileCompletion;
  filedAt: string | null;
  updatedAt: Date | null;
};
export const ATTENTION_TITLES = {
  RFE_ISSUED: "RFE issued",
  PASSPORT_BEFORE_VISA: "Passport expires before visa",
  INCOMPLETE_PROFILE: "Incomplete profile",
  STALE_CASE: "No recent update",
} as const;

export type AttentionReason = {
  code:
    | "RFE_ISSUED"
    | "PASSPORT_BEFORE_VISA"
    | "INCOMPLETE_PROFILE"
    | "STALE_CASE";
  title: string;
  reason: string;
};

/** Derives review reasons from recorded facts without guessing missing dates or completion state. */
export function getCaseAttention(
  record: AttentionInput,
  now = new Date()
): AttentionReason[] {
  const reasons: AttentionReason[] = [];
  const status = record.status?.trim().toLowerCase() ?? "";
  if (status === "rfe issued") {
    reasons.push({
      code: "RFE_ISSUED",
      title: ATTENTION_TITLES.RFE_ISSUED,
      reason:
        "Review the request for evidence and confirm who needs to act and the response deadline.",
    });
  }
  if (
    record.passportExpiry &&
    record.expiresAt &&
    record.passportExpiry < record.expiresAt
  ) {
    reasons.push({
      code: "PASSPORT_BEFORE_VISA",
      title: ATTENTION_TITLES.PASSPORT_BEFORE_VISA,
      reason: `The recorded passport expiry (${record.passportExpiry}) is before the visa expiry (${record.expiresAt}). Review the dates and any follow-up needed.`,
    });
  }
  if (
    record.profileCompletion.percentage < 100 &&
    !record.filedAt &&
    UNFILED_STATUSES.includes(status)
  ) {
    reasons.push({
      code: "INCOMPLETE_PROFILE",
      title: ATTENTION_TITLES.INCOMPLETE_PROFILE,
      reason: `The profile is ${record.profileCompletion.percentage}% complete and this case has not been filed. Missing: ${record.profileCompletion.missingFields.join(", ")}.`,
    });
  }
  if (
    record.updatedAt &&
    ACTIVE_STATUSES.includes(status) &&
    now.getTime() - record.updatedAt.getTime() > STALE_CASE_DAYS * DAY_MS
  ) {
    reasons.push({
      code: "STALE_CASE",
      title: ATTENTION_TITLES.STALE_CASE,
      reason: `This active case was last updated on ${record.updatedAt.toISOString().slice(0, 10)}, more than ${STALE_CASE_DAYS} days ago. Check whether progress needs to be recorded.`,
    });
  }
  return reasons;
}
