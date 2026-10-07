import { and, eq, inArray } from "drizzle-orm";
import { caseAdvisors, cases } from "../db/schema";
import { demoBeneficiaries } from "./beneficiaries";
import { casePlans } from "./case-plans";
import { demoId, type VisaIds } from "./data";
import { seedDate, seedDateOnly } from "./dates";
import { seedCaseEvents } from "./events";
import { seedCaseIntake } from "./intake";
import { seedCaseTasks } from "./tasks";
import type { SeedTransaction } from "./types";

/** Refreshes known fixtures while preserving unrelated records and manually added task IDs. */
export async function seedCases(
  tx: SeedTransaction,
  visaIds: VisaIds,
  now: Date
) {
  for (const plan of casePlans) {
    const person = demoBeneficiaries.find(
      (item) => item.user === plan.employee
    );
    if (!person) {
      throw new Error(`Unknown employee ${plan.employee}`);
    }
    const id = demoId(3, plan.case);
    const hrId = demoId(1, person.company === 1 ? 1 : 4);
    const advisorId = demoId(1, plan.advisors[0]);
    const employeeId = demoId(1, person.user);
    const values = {
      reference: `CASE-${plan.case}`,
      companyId: demoId(2, person.company),
      beneficiaryUserId: employeeId,
      visaTypeId: visaIds[person.visa],
      status: plan.status,
      createdAt: seedDate(now, -plan.created),
      filedAt: seedDateOnly(now, plan.filed === undefined ? null : -plan.filed),
      approvedAt: seedDateOnly(
        now,
        plan.approved === undefined ? null : -plan.approved
      ),
      updatedAt: seedDate(now, -plan.updated),
      expiresAt: seedDateOnly(now, plan.expires ?? null),
    };
    await tx
      .insert(cases)
      .values({ id, ...values })
      .onConflictDoUpdate({ target: cases.id, set: values });
    await tx
      .delete(caseAdvisors)
      .where(
        and(
          eq(caseAdvisors.caseId, id),
          inArray(caseAdvisors.userId, [demoId(1, 3), demoId(1, 6)])
        )
      );
    await tx
      .insert(caseAdvisors)
      .values(
        plan.advisors.map((advisor) => ({
          caseId: id,
          userId: demoId(1, advisor),
        }))
      )
      .onConflictDoNothing();

    const context = {
      plan,
      person,
      id,
      hrId,
      advisorId,
      employeeId,
      values,
      now,
    };
    await seedCaseTasks(tx, context);
    await seedCaseEvents(tx, context);
    await seedCaseIntake(tx, context);
  }
}
