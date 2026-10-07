import { useQuery } from "@tanstack/react-query";
import { type ApiSession, queryErrorMessage } from "@/api/client";
import { WorkspaceSession } from "@/components/account/workspace-session";
import { QueryState } from "@/components/layout/query-state";

/** Resolves the existing local HR account before making any private requests. */
export function AccountGate({ api }: { api: ApiSession }) {
  const query = useQuery(api.trpc.devAuth.personas.queryOptions());
  if (query.isPending) {
    return <QueryState loading message="Loading your workspace…" />;
  }
  if (query.isError) {
    return (
      <QueryState
        message={queryErrorMessage(query.error)}
        onRetry={() => void query.refetch()}
      />
    );
  }
  if (!query.data.enabled) {
    return (
      <QueryState message="Local test sign-in is disabled. Enable it in the API configuration to use a test account." />
    );
  }
  const account = query.data.personas.find((user) => user.role === "hr");
  if (!account) {
    return (
      <QueryState
        message="No HR account is available in the backend."
        onRetry={() => void query.refetch()}
      />
    );
  }
  return <WorkspaceSession account={account} key={account.id} />;
}
