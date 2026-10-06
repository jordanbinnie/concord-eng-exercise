import type { ColumnDef, SortingState } from "@tanstack/react-table";
import { MoreHorizontalIcon } from "lucide-react";
import { CaseAttention } from "@/components/case-attention";
import type { DataTableFeatures } from "@/components/data-table-features";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CasePageInput, CaseRecord } from "@/hooks/use-cases";

type CaseColumn = ColumnDef<DataTableFeatures, CaseRecord> & {
  id: NonNullable<CasePageInput["sort"]>["id"] | "actions";
};

/** Opens the one case attached to this person. */
function CaseActions({ record }: { record: CaseRecord }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            aria-label={`Open actions for ${record.beneficiary}`}
            size="icon"
            variant="ghost"
          />
        }
      >
        <MoreHorizontalIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Case</DropdownMenuLabel>
          <DropdownMenuItem render={<a href={`#case/${record.id}`} />}>
            View case
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const caseColumns = [
  {
    id: "Employee ID",
    accessorFn: (row) => row.employeeId ?? "Not provided",
    header: "Employee ID",
  },
  {
    id: "Name",
    accessorKey: "beneficiary",
    header: "Name",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.beneficiary}</span>
    ),
  },
  { id: "Email", accessorKey: "email", header: "Email" },
  { id: "Company", accessorKey: "company", header: "Company" },
  {
    id: "Visa type",
    accessorFn: (row) => row.visaType ?? "Not provided",
    header: "Visa type",
  },
  {
    id: "Status",
    accessorFn: (row) => row.status ?? "Not provided",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant="secondary">{row.original.status ?? "Not provided"}</Badge>
    ),
  },
  {
    id: "Needs attention",
    accessorFn: (row) => row.attention.map((reason) => reason.title).join(", "),
    header: "Needs attention",
    cell: ({ row }) => <CaseAttention record={row.original} />,
  },
  {
    id: "actions",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => <CaseActions record={row.original} />,
  },
] satisfies CaseColumn[];

/** Converts table sorting to the router's inferred input using only declared case columns. */
export function getCaseSort(sorting: SortingState): CasePageInput["sort"] {
  const first = sorting[0];
  const column = caseColumns.find((candidate) => candidate.id === first?.id);
  if (!(first && column) || column.id === "actions") {
    return;
  }
  return { id: column.id, desc: first.desc };
}
