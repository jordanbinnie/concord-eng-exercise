import type { ApiCase } from "../../src/types/case";

/** Isolated API fixture for route and adapter tests; never used by the app. */
export const caseFixture: ApiCase = {
  id: "30000000-0000-4000-8000-000000000009",
  reference: "CASE-9",
  approvedAt: null,
  nextTask: null,
  status: "In progress",
  expiresAt: null,
  filedAt: null,
  updatedAt: "2026-10-05T09:00:00.000Z",
  createdAt: "2026-09-07T09:00:00.000Z",
  passportExpiry: null,
  nationality: "NZ",
  jobTitle: "Engineer",
  department: "Engineering",
  workLocation: "Auckland",
  company: "Test Company",
  beneficiary: "Noah Davis",
  beneficiaryUserId: "10000000-0000-4000-8000-000000000009",
  email: "noah.davis@example.com",
  employeeId: "EMP-9",
  visaType: "H-1B",
  country: "US",
  profileCompletion: {
    percentage: 80,
    completed: 4,
    total: 5,
    missingFields: ["Passport expiry"],
  },
  attention: [
    {
      code: "INCOMPLETE_PROFILE",
      title: "Incomplete profile",
      reason: "Passport expiry is missing.",
    },
  ],
  monitoring: {
    group: "needs-action",
    reason: "Incomplete profile",
    dueDate: null,
    description: "Passport expiry is missing.",
    dateKind: null,
  },
};
