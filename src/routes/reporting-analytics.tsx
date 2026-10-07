import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/pages/placeholder-page";

export const Route = createFileRoute("/reporting-analytics")({
  staticData: { workspacePage: "reporting-analytics" },
  component: PlaceholderRoute,
});

function PlaceholderRoute() {
  return <PlaceholderPage name="Analytics" slug="reporting-analytics" />;
}
