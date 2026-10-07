export const overviewGroups = [
  { label: "Overdue", slug: "overdue" },
  { label: "Needs action", slug: "needs-action" },
  { label: "Monitored", slug: "monitored" },
] as const;

export type OverviewGroup = (typeof overviewGroups)[number];
