import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { flagDuplicates } from "../src/data/employee-duplicates";
import {
  EMPLOYEE_COLUMNS,
  type RawEmployee,
} from "../src/data/employee-schema";
import { normalizeEmployee } from "../src/data/normalize-employee";
import { processEmployeeCsv } from "../src/data/process-employees";

const csv = readFileSync(
  new URL("../public/concord_employees.csv", import.meta.url),
  "utf8"
);
function readRecords(text: string) {
  const result = processEmployeeCsv(text);
  expect(result.success).toBe(true);
  return result.success ? result.data : [];
}
const fixture = readRecords(csv)[1].raw;
function employee(overrides: Partial<RawEmployee> = {}) {
  return normalizeEmployee(
    {
      ...fixture,
      passport_expiry: "13/05/2030",
      last_updated: "14/06/2026",
      ...overrides,
    },
    3
  );
}
function codes(record: ReturnType<typeof employee>) {
  return record.issues.map((issue) => issue.code);
}
function encode(fields: string[]) {
  return fields.map((value) => `"${value.replaceAll('"', '""')}"`).join(",");
}

describe("normalization", () => {
  test("normalizes clear aliases and preserves source", () => {
    const record = employee({
      profile_status: " in progress ",
      visa_type: "O1A",
      work_location: "San Francisco, US",
      nationality: "UAE",
      full_name: " Müller, Lucas ",
    });
    expect(record.normalized).toMatchObject({
      profile_status: "In Progress",
      visa_type: "O1A",
      work_location: "San Francisco, USA",
      nationality: "United Arab Emirates",
      full_name: "Müller, Lucas",
      profile_completion_pct: 65,
    });
    expect(record.raw.profile_status).toBe(" in progress ");
    expect(record.needsReview).toBe(false);
  });
  test.each([
    ["04/22/2026", "22/04/2026", undefined],
    ["22/04/2026", "22/04/2026", undefined],
    ["07/07/2026", "07/07/2026", undefined],
    ["06/07/2026", null, "ambiguous_date"],
    ["29/02/2024", "29/02/2024", undefined],
    ["29/02/2025", null, "invalid_date"],
    ["31/04/2026", null, "invalid_date"],
    ["00/12/2026", null, "invalid_date"],
    ["13/13/2026", null, "invalid_date"],
    ["2026-04-22", null, "invalid_date"],
  ])("date %s", (input, normalized, code) => {
    const record = employee({ passport_expiry: input });
    expect(record.normalized.passport_expiry).toBe(normalized);
    expect(record.raw.passport_expiry).toBe(input);
    if (code) {
      expect(codes(record)).toContain(code);
    } else {
      expect(record.needsReview).toBe(false);
    }
  });
  test("collects failures without losing valid fields", () => {
    const record = employee({
      employee_id: "wrong",
      email: "invalid",
      visa_type: "UNKNOWN",
      profile_completion_pct: "101",
      profile_status: "Unknown",
    });
    expect(record.issues).toHaveLength(4);
    expect(record.normalized.visa_type).toBe("UNKNOWN");
    expect(record.normalized.company).toBe(fixture.company);
    expect(record.normalized.email).toBeNull();
    expect(record.needsReview).toBe(true);
  });
  test("blank is not zero and zero is valid", () => {
    expect(
      employee({ profile_completion_pct: "" }).normalized.profile_completion_pct
    ).toBeNull();
    expect(codes(employee({ profile_completion_pct: "" }))).toContain(
      "missing_value"
    );
    expect(
      employee({ profile_completion_pct: "0" }).normalized
        .profile_completion_pct
    ).toBe(0);
    expect(codes(employee({ profile_completion_pct: "1.5" }))).toContain(
      "invalid_value"
    );
  });
});

