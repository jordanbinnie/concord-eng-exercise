import type { Database } from "../db/client";

export type SeedTransaction = Parameters<
  Parameters<Database["transaction"]>[0]
>[0];
