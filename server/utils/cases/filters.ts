import {
  and,
  eq,
  ilike,
  inArray,
  isNull,
  lt,
  or,
  type SQLWrapper,
  sql,
} from "drizzle-orm";
import {
  beneficiaryProfiles,
  cases,
  companies,
  users,
  visaTypes,
} from "../../db/schema";
import {
  ACTIVE_STATUSES,
  ATTENTION_TITLES,
  STALE_CASE_DAYS,
  UNFILED_STATUSES,
} from "./attention";
import { profileFields } from "./profile-completion";

// ECMAScript whitespace keeps SQL checks consistent with String.trim() in the review rules.
const whitespace =
  "\u0009\u000a\u000b\u000c\u000d\u0020\u00a0\u1680\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u2028\u2029\u202f\u205f\u3000\ufeff";

/** Trims database values using the same definition of blank as the profile completion calculation. */
function trimmed(field: SQLWrapper) {
  return sql<string>`btrim(coalesce(${field}::text, ''), ${whitespace})`;
}

export const normalizedStatus = sql<string>`lower(${trimmed(cases.status)})`;

/** Mirrors the review rules in SQL so filtering happens before pagination, using the same cutoff and field list. */
export function caseAttentionFilter(now: Date) {
  const missingProfile = or(
    ...Object.keys(profileFields).map((key) => {
      const field = beneficiaryProfiles[key as keyof typeof profileFields];
      return eq(trimmed(field), "");
    })
  );
  const rules = [
    {
      title: ATTENTION_TITLES.RFE_ISSUED,
      condition: eq(normalizedStatus, "rfe issued"),
    },
    {
      title: ATTENTION_TITLES.PASSPORT_BEFORE_VISA,
      condition: lt(beneficiaryProfiles.passportExpiry, cases.expiresAt),
    },
    {
      title: ATTENTION_TITLES.INCOMPLETE_PROFILE,
      condition: and(
        missingProfile,
        isNull(cases.filedAt),
        inArray(normalizedStatus, UNFILED_STATUSES)
      ),
    },
    {
      title: ATTENTION_TITLES.STALE_CASE,
      condition: and(
        inArray(normalizedStatus, ACTIVE_STATUSES),
        lt(
          cases.updatedAt,
          new Date(now.getTime() - STALE_CASE_DAYS * 86_400_000)
        )
      ),
    },
  ];
  return {
    condition: or(...rules.map((rule) => rule.condition)),
    text: sql<string>`concat_ws(' ', ${sql.join(
      rules.map(
        (rule) => sql`case when ${rule.condition} then ${rule.title} end`
      ),
      sql`, `
    )})`,
  };
}

/** Searches accessible case fields as literal text; SQL wildcard characters are escaped. */
export function caseSearchFilter(
  search: string,
  attentionText: ReturnType<typeof caseAttentionFilter>["text"]
) {
  if (!search) {
    return;
  }
  const pattern = `%${search.replace(/[\\%_]/g, "\\$&")}%`;
  return ilike(
    sql`concat_ws(' ', ${users.employeeId}, ${users.fullName}, ${users.email}, ${companies.name}, ${visaTypes.name}, ${cases.status}, ${cases.id}::text, ${attentionText})`,
    pattern
  );
}
