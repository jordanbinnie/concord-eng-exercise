import { describe, expect, test } from "bun:test";
import { readEmployeeFile } from "../scripts/employee-input";
import { loadEmployees } from "../src/data/load-employees";

async function withFetch(replacement: typeof fetch) {
  const original = globalThis.fetch;
  globalThis.fetch = replacement;
  try {
    return await loadEmployees();
  } finally {
    globalThis.fetch = original;
  }
}

describe("errors are values", () => {
  test("uses a supplied CSV reader and preserves its error result", async () => {
    const result = await loadEmployees(() =>
      readEmployeeFile(new URL("./missing-employees.csv", import.meta.url))
    );
    expect(result).toMatchObject({
      success: false,
      error: { code: "file_read_error" },
    });
  });
  test("missing files return an object", () => {
    expect(
      readEmployeeFile(new URL("./missing-employees.csv", import.meta.url))
    ).toMatchObject({ success: false, error: { code: "file_read_error" } });
  });
  test("network rejection resolves to an error object", async () => {
    const result = await withFetch((() =>
      Promise.reject(new Error("offline"))) as typeof fetch);
    expect(result).toMatchObject({
      success: false,
      error: { code: "network_error", message: "offline" },
    });
  });
  test("HTTP failure resolves to an error object", async () => {
    const result = await withFetch((() =>
      Promise.resolve(new Response("", { status: 503 }))) as typeof fetch);
    expect(result).toMatchObject({
      success: false,
      error: { code: "http_error" },
    });
  });
  test("invalid response data resolves to an error object", async () => {
    const result = await withFetch((() =>
      Promise.resolve(new Response("wrong headers"))) as typeof fetch);
    expect(result).toMatchObject({
      success: false,
      error: { code: "invalid_csv_headers" },
    });
  });
});
