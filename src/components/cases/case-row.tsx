import { Link } from "@tanstack/react-router";
import { caseStatuses } from "@/data/case-statuses";
import { caseStage, caseStatusLabel, relativeCaseDate } from "@/lib/case-utils";
import type { ApiCase } from "@/types/case";

export const myCasesColumns =
  "min-w-[1050px] grid-cols-[140px_minmax(160px,1fr)_minmax(200px,1fr)_80px_minmax(120px,0.7fr)_150px_120px]";

/** Shared compact case row for Overview and My cases. */
export function CaseRow({
  record,
  section,
}: {
  record: ApiCase;
  section: "overview" | "my-cases";
}) {
  const stage = caseStatuses.find(
    (status) => status.slug === caseStage(record.status)
  );
  return (
    <Link
      className={`grid h-11 cursor-default select-none ${section === "my-cases" ? `${myCasesColumns} px-4` : "grid-cols-[140px_minmax(160px,1fr)_minmax(200px,1fr)_150px_120px] pr-3 pl-2"} items-center gap-3 rounded-lg hover:bg-overview-group focus-visible:outline-2 focus-visible:outline-ring`}
      draggable={false}
      params={{ caseId: record.reference ?? record.id }}
      search={(previous) => previous}
      to={section === "overview" ? "/overview/$caseId" : "/my-cases/$caseId"}
    >
      <div className="flex min-w-0 items-center gap-1.5 font-[450] text-[15px] text-muted-foreground leading-5">
        {section === "overview" && (
          <span aria-hidden="true" className="w-4 shrink-0" />
        )}
        <span className="truncate" title={record.employeeId ?? undefined}>
          {record.employeeId ?? "—"}
        </span>
      </div>
      <span className="truncate font-medium text-[15px] text-sidebar-accent-foreground leading-5">
        {record.beneficiary}
      </span>
      {section === "my-cases" && (
        <>
          <span
            className="truncate font-[450] text-[15px] text-muted-foreground leading-5"
            title={record.email}
          >
            {record.email}
          </span>
          <span className="font-[450] text-[15px] text-muted-foreground leading-5">
            {record.country ?? "—"}
          </span>
          <span className="truncate font-[450] text-[15px] text-muted-foreground leading-5">
            {record.visaType ?? "—"}
          </span>
        </>
      )}
      {section === "overview" && (
        <span className="truncate font-medium text-[15px] text-sidebar-accent-foreground leading-5">
          {record.monitoring.reason}
        </span>
      )}
      <span className="flex min-w-0 items-center gap-1.5 font-[450] text-[15px] text-muted-foreground leading-5">
        <span
          aria-hidden="true"
          className={`size-1.5 shrink-0 rounded-full ${stage?.dot ?? "bg-muted-foreground"}`}
        />
        <span className="truncate">{caseStatusLabel(record.status)}</span>
      </span>
      <span
        className={`${section === "overview" ? "text-right text-[14px]" : "truncate text-[15px]"} font-[450] text-muted-foreground leading-5`}
      >
        {section === "overview"
          ? record.monitoring.dueDate
            ? relativeCaseDate(record.monitoring.dueDate)
            : "No deadline"
          : record.monitoring.reason}
      </span>
    </Link>
  );
}
