import { QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink, TRPCClientError } from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import type { AppRouter } from "../../server/router/index";

export const DEV_USER_STORAGE_KEY = "concord-dev-user-id";
export const { TRPCProvider, useTRPC } = createTRPCContext<AppRouter>();

/** Creates a private query cache and a tRPC client pinned to one test identity. */
export function createApiSession(userId?: string) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        // Invalid input or denied access needs user action, not another request.
        retry: (failureCount, error) =>
          !isRequestError(error) && failureCount < 1,
      },
    },
  });
  const trpcClient = createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: "/trpc",
        headers: userId ? { "x-dev-user-id": userId } : {},
      }),
    ],
  });
  return { queryClient, trpcClient };
}

/** Identifies validation and access failures that should not be retried automatically. */
function isRequestError(error: unknown): error is TRPCClientError<AppRouter> {
  return (
    error instanceof TRPCClientError &&
    (error.data?.code === "BAD_REQUEST" ||
      error.data?.code === "UNAUTHORIZED" ||
      error.data?.code === "FORBIDDEN")
  );
}

/** Gives validation failures a readable message without displaying the raw Zod error details. */
export function queryErrorMessage(error: unknown, fallback: string) {
  if (!isRequestError(error)) {
    return fallback;
  }
  return error.data?.code === "BAD_REQUEST"
    ? "The request contains invalid values. Check the filters or case link."
    : error.message;
}
