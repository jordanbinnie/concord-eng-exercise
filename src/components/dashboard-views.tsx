import { useQueryClient } from "@tanstack/react-query";
import type {
  OnChangeFn,
  PaginationState,
  SortingState,
} from "@tanstack/react-table";
import { useState } from "react";
import { CaseOverview } from "@/components/case-overview";
import { CaseStats } from "@/components/case-stats";
import { caseColumns, getCaseSort } from "@/components/dashboard-columns";
import { DataTable } from "@/components/data-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCaseDetail, useCasePage, useCaseStats } from "@/hooks/use-cases";
import { useDebounce } from "@/hooks/use-debounce";
import type { DevUser } from "@/hooks/use-dev-user";
import { queryErrorMessage, useTRPC } from "@/lib/trpc";

/** Displays a consistent empty or not-yet-available message. */
export function Notice({ title, message }: { title: string; message: string }) {
  return (
    <Empty className="border">
      <EmptyHeader>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{message}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

/** Fetches one page and sends table search, sorting, and pagination to the API. */
function CaseList({ needsAttention = false }: { needsAttention?: boolean }) {
  const queryClient = useQueryClient();
  const trpc = useTRPC();
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [search, setSearch] = useState("");
  const normalizedSearch = search.trim();
  const { debouncedValue: debouncedSearch, flush } =
    useDebounce(normalizedSearch);
  const query = useCasePage({
    ...pagination,
    search: debouncedSearch,
    needsAttention,
    sort: getCaseSort(sorting),
  });
  // Refreshing a matching cache entry must not replace its rows with a loading screen.
  const busy =
    query.isPending ||
    query.isPlaceholderData ||
    normalizedSearch !== debouncedSearch;
  const result = query.data;
  const displayedPagination =
    result && !query.isPlaceholderData
      ? { pageIndex: result.pageIndex, pageSize: result.pageSize }
      : pagination;

  /** Restarts on page one and immediately displays an exact cached search instead of waiting. */
  function changeSearch(value: string) {
    setSearch(value);
    setPagination((previous) => ({ ...previous, pageIndex: 0 }));
    const cached = queryClient.getQueryData(
      trpc.cases.getPage.queryKey({
        pageIndex: 0,
        pageSize: pagination.pageSize,
        search: value.trim(),
        needsAttention,
        sort: getCaseSort(sorting),
      })
    );
    if (cached !== undefined) {
      flush(value.trim());
    }
  }

  /** Applies one sortable column across the entire dataset and resets pagination. */
  const changeSorting: OnChangeFn<SortingState> = (updater) => {
    setSorting(updater);
    setPagination((previous) => ({ ...previous, pageIndex: 0 }));
  };

  if (query.error && !query.data) {
    return (
      <LoadError
        error={queryErrorMessage(
          query.error,
          "Unable to load cases. Try again."
        )}
        retry={() => {
          void query.refetch();
        }}
      />
    );
  }
  return (
    <div>
      {query.error && (
        <Alert className="mb-4">
          <AlertTitle>Couldn’t refresh cases</AlertTitle>
          <AlertDescription>
            Showing the cached results. Try again to refresh them.
          </AlertDescription>
          <Button
            className="mt-2 w-fit"
            onClick={() => {
              void query.refetch();
            }}
            size="sm"
            variant="outline"
          >
            Try again
          </Button>
        </Alert>
      )}
      <DataTable
        busy={busy}
        columns={caseColumns}
        data={result?.data ?? []}
        label="Cases"
        onPaginationChange={(updater) => {
          setPagination(
            typeof updater === "function"
              ? updater(displayedPagination)
              : updater
          );
        }}
        onSearchChange={changeSearch}
        onSortingChange={changeSorting}
        pagination={displayedPagination}
        refreshing={query.isFetching && !busy}
        rowCount={result?.total ?? 0}
        search={search}
        searchPlaceholder="Filter by employee ID, name, email, or status…"
        sorting={sorting}
      />
    </div>
  );
}

/** Keeps stage and attention totals independent of table filters and pagination. */
function Overview() {
  const query = useCaseStats();
  if (query.error) {
    return (
      <LoadError
        error={queryErrorMessage(
          query.error,
          "Unable to load case totals. Try again."
        )}
        retry={() => {
          void query.refetch();
        }}
      />
    );
  }
  if (!query.data) {
    return <Loading />;
  }
  return (
    <div className="space-y-6">
      <CaseStats stats={query.data} />
      <section className="space-y-3">
        <h2 className="font-semibold text-lg tracking-tight">Cases</h2>
        <Tabs defaultValue="all">
          <TabsList aria-label="Filter cases">
            <TabsTrigger value="all">
              All cases ({query.data.total})
            </TabsTrigger>
            <TabsTrigger value="attention">
              Needs attention ({query.data.needsAttention})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <CaseList />
          </TabsContent>
          <TabsContent value="attention">
            <CaseList needsAttention />
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}

/** Loads only the beneficiary's single accessible case before displaying its full details. */
function BeneficiaryView() {
  const query = useCasePage({ pageSize: 1 });
  if (query.error) {
    return (
      <LoadError
        error={queryErrorMessage(
          query.error,
          "Unable to load your case. Try again."
        )}
        retry={() => {
          void query.refetch();
        }}
      />
    );
  }
  if (!query.data) {
    return <Loading />;
  }
  const record = query.data.data[0];
  return (
    <div className="max-w-3xl rounded-xl bg-muted/20 p-4 sm:p-6">
      {record ? (
        <CaseDetails caseId={record.id} presentation="page" />
      ) : (
        <Notice
          message="Your case will appear here once it has been created."
          title="No case yet"
        />
      )}
    </div>
  );
}

/** Loads full case details for the beneficiary page or the HR and advisor side panel. */
function CaseDetails({
  caseId,
  presentation = "panel",
}: {
  caseId: string;
  presentation?: "page" | "panel";
}) {
  const query = useCaseDetail(caseId);
  const retry = () => {
    void query.refetch();
  };
  if (query.error) {
    return (
      <LoadError
        error={queryErrorMessage(
          query.error,
          "Unable to load this case. Check the API connection and try again."
        )}
        retry={retry}
      />
    );
  }
  if (!query.data) {
    return <Loading />;
  }
  if (!query.data.success) {
    return <LoadError error={query.data.error.message} retry={retry} />;
  }
  return <CaseOverview presentation={presentation} record={query.data.data} />;
}

/** Displays a recoverable loading failure. */
function LoadError({ error, retry }: { error: string; retry: () => void }) {
  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <AlertTitle>Unable to load data</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
      <Button onClick={retry}>Try again</Button>
    </div>
  );
}

/** Announces a request in progress using the standard spinner. */
function Loading() {
  return (
    <div className="flex items-center gap-2 text-muted-foreground text-sm">
      <Spinner />
      <span>Loading…</span>
    </div>
  );
}

/** Shows one shared dashboard, adapting records and sections to the selected role. */
export function DashboardView({
  user,
  route,
  onCloseCase,
}: {
  user: DevUser;
  route: string;
  onCloseCase: () => void;
}) {
  const caseId =
    route.startsWith("case/") || route.startsWith("employees/case/")
      ? route.split("case/")[1]
      : undefined;
  return (
    <main className="space-y-6 p-4 md:p-6">
      <h1 className="font-semibold text-2xl tracking-tight">
        {user.role === "beneficiary" ? "My case" : "Dashboard"}
      </h1>
      {user.role === "beneficiary" ? <BeneficiaryView /> : <Overview />}
      {user.role !== "beneficiary" && (
        <Sheet
          onOpenChange={(open) => {
            if (!open) {
              onCloseCase();
            }
          }}
          open={!!caseId}
        >
          <SheetContent className="gap-0 overflow-hidden data-[side=right]:w-full data-[side=right]:sm:max-w-2xl">
            <SheetHeader className="shrink-0 border-b px-6 py-5 pr-14">
              <SheetTitle>Case details</SheetTitle>
              <SheetDescription className="sr-only">
                Information and progress for this case.
              </SheetDescription>
            </SheetHeader>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-muted/20 p-4 sm:p-6">
              {caseId && <CaseDetails caseId={caseId} key={caseId} />}
            </div>
          </SheetContent>
        </Sheet>
      )}
    </main>
  );
}
