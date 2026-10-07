import { caseStatuses } from "@/data/case-statuses";
import type { CaseStatsData } from "@/types/case";

/** Counts by visa stage. */
export function CaseStats({ stats }: { stats: CaseStatsData }) {
  const counts = {
    "pre-assessment": stats.preAssessment,
    "in-progress": stats.inProgress,
    filed: stats.filed,
    approved: stats.approved,
  };
  return (
    <div className="grid grid-cols-1 gap-4 pb-2 sm:grid-cols-2 xl:grid-cols-4">
      {caseStatuses.map(({ slug, dot, label }) => (
        <div
          className="flex flex-col rounded-[0.75rem] bg-popover px-6 py-5 shadow-panel"
          key={label}
        >
          <div className="flex flex-col gap-2">
            <div className="font-medium text-2xl text-foreground not-italic tabular-nums leading-8 tracking-[-0.01rem]">
              {counts[slug]}
            </div>
            <div className="flex items-center gap-1.5 font-medium text-[15px] text-muted-foreground leading-5">
              <span
                aria-hidden="true"
                className={`size-4 shrink-0 rounded-full ${dot}`}
              />
              <span>{label}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
