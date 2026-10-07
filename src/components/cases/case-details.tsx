import { useQuery } from "@tanstack/react-query";
import { queryErrorMessage } from "@/api/client";
import { useApi } from "@/api/use-api";
import { QueryState } from "@/components/layout/query-state";
import { CasePage } from "@/pages/case-page";
import { NotFoundPage } from "@/pages/not-found-page";

/** Both entry points subscribe to the same authorized case query. */
export function CaseDetails({ id }: { id: string }) {
  const { trpc } = useApi();
  const query = useQuery(trpc.cases.getById.queryOptions({ id }));
  if (query.isPending) {
    return <QueryState loading message="Loading case…" />;
  }
  if (query.isError) {
    return (
      <QueryState
        message={queryErrorMessage(query.error)}
        onRetry={() => void query.refetch()}
      />
    );
  }
  if (!query.data.success) {
    return <NotFoundPage />;
  }
  return <CasePage record={query.data.data} />;
}
