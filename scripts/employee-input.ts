import { readFileSync } from "node:fs";
import { errorMessage, failure, type Result } from "../src/data/result";

/**
 * Reads a CSV file as UTF-8 text.
 * Returns file-access failures as error objects instead of throwing them.
 */
export function readEmployeeFile(path: string | URL): Result<string> {
  try {
    return { success: true, data: readFileSync(path, "utf8") };
  } catch (error) {
    return failure("file_read_error", errorMessage(error));
  }
}
