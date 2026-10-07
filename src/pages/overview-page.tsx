import { useQuery } from "@tanstack/react-query";
import type { MouseEventHandler } from "react";
import { queryErrorMessage } from "@/api/client";
import { useApi } from "@/api/use-api";
import { useAccount } from "@/components/account/account-context";
import { QueryState } from "@/components/layout/query-state";
import { CaseGroup } from "@/components/overview/case-group";
import { CaseStats } from "@/components/overview/case-stats";
import { OverviewGreeting } from "@/components/overview/overview-greeting";
import { overviewGroups } from "@/data/overview-groups";

/** Overview of visa stages and cases needing attention. */
export function OverviewPage({
  openGroups,
  onToggleGroup,
}: {
  openGroups: Record<string, boolean>;
  onToggleGroup: MouseEventHandler<HTMLButtonElement>;
}) {
  const { trpc } = useApi();
  const account = useAccount();
  const query = useQuery(trpc.cases.getStats.queryOptions());
  if (query.isPending) {
    return <QueryState loading message="Loading your overview…" />;
  }
  if (query.isError) {
    return (
      <QueryState
        message={queryErrorMessage(query.error)}
        onRetry={() => void query.refetch()}
      />
    );
  }
  const stats = query.data;
  const counts = {
    "needs-action": stats.needsAction,
    overdue: stats.overdue,
    monitored: stats.total,
  };
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <OverviewGreeting
        name={account?.fullName}
        needsAction={stats.needsAction}
        overdue={stats.overdue}
      />
      <CaseStats stats={stats} />
      <div className="flex min-w-0 flex-col gap-2">
        {overviewGroups.map((group) => (
          <CaseGroup
            group={group}
            key={group.slug}
            onToggle={onToggleGroup}
            open={openGroups[group.slug]}
            total={counts[group.slug]}
          />
        ))}
      </div>
    </div>
  );
}
