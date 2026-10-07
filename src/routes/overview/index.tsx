import { createFileRoute } from "@tanstack/react-router";
import { useOverviewState } from "@/components/overview/overview-state";
import { OverviewPage } from "@/pages/overview-page";

export const Route = createFileRoute("/overview/")({
  component: OverviewRoute,
});

function OverviewRoute() {
  const { openGroups, toggleGroup } = useOverviewState();
  return <OverviewPage onToggleGroup={toggleGroup} openGroups={openGroups} />;
}
