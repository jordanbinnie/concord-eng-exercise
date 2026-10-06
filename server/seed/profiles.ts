import { beneficiaryProfiles } from "../db/schema";
import { getProfileCompletion } from "../utils/cases/profile-completion";
import { demoBeneficiaries } from "./beneficiaries";
import { demoId } from "./data";
import { caseScenarios, seedDateOnly } from "./scenarios";
import type { SeedTransaction } from "./types";

/** Refreshes job, destination, and passport data; incomplete profiles keep missing passport dates blank. */
export async function seedProfiles(tx: SeedTransaction, now: Date) {
  for (const person of demoBeneficiaries) {
    const scenario = caseScenarios[person.scenario];
    const values = {
      nationality: person.nationality,
      jobTitle: person.jobTitle,
      department: person.department,
      workLocation: person.workLocation,
      passportExpiry: seedDateOnly(now, scenario.passportExpiresInDays),
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
