export type DataError = { code: string; message: string; sourceRow?: number };
export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: DataError };

/**
 * Creates a failed result containing an error code, message and optional source row.
 * Returns the error as data instead of throwing it.
 */
export function failure(
  code: string,
  message: string,
  sourceRow?: number
): Result<never> {
  return {
    success: false,
    error: { code, message, ...(sourceRow === undefined ? {} : { sourceRow }) },
  };
}

/**
 * Extracts a readable message from a caught error or another failure value.
 */
export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