describe("review rules", () => {
  test("profile contradictions", () => {
    expect(
      codes(
        employee({ profile_status: "Completed", profile_completion_pct: "90" })
      )
    ).toContain("profile_completion_conflict");
    expect(
      codes(
        employee({
          profile_status: "Not Started",
          profile_completion_pct: "10",
        })
      )
    ).toContain("profile_completion_conflict");
  });
  test("requires dates only for relevant statuses", () => {
    expect(codes(employee())).not.toContain("missing_case_date");
    expect(
      employee({ case_status: "Approved" }).issues.filter(
        (issue) => issue.code === "missing_case_date"
      )
    ).toHaveLength(3);
    expect(
      codes(employee({ case_status: "Filed", filed_at: "06/07/2026" }))
    ).toEqual(["ambiguous_date"]);
  });
  test("unexplained case combinations", () => {
    expect(
      codes(employee({ case_status: "Denied", granted_at: "15/05/2026" }))
    ).toContain("unexpected_grant_date");
    expect(
      codes(employee({ case_status: "Withdrawn", granted_at: "15/05/2026" }))
    ).toContain("unexpected_grant_date");
    expect(codes(employee({ expires_at: "15/05/2026" }))).toContain(
      "expiry_without_grant"
    );
    expect(codes(employee({ case_status: "In Review" }))).toContain(
      "review_without_filing"
    );
  });
  test("checks chronology only for resolved dates", () => {
    expect(
      codes(employee({ case_status: "Filed", filed_at: "22/07/2026" }))
    ).toContain("date_order_conflict");
    expect(
      codes(employee({ case_status: "Filed", filed_at: "06/07/2026" }))
    ).not.toContain("date_order_conflict");
  });
  test("flags every duplicate without merging", () => {
    const records = [
      employee(),
      normalizeEmployee({ ...fixture, email: fixture.email.toUpperCase() }, 4),
    ];
    flagDuplicates(records);
    for (const record of records) {
      expect(codes(record)).toContain("duplicate_employee_id");
      expect(codes(record)).toContain("possible_duplicate_person");
      expect(
        record.issues.find(
          (issue) => issue.code === "possible_duplicate_person"
        )?.relatedRowIds
      ).toEqual([records.find((other) => other !== record)?.rowId]);
    }
    expect(records).toHaveLength(2);
  });
});

describe("CSV integration", () => {
  test("retains all source records and flags known problems", () => {
    const records = readRecords(csv);
    expect(records).toHaveLength(33);
    expect(new Set(records.map((record) => record.rowId)).size).toBe(33);
    for (const id of ["EMP-1001", "EMP-1028"]) {
      expect(
        codes(
          records.find((record) => record.raw.employee_id === id) ?? employee()
        )
      ).toContain("possible_duplicate_person");
    }
    expect(records[2].normalized.filed_at).toBe("22/04/2026");
    expect(records[22].normalized.visa_type).toBe("O1A");
    expect(records[32].sourceRow).toBe(34);
    expect(records[32].issues).toContainEqual(
      expect.objectContaining({
        code: "missing_value",
        fields: ["employee_id"],
      })
    );
    expect(records[0].raw.full_name).toBe("Chen, Wei");
  });
  test("supports reordered headers, BOM, quotes and multiline fields", () => {
    const columns = [...EMPLOYEE_COLUMNS].reverse();
    const raw = { ...fixture, full_name: 'A, "B"\nC' };
    const text = `\uFEFF${encode(columns)}\r\n${encode(columns.map((column) => raw[column]))}\r\n${encode(columns.map((column) => fixture[column]))}`;
    const records = readRecords(text);
    expect(records[0].raw).toEqual(raw);
    expect(records[1].sourceRow).toBe(4);
  });
  test.each([
    ["", "invalid_csv_headers"],
    ["unexpected\na", "invalid_csv_headers"],
    [`${EMPLOYEE_COLUMNS.join(",")}\na,b`, "invalid_csv_row"],
    [`${EMPLOYEE_COLUMNS.join(",")}\n"unclosed`, "invalid_csv_quoting"],
    [`${EMPLOYEE_COLUMNS.join(",")}\na"b`, "invalid_csv_quoting"],
  ])("returns an error object for malformed input", (text, code) => {
    expect(processEmployeeCsv(text)).toMatchObject({
      success: false,
      error: { code },
    });
  });
  test("duplicate headers return an error object", () => {
    const columns = [...EMPLOYEE_COLUMNS];
    columns[0] = "email";
    expect(processEmployeeCsv(columns.join(","))).toMatchObject({
      success: false,
      error: { code: "invalid_csv_headers" },
    });
  });
  test("accepts visa types outside the original export", () => {
    const record = employee({ visa_type: "  New visa category  " });
    expect(record.normalized.visa_type).toBe("New visa category");
    expect(record.needsReview).toBe(false);
    expect(codes(employee({ visa_type: " " }))).toContain("missing_value");
  });
});
