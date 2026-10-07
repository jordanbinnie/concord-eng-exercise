import { eq } from "drizzle-orm";
import { information } from "../db/schema";
import { demoId } from "./data";
import type { SeedCaseContext, SeedTransaction } from "./types";

export async function seedCaseIntake(
  tx: SeedTransaction,
  context: SeedCaseContext
) {
  const { plan, id, person, hrId, values } = context;
  await tx.delete(information).where(eq(information.id, demoId(8, plan.case)));
  if (plan.status === "Pre-assessment") {
    const answer = {
      cv: {
        status: plan.task === "missingCv" ? "awaiting employee" : "received",
        fileName:
          plan.task === "missingCv" ? null : `EMP-${person.user}-cv.pdf`,
      },
      linkedInProfile: { status: "awaiting employee", url: null },
      proposedRoute: person.visa,
      assessmentOutcome: "Not assessed",
      note: "Fictional intake fixture. Document metadata does not imply a real uploaded file or a verified profile.",
    };
    await tx
      .insert(information)
      .values({
        id: demoId(8, plan.case),
        caseId: id,
        question: "Pre-assessment intake",
        answer,
        createdByUserId: hrId,
        createdAt: values.createdAt,
      })
      .onConflictDoUpdate({
        target: information.id,
        set: { answer, createdByUserId: hrId, createdAt: values.createdAt },
      });
  }
}
