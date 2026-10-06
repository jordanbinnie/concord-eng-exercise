import { dateSortKey } from "./employee-dates";
import type { EmployeeField, EmployeeRecord } from "./employee-schema";

/**
 * Adds an issue to the record and marks it as needing review.
 * Leaves the original and normalized field values unchanged.
 */
export function review(
  record: EmployeeRecord,
  code: string,
  fields: EmployeeField[],
  message: string
) {
  record.issues.push({ code, fields, message });
  record.needsReview = true;
}

/**
 * Flags dates that occur in the wrong order.
 * Compares only resolved dates so ambiguous values do not create extra issues.
 */
function checkDateOrder(record: EmployeeRecord) {
  const data = record.normalized;
  const pairs = [
    ["filed_at", "granted_at"],
    ["granted_at", "expires_at"],
    ["filed_at", "expires_at"],
    ["filed_at", "last_updated"],
    ["granted_at", "last_updated"],
  ] as const;
  for (const [first, second] of pairs) {
    const a = dateSortKey(data[first]);
    const b = dateSortKey(data[second]);
    if (a && b && a > b) {
      review(
        record,
        "date_order_conflict",
        [first, second],
        `${first} is after ${second}.`
      );
    }
  }
}

/**
 * Checks for conflicting statuses, percentages and dates on one record.
 * Adds review issues without guessing corrections.
 */
export function checkRelationships(record: EmployeeRecord) {
  const data = record.normalized;
  checkRequiredDates(record);
  checkProfileCompletion(record);
  if (
    (data.case_status === "Denied" || data.case_status === "Withdrawn") &&
    record.raw.granted_at.trim()
  ) {
    review(
      record,
      "unexpected_grant_date",
      ["case_status", "granted_at"],
      "Grant date on a denied or withdrawn case needs explanation."
    );
  }
  if (record.raw.expires_at.trim() && !record.raw.granted_at.trim()) {
    review(
      record,
      "expiry_without_grant",
      ["expires_at", "granted_at"],
      "Expiry without a grant date may refer to another visa; review needed."
    );
  }
  if (data.case_status === "In Review" && !record.raw.filed_at.trim()) {
    review(
      record,
      "review_without_filing",
      ["case_status", "filed_at"],
      "Confirm whether In Review is a pre-filing review."
    );
  }
  checkDateOrder(record);
  if (
    data.case_status === "Not Filed" &&
    ["filed_at", "granted_at"].some((field) =>
      record.raw[field as EmployeeField].trim()
    )
  ) {
    review(
      record,
      "not_filed_with_dates",
      ["case_status", "filed_at", "granted_at"],
      "Not Filed case has a filing or grant date."
    );
  }
}

/**
 * Flags a completed profile below 100% or a not-started profile above 0%.
 */
function checkProfileCompletion(record: EmployeeRecord) {
  const data = record.normalized;
  if (
    data.profile_completion_pct !== null &&
    ((data.profile_status === "Completed" &&
      data.profile_completion_pct !== 100) ||
      (data.profile_status === "Not Started" &&
        data.profile_completion_pct !== 0))
  ) {
    review(
      record,
      "profile_completion_conflict",
      ["profile_status", "profile_completion_pct"],
      "Profile status and completion percentage disagree."
    );
  }
}

/**
 * Checks for missing filing, grant and expiry dates based on the case status.
 */
function checkRequiredDates(record: EmployeeRecord) {
  const data = record.normalized;
  /**
   * Adds a review issue if the specified date is blank in the original record.
   */
  const requireDate = (field: EmployeeField) => {
    if (!record.raw[field].trim()) {
      review(
        record,
        "missing_case_date",
        ["case_status", field],
        `${field} is missing for a ${data.case_status} case.`
      );
    }
  };
  if (
    data.case_status &&
    ["Filed", "RFE Issued", "Approved", "Denied", "Withdrawn"].includes(
      data.case_status
    )
  ) {
    requireDate("filed_at");
  }
  if (data.case_status === "Approved") {
    requireDate("granted_at");
    requireDate("expires_at");
  }
}
