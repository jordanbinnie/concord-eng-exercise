import { createContext, type ReactNode, useContext } from "react";
import { useOverviewGroups } from "@/hooks/use-overview-groups";

const OverviewStateContext = createContext<ReturnType<
  typeof useOverviewGroups
> | null>(null);

/** Preserves Overview expansion state while other routes are open. */
export function OverviewStateProvider({ children }: { children: ReactNode }) {
  const state = useOverviewGroups();
  return <OverviewStateContext value={state}>{children}</OverviewStateContext>;
}

/** Reads the persistent Overview group state. */
export function useOverviewState() {
  const state = useContext(OverviewStateContext);
  if (!state) {
    throw new Error(
      "useOverviewState must be used inside OverviewStateProvider."
    );
  }
  return state;
}
