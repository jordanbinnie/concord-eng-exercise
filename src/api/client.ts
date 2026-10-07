import { QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink, TRPCClientError } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
import type { AppRouter } from "../../server/router";

/** Each identity owns its client and cache, so private data cannot cross accounts. */
export function createApiSession(userId?: string) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: (count, error) =>
          !(error instanceof TRPCClientError) && count < 1,
      },
    },
  });
  const client = createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url: "/trpc",
        headers: userId ? { "x-dev-user-id": userId } : {},
      }),
    ],
  });
  const trpc = createTRPCOptionsProxy<AppRouter>({ client, queryClient });
  return { queryClient, trpc };
}

export type ApiSession = ReturnType<typeof createApiSession>;

/** Keeps access failures useful while avoiding raw database and validation errors. */
export function queryErrorMessage(error: unknown) {
  if (error instanceof TRPCClientError) {
    if (
      error.data?.code === "UNAUTHORIZED" ||
      error.data?.code === "FORBIDDEN"
    ) {
      return "Your account could not access this data. Check the selected account and try again.";
    }
    if (error.data?.code === "BAD_REQUEST") {
      return "Check the search or case link and try again.";
    }
  }
  return "Couldn’t load data. Check the API connection and try again.";
}
