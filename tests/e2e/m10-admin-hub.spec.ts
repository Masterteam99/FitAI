import { test, expect } from "./fixtures";

test.describe("M10 admin hub", () => {
  test("non admin → /admin → redirect /dashboard", async ({ authedPage }) => {
    await authedPage.goto("/admin");
    await authedPage.waitForURL(/\/dashboard$/, { timeout: 15_000 });
    expect(authedPage.url()).toMatch(/\/dashboard$/);
  });

  test.fixme("admin tests — richiede adminUser fixture (vedi T17)", () => {
    // I test admin completi sono scritti in Task 17, quando viene aggiunta la
    // fixture adminUser/authedAdminPage in tests/e2e/fixtures.ts.
  });
});
