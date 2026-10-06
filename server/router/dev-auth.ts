import { getDevPersonas, isDevAuthEnabled } from "../dev-auth";
import { publicProcedure, router } from "../trpc";

export const devAuthRouter = router({
  // The switcher must load before a user is selected. getDevPersonas still enforces the dev-auth flag.
  personas: publicProcedure.query(async ({ ctx }) => ({
    enabled: isDevAuthEnabled(),
    personas: await getDevPersonas(ctx.db),
  })),
});
