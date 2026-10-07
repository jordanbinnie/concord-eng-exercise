import type { ChangeEvent } from "react";
import { CaseFilters } from "@/components/cases/case-filters";
import { CaseSearch } from "@/components/cases/case-search";
import { CasesTable } from "@/components/cases/cases-table";
import { resolveCaseFilter } from "@/lib/case-utils";

/** Filterable case list with a fixed pagination footer. */
export function MyCasesPage({
  filter,
  search,
  onSearchChange,
}: {
  filter: string;
  search: string;
  onSearchChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  const selectedFilter = resolveCaseFilter(filter);
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex shrink-0 flex-wrap items-center gap-3">
        <CaseFilters filter={selectedFilter} />
        <CaseSearch onChange={onSearchChange} value={search} />
      </div>
      <CasesTable
        key={selectedFilter}
        search={search}
        status={selectedFilter}
      />
    </div>
  );
}
