import type { EmployeeRecord } from "./employee-schema";

/**
 * Groups records by employee ID or email and flags every matching record.
 * Email matching ignores case; related row IDs identify the other matches.
 */
function flagDuplicateField(
  records: EmployeeRecord[],
  field: "employee_id" | "email"
) {
  const groups = new Map<string, EmployeeRecord[]>();
  for (const record of records) {
    const value = record.raw[field].trim();
    if (!value) {
      continue;
    }
    const key = field === "email" ? value.toLowerCase() : value;
    const group = groups.get(key) ?? [];
    group.push(record);
    groups.set(key, group);
  }
  for (const group of groups.values()) {
    if (group.length < 2) {
      continue;
    }
    for (const record of group) {
      record.issues.push({
        code:
          field === "email"
            ? "possible_duplicate_person"
            : "duplicate_employee_id",
        fields: [field],
        message: `${field} appears on multiple records; review before merging.`,
        relatedRowIds: group
          .filter((other) => other !== record)
          .map((other) => other.rowId),
      });
      record.needsReview = true;
    }
  }
}

/**
 * Flags repeated employee IDs and emails without merging or removing records.
 */
export function flagDuplicates(records: EmployeeRecord[]) {
  flagDuplicateField(records, "employee_id");
  flagDuplicateField(records, "email");
}
