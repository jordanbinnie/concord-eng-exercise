export const profileFields = {
  nationality: "Nationality",
  passportExpiry: "Passport expiry",
  jobTitle: "Job title",
  department: "Department",
  workLocation: "Work location",
} as const;

type ProfileFields = {
  [Field in keyof typeof profileFields]: string | null;
};

/** Counts populated profile fields equally; completion measures recorded information, not visa eligibility. */
export function getProfileCompletion(profile: ProfileFields) {
  const fields = Object.keys(profileFields) as (keyof ProfileFields)[];
  const missingFields = fields
    .filter((field) => !profile[field]?.trim())
    .map((field) => profileFields[field]);
  const total = fields.length;
  const completed = total - missingFields.length;
  return {
    percentage: Math.round((completed / total) * 100),
    completed,
    total,
    missingFields,
  };
}

export type ProfileCompletion = ReturnType<typeof getProfileCompletion>;
