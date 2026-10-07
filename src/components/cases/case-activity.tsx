import { History } from "lucide-react";
import { relativeCaseDate } from "@/lib/case-utils";
import type { CaseDetail } from "@/types/case";

/** Shows only timestamps recorded in the backend; no actor or event is inferred. */
export function CaseActivity({ record }: { record: CaseDetail }) {
  const fallback = [
    { label: "Case last updated", date: record.updatedAt },
    { label: "Application filed", date: record.filedAt },
    { label: "Case created", date: record.createdAt },
  ]
    .filter((event): event is { label: string; date: string } => !!event.date)
    .sort((first, second) => Date.parse(second.date) - Date.parse(first.date));
  const activity = record.events.length
    ? record.events.map((event) => ({
        id: event.id,
        label: event.title,
        date: event.occurredAt,
      }))
    : fallback.map((event) => ({ ...event, id: event.label }));
  return (
    <section aria-label="Activity" className="flex flex-col gap-3">
      <h2 className="font-semibold text-lg text-sidebar-accent-foreground leading-6 tracking-[-0.01rem]">
        Activity
      </h2>
      <ul className="flex flex-col pl-3 font-[450] text-[14px] text-muted-foreground leading-5">
        {activity.map((event) => (
          <li
            className="relative flex items-start gap-3 pb-4 last:pb-0 [&:last-child>span]:hidden"
            key={event.id}
          >
            <span
              aria-hidden="true"
              className="absolute top-5 bottom-0 left-[7.5px] border-border border-l"
            />
            <History
              aria-hidden="true"
              className="mt-0.5 size-4 shrink-0"
              strokeWidth={1.75}
            />
            <p>
              {event.label} ·{" "}
              <time
                dateTime={event.date}
                title={new Date(event.date).toLocaleString()}
              >
                {relativeCaseDate(event.date)}
              </time>
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
