import { caseStatuses } from "@/data/case-statuses";

/** Explains an empty list using the active search and status filter. */
export function CasesEmptyState({
  search,
  status,
}: {
  search: string;
  status: string;
}) {
  const stage = caseStatuses.find((item) => item.slug === status);
  let title = "No cases yet";
  let hint = "Your cases will appear here.";

  if (search) {
    title = `No cases found for “${search}”`;
    hint = "Try a different employee ID, name or email.";
    if (stage) {
      hint = `No matches in ${stage.label}. Try another search or select All.`;
    }
  } else if (stage) {
    title = `No cases in ${stage.label}`;
    hint = "Select All to see cases in other stages.";
  }

  return (
    <div className="flex min-h-32 flex-col items-center justify-center gap-1 px-4 py-6 text-center">
      <p className="font-medium text-[15px] text-foreground leading-5">
        {title}
      </p>
      <p className="font-[450] text-[14px] text-muted-foreground leading-5">
        {hint}
      </p>
    </div>
  );
}
