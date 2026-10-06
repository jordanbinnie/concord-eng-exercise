import { FolderIcon } from "lucide-react";
import { NavMain } from "@/components/nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { UserSwitcher } from "@/components/user-switcher";
import type { DevUser } from "@/hooks/use-dev-user";

type Props = {
  users: DevUser[];
  activeUser: DevUser | null;
  status: string;
  onSelect: (user: DevUser) => void;
};

/** Shows navigation and the current identity for the selected role. */
export function AppSidebar({ users, activeUser, status, onSelect }: Props) {
  const items = [
    {
      title: activeUser?.role === "beneficiary" ? "My case" : "Cases",
      url: "#cases",
      icon: <FolderIcon />,
      isActive: true,
    },
  ];
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <UserSwitcher
          activeUser={activeUser}
          onSelect={onSelect}
          status={status}
          users={users}
        />
      </SidebarHeader>
      <SidebarContent>
        {activeUser && <NavMain items={items} key={activeUser.id} />}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
