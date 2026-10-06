import { dateSortKey } from "./employee-dates";
import type { EmployeeRecord } from "./employee-schema";

export const ALL_CASE_STATUSES = "";
export const MISSING_CASE_STATUS = "__missing_case_status__";

/** Returns the distinct normalized company names in alphabetical order. */
export function getCompanies(records: EmployeeRecord[]): string[] {
  const companies = records.flatMap((record) =>
    record.normalized.company ? [record.normalized.company] : []
  );
  return [...new Set(companies)].sort((a, b) => a.localeCompare(b));
}

/** Identifies RFE cases that HR should follow up with the advisor about. */
export function needsHrFollowUp(record: EmployeeRecord): boolean {
  return record.normalized.case_status === "RFE Issued";
}

/** Returns the case statuses present for one company, including missing values. */
export function getCaseStatuses(records: EmployeeRecord[]): string[] {
  const statuses = records.map(
    (record) => record.normalized.case_status ?? record.raw.case_status.trim()
  );
  const named = [...new Set(statuses.filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );
  return statuses.includes("") ? [...named, MISSING_CASE_STATUS] : named;
}

/** Matches ID, name or email using a case-insensitive substring search. */
function matchesSearch(record: EmployeeRecord, query: string): boolean {
  if (!query) {
    return true;
  }
  return (["employee_id", "full_name", "email"] as const).some((field) =>
    (record.normalized[field] ?? record.raw[field])
      .toLowerCase()
      .includes(query)
  );
}

/** Matches a selected case status, including records with a blank status. */
function matchesStatus(record: EmployeeRecord, status: string): boolean {
  if (status === ALL_CASE_STATUSES) {
    return true;
  }
  const value = record.normalized.case_status ?? record.raw.case_status.trim();
  return status === MISSING_CASE_STATUS ? value === "" : value === status;
}

/** Orders RFE cases first, then resolved expiry dates, with source order breaking ties. */
function compareEmployees(a: EmployeeRecord, b: EmployeeRecord): number {
  const priority = Number(needsHrFollowUp(b)) - Number(needsHrFollowUp(a));
  const expiry = (
    dateSortKey(a.normalized.expires_at) ?? "9999-99-99"
  ).localeCompare(dateSortKey(b.normalized.expires_at) ?? "9999-99-99");
  return priority || expiry || a.sourceRow - b.sourceRow;
}

/** Selects and sorts one company's records without modifying the imported data. */
export function getCompanyEmployees(
  records: EmployeeRecord[],
  company: string,
  status = ALL_CASE_STATUSES,
  search = ""
): EmployeeRecord[] {
  const query = search.trim().toLowerCase();
  return records
    .filter(
      (record) =>
        record.normalized.company === company &&
        matchesStatus(record, status) &&
        matchesSearch(record, query)
    )
    .sort(compareEmployees);
}
