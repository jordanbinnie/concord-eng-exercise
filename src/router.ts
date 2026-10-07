import { createRouter, type RouterHistory } from "@tanstack/react-router";
import { type ApiSession, createApiSession } from "@/api/client";
import { RoutePendingState } from "@/components/layout/query-state";
import type { WorkspaceSlug } from "@/data/workspace-pages";
import { NotFoundPage } from "@/pages/not-found-page";
import { RouteErrorPage } from "@/pages/route-error-page";
import { routeTree } from "@/routeTree.gen";

/** Creates a browser router, or an isolated history for route tests. */
export function createAppRouter({
  api = createApiSession(),
  ...options
}: {
  api?: ApiSession;
  history?: RouterHistory;
  isServer?: boolean;
  origin?: string;
} = {}) {
  return createRouter({
    routeTree,
    context: api,
    defaultPreload: "intent",
    defaultPreloadStaleTime: 0,
    defaultPendingComponent: RoutePendingState,
    scrollRestoration: true,
    scrollToTopSelectors: [
      "[data-scroll-restoration-id='workspace-content']",
      "[data-scroll-restoration-id='cases-list']",
    ],
    defaultNotFoundComponent: NotFoundPage,
    defaultErrorComponent: RouteErrorPage,
    ...options,
  });
}

declare module "@tanstack/react-router" {
  // biome-ignore lint/style/useConsistentTypeDefinitions: TanStack uses interface merging for router registration.
  interface Register {
    router: ReturnType<typeof createAppRouter>;
  }
  // biome-ignore lint/style/useConsistentTypeDefinitions: TanStack uses interface merging for route metadata.
  interface StaticDataRouteOption {
    workspacePage?: WorkspaceSlug;
  }
}
