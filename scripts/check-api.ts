import assert from "node:assert/strict";
import { createTRPCClient, httpBatchLink, TRPCClientError } from "@trpc/client";
import type { AppRouter } from "../server/router";
import { caseStage } from "../src/lib/case-utils";
import type { ApiCase } from "../src/types/case";

const url = process.env.API_URL ?? "http://127.0.0.1:3001";
function clientFor(userId?: string) {
  return createTRPCClient<AppRouter>({
    links: [
      httpBatchLink({
        url,
        headers: userId ? { "x-dev-user-id": userId } : {},
      }),
    ],
  });
}

/** Read-only verification against the running API and its existing database. */
const publicClient = clientFor();
const identities = await publicClient.devAuth.personas.query();
assert(identities.enabled, "Local test authentication must be enabled.");
assert(identities.personas.length, "No test accounts were returned.");
await assert.rejects(
  publicClient.cases.getStats.query(),
  (error: unknown) =>
    error instanceof TRPCClientError && error.data?.code === "UNAUTHORIZED"
);

const accessibleCases = new Map<string, ApiCase[]>();
for (const persona of identities.personas) {
  const client = clientFor(persona.id);
  const stats = await client.cases.getStats.query();
  const records: ApiCase[] = [];
  let pageIndex = 0;
  while (true) {
    const page = await client.cases.getPage.query({ pageIndex, pageSize: 10 });
    records.push(...page.data);
    if (page.nextCursor === undefined) {
      break;
    }
    pageIndex = page.nextCursor;
  }
  assert.equal(records.length, stats.total);
  accessibleCases.set(persona.role, records);
  assert.equal(new Set(records.map((record) => record.id)).size, stats.total);
  assert.equal(
    records.filter((record) => record.monitoring.group === "overdue").length,
    stats.overdue
  );
  assert.equal(
    records.filter((record) => record.monitoring.group === "needs-action")
      .length,
    stats.needsAction
  );
  assert.equal(stats.needsAttention, stats.overdue + stats.needsAction);
  if (persona.role === "hr") {
    assert(new Set(records.map((record) => record.company)).size <= 1);
  }
  if (persona.role === "beneficiary") {
    assert(records.every((record) => record.beneficiaryUserId === persona.id));
  }
  for (const status of [
    "pre-assessment",
    "in-progress",
    "filed",
    "approved",
  ] as const) {
    const page = await client.cases.getPage.query({ status, pageSize: 100 });
    const expected = records.filter(
      (record) => caseStage(record.status) === status
    );
    assert.equal(page.total, expected.length);
    assert(page.data.every((record) => caseStage(record.status) === status));
    const count = {
      "pre-assessment": stats.preAssessment,
      "in-progress": stats.inProgress,
      filed: stats.filed,
      approved: stats.approved,
    }[status];
    assert.equal(page.total, count);
  }
  for (const group of ["overdue", "needs-action", "monitored"] as const) {
    const page = await client.cases.getPage.query({
      group,
      pageSize: 100,
      sort: { id: "Deadline", desc: false },
    });
    const expected =
      group === "monitored"
        ? stats.total
        : group === "overdue"
          ? stats.overdue
          : stats.needsAction;
    assert.equal(page.total, expected);
    assert(
      page.data.every(
        (record) => group === "monitored" || record.monitoring.group === group
      )
    );
    const dates = page.data.map(
      (record) => record.monitoring.dueDate ?? "9999-12-31"
    );
    assert.deepEqual(dates, [...dates].sort());
    const cursorPage = await client.cases.getPage.query({
      group,
      pageSize: 1,
      cursor: 1,
    });
    if (expected > 1) {
      assert.equal(cursorPage.pageIndex, 1);
    }
  }
  const record = records[0];
  if (record) {
    const result = await client.cases.getById.query({ id: record.id });
    assert(result.success);
    assert.equal(result.data.country, record.country);
    assert.equal(result.data.beneficiary, record.beneficiary);
    assert.match(record.reference ?? "", /^CASE-[1-9]\d*$/);
    assert.match(record.employeeId ?? "", /^EMP-[1-9]\d*$/);
    const byReference = await client.cases.getById.query({
      id: record.reference as string,
    });
    assert(byReference.success && byReference.data.id === record.id);
    assert(result.data.events.length >= 2);
    assert(result.data.events.every((event) => event.actorName));
    assert(result.data.tasks.every((task) => task.ownerName));
    const referenceSearch = await client.cases.getPage.query({
      search: record.reference as string,
    });
    assert(referenceSearch.data.some((item) => item.id === record.id));
    if (persona.role === "advisor") {
      for (const assigned of records) {
        const detail = await client.cases.getById.query({ id: assigned.id });
        assert(
          detail.success &&
            detail.data.advisors.some((advisor) => advisor.id === persona.id)
        );
      }
    }
    const search = await client.cases.getPage.query({ search: record.email });
    assert(search.data.some((item) => item.id === record.id));
  }
  const missing = await client.cases.getById.query({
    id: "30000000-0000-4000-8000-999999999999",
  });
  assert.equal(missing.success, false);
  console.log(
    `${persona.role}: ${stats.total} cases; status filters, monitoring groups, search, pagination, and details verified.`
  );
}
for (const persona of identities.personas.filter(
  (item) => item.role !== "advisor"
)) {
  const allowed = new Set(
    accessibleCases.get(persona.role)?.map((record) => record.id)
  );
  const unavailable = accessibleCases
    .get("advisor")
    ?.find((record) => !allowed.has(record.id));
  if (unavailable) {
    const result = await clientFor(persona.id).cases.getById.query({
      id: unavailable.id,
    });
    assert.equal(
      result.success,
      false,
      `${persona.role} must not read a case outside their scope.`
    );
  }
}
console.log("Live API checks passed. No database records were changed.");
