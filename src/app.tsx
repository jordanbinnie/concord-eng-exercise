import { QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { createApiSession } from "@/api/client";
import { AccountGate } from "@/components/account/account-gate";

/** Renders the file-based workspace routes. */
export default function App() {
  const [api] = useState(() => createApiSession());
  return (
    <QueryClientProvider client={api.queryClient}>
      <AccountGate api={api} />
    </QueryClientProvider>
  );
}
