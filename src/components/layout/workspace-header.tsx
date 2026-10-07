import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type { WorkspacePage } from "@/data/workspace-pages";

/** Shared page title or case breadcrumbs. */
export function WorkspaceHeader({
  page,
  caseId,
}: {
  page: WorkspacePage;
  caseId?: string;
}) {
  return (
    <header className="flex h-11 shrink-0 items-center gap-2 border-b-[0.5px] px-4 max-md:px-3">
      <SidebarTrigger className="md:hidden" />
      {caseId ? (
        <Breadcrumb>
          <BreadcrumbList className="gap-2 font-medium text-[15px] text-header-foreground leading-5">
            <BreadcrumbItem>
              <BreadcrumbLink
                className="cursor-default select-none"
                draggable={false}
                render={
                  <Link search={(previous) => previous} to={`/${page.slug}`} />
                }
              >
                {page.label}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-muted-foreground [&>svg]:size-3">
              <ChevronRight strokeWidth={2.5} />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage className="font-medium text-header-foreground">
                {caseId}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      ) : (
        <h1 className="font-medium text-[15px] text-header-foreground leading-5">
          {page.label}
        </h1>
      )}
    </header>
  );
}
