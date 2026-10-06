import { flagDuplicates } from "./employee-duplicates";
import {
  EMPLOYEE_COLUMNS,
  type EmployeeRecord,
  type RawEmployee,
} from "./employee-schema";
import { normalizeEmployee } from "./normalize-employee";
import { type CsvRow, parseCsv } from "./parse-csv";
import { failure, type Result } from "./result";

/**
 * Checks that every expected column appears exactly once, in any order.
 * Returns the column names or an error object describing invalid headers.
 */
function validateHeaders(header: CsvRow | undefined): Result<string[]> {
  if (
    !header ||
    header.fields.length !== EMPLOYEE_COLUMNS.length ||
    new Set(header.fields).size !== EMPLOYEE_COLUMNS.length ||
    EMPLOYEE_COLUMNS.some((column) => !header.fields.includes(column))
  ) {
    return failure(
      "invalid_csv_headers",
      "CSV headers must contain each expected employee column exactly once."
    );
  }
  return { success: true, data: header.fields };
}

/**
 * Maps CSV fields to their column names and normalizes the employee record.
 * Returns an error object if the field count does not match the headers.
 */
function readEmployeeRow(
  row: CsvRow,
  columns: string[]
): Result<EmployeeRecord> {
  if (row.fields.length !== columns.length) {
    return failure(
      "invalid_csv_row",
      `CSV line ${row.sourceRow}: expected ${columns.length} fields, received ${row.fields.length}.`,
      row.sourceRow
    );
  }
  const raw = Object.fromEntries(
    columns.map((column, index) => [column, row.fields[index]])
  ) as RawEmployee;
  return { success: true, data: normalizeEmployee(raw, row.sourceRow) };
}

/**
 * Parses and validates CSV structure, normalizes records and flags duplicates.
 * Returns records with review issues, or an error object if the CSV structure is invalid.
 */
export function processEmployeeCsv(text: string): Result<EmployeeRecord[]> {
  const parsed = parseCsv(text);
  if (!parsed.success) {
    return parsed;
  }
  const [header, ...rows] = parsed.data;
  const columns = validateHeaders(header);
  if (!columns.success) {
    return columns;
  }
  const records: EmployeeRecord[] = [];
  for (const row of rows) {
    const result = readEmployeeRow(row, columns.data);
    if (!result.success) {
      return result;
    }
    records.push(result.data);
  }
  flagDuplicates(records);
  return { success: true, data: records };
}
