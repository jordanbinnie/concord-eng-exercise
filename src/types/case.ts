import type { inferRouterOutputs } from "@trpc/server";
import type { caseStatuses } from "@/data/case-statuses";
import type { AppRouter } from "../../server/router";

export type CaseStatus = (typeof caseStatuses)[number]["slug"];
export type ApiCase =
  inferRouterOutputs<AppRouter>["cases"]["getPage"]["data"][number];
export type CaseStatsData = inferRouterOutputs<AppRouter>["cases"]["getStats"];
export type CaseDetail = Extract<
  inferRouterOutputs<AppRouter>["cases"]["getById"],
  { success: true }
>["data"];
