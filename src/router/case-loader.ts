import { notFound } from "@tanstack/react-router";
import type { ApiSession } from "@/api/client";
import { caseReferenceSchema } from "../../shared/case-reference";

/** Both case routes load the same record and reject unknown case IDs. */
export async function loadCase({
  params,
  context,
}: {
  params: { caseId: string };
  context: ApiSession;
}) {
  if (!caseReferenceSchema.safeParse(params.caseId).success) {
    throw notFound();
  }
  const response = await context.queryClient.ensureQueryData(
    context.trpc.cases.getById.queryOptions({ id: params.caseId })
  );
  if (!response.success) {
    throw notFound();
  }
  return response.data;
}
