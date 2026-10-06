import { z } from "zod";

export const PROFILE_STATUSES = [
  "Not Started",
  "In Progress",
  "Completed",
] as const;
export const CASE_STATUSES = [
  "Not Filed",
  "Filed",
  "In Review",
  "RFE Issued",
  "Approved",
  "Denied",
  "Withdrawn",
] as const;
const EMPLOYEE_ID_PATTERN = /^EMP-\d+$/;
const text = z.string().min(1);

// Normalization and review rules live outside this schema.
export const employeeSchema = z.object({
  employee_id: text.regex(EMPLOYEE_ID_PATTERN),
  full_name: text,
  email: z.email(),
  company: text,
  department: text,
  job_title: text,
  nationality: text,
  work_location: text,
  visa_type: text,
  profile_status: z.enum(PROFILE_STATUSES),
  case_status: z.enum(CASE_STATUSES),
  profile_completion_pct: z.number().int().min(0).max(100),
  filed_at: text,
  granted_at: text,
  expires_at: text,
  passport_expiry: text,
  assigned_advisor: text,
  last_updated: text,
});

export type EmployeeField = keyof z.input<typeof employeeSchema>;
export type RawEmployee = Record<EmployeeField, string>;
export type NormalizedEmployee = {
  [K in keyof z.output<typeof employeeSchema>]:
    | z.output<typeof employeeSchema>[K]
    | null;
};
export const EMPLOYEE_COLUMNS = Object.keys(
  employeeSchema.shape
) as EmployeeField[];

export type ReviewIssue = {
  code: string;
  fields: EmployeeField[];
  message: string;
  relatedRowIds?: string[];
};
export type EmployeeRecord = {
  rowId: string;
  sourceRow: number;
  raw: RawEmployee;
  normalized: NormalizedEmployee;
  issues: ReviewIssue[];
  needsReview: boolean;
};
