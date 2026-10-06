import { ApiProvider } from "@/components/api-provider";
import { AppSidebar } from "@/components/app-sidebar";
import { DashboardView, Notice } from "@/components/dashboard-views";
import { Button } from "@/components/ui/button";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { type DevUser, useDevUser } from "@/hooks/use-dev-user";
import { useHashRoute } from "@/hooks/use-hash-route";

/** Shares the selected identity between navigation and role-specific dashboard views. */
export default function App() {
  const { users, activeUser, status, selectUser, retry } = useDevUser();
  const { route, reset } = useHashRoute();
  /** Returns to Cases before changing the identity used by the workspace. */
  function switchUser(user: DevUser) {
    if (user.id !== activeUser?.id) {
      reset();
      selectUser(user);
    }
  }
  return (
    <SidebarProvider>
      <AppSidebar
        activeUser={activeUser}
        onSelect={switchUser}
        status={status}
        users={users}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
        </header>
        {activeUser ? (
          <ApiProvider key={activeUser.id} userId={activeUser.id}>
            <DashboardView
              onCloseCase={reset}
              route={route}
              user={activeUser}
            />
          </ApiProvider>
        ) : (
          <main className="space-y-4 p-6">
            <Notice message={status} title="Choose a test user" />
            {status === "Unable to load demo users" && (
              <Button onClick={retry}>Try again</Button>
            )}
          </main>
        )}
      </SidebarInset>
    </SidebarProvider>
  );
}
