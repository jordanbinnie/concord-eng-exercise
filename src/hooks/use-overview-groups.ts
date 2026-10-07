import { type MouseEvent, useCallback, useState } from "react";

/** Keeps expanded groups stable while navigating between pages. */
export function useOverviewGroups() {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    monitored: true,
    "needs-action": false,
    overdue: false,
  });
  const toggleGroup = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    const slug = event.currentTarget.value;
    setOpenGroups((previous) => ({ ...previous, [slug]: !previous[slug] }));
  }, []);
  return { openGroups, toggleGroup };
}
