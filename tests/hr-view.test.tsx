import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { EmployeeDetailsContent } from "../src/components/employee-details";
import { EmployeeReviewContent } from "../src/components/employee-review";
import { HrEmployeeTable } from "../src/components/hr-employee-table";
import type { EmployeeRecord } from "../src/data/employee-schema";
import {
  getCaseStatuses,
  getCompanies,
  getCompanyEmployees,
  MISSING_CASE_STATUS,
  needsHrFollowUp,
} from "../src/data/hr-view";
import { processEmployeeCsv } from "../src/data/process-employees";

const result = processEmployeeCsv(
  readFileSync(
    new URL("../public/concord_employees.csv", import.meta.url),
    "utf8"
  )
);
const records = result.success ? result.data : [];

/** Creates an independent fixture for HR display rules without changing source data. */
function record(
  overrides: Partial<EmployeeRecord["normalized"]>,
  sourceRow = 2
): EmployeeRecord {
  return {
    ...records[0],
    rowId: `csv-row-${sourceRow}`,
    sourceRow,
    normalized: { ...records[0].normalized, ...overrides },
    issues: [],
    needsReview: false,
  };
}

describe("HR company view", () => {
  test("lists companies alphabetically and isolates each company's rows and counts", () => {
    const companies = getCompanies(records);
    expect(companies).toEqual([
      "Kowhai Robotics",
      "Southern Cross Logistics",
      "Tasman BioHealth",
      "Vantage Cloud",
    ]);
    let total = 0;
    for (const company of companies) {
      const visible = getCompanyEmployees(records, company);
      expect(visible.every((row) => row.normalized.company === company)).toBe(
        true
      );
      expect(visible.length).toBe(
        records.filter((row) => row.normalized.company === company).length
      );
      total += visible.length;
    }
    expect(total).toBe(33);
    expect(getCompanyEmployees(records, "Missing company")).toEqual([]);
  });
  test("only RFE triggers follow-up", () => {
    for (const status of [
      "Approved",
      "Denied",
      "Withdrawn",
      "Not Filed",
      "Filed",
      "In Review",
      null,
    ] as const) {
      expect(needsHrFollowUp(record({ case_status: status }))).toBe(false);
    }
    expect(needsHrFollowUp(record({ case_status: "RFE Issued" }))).toBe(true);
  });
  test("filters the selected company by status and ID, name, or email", () => {
    const company = "Southern Cross Logistics";
    const statuses = getCaseStatuses(getCompanyEmployees(records, company));
    expect(statuses).toContain("Approved");
    expect(statuses).toContain("Not Filed");
    expect(statuses).toContain(MISSING_CASE_STATUS);
    expect(
      getCompanyEmployees(records, company, "", " emp-1008 ").map(
        (row) => row.raw.employee_id
      )
    ).toEqual(["EMP-1008"]);
    expect(
      getCompanyEmployees(records, company, "Approved", "mateo").map(
        (row) => row.raw.employee_id
      )
    ).toEqual(["EMP-1008"]);
    expect(
      getCompanyEmployees(
        records,
        company,
        "Approved",
        "MATEO.GARCIA@EXAMPLE.COM"
      ).map((row) => row.raw.employee_id)
    ).toEqual(["EMP-1008"]);
    expect(getCompanyEmployees(records, company, "Not Filed", "mateo")).toEqual(
      []
    );
    expect(
      getCompanyEmployees(records, "Kowhai Robotics", "", "EMP-1008")
    ).toEqual([]);
    expect(
      getCompanyEmployees(records, company, MISSING_CASE_STATUS).map(
        (row) => row.raw.employee_id
      )
    ).toEqual(["EMP-1017", "EMP-1026"]);
  });
  test("shows a useful empty state when filters find no records", () => {
    const html = renderToStaticMarkup(
      <HrEmployeeTable
        emptyMessage="No employees match these filters."
        records={[]}
      />
    );
    expect(html).toContain("No employees match these filters.");
  });
  test("prioritizes RFE, then resolved expiries, then source order without mutation", () => {
    const input = [
      record({ expires_at: null }, 8),
      record({ expires_at: "20/12/2027" }, 5),
      record({ expires_at: null, case_status: "RFE Issued" }, 6),
      record({ expires_at: "20/12/2026" }, 4),
      record({ expires_at: null }, 7),
      record({ expires_at: "20/12/2026" }, 3),
    ];
    expect(
      getCompanyEmployees(input, "Kowhai Robotics").map((row) => row.sourceRow)
    ).toEqual([6, 3, 4, 5, 7, 8]);
    expect(input.map((row) => row.sourceRow)).toEqual([8, 5, 6, 4, 7, 3]);
  });
  test("renders follow-up and data issues separately", () => {
    const visible = getCompanyEmployees(records, "Kowhai Robotics");
    const html = renderToStaticMarkup(<HrEmployeeTable records={visible} />);
    expect(html).toContain('<th scope="col">Data validation</th>');
    expect(html).toContain("Follow up with advisor");
    expect(html).toContain("Check data (");
    expect(html).toContain("Follow up with advisor</span></td><td><button");
    expect(html).toContain('class="review-button"');
    expect(html).toContain("lucas.muller@example.com");
    expect(html).not.toContain("yuki.tanaka");
    const review = renderToStaticMarkup(
      <EmployeeReviewContent
        record={records[0]}
        visibleRowIds={new Set(visible.map((row) => row.rowId))}
      />
    );
    expect(review).toContain('href="#csv-row-29"');
  });
  test("renders missing ID blank and uncertain expiry as original", () => {
    const missingId = records.filter((row) => !row.raw.employee_id);
    const html = renderToStaticMarkup(<HrEmployeeTable records={missingId} />);
    expect(html).toContain("<td></td>");
    expect(html).not.toContain("Missing ID");
    expect(html).toContain("Check data");
    const review = renderToStaticMarkup(
      <EmployeeReviewContent
        record={missingId[0]}
        visibleRowIds={new Set(missingId.map((row) => row.rowId))}
      />
    );
    expect(review).toContain("employee_id is missing");
    const ambiguous = records.filter(
      (row) => row.raw.employee_id === "EMP-1029"
    );
    const dates = renderToStaticMarkup(<HrEmployeeTable records={ambiguous} />);
    expect(dates).toContain("05/09/2026");
    expect(dates).toContain("Original value · needs review");
  });
  test("uses plain text for duplicate references outside the current view", () => {
    const html = renderToStaticMarkup(
      <EmployeeReviewContent
        record={records[0]}
        visibleRowIds={new Set([records[0].rowId])}
      />
    );
    expect(html).toContain("outside this view");
    expect(html).not.toContain('href="#csv-row-29"');
  });
  test("renders an empty state and no attention text for clean non-RFE rows", () => {
    expect(renderToStaticMarkup(<HrEmployeeTable records={[]} />)).toContain(
      "No employee records"
    );
    const html = renderToStaticMarkup(
      <HrEmployeeTable records={[record({ case_status: "Denied" })]} />
    );
    expect(html).not.toContain("Follow up with advisor");
    expect(html).not.toContain("Check data");
    expect(html).toContain("No issues found");
  });
});

describe("employee details panel", () => {
  test("includes all 18 fields and the selected employee's data", () => {
    const html = renderToStaticMarkup(
      <EmployeeDetailsContent record={records[0]} />
    );
    expect((html.match(/<dt>/g) ?? []).length).toBe(18);
    expect(html).toContain("wei.chen@example.com");
    expect(html).toContain("Staff Software Engineer");
    expect(html).toContain("Passport expiry");
    expect(html).toContain("Assigned advisor");
    expect(html).toContain("J. Patel");
    expect(html).toContain("Date could be day-first or month-first");
    expect(html).toContain("Original value · not validated");
  });
  test("keeps missing IDs blank with an explanation", () => {
    const html = renderToStaticMarkup(
      <EmployeeDetailsContent record={records[32]} />
    );
    expect(html).not.toContain("Missing ID");
    expect(html).toContain("employee_id is missing");
  });
  test("offers a details button on every visible row", () => {
    const html = renderToStaticMarkup(
      <HrEmployeeTable records={records.slice(0, 2)} />
    );
    expect((html.match(/See more details/g) ?? []).length).toBe(2);
    expect(html).toContain('aria-haspopup="dialog"');
  });
});
