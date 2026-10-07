import { useMatch, useNavigate, useSearch } from "@tanstack/react-router";
import { type ChangeEvent, useCallback } from "react";
import { MyCasesPage } from "@/pages/my-cases-page";
import type { CaseStatus } from "@/types/case";

/** Binds the case list to validated URL search state. */
export function MyCasesRoute({ filter }: { filter: CaseStatus | "all" }) {
  const { q } = useSearch({ from: "/my-cases" });
  const isIndex = useMatch({
    strict: false,
    select: (match) => match.routeId === "/my-cases/",
  });
  const from = isIndex ? "/my-cases/" : (`/my-cases/${filter}` as const);
  const navigate = useNavigate({ from });
  const updateSearch = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const query = event.target.value;
      void navigate({
        to: ".",
        search: (previous) => ({ ...previous, q: query || undefined }),
        replace: true,
        resetScroll: false,
      });
    },
    [navigate]
  );
  return (
    <MyCasesPage
      filter={filter}
      onSearchChange={updateSearch}
      search={q ?? ""}
    />
  );
}
