import { CheckIcon, ChevronsUpDownIcon, UserRoundIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { type DevUser, roleLabels } from "@/hooks/use-dev-user";

/** Lets you switch between the seeded advisor, HR, and beneficiary identities. */
export function UserSwitcher({
  users,
  activeUser,
  status,
  onSelect,
}: {
  users: DevUser[];
  activeUser: DevUser | null;
  status: string;
  onSelect: (user: DevUser) => void;
}) {
  const { isMobile } = useSidebar();
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            disabled={!users.length}
            render={
              <SidebarMenuButton
                className="data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground"
                size="lg"
              />
            }
          >
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <UserRoundIcon className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">
                {activeUser?.fullName ?? "Switch user"}
              </span>
              <span className="truncate text-xs">
                {activeUser ? roleLabels[activeUser.role] : status}
              </span>
            </div>
            <ChevronsUpDownIcon className="ml-auto" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="min-w-60"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel>Switch test user</DropdownMenuLabel>
              {users.map((user) => (
                <DropdownMenuItem
                  className="gap-2 p-2"
                  key={user.id}
                  onClick={() => onSelect(user)}
                >
                  <UserRoundIcon />
                  <div className="grid flex-1">
                    <span>{user.fullName}</span>
                    <span className="text-muted-foreground text-xs">
                      {roleLabels[user.role]}
                    </span>
                  </div>
                  {user.id === activeUser?.id && (
                    <CheckIcon aria-label="Selected" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
