import { createFileRoute } from "@tanstack/react-router";
import { MyCasesRoute } from "@/components/cases/my-cases-route";

export const Route = createFileRoute("/my-cases/")({ component: CasesRoute });

function CasesRoute() {
  return <MyCasesRoute filter="all" />;
}
