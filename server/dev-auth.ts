import { eq, inArray } from "drizzle-orm";
import type { Database } from "./db/client";
import { users } from "./db/schema";

export const DEV_PERSONAS = [
  { id: "10000000-0000-4000-8000-000000000001", role: "hr" },
  { id: "10000000-0000-4000-8000-000000000002", role: "beneficiary" },
  { id: "10000000-0000-4000-8000-000000000003", role: "advisor" },
] as const;

const personaIds: string[] = DEV_PERSONAS.map((persona) => persona.id);

/** Enables impersonation only when explicitly requested in a non-production API. */
export function isDevAuthEnabled() {
  return (
    process.env.DEV_AUTH_ENABLED === "true" &&
    process.env.NODE_ENV !== "production"
  );
}

/** Returns only the seeded users allowed in the local persona switcher. */
export async function getDevPersonas(db: Database) {
  if (!isDevAuthEnabled()) {
    return [];
  }
  const records = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      email: users.email,
      role: users.role,
    })
    .from(users)
    .where(inArray(users.id, personaIds));
  return personaIds.flatMap((id) => {
    const user = records.find((record) => record.id === id);
    return user ? [user] : [];
  });
}

/**
 * Resolves a seeded identity for local testing; this does not verify a real login.
 * Only allowlisted IDs work, and impersonation must be explicitly enabled outside production.
 * The database supplies the role and company used by the case access rules.
 */
export async function resolveDevUser(db: Database, id: string | undefined) {
  if (!(isDevAuthEnabled() && id && personaIds.includes(id))) {
    return null;
  }
  const [user] = await db.select().from(users).where(eq(users.id, id));
  return user ?? null;
}
