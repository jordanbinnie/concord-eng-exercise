import { beneficiaryProfiles } from "../db/schema";
import { getProfileCompletion } from "../utils/cases/profile-completion";
import { demoBeneficiaries } from "./beneficiaries";
import { casePlans } from "./case-plans";
import { demoId } from "./data";
import { seedDateOnly } from "./dates";
import type { SeedTransaction } from "./types";

/** Refreshes job, destination, and passport data; incomplete profiles keep missing passport dates blank. */
export async function seedProfiles(tx: SeedTransaction, now: Date) {
  for (const person of demoBeneficiaries) {
    const plan = casePlans.find((item) => item.case === person.case);
    if (!plan) {
      throw new Error(`Missing original case for employee ${person.user}`);
    }
    const values = {
      nationality: person.nationality,
      jobTitle: person.jobTitle,
      department: person.department,
      workLocation: person.workLocation,
      passportExpiry: seedDateOnly(now, plan.passport ?? null),
    };
    // Keep the legacy flag consistent until the stored column is retired.
    const profileComplete = getProfileCompletion(values).percentage === 100;
    await tx
      .insert(beneficiaryProfiles)
      .values({ userId: demoId(1, person.user), ...values, profileComplete })
      .onConflictDoUpdate({
        target: beneficiaryProfiles.userId,
        set: { ...values, profileComplete },
      });
  }
}
