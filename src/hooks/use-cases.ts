import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import { useTRPC } from "@/lib/trpc";
import type { AppRouter } from "../../server/router/index";

type Inputs = inferRouterInputs<AppRouter>;
type Outputs = inferRouterOutputs<AppRouter>;
export type CasePageInput = Inputs["cases"]["getPage"];
export type CaseRecord = Outputs["cases"]["getPage"]["data"][number];
export type CaseDetail = Extract<
  Outputs["cases"]["getById"],
  { success: true }
>["data"];

export type CaseStatsData = Outputs["cases"]["getStats"];

/** Caches each requested page separately by its search, filter, and sort inputs. */
export function useCasePage(input: CasePageInput = {}) {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.cases.getPage.queryOptions(input),
    placeholderData: keepPreviousData,
  });
}

/** Reads aggregate counts independently so changing pages cannot change dashboard totals. */
export function useCaseStats() {
  const trpc = useTRPC();
  return useQuery(trpc.cases.getStats.queryOptions());
}

/** Fetches and caches a case independently from the list using its generated tRPC query key. */
export function useCaseDetail(caseId: string) {
  const trpc = useTRPC();
  return useQuery(trpc.cases.getById.queryOptions({ id: caseId }));
}
