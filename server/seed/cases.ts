import { caseAdvisors, cases } from "../db/schema";
import { demoBeneficiaries } from "./beneficiaries";
import { demoId, type VisaIds } from "./data";
import { caseScenarios, seedDate, seedDateOnly } from "./scenarios";
import type { SeedTransaction } from "./types";

/** Refreshes one case per sample person with a coherent timeline and the assigned advisors. */
export async function seedCases(
  tx: SeedTransaction,
  visaIds: VisaIds,
  now: Date
) {
  for (const person of demoBeneficiaries) {
    const scenario = caseScenarios[person.scenario];
    const id = demoId(3, person.case);
    const values = {
      companyId: demoId(2, person.company),
      beneficiaryUserId: demoId(1, person.user),
      visaTypeId: visaIds[person.visa],
      status: scenario.status,
      createdAt: seedDate(now, -scenario.createdDaysAgo),
      filedAt: seedDateOnly(
        now,
        scenario.filedDaysAgo === null ? null : -scenario.filedDaysAgo
      ),
      updatedAt: seedDate(now, -scenario.updatedDaysAgo),
      expiresAt: seedDateOnly(now, scenario.expiresInDays),
    };
    await tx
      .insert(cases)
      .values({ id, ...values })
      .onConflictDoUpdate({ target: cases.id, set: values });
    // Sam manages most cases; Morgan handles two separately and shares Lydia's RFE case.
    // Existing extra assignments are kept so reseeding does not discard manually added advisors.
    await tx
      .insert(caseAdvisors)
      .values(
        (person.advisors ?? [3]).map((advisor) => ({
          caseId: id,
          userId: demoId(1, advisor),
        }))
      )
      .onConflictDoNothing();
  }
}
