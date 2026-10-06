import { router } from "../trpc";
import { casesRouter } from "./cases";
import { devAuthRouter } from "./dev-auth";

export const appRouter = router({
  cases: casesRouter,
  devAuth: devAuthRouter,
});

export type AppRouter = typeof appRouter;
