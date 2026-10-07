import { describe, expect, test } from "bun:test";
import { QueryClientProvider } from "@tanstack/react-query";
import { createMemoryHistory, RouterProvider } from "@tanstack/react-router";
import { renderToStaticMarkup } from "react-dom/server";
import { caseReferenceSchema } from "../shared/case-reference";
import { createApiSession } from "../src/api/client";
import { createAppRouter } from "../src/router";
import { caseFixture } from "./fixtures/case";

async function loadRoute(path: string) {
  const history = createMemoryHistory({ initialEntries: [path] });
  const api = createApiSession("test-user");
  for (const id of [caseFixture.id, caseFixture.reference ?? caseFixture.id]) {
    api.queryClient.setQueryData(
      api.trpc.cases.getById.queryOptions({ id }).queryKey,
      {
        success: true,
        data: { ...caseFixture, advisors: [], tasks: [], events: [] },
      }
    );
  }
  const url = new URL(path, "http://localhost");
  const caseId = url.pathname.split("/")[2];
  if (
    caseId &&
    caseReferenceSchema.safeParse(caseId).success &&
    caseId !== caseFixture.id &&
    caseId !== caseFixture.reference
  ) {
    api.queryClient.setQueryData(
      api.trpc.cases.getById.queryOptions({ id: caseId }).queryKey,
      {
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "This case is unavailable or you do not have access.",
        },
      }
    );
  }
  const search = url.searchParams.get("q") ?? "";
  for (const status of [
    "all",
    "pre-assessment",
    "in-progress",
    "filed",
    "approved",
  ] as const) {
    const matches =
      (status === "all" || status === "in-progress") &&
      (!search || "Noah Davis".toLowerCase().includes(search.toLowerCase()));
    api.queryClient.setQueryData(
      api.trpc.cases.getPage.queryOptions({
        pageIndex: 0,
        pageSize: 10,
        search,
        status,
      }).queryKey,
      {
        success: true,
        data: matches ? [caseFixture] : [],
        total: matches ? 1 : 0,
        pageIndex: 0,
        pageSize: 10,
        pageCount: matches ? 1 : 0,
        nextCursor: undefined,
      }
    );
  }
  const router = createAppRouter({ api, history, isServer: true });
  await router.load();
  return { history, router, api };
}

