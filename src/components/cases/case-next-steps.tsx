import { CircleAlert } from "lucide-react";
import { relativeCaseDate } from "@/lib/case-utils";
import type { CaseDetail } from "@/types/case";

/** Recorded issues with a concise explanation and any known date. */
export function CaseNextSteps({ record }: { record: CaseDetail }) {
  const issues = record.attention.length
    ? record.attention.map((reason) => ({
        id: reason.code,
        title: reason.title,
        description: reason.reason,
        date:
          reason.code === "PASSPORT_BEFORE_VISA" ? record.passportExpiry : null,
      }))
    : [
        {
          id: "next-action",
          title: record.monitoring.reason,
          description: record.monitoring.description,
          date: record.monitoring.dueDate,
        },
      ];

  return (
    <section aria-label="Next steps" className="flex flex-col gap-3">
      <h2 className="font-semibold text-lg text-sidebar-accent-foreground leading-6 tracking-[-0.01rem]">
        Next steps
      </h2>
      <div className="flex flex-col gap-3">
        {issues.map((issue) => {
          const overdue =
            !!issue.date && issue.date < new Date().toISOString().slice(0, 10);
          return (
            <div className="flex flex-col gap-2" key={issue.id}>
              <div className="flex min-h-9 flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-lg bg-overview-group px-3 py-2">
                <h3 className="font-medium text-[15px] text-foreground leading-5">
                  {issue.title}
                </h3>
                <span
                  className={`flex items-center gap-1.5 font-[450] text-[14px] leading-5 ${overdue ? "text-destructive" : "text-muted-foreground"}`}
                >
                  {overdue && (
                    <CircleAlert
                      aria-hidden="true"
                      className="size-4 shrink-0"
                      strokeWidth={2}
                    />
                  )}
                  {issue.date
                    ? relativeCaseDate(issue.date)
                    : "No deadline recorded"}
                </span>
              </div>
              <p className="px-3 font-[450] text-[14px] text-muted-foreground leading-5">
                {issue.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
