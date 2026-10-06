import {
  type ColumnDef,
  type ColumnVisibilityState,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
  useTable,
} from "@tanstack/react-table";
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  ChevronDownIcon,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  type DataTableFeatures,
  dataTableFeatures,
} from "@/components/data-table-features";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Props<T extends { id: string }> = {
  data: T[];
  columns: ColumnDef<DataTableFeatures, T>[];
  searchPlaceholder: string;
  label: string;
  busy: boolean;
  refreshing?: boolean;
  rowCount: number;
  pagination: PaginationState;
  onPaginationChange: OnChangeFn<PaginationState>;
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
  search: string;
  onSearchChange: (value: string) => void;
};

/** Uses shadcn's Base UI data-table pattern for filtering, sorting, selection, columns, and pagination. */
export function DataTable<T extends { id: string }>({
  data,
  columns,
  searchPlaceholder,
  label,
  busy,
  refreshing = false,
  rowCount,
  pagination,
  onPaginationChange,
  sorting,
  onSortingChange,
  search,
  onSearchChange,
}: Props<T>) {
  const [columnVisibility, setColumnVisibility] =
    useState<ColumnVisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const tableColumns = useMemo<ColumnDef<DataTableFeatures, T>[]>(
    () => [
      {
        id: "select",
        enableSorting: false,
        enableHiding: false,
        header: ({ table }) => (
          <Checkbox
            aria-label="Select all rows on this page"
            checked={table.getIsAllPageRowsSelected()}
            disabled={busy}
            indeterminate={
              table.getIsSomePageRowsSelected() &&
              !table.getIsAllPageRowsSelected()
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            aria-label={`Select row ${row.index + 1}`}
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
          />
        ),
      },
      ...columns,
    ],
    [columns, busy]
  );
  const table = useTable({
    features: dataTableFeatures,
    data,
    columns: tableColumns,
    getRowId: (row) => row.id,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    enableMultiSort: false,
    rowCount,
    onPaginationChange: (updater) => {
      setRowSelection({});
      onPaginationChange(updater);
    },
    onSortingChange: (updater) => {
      setRowSelection({});
      onSortingChange(updater);
    },
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: { sorting, pagination, columnVisibility, rowSelection },
  });
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 py-4">
        <Input
          aria-label={searchPlaceholder}
          className="max-w-sm"
          maxLength={200}
          onChange={(event) => {
            setRowSelection({});
            onSearchChange(event.target.value);
          }}
          placeholder={searchPlaceholder}
          value={search}
        />
        {refreshing && (
          <span
            className="inline-flex items-center gap-2 text-muted-foreground text-xs"
            role="status"
          >
            <Spinner />
            <span className="sr-only sm:not-sr-only">Updating…</span>
          </span>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button className="ml-auto" variant="outline" />}
          >
            Columns
            <ChevronDownIcon />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  checked={column.getIsVisible()}
                  key={column.id}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table aria-busy={busy || refreshing} aria-label={label}>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => (
                  <TableHead
                    aria-sort={
                      header.column.getIsSorted() === "asc"
                        ? "ascending"
                        : header.column.getIsSorted() === "desc"
                          ? "descending"
                          : undefined
                    }
                    key={header.id}
                  >
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <Button
                        className="-ml-3"
                        onClick={() =>
                          header.column.toggleSorting(
                            header.column.getIsSorted() === "asc"
                          )
                        }
                        size="sm"
                        variant="ghost"
                      >
                        <table.FlexRender header={header} />
                        <SortIcon direction={header.column.getIsSorted()} />
                      </Button>
                    ) : (
                      <table.FlexRender header={header} />
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {busy ? (
              <TableRow>
                <TableCell
                  className="h-36 text-center"
                  colSpan={table.getVisibleLeafColumns().length}
                >
                  <span
                    className="inline-flex items-center gap-2 text-muted-foreground"
                    role="status"
                  >
                    <Spinner />
                    Loading cases…
                  </span>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  key={row.id}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  className="h-24 text-center"
                  colSpan={table.getVisibleLeafColumns().length}
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2 py-4">
        <div className="flex-1 text-muted-foreground text-sm">
          {table.getSelectedRowModel().rows.length} of {data.length} rows on
          this page selected. {rowCount} matching cases.
        </div>
        <span className="text-muted-foreground text-sm">
          Page {table.state.pagination.pageIndex + 1} of{" "}
          {Math.max(1, table.getPageCount())}
        </span>
        <Button
          disabled={busy || !table.getCanPreviousPage()}
          onClick={() => table.previousPage()}
          size="sm"
          variant="outline"
        >
          Previous
        </Button>
        <Button
          disabled={busy || !table.getCanNextPage()}
          onClick={() => table.nextPage()}
          size="sm"
          variant="outline"
        >
          Next
        </Button>
      </div>
    </div>
  );
}

/** Shows the current direction beside a sortable column heading. */
function SortIcon({ direction }: { direction: false | "asc" | "desc" }) {
  if (direction === "asc") {
    return <ArrowUpIcon />;
  }
  if (direction === "desc") {
    return <ArrowDownIcon />;
  }
  return <ArrowUpDownIcon />;
}
