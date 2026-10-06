import { QueryClientProvider } from "@tanstack/react-query";
import { type ReactNode, useState } from "react";
import { createApiSession, TRPCProvider } from "@/lib/trpc";

/** Supplies a stable tRPC client and query cache; key this provider by user ID when switching identities. */
export function ApiProvider({
  userId,
  children,
}: {
  userId?: string;
  children: ReactNode;
}) {
  const [{ queryClient, trpcClient }] = useState(() =>
    createApiSession(userId)
  );
  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider queryClient={queryClient} trpcClient={trpcClient}>
        {children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}
