import { createDb } from "../db/client";
import { demoBeneficiaries } from "./beneficiaries";
import { casePlans } from "./case-plans";
import { seedCases } from "./cases";
import { seedCompanies } from "./companies";
import { demoStaff } from "./data";
import { seedProfiles } from "./profiles";
import { seedUsers } from "./users";
import { validateSeed } from "./validate";
import { seedVisaTypes } from "./visa-types";

type SeedResult =
  | { success: true; message: string }
  | { success: false; error: { code: string; message: string } };

/** Seeds all demo data in one transaction and closes the connection, returning a result object. */
export async function seed(
  databaseUrl = process.env.DATABASE_URL
): Promise<SeedResult> {
  if (!databaseUrl) {
    return {
      success: false,
      error: {
        code: "MISSING_DATABASE_URL",
        message: "DATABASE_URL is required. Copy .env.example to .env first.",
      },
    };
  }
  let connection: ReturnType<typeof createDb> | undefined;
  try {
    validateSeed();
    connection = createDb(databaseUrl);
    await connection.db.transaction(async (tx) => {
      await seedCompanies(tx);
      await seedUsers(tx);
      const visaIds = await seedVisaTypes(tx);
      const now = new Date();
      await seedProfiles(tx, now);
      await seedCases(tx, visaIds, now);
    });
    return {
      success: true,
      message: `Demo seed ready: ${demoBeneficiaries.length + demoStaff.length} users, ${casePlans.length} cases, 2 companies; readable references, internal tasks, and recorded events.`,
    };
  } catch {
    return {
      success: false,
      error: {
        code: "SEED_FAILED",
        message:
          "Could not seed demo data. Check that the database is available and the schema has been applied with bun run db:push.",
      },
    };
  } finally {
    await connection?.close().catch(() => undefined);
  }
}
