import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  beneficiaryProfiles,
  caseAdvisors,
  cases,
  companies,
  information,
  jurisdictions,
  users,
  visaTypes,
} from "./schema";

const schema = {
  beneficiaryProfiles,
  caseAdvisors,
  cases,
  companies,
  information,
  jurisdictions,
  users,
  visaTypes,
};

/** Creates the PostgreSQL connection used by tRPC procedures. */
export function createDb(databaseUrl: string) {
  const client = postgres(databaseUrl);
  return { db: drizzle(client, { schema }), close: () => client.end() };
}

export type Database = ReturnType<typeof createDb>["db"];
