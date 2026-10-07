import { Outlet, useMatches, useParams } from "@tanstack/react-router";
import { WorkspaceLayout } from "@/components/layout/workspace-layout";
import { OverviewStateProvider } from "@/components/overview/overview-state";
import { getWorkspacePage } from "@/data/workspace-pages";

/** Persistent shell driven by matched route metadata and parameters. */
export function WorkspaceRoot() {
  const slug = useMatches({
    select: (matches) =>
      matches.find((match) => match.staticData.workspacePage)?.staticData
        .workspacePage,
  });
  const { caseId } = useParams({ strict: false });
  const employeeId = useMatches({
    select: (matches) =>
      matches.find(
        (match) =>
          match.routeId === "/overview/$caseId" ||
          match.routeId === "/my-cases/$caseId"
      )?.loaderData?.employeeId,
  });
  const page = getWorkspacePage(slug ?? "overview");
  const currentPage = slug ? page : { ...page, label: "Page not found" };
  return (
    <OverviewStateProvider>
      <WorkspaceLayout caseId={employeeId ?? caseId} page={currentPage}>
        <Outlet />
      </WorkspaceLayout>
    </OverviewStateProvider>
  );
}
