import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { queryErrorMessage } from "@/api/client";
import { useApi } from "@/api/use-api";
import { CaseRow, myCasesColumns } from "@/components/cases/case-row";
import { CasesEmptyState } from "@/components/cases/cases-empty-state";
import { CasesPagination } from "@/components/cases/cases-pagination";
import { PageLoadingState, QueryState } from "@/components/layout/query-state";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { resolveCaseFilter } from "@/lib/case-utils";

const pageSize = 10;
/** Searches, filters, and paginates authorized cases on the server. */
export function CasesTable({
  search,
  status,
}: {
  search: string;
  status: string;
}) {
  const { trpc } = useApi();
  const debouncedSearch = useDebouncedValue(search.trim());
  const [pagination, setPagination] = useState({
    search: search.trim(),
    index: 0,
  });
  const pageIndex =
    pagination.search === debouncedSearch ? pagination.index : 0;
  const query = useQuery(
    trpc.cases.getPage.queryOptions(
      {
        pageIndex,
        pageSize,
        search: debouncedSearch,
        status: resolveCaseFilter(status),
      },
      { placeholderData: keepPreviousData }
    )
  );
  const visibleRows = query.data?.data ?? [];
  const currentPage = query.data?.pageIndex ?? pageIndex;
  const pageCount = query.data?.pageCount ?? 0;
  const previousPage = useCallback(
    () =>
      setPagination({
        search: debouncedSearch,
        index: Math.max(0, currentPage - 1),
      }),
    [currentPage, debouncedSearch]
  );
  const nextPage = useCallback(
    () =>
      setPagination({
        search: debouncedSearch,
        index: Math.min(pageCount - 1, currentPage + 1),
      }),
    [pageCount, currentPage, debouncedSearch]
  );

  if (query.isPending) {
    return <PageLoadingState message="Loading cases…" />;
  }

  return (
    <section
      aria-busy={query.isFetching}
      aria-label="Cases"
      className="-mx-3 flex min-h-0 min-w-0 flex-1 flex-col max-md:-mx-2"
    >
      <div
        className="min-h-0 min-w-0 flex-1 overflow-auto overscroll-x-contain px-3 max-md:px-2"
        data-scroll-restoration-id="cases-list"
      >
        <Table className="font-medium text-[15px] text-foreground leading-5">
          <TableCaption className="sr-only">Visa cases</TableCaption>
          <TableHeader className="[&_tr]:border-0">
            <TableRow className="border-0 hover:bg-transparent">
              <TableHead className="h-9 p-0 pb-0.5">
                <div
                  className={`grid h-9 ${myCasesColumns} items-center gap-3 rounded-lg px-4 font-medium text-[15px] text-foreground leading-5`}
                >
                  <span>Employee ID</span>
                  <span>Name</span>
                  <span>Email</span>
                  <span>Country</span>
                  <span>Visa type</span>
                  <span>Status</span>
                  <span>Next steps</span>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {query.isError ? (
              <TableRow className="border-0 hover:bg-transparent">
                <TableCell className="p-0">
                  <QueryState
                    message={queryErrorMessage(query.error)}
                    onRetry={() => void query.refetch()}
                  />
                </TableCell>
              </TableRow>
            ) : visibleRows.length ? (
              visibleRows.map((record) => (
                <TableRow
                  className="border-0 hover:bg-transparent"
                  key={record.id}
                >
                  <TableCell className="p-0 pb-0.5">
                    <CaseRow record={record} section="my-cases" />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="border-0 hover:bg-transparent">
                <TableCell className="p-0" colSpan={1}>
                  <CasesEmptyState search={debouncedSearch} status={status} />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <CasesPagination
        loading={query.isFetching}
        onNext={nextPage}
        onPrevious={previousPage}
        pageIndex={currentPage}
        pageSize={pageSize}
        total={query.data?.total ?? 0}
      />
    </section>
  );
}
