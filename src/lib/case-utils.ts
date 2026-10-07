import { caseStatuses } from "@/data/case-statuses";
import type { CaseStatus } from "@/types/case";

/** Maps API status labels to the existing filter and dot presentation. */
export function caseStage(status: string | null): CaseStatus | null {
  const normalized = status?.trim().toLowerCase();
  if (normalized === "in progress" || normalized === "rfe issued") {
    return "in-progress";
  }
  return caseStatuses.find((stage) => stage.slug === normalized)?.slug ?? null;
}

export function caseStatusLabel(status: string | null) {
  return status?.trim() || "Not recorded";
}

export function relativeCaseDate(date: string | null, now = new Date()) {
  if (!date) {
    return "No date recorded";
  }
  const today = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  );
  const recorded = Date.parse(date.slice(0, 10));
  if (!Number.isFinite(recorded)) {
    return "No date recorded";
  }
  const days = Math.round((recorded - today) / 86_400_000);
  return days === 0
    ? "today"
    : new Intl.RelativeTimeFormat("en", { numeric: "always" }).format(
        days,
        "day"
      );
}

/** Falls back to all cases for unrecognized child routes. */
export function resolveCaseFilter(filter: string): CaseStatus | "all" {
  return caseStatuses.find((status) => status.slug === filter)?.slug ?? "all";
}
