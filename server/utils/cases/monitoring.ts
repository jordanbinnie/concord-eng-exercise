import type { AttentionReason } from "./attention";

type MonitoringInput = {
  expiresAt: string | null;
  passportExpiry: string | null;
  nextTask?: {
    id: string | null;
    title: string | null;
    description: string | null;
    targetDate: string | null;
  } | null;
};

/** Uses recorded expiries and review flags; missing task deadlines stay unknown. */
export function getCaseMonitoring(
  record: MonitoringInput,
  attention: AttentionReason[],
  now = new Date()
) {
  const today = now.toISOString().slice(0, 10);
  const expiries = [
    { date: record.expiresAt, title: "Visa expiry" },
    { date: record.passportExpiry, title: "Passport expiry" },
  ].filter((item): item is { date: string; title: string } => !!item.date);
  const task = record.nextTask?.id ? record.nextTask : null;
  const expired = expiries
    .filter((item) => item.date < today)
    .sort((first, second) => first.date.localeCompare(second.date))[0];
  if (
    task?.targetDate &&
    task.targetDate < today &&
    (!expired || task.targetDate <= expired.date)
  ) {
    return {
      group: "overdue" as const,
      reason: task.title ?? "Outstanding task",
      dueDate: task.targetDate,
      description: task.description ?? "An internal team target has passed.",
      dateKind: "internal" as const,
    };
  }
  if (expired) {
    return {
      group: "overdue" as const,
      reason: expired.title,
      dueDate: expired.date,
      description: `The recorded ${expired.title.toLowerCase()} has passed. Review the record and any follow-up needed.`,
      dateKind: "expiry" as const,
    };
  }
  if (task) {
    return {
      group: "needs-action" as const,
      reason: task.title ?? "Outstanding task",
      dueDate: task.targetDate,
      description: task.description ?? "Review the outstanding task.",
      dateKind: "internal" as const,
    };
  }
  const review = attention[0];
  if (review) {
    return {
      group: "needs-action" as const,
      reason: review.title,
      dueDate:
        review.code === "PASSPORT_BEFORE_VISA" ? record.passportExpiry : null,
      description: review.reason,
      dateKind:
        review.code === "PASSPORT_BEFORE_VISA" ? ("expiry" as const) : null,
    };
  }
  const expiry = expiries[0];
  return {
    group: "monitored" as const,
    reason: expiry?.title ?? "No review flags",
    dueDate: expiry?.date ?? null,
    description: "No review flags are recorded for this case.",
    dateKind: expiry ? ("expiry" as const) : null,
  };
}
