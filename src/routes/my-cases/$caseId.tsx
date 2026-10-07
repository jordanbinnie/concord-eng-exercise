import { createFileRoute } from "@tanstack/react-router";
import { CaseDetails } from "@/components/cases/case-details";
import { loadCase } from "@/router/case-loader";

export const Route = createFileRoute("/my-cases/$caseId")({
  loader: loadCase,
  component: CaseRoute,
});

function CaseRoute() {
  const { caseId } = Route.useParams();
  return <CaseDetails id={caseId} />;
}
