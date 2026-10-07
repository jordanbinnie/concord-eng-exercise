import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/overview")({
  staticData: { workspacePage: "overview" },
  component: Outlet,
});
