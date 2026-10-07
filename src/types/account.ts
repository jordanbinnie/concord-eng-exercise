import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../server/router";

export type Account =
  inferRouterOutputs<AppRouter>["devAuth"]["personas"]["personas"][number];
