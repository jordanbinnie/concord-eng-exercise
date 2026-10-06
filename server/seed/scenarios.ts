type CaseScenario = {
  status:
    | "Pre-assessment"
    | "In progress"
    | "Filed"
    | "Approved"
    | "RFE Issued";
  createdDaysAgo: number;
  updatedDaysAgo: number;
  filedDaysAgo: number | null;
  expiresInDays: number | null;
  passportExpiresInDays: number | null;
};

// Relative dates describe the sample case history, not official processing times.
// Only approved cases have a recorded visa expiry; pending outcomes remain unknown.
const standardScenarios = {
  assessment: {
    status: "Pre-assessment",
    createdDaysAgo: 12,
    updatedDaysAgo: 2,
    filedDaysAgo: null,
    expiresInDays: null,
    passportExpiresInDays: 1825,
  },
  preparation: {
    status: "In progress",
    createdDaysAgo: 28,
    updatedDaysAgo: 3,
    filedDaysAgo: null,
    expiresInDays: null,
    passportExpiresInDays: 1460,
  },
  filed: {
    status: "Filed",
    createdDaysAgo: 70,
    updatedDaysAgo: 6,
    filedDaysAgo: 24,
    expiresInDays: null,
    passportExpiresInDays: 2190,
  },
  approved: {
    status: "Approved",
    createdDaysAgo: 240,
    updatedDaysAgo: 120,
    filedDaysAgo: 190,
    expiresInDays: 730,
    passportExpiresInDays: 1825,
  },
} satisfies Record<string, CaseScenario>;

export const caseScenarios = {
  ...standardScenarios,
  // RFE examples are used only for US H-1B cases and always follow a filing.
  rfe: {
    ...standardScenarios.filed,
    status: "RFE Issued",
    createdDaysAgo: 110,
    filedDaysAgo: 75,
    updatedDaysAgo: 5,
  },
  // The recorded passport may be outdated: deliberately flag it for review, not automatic correction.
  passportReview: { ...standardScenarios.approved, passportExpiresInDays: 120 },
  // Passport details are still missing, so these profiles are explicitly incomplete.
  incompleteProfile: {
    ...standardScenarios.assessment,
    passportExpiresInDays: null,
  },
  staleFiled: {
    ...standardScenarios.filed,
    createdDaysAgo: 100,
    filedDaysAgo: 65,
    updatedDaysAgo: 45,
  },
  staleIncomplete: {
    ...standardScenarios.preparation,
    createdDaysAgo: 75,
    updatedDaysAgo: 46,
    passportExpiresInDays: null,
  },
  staleRfe: {
    ...standardScenarios.filed,
    status: "RFE Issued",
    createdDaysAgo: 145,
    filedDaysAgo: 105,
    updatedDaysAgo: 40,
  },
} satisfies Record<string, CaseScenario>;

export type DemoScenario = keyof typeof caseScenarios;

/** Shifts one shared seed timestamp using UTC days so all demo dates stay consistent. */
export function seedDate(now: Date, days: number) {
  const date = new Date(now);
  date.setUTCDate(date.getUTCDate() + days);
  return date;
}

/** Formats a known date as ISO, preserving null when a date has not been recorded. */
export function seedDateOnly(now: Date, days: number | null) {
  return days === null ? null : seedDate(now, days).toISOString().slice(0, 10);
}
