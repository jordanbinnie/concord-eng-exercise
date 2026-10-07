import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/pages/placeholder-page";

export const Route = createFileRoute("/pre-assessments")({
  staticData: { workspacePage: "pre-assessments" },
  component: PlaceholderRoute,
});

function PlaceholderRoute() {
  return <PlaceholderPage name="Pre-assessments" slug="pre-assessments" />;
}
