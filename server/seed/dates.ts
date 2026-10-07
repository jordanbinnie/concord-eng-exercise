/** Shifts one shared seed timestamp using UTC days so all demo dates stay consistent. */
export function seedDate(now: Date, days: number) {
  const date = new Date(now);
  date.setUTCDate(date.getUTCDate() + days);
  return date;
}

/** Formats a known date as ISO, preserving null when a date has not been recorded. */
export function seedDateOnly(now: Date, days: number | null) {
  return days === null ? null : seedDate(now, days).toISOString().slice(0, 10);
}
