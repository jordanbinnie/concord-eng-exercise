import { useAccount } from "@/components/account/account-context";
import { UserMenu } from "@/components/account/user-menu";
import { WorkspaceNavigation } from "@/components/layout/workspace-navigation";
import { Sidebar, SidebarContent, SidebarMenu } from "@/components/ui/sidebar";

/** Account menu and workspace navigation. */
export function WorkspaceSidebar() {
  const account = useAccount();
  return (
    <Sidebar className="group-data-[side=left]:border-r-0">
      <SidebarContent className="px-3">
        <div className="pt-2">
          <div className="flex h-11 items-center">
            <UserMenu name={account?.fullName ?? "Workspace"} />
          </div>
        </div>
        <SidebarMenu className="mt-2.25 gap-px">
          <WorkspaceNavigation />
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
