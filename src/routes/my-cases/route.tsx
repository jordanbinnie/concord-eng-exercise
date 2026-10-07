import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/my-cases")({
  staticData: { workspacePage: "my-cases" },
  validateSearch: (search: Record<string, unknown>): { q?: string } => ({
    q:
      typeof search.q === "string" && search.q
        ? search.q.slice(0, 200)
        : undefined,
  }),
  component: Outlet,
});
