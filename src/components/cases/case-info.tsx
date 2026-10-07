import { caseStatusLabel } from "@/lib/case-utils";
import type { CaseDetail } from "@/types/case";

/** Employee and visa information for the selected case. */
export function CaseInfo({ record }: { record: CaseDetail }) {
  const details = [
    { label: "Employee ID", value: record.employeeId ?? "—" },
    {
      label: "Advisor",
      value:
        record.advisors.map((advisor) => advisor.name).join(", ") ||
        "Not assigned",
    },
    { label: "Company", value: record.company },
    { label: "Email", value: record.email },
    { label: "Role", value: record.jobTitle ?? "—" },
    { label: "Country", value: record.country ?? "—" },
    { label: "Visa type", value: record.visaType ?? "—" },
    { label: "Stage", value: caseStatusLabel(record.status) },
    { label: "Filed", value: record.filedAt ?? "Not filed" },
    { label: "Approved", value: record.approvedAt ?? "Not recorded" },
    { label: "Visa expiry", value: record.expiresAt ?? "Not recorded" },
  ];

  return (
    <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
      {details.map(({ label, value }) => (
        <div className="flex min-w-0 flex-col gap-1" key={label}>
          <dt className="font-[450] text-[14px] text-muted-foreground leading-5">
            {label}
          </dt>
          <dd className="break-words font-medium text-[15px] text-header-foreground leading-5">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
