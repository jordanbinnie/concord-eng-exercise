import { Link, useMatches } from "@tanstack/react-router";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { getWorkspacePage, workspacePages } from "@/data/workspace-pages";

/** Shares section names and routes between sidebar links and page headings. */
export function WorkspaceNavigation() {
  const section = useMatches({
    select: (matches) =>
      matches.find((match) => match.staticData.workspacePage)?.staticData
        .workspacePage,
  });
  const activePage = getWorkspacePage(section ?? "overview");

  return workspacePages.map(({ icon: Icon, label, slug }) => (
    <SidebarMenuItem key={slug}>
      <SidebarMenuButton
        className="h-7 gap-1.5 py-1 pr-[0.5625rem] pl-2 text-[15px]"
        isActive={activePage.slug === slug}
        render={
          <Link
            aria-current={activePage.slug === slug ? "page" : undefined}
            to={`/${slug}`}
          >
            <Icon aria-hidden="true" className="size-4!" />
            {label}
          </Link>
        }
      />
    </SidebarMenuItem>
  ));
}
