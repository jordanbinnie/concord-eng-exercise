import { normalizeDate } from "./employee-dates";
import { checkRelationships, review } from "./employee-review";
import {
  CASE_STATUSES,
  EMPLOYEE_COLUMNS,
  type EmployeeField,
  type EmployeeRecord,
  employeeSchema,
  type NormalizedEmployee,
  PROFILE_STATUSES,
  type RawEmployee,
} from "./employee-schema";
import type { Result } from "./result";

const INTEGER_PATTERN = /^\d+$/;
const US_LOCATION_PATTERN = /,\s*US$/;
const DATE_FIELDS = new Set<EmployeeField>([
  "filed_at",
  "granted_at",
  "expires_at",
  "passport_expiry",
  "last_updated",
]);

const REQUIRED_FIELDS: EmployeeField[] = [
  "employee_id",
  "full_name",
  "email",
  "company",
  "nationality",
  "work_location",
  "visa_type",
  "profile_status",
  "case_status",
  "profile_completion_pct",
  "passport_expiry",
  "assigned_advisor",
  "last_updated",
];

/**
 * Matches a status ignoring case and returns its standard spelling.
 * Preserves unrecognized values so validation can flag them.
 */
function canonicalStatus(value: string, statuses: readonly string[]): string {
  return (
    statuses.find((status) => status.toLowerCase() === value.toLowerCase()) ??
    value
  );
}

/**
 * Applies field-specific formatting and converts percentages to numbers.
 * Returns date errors as values and preserves visa types as supplied.
 */
function normalizeValue(
  field: EmployeeField,
  value: string
): Result<string | number> {
  if (DATE_FIELDS.has(field)) {
    return normalizeDate(value);
  }
  let data: string | number = value;
  switch (field) {
    case "profile_status":
      data = canonicalStatus(value, PROFILE_STATUSES);
      break;
    case "case_status":
      data = canonicalStatus(value, CASE_STATUSES);
      break;
    case "profile_completion_pct":
      data = INTEGER_PATTERN.test(value) ? Number(value) : value;
      break;
    case "nationality":
      data = value === "UAE" ? "United Arab Emirates" : value;
      break;
    case "work_location":
      data = value.replace(US_LOCATION_PATTERN, ", USA");
      break;
    default:
      break;
  }
  return { success: true, data };
}

/**
 * Normalizes and validates one field, storing its value or null on the record.
 * Adds review issues for missing required values, ambiguity or failed validation.
 */
function normalizeField(record: EmployeeRecord, field: EmployeeField) {
  Object.assign(record.normalized, { [field]: null });
  const value = record.raw[field].trim();
  if (!value) {
    if (REQUIRED_FIELDS.includes(field)) {
      review(
        record,
        "missing_value",
        [field],
        `${field} is missing; review needed.`
      );
    }
    return;
  }
  const normalized = normalizeValue(field, value);
  if (!normalized.success) {
    review(
      record,
      normalized.error.code,
      [field],
      `${field}: ${normalized.error.message}`
    );
    return;
  }
  const validated = employeeSchema.shape[field].safeParse(normalized.data);
  if (!validated.success) {
    for (const issue of validated.error.issues) {
      review(record, "invalid_value", [field], `${field}: ${issue.message}`);
    }
    return;
  }
  Object.assign(record.normalized, { [field]: validated.data });
}

/**
 * Builds a record with preserved source values, normalized fields and review issues.
 * Uses the source row number as an identity independent of the employee ID.
 */
export function normalizeEmployee(
  raw: RawEmployee,
  sourceRow: number
): EmployeeRecord {
  const normalized = {} as NormalizedEmployee;
  const record: EmployeeRecord = {
    rowId: `csv-row-${sourceRow}`,
    sourceRow,
    raw: { ...raw },
    normalized,
    issues: [],
    needsReview: false,
  };
  for (const field of EMPLOYEE_COLUMNS) {
    normalizeField(record, field);
  }
  checkRelationships(record);
  return record;
}
