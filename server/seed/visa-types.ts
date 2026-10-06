import { and, eq } from "drizzle-orm";
import { jurisdictions, visaTypes } from "../db/schema";
import { type DemoVisa, demoId, demoVisaTypes, type VisaIds } from "./data";
import type { SeedTransaction } from "./types";

/** Resolves catalogue entries by jurisdiction and code, returning named IDs instead of array positions. */
export async function seedVisaTypes(tx: SeedTransaction): Promise<VisaIds> {
  const visaIds = {} as VisaIds;
  for (const key of Object.keys(demoVisaTypes) as DemoVisa[]) {
    const visa = demoVisaTypes[key];
    await tx
      .insert(jurisdictions)
      .values({
        id: demoId(4, visa.index),
        code: visa.country,
        name: visa.jurisdiction,
      })
      .onConflictDoNothing();
    const [jurisdiction] = await tx
      .select()
      .from(jurisdictions)
      .where(eq(jurisdictions.code, visa.country));
    const id = demoId(5, visa.index);
    // Refresh names for our own sample entries; reuse any existing matching catalogue entry.
    await tx
      .insert(visaTypes)
      .values({
        id,
        code: visa.code,
        name: visa.name,
        jurisdictionId: jurisdiction.id,
      })
      .onConflictDoNothing();
    await tx
      .update(visaTypes)
      .set({ name: visa.name })
      .where(eq(visaTypes.id, id));
    const [existing] = await tx
      .select()
      .from(visaTypes)
      .where(
        and(
          eq(visaTypes.jurisdictionId, jurisdiction.id),
          eq(visaTypes.code, visa.code)
        )
      );
    visaIds[key] = existing.id;
  }
  return visaIds;
}
