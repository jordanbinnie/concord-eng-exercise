import { failure, type Result } from "./result";

const DATE_PATTERN = /^(\d{2})\/(\d{2})\/(\d{4})$/;

/**
 * Checks whether the day, month and year form a real calendar date, including leap years.
 */
function calendarDate(day: number, month: number, year: number) {
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  return (
    year > 0 &&
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/**
 * Converts an unambiguous date to DD/MM/YYYY.
 * Returns an error object when the date is invalid or has two possible interpretations.
 */
export function normalizeDate(value: string): Result<string> {
  const match = DATE_PATTERN.exec(value);
  if (!match) {
    return failure(
      "invalid_date",
      "Expected a date with two-digit day/month and four-digit year."
    );
  }
  const [, first, second, yearText] = match;
  const a = Number(first);
  const b = Number(second);
  const year = Number(yearText);
  const dayFirst = calendarDate(a, b, year);
  const monthFirst = calendarDate(b, a, year);
  if (dayFirst && monthFirst && a !== b) {
    return failure(
      "ambiguous_date",
      "Date could be day-first or month-first; review needed."
    );
  }
  if (!(dayFirst || monthFirst)) {
    return failure("invalid_date", "Date is not a valid calendar date.");
  }
  return {
    success: true,
    data: dayFirst ? value : `${second}/${first}/${yearText}`,
  };
}

/**
 * Converts a resolved DD/MM/YYYY date to YYYY-MM-DD for chronological sorting.
 * Returns null when no resolved date is available.
 */
export function dateSortKey(value: string | null): string | null {
  if (!value) {
    return null;
  }
  const [day, month, year] = value.split("/");
  return `${year}-${month}-${day}`;
}
