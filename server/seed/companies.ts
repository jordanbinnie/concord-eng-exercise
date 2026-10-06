import { companies } from "../db/schema";
import { demoCompanies } from "./data";
import type { SeedTransaction } from "./types";

/** Refreshes only the two known demo companies, preserving unrelated company records. */
export async function seedCompanies(tx: SeedTransaction) {
  for (const { id, name } of demoCompanies) {
    await tx
      .insert(companies)
      .values({ id, name })
      .onConflictDoUpdate({ target: companies.id, set: { name } });
  }
}
