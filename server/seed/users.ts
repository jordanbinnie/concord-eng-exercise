import { users } from "../db/schema";
import { type DemoBeneficiary, demoBeneficiaries } from "./beneficiaries";
import { demoCompanies, demoId, demoStaff } from "./data";
import type { SeedTransaction } from "./types";

/** Builds a fictional employee address and stable employee ID for an explicit sample person. */
function beneficiaryUser(person: DemoBeneficiary) {
  const company = demoCompanies[person.company - 1];
  const emailName = person.name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/'/g, "")
    .replace(/ /g, ".");
  return {
    id: demoId(1, person.user),
    companyId: company.id,
    fullName: person.name,
    email: `${emailName}@${company.emailDomain}`,
    employeeId: `EMP-${person.user}`,
    role: "beneficiary" as const,
  };
}

/** Refreshes demo users by stable ID while leaving non-demo users untouched. */
export async function seedUsers(tx: SeedTransaction) {
  const records = [
    ...demoStaff.map((person) => ({ ...person, employeeId: null })),
    ...demoBeneficiaries.map(beneficiaryUser),
  ];
  for (const record of records) {
    const { id, ...values } = record;
    await tx
      .insert(users)
      .values(record)
      .onConflictDoUpdate({ target: users.id, set: values });
  }
}
