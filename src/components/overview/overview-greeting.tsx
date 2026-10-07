/** Personal greeting and a count of cases needing attention. */
export function OverviewGreeting({
  needsAction,
  overdue,
  name,
}: {
  needsAction: number;
  overdue: number;
  name?: string;
}) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening";
  return (
    <div className="flex flex-col gap-1 px-3 py-2 max-md:px-1">
      <h2 className="font-semibold text-2xl text-sidebar-accent-foreground leading-8 tracking-[-0.01rem]">
        Good {greeting}
        {name ? `, ${name.split(" ")[0]}` : ""}.
      </h2>
      <p className="font-[450] text-[15px] text-muted-foreground leading-5">
        You have {needsAction} cases needing action and {overdue} overdue.
      </p>
    </div>
  );
}
