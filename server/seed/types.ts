import type { Database } from "../db/client";
import type { DemoBeneficiary } from "./beneficiaries";
import type { CasePlan } from "./case-plans";

export type SeedTransaction = Parameters<
  Parameters<Database["transaction"]>[0]
>[0];

export type SeedCaseContext = {
  plan: CasePlan;
  person: DemoBeneficiary;
  id: string;
  hrId: string;
  advisorId: string;
  employeeId: string;
  values: { createdAt: Date; updatedAt: Date };
  now: Date;
};
