import { createRootRouteWithContext } from "@tanstack/react-router";
import type { ApiSession } from "@/api/client";
import { WorkspaceRoot } from "@/components/layout/workspace-root";

export const Route = createRootRouteWithContext<ApiSession>()({
  component: WorkspaceRoot,
});
