import { describe, expect, test } from "bun:test";
import { casePlans } from "../server/seed/case-plans";
import { validateSeed } from "../server/seed/validate";
import { caseReferenceSchema } from "../shared/case-reference";

describe("realistic fictional seed", () => {
  test("all sample cases have internally consistent ownership and dates", () => {
    expect(() => validateSeed()).not.toThrow();
    expect(new Set(casePlans.map((plan) => plan.case)).size).toBe(
      casePlans.length
    );
  });
  test("preserves an approved case separately from its employee’s renewal", () => {
    const records = casePlans.filter((plan) => plan.employee === 10);
    expect(
      records.some(
        (plan) => plan.status === "Approved" && plan.expires !== undefined
      )
    ).toBe(true);
    expect(
      records.some(
        (plan) => plan.status === "In progress" && plan.expires === undefined
      )
    ).toBe(true);
  });
  test("rejects an invented approval on an unfiled case", () => {
    expect(() =>
      validateSeed([
        {
          ...casePlans[0],
          status: "In progress",
          filed: undefined,
          approved: 1,
        },
      ])
    ).toThrow("approval timeline");
  });
  test("rejects a filing before its case was opened", () => {
    expect(() => validateSeed([{ ...casePlans[0], filed: 500 }])).toThrow(
      "filing timeline"
    );
  });
  test("readable references are validated independently of UUIDs", () => {
    expect(caseReferenceSchema.parse("case-123")).toBe("CASE-123");
    expect(caseReferenceSchema.safeParse("CASE-0").success).toBe(false);
    expect(caseReferenceSchema.safeParse("EMP-123").success).toBe(false);
  });
});
