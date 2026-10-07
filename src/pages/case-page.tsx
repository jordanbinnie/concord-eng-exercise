import { CaseActivity } from "@/components/cases/case-activity";
import { CaseInfo } from "@/components/cases/case-info";
import { CaseNextSteps } from "@/components/cases/case-next-steps";
import type { CaseDetail } from "@/types/case";

/** Selected case details, next steps, and activity. */
export function CasePage({ record }: { record: CaseDetail }) {
  return (
    <section
      aria-label="Case details"
      className="flex flex-col gap-6 px-3 py-2 max-md:px-1"
    >
      <h1 className="font-semibold text-2xl text-sidebar-accent-foreground leading-8 tracking-[-0.01rem]">
        {record.beneficiary}
      </h1>
      <CaseInfo record={record} />
      <hr className="border-border border-t-[0.5px]" />
      <CaseNextSteps record={record} />
      <CaseActivity record={record} />
    </section>
  );
}
