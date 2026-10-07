import { describe, expect, test } from "bun:test";
import { getCaseMonitoring } from "../server/utils/cases/monitoring";
import { createApiSession } from "../src/api/client";
import {
  caseStage,
  caseStatusLabel,
  relativeCaseDate,
} from "../src/lib/case-utils";
import { caseFixture } from "./fixtures/case";

const now = new Date("2026-10-07T12:00:00Z");

describe("backend case presentation", () => {
  test("each backend identity receives an isolated query cache", () => {
    const hr = createApiSession("hr-test-id");
    const employee = createApiSession("employee-test-id");
    const queryKey = hr.trpc.cases.getById.queryOptions({
      id: caseFixture.id,
    }).queryKey;
    hr.queryClient.setQueryData(queryKey, {
      success: true,
      data: { ...caseFixture, advisors: [], tasks: [], events: [] },
    });
    expect(hr.queryClient.getQueryData(queryKey)).toBeDefined();
    expect(employee.queryClient.getQueryData(queryKey)).toBeUndefined();
  });
  test("preserves the RFE label while grouping it under In progress", () => {
    expect(caseStage("RFE Issued")).toBe("in-progress");
    expect(caseStatusLabel("RFE Issued")).toBe("RFE Issued");
  });

  test("keeps an unknown status unknown", () => {
    expect(caseStage(null)).toBeNull();
    expect(caseStage("unexpected")).toBeNull();
    expect(caseStatusLabel(null)).toBe("Not recorded");
  });

  test("places past recorded expiries in Overdue ahead of review flags", () => {
    const monitoring = getCaseMonitoring(
      { expiresAt: "2026-10-05", passportExpiry: "2026-10-03" },
      caseFixture.attention,
      now
    );
    expect(monitoring.group).toBe("overdue");
    expect(monitoring.reason).toBe("Passport expiry");
    expect(monitoring.dueDate).toBe("2026-10-03");
  });

  test("does not treat an expiry today as overdue", () => {
    expect(
      getCaseMonitoring(
        { expiresAt: "2026-10-07", passportExpiry: null },
        [],
        now
      ).group
    ).toBe("monitored");
  });

  test("uses an overdue internal task without treating it as a visa expiry", () => {
    const monitoring = getCaseMonitoring(
      {
        expiresAt: null,
        passportExpiry: "2029-10-07",
        nextTask: {
          id: "task-1",
          title: "Send CV and profile link",
          description: "Internal document request",
          targetDate: "2026-10-05",
        },
      },
      [],
      now
    );
    expect(monitoring.group).toBe("overdue");
    expect(monitoring.dateKind).toBe("internal");
    expect(monitoring.reason).toBe("Send CV and profile link");
    expect(monitoring.dueDate).toBe("2026-10-05");
  });

  test("keeps an open task with no target actionable without inventing a date", () => {
    const monitoring = getCaseMonitoring(
      {
        expiresAt: null,
        passportExpiry: "2029-10-07",
        nextTask: {
          id: "task-2",
          title: "Provide requested documents",
          description: null,
          targetDate: null,
        },
      },
      [],
      now
    );
    expect(monitoring.group).toBe("needs-action");
    expect(monitoring.dueDate).toBeNull();
  });

  test("does not assign a passport expiry as an RFE response deadline", () => {
    const monitoring = getCaseMonitoring(
      { expiresAt: null, passportExpiry: "2028-10-07" },
      [
        {
          code: "RFE_ISSUED",
          title: "RFE issued",
          reason: "Review the request.",
        },
      ],
      now
    );
    expect(monitoring.group).toBe("needs-action");
    expect(monitoring.dueDate).toBeNull();
  });

  test("uses the recorded passport date for a passport review flag", () => {
    const monitoring = getCaseMonitoring(
      { expiresAt: "2028-10-07", passportExpiry: "2027-10-07" },
      [
        {
          code: "PASSPORT_BEFORE_VISA",
          title: "Passport expires before visa",
          reason: "Review the dates.",
        },
      ],
      now
    );
    expect(monitoring.dueDate).toBe("2027-10-07");
    expect(monitoring.group).toBe("needs-action");
  });

  test("formats timestamps by their recorded calendar date and handles missing dates", () => {
    expect(relativeCaseDate("2026-10-05T09:00:00Z", now)).toBe("2 days ago");
    expect(relativeCaseDate("2026-10-07", now)).toBe("today");
    expect(relativeCaseDate(null, now)).toBe("No date recorded");
    expect(relativeCaseDate("invalid", now)).toBe("No date recorded");
  });
});
