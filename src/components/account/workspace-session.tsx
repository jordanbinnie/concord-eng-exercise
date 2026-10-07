import { QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { useState } from "react";
import { createApiSession } from "@/api/client";
import { AccountContext } from "@/components/account/account-context";
import { createAppRouter } from "@/router";
import type { Account } from "@/types/account";

/** A fresh router and query cache follow each backend identity. */
export function WorkspaceSession({ account }: { account: Account }) {
  const [session] = useState(() => createApiSession(account.id));
  const [router] = useState(() => createAppRouter({ api: session }));
  return (
    <QueryClientProvider client={session.queryClient}>
      <AccountContext value={{ account }}>
        <RouterProvider router={router} />
      </AccountContext>
    </QueryClientProvider>
  );
}
