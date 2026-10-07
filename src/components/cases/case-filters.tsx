import { Link, useNavigate } from "@tanstack/react-router";
import type { PointerEvent } from "react";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { caseStatuses } from "@/data/case-statuses";

const caseFilters = [{ label: "All", slug: "all" as const }, ...caseStatuses];

/** Selects a case stage on press and updates the child route. */
export function CaseFilters({ filter }: { filter: string }) {
  const selectedFilter = filter;
  const navigate = useNavigate();
  const selectFilterOnPress = useCallback(
    (event: PointerEvent<HTMLAnchorElement>) => {
      if (
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      const slug = event.currentTarget.dataset.filter;
      const destination = caseFilters.find((item) => item.slug === slug);
      if (destination) {
        void navigate({
          to: `/my-cases/${destination.slug}`,
          search: (previous) => previous,
        });
      }
    },
    [navigate]
  );
  return (
    <nav aria-label="Filter cases by status" className="flex flex-wrap gap-2">
      {caseFilters.map(({ label, slug }) => (
        <Button
          aria-current={selectedFilter === slug ? "page" : undefined}
          className={`h-7 cursor-default rounded-full px-3 font-medium text-[14px] leading-5 active:translate-y-0! ${selectedFilter === slug ? "bg-muted text-foreground ring-[0.5px] ring-border" : "bg-popover text-muted-foreground shadow-panel"}`}
          key={slug}
          nativeButton={false}
          render={
            <Link
              data-filter={slug}
              draggable={false}
              onPointerDown={selectFilterOnPress}
              search={(previous) => previous}
              to={`/my-cases/${slug}`}
            />
          }
          variant="ghost"
        >
          {label}
        </Button>
      ))}
    </nav>
  );
}
