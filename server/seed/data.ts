/** Builds stable IDs so rerunning the demo seed updates the same records. */
export function demoId(group: number, index: number) {
  return `${group}0000000-0000-4000-8000-${String(index).padStart(12, "0")}`;
}

export const demoCompanies = [
  {
    id: demoId(2, 1),
    name: "Kowhai Technologies",
    emailDomain: "kowhai.example",
  },
  { id: demoId(2, 2), name: "Rimu Analytics", emailDomain: "rimu.example" },
] as const;

// Fictional international employers and people. Reserved .example domains cannot email real staff.
export const demoStaff = [
  {
    id: demoId(1, 1),
    companyId: demoId(2, 1),
    fullName: "Emma Wilson",
    email: "emma.wilson@kowhai.example",
    role: "hr",
  },
  {
    id: demoId(1, 3),
    companyId: null,
    fullName: "Sam Carter",
    email: "sam.carter@northstar-immigration.example",
    role: "advisor",
  },
  {
    id: demoId(1, 4),
    companyId: demoId(2, 2),
    fullName: "Hannah Brooks",
    email: "hannah.brooks@rimu.example",
    role: "hr",
  },
  {
    id: demoId(1, 6),
    companyId: null,
    fullName: "Morgan Ellis",
    email: "morgan.ellis@northstar-immigration.example",
    role: "advisor",
  },
] as const;

// These are sample catalogue entries, not an exhaustive list or eligibility rules.
// Keep existing IDs and codes so already-seeded cases retain their visa relationships.
export const demoVisaTypes = {
  h1b: {
    index: 1,
    country: "US",
    jurisdiction: "United States",
    code: "H-1B",
    name: "H-1B",
  },
  globalTalent: {
    index: 2,
    country: "UK",
    jurisdiction: "United Kingdom",
    code: "GLOBAL-TALENT",
    name: "Global Talent",
  },
  skillsInDemand: {
    index: 3,
    country: "AU",
    jurisdiction: "Australia",
    code: "482",
    name: "Skills in Demand (subclass 482)",
  },
  intraCompany: {
    index: 4,
    country: "CA",
    jurisdiction: "Canada",
    code: "ICT",
    name: "Intra-company transfer work permit",
  },
  aewv: {
    index: 5,
    country: "NZ",
    jurisdiction: "New Zealand",
    code: "AEWV",
    name: "Accredited Employer Work Visa",
  },
  skilledWorker: {
    index: 6,
    country: "UK",
    jurisdiction: "United Kingdom",
    code: "SKILLED-WORKER",
    name: "Skilled Worker",
  },
} as const;

export type DemoVisa = keyof typeof demoVisaTypes;
export type VisaIds = Record<DemoVisa, string>;
