import { createFileRoute } from "@tanstack/react-router";
import { CaseDetails } from "@/components/cases/case-details";
import { loadCase } from "@/router/case-loader";

export const Route = createFileRoute("/overview/$caseId")({
  loader: loadCase,
  component: CaseRoute,
});

function CaseRoute() {
  const { caseId } = Route.useParams();
  return <CaseDetails id={caseId} />;
}
