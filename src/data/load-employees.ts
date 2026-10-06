import type { EmployeeRecord } from "./employee-schema";
import { processEmployeeCsv } from "./process-employees";
import { errorMessage, failure, type Result } from "./result";

/**
 * Fetches the browser CSV, returning HTTP and network failures as error objects.
 */
async function fetchEmployeeCsv(): Promise<Result<string>> {
  try {
    const response = await fetch("/concord_employees.csv");
    if (!response.ok) {
      return failure(
        "http_error",
        `Employee CSV request failed: ${response.status}`
      );
    }
    return { success: true, data: await response.text() };
  } catch (error) {
    return failure("network_error", errorMessage(error));
  }
}

/**
 * Loads and validates employees using the browser fetcher or a supplied CSV reader.
 * Returns records with review issues, or an error object if loading fails.
 */
export async function loadEmployees(
  readCsv: () => Result<string> | Promise<Result<string>> = fetchEmployeeCsv
): Promise<Result<EmployeeRecord[]>> {
  try {
    const input = await readCsv();
    return input.success ? processEmployeeCsv(input.data) : input;
  } catch (error) {
    return failure("load_error", errorMessage(error));
  }
}
