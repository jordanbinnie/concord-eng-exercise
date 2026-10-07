import type { ReactNode } from "react";
import { WorkspaceHeader } from "@/components/layout/workspace-header";
import { WorkspaceSidebar } from "@/components/layout/workspace-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import type { WorkspacePage } from "@/data/workspace-pages";

/** Fixed workspace shell with a scrollable content area. */
export function WorkspaceLayout({
  page,
  caseId,
  children,
}: {
  page: WorkspacePage;
  caseId?: string;
  children: ReactNode;
}) {
  const isCaseList = page.slug === "my-cases" && !caseId;
  return (
    <SidebarProvider className="h-svh min-h-0 overflow-hidden">
      <WorkspaceSidebar />
      <SidebarInset className="mt-2 mr-2 mb-10 min-h-0 min-w-0 overflow-hidden rounded-[0.75rem] shadow-panel peer-data-[state=collapsed]:m-0 peer-data-[state=collapsed]:rounded-none peer-data-[state=collapsed]:shadow-none max-md:m-0 max-md:rounded-none max-md:shadow-none">
        <WorkspaceHeader caseId={caseId} page={page} />
        <div
          className={`flex min-h-0 min-w-0 flex-1 flex-col overscroll-contain p-3 max-md:px-2 ${isCaseList ? "overflow-hidden pb-0" : "overflow-y-auto overflow-x-hidden"}`}
          data-scroll-restoration-id="workspace-content"
        >
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
