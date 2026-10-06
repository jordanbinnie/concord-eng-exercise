import { privateProcedure, router } from "../trpc";
import { getCaseById } from "../utils/cases/get-by-id";
import { getCasePage } from "../utils/cases/get-page";
import { getCaseStats } from "../utils/cases/get-stats";
import { caseByIdInput, casePageInput } from "../utils/cases/inputs";

// The router defines access and input schemas; utils/cases contains the query logic.
export const casesRouter = router({
  getPage: privateProcedure
    .input(casePageInput)
    .query(({ ctx, input }) => getCasePage(ctx, input)),
  getStats: privateProcedure.query(({ ctx }) => getCaseStats(ctx)),
  getById: privateProcedure
    .input(caseByIdInput)
    .query(({ ctx, input }) => getCaseById(ctx, input.id)),
});