function renderRoute({ router, api }: Awaited<ReturnType<typeof loadRoute>>) {
  return renderToStaticMarkup(
    <QueryClientProvider client={api.queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

describe("workspace routing", () => {
  test("matches each status filter before the dynamic case route", async () => {
    for (const filter of [
      "all",
      "pre-assessment",
      "in-progress",
      "filed",
      "approved",
    ]) {
      const loaded = await loadRoute(`/my-cases/${filter}`);
      const { router } = loaded;
      expect(router.state.matches.at(-1)?.routeId).toBe(`/my-cases/${filter}`);
      expect(router.state.matches.at(-1)?.status).toBe("success");
      expect(renderRoute(loaded)).toContain(
        'aria-label="Search cases, names or email"'
      );
    }
  });

  test("loads identical case details from both entry points", async () => {
    const overview = await loadRoute(`/overview/${caseFixture.id}`);
    const cases = await loadRoute(`/my-cases/${caseFixture.id}`);
    const record = overview.router.state.matches.at(-1)?.loaderData;
    expect(record).toMatchObject({
      id: caseFixture.id,
      beneficiary: "Noah Davis",
    });
    expect(cases.router.state.matches.at(-1)?.loaderData).toEqual(record);
    for (const loaded of [overview, cases]) {
      const html = renderRoute(loaded);
      expect(html).toContain("Noah Davis");
      expect(html).toContain("Next steps");
      expect(html).toContain("Activity");
      expect(html).toContain("Case created");
      expect(html).not.toContain("Uploaded employment letter");
      expect(html).not.toContain("Application filed");
    }
  });

  test("renders a recoverable not-found page for unknown cases", async () => {
    for (const section of ["overview", "my-cases"]) {
      const loaded = await loadRoute(`/${section}/VISA-unknown`);
      const { router } = loaded;
      expect(router.state.matches.at(-1)?.status).toBe("notFound");
      const html = renderRoute(loaded);
      expect(html).toContain("This page or case could not be found.");
      expect(html).toContain("Back to Overview");
      expect(html).not.toContain('aria-label="Case details"');
    }
  });

  test("handles unknown pages without displaying Overview content", async () => {
    const loaded = await loadRoute("/missing-page");
    const html = renderRoute(loaded);
    expect(html).toContain("Page not found");
    expect(html).not.toContain("Good morning");
    expect(html).not.toContain("Good afternoon");
  });

  test("uses a unique case link with an employee ID breadcrumb", async () => {
    const loaded = await loadRoute("/overview/CASE-9");
    expect(loaded.router.state.matches.at(-1)?.loaderData).toMatchObject({
      id: caseFixture.id,
      reference: "CASE-9",
    });
    const html = renderRoute(loaded);
    expect(html).not.toContain(">CASE-9<");
    expect(html).toContain("EMP-9");
    expect(html).not.toContain(">30000000-0000-4000-8000-000000000009<");
  });

  test("treats a backend access denial as not found on both case routes", async () => {
    for (const section of ["overview", "my-cases"]) {
      const loaded = await loadRoute(
        `/${section}/30000000-0000-4000-8000-999999999999`
      );
      expect(loaded.router.state.matches.at(-1)?.status).toBe("notFound");
      expect(renderRoute(loaded)).not.toContain("Noah Davis");
    }
  });

  test("validates search and restores the input from the URL", async () => {
    const loaded = await loadRoute("/my-cases/in-progress?q=Noah");
    const { router } = loaded;
    expect(router.state.matches.at(-1)?.search).toEqual({ q: "Noah" });
    const html = renderRoute(loaded);
    expect(html).toContain('value="Noah"');
    expect(html).toContain("Noah Davis");
    expect(html).not.toContain("Alex Morgan");
    const invalid = await loadRoute("/my-cases/all?q=123");
    expect(
      invalid.router.matchRoutes(invalid.router.state.location).at(-1)?.search
    ).toEqual({ q: undefined });
  });

  test("changing search retains the current status route", async () => {
    const { router } = await loadRoute("/my-cases/filed?q=Alex");
    const next = router.buildLocation({
      from: "/my-cases/filed",
      to: ".",
      search: (previous) => ({ ...previous, q: "Maya" }),
    });
    expect(next.pathname).toBe("/my-cases/filed");
    expect(next.search).toEqual({ q: "Maya" });
    const cleared = router.buildLocation({
      from: "/my-cases/filed",
      to: ".",
      search: (previous) => ({ ...previous, q: undefined }),
    });
    expect(cleared.href).toBe("/my-cases/filed");
  });

  test("filter and case links preserve search through Back and Forward", async () => {
    const { history, router } = await loadRoute("/my-cases/all?q=Noah");
    const filtered = router.buildLocation({
      to: "/my-cases/in-progress",
      search: (previous) => previous,
    });
    history.push(filtered.href);
    await router.load();
    const selected = router.buildLocation({
      to: "/my-cases/$caseId",
      params: { caseId: caseFixture.id },
      search: (previous) => previous,
    });
    history.push(selected.href);
    await router.load();
    expect(router.state.matches.at(-1)?.loaderData).toMatchObject({
      id: caseFixture.id,
    });
    history.back();
    await router.load();
    expect(router.state.location.href).toBe("/my-cases/in-progress?q=Noah");
    history.back();
    await router.load();
    expect(router.state.location.href).toBe("/my-cases/all?q=Noah");
    history.forward();
    await router.load();
    expect(router.state.location.href).toBe("/my-cases/in-progress?q=Noah");
    expect(router.state.matches.at(-1)?.search).toEqual({ q: "Noah" });
  });
});
