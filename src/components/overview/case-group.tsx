import { useInfiniteQuery } from "@tanstack/react-query";
import { CircleAlert } from "lucide-react";
import type { MouseEventHandler } from "react";
import { queryErrorMessage } from "@/api/client";
import { useApi } from "@/api/use-api";
import { CaseRow } from "@/components/cases/case-row";
import { QueryState } from "@/components/layout/query-state";
import { Button } from "@/components/ui/button";
import type { OverviewGroup } from "@/data/overview-groups";

/** Expandable attention group with its case rows. */
export function CaseGroup({
  group: { label, slug },
  total,
  open,
  onToggle,
}: {
  group: OverviewGroup;
  total: number;
  open: boolean;
  onToggle: MouseEventHandler<HTMLButtonElement>;
}) {
  const { trpc } = useApi();
  const query = useInfiniteQuery(
    trpc.cases.getPage.infiniteQueryOptions(
      {
        group: slug,
        pageSize: 25,
        sort: { id: "Deadline", desc: false },
      },
      {
        enabled: open,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    )
  );
  const records = query.data?.pages.flatMap((page) => page.data) ?? [];
  return (
    <section
      aria-label={label}
      className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-0.5"
    >
      <button
        aria-controls={`overview-${slug}`}
        aria-expanded={open}
        className="group/overview-header flex h-9 w-full cursor-default items-center gap-1.5 rounded-lg pr-3 pl-2 text-left font-medium text-[15px] text-foreground leading-5 focus-visible:outline-2 focus-visible:outline-ring"
        onClick={onToggle}
        style={{ background: "var(--overview-group-background)" }}
        type="button"
        value={slug}
      >
        <span aria-hidden="true" className="flex w-4 shrink-0 justify-center">
          <span
            className={`text-[0.375rem] group-hover/overview-header:text-header-foreground ${open ? "rotate-90 text-[lch(66%_1_282/1)]" : "text-header-foreground"}`}
          >
            ▶
          </span>
        </span>

        <span
          className={
            slug === "overdue"
              ? "font-medium text-[15px] text-sidebar-accent-foreground leading-5"
              : undefined
          }
        >
          {label}
        </span>
        <span className="font-normal text-muted-foreground tabular-nums">
          {total}
        </span>
        {slug !== "monitored" && (
          <CircleAlert
            aria-hidden="true"
            className="ml-auto size-4 shrink-0 text-destructive"
            strokeWidth={2}
          />
        )}
      </button>
      <div
        className="min-w-0 space-y-0.5"
        hidden={!open}
        id={`overview-${slug}`}
      >
        {query.isPending && <QueryState loading message="Loading cases…" />}
        {query.isError && (
          <QueryState
            message={queryErrorMessage(query.error)}
            onRetry={() => void query.refetch()}
          />
        )}
        {query.isSuccess && !records.length && (
          <QueryState message="No cases in this group." />
        )}
        {!!records.length && (
          <section
            aria-label={`${label} cases`}
            className="min-w-0 overflow-x-auto overscroll-x-contain"
          >
            <div className="min-w-[850px] space-y-0.5">
              {records.map((record) => (
                <CaseRow key={record.id} record={record} section="overview" />
              ))}
            </div>
          </section>
        )}
        {query.hasNextPage && (
          <div className="flex justify-center py-2">
            <Button
              className="cursor-default"
              disabled={query.isFetchingNextPage}
              onClick={() => void query.fetchNextPage()}
              size="sm"
              variant="default"
            >
              {query.isFetchingNextPage ? "Loading…" : "Show more"}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
