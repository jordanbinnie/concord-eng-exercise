import { useQuery } from "@tanstack/react-query";
import type { inferRouterOutputs } from "@trpc/server";
import { useEffect, useState } from "react";
import { DEV_USER_STORAGE_KEY, useTRPC } from "@/lib/trpc";
import type { AppRouter } from "../../server/router/index";

export type DevUser =
  inferRouterOutputs<AppRouter>["devAuth"]["personas"]["personas"][number];
export const roleLabels = {
  advisor: "Advisor",
  hr: "HR",
  beneficiary: "Beneficiary",
};

/** Loads switchable users with TanStack Query and remembers the selected identity locally. */
export function useDevUser() {
  const trpc = useTRPC();
  const query = useQuery(trpc.devAuth.personas.queryOptions());
  const [selectedId, setSelectedId] = useState(() =>
    localStorage.getItem(DEV_USER_STORAGE_KEY)
  );
  const users = query.isError ? [] : (query.data?.personas ?? []);
  const activeUser =
    users.find((user) => user.id === selectedId) ?? users[0] ?? null;

  useEffect(() => {
    if (activeUser) {
      localStorage.setItem(DEV_USER_STORAGE_KEY, activeUser.id);
    } else if (query.isSuccess) {
      localStorage.removeItem(DEV_USER_STORAGE_KEY);
    }
  }, [activeUser, query.isSuccess]);

  let status = "No demo users available";
  if (query.isPending) {
    status = "Loading users…";
  } else if (query.isError) {
    status = "Unable to load demo users";
  } else if (!query.data.enabled) {
    status = "Test auth is disabled";
  }

  /** Changes the selected identity; the keyed provider creates its own query cache. */
  function selectUser(user: DevUser) {
    setSelectedId(user.id);
  }

  /** Retries the user query without reloading the page. */
  function retry() {
    void query.refetch();
  }

  return { users, activeUser, status, selectUser, retry };
}
