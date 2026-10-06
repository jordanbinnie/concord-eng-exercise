import { Card, CardContent, CardDescription } from "@/components/ui/card";
import type { CaseStatsData } from "@/hooks/use-cases";

const stages = [
  { label: "Pre-assessment", key: "preAssessment", dot: "bg-zinc-400" },
  {
    label: "In progress",
    key: "inProgress",
    dot: "bg-amber-500",
  },
  { label: "Filed", key: "filed", dot: "bg-blue-500" },
  { label: "Approved", key: "approved", dot: "bg-emerald-500" },
] as const;

/** Summarizes accessible cases by stage, with RFEs included in ongoing work. */
export function CaseStats({ stats }: { stats: CaseStatsData }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stages.map((stage) => (
        <Card key={stage.label}>
          <CardContent className="space-y-2">
            <div className="font-semibold text-3xl tabular-nums tracking-tight">
              {stats[stage.key]}
            </div>
            <CardDescription className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className={`size-2.5 shrink-0 rounded-full ${stage.dot}`}
              />
              {stage.label}
            </CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
