import { test, expect } from "@playwright/test";

test.describe("Smoke — basic routing", () => {
  test("home risponde 200", async ({ page }) => {
    const res = await page.goto("/");
    expect(res?.status()).toBe(200);
  });

  test("URL inesistente mostra la 404 custom italiana", async ({ page }) => {
    await page.goto("/questa-pagina-non-esiste-xyz");
    await expect(page.getByText("Pagina non trovata")).toBeVisible();
    await expect(page.getByText("404", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: /Vai alla dashboard/i })).toBeVisible();
  });

  test("manifest e icone PWA sono raggiungibili", async ({ request }) => {
    expect((await request.get("/manifest.json")).status()).toBe(200);
    expect((await request.get("/icon-192.png")).status()).toBe(200);
    expect((await request.get("/icon-512.png")).status()).toBe(200);
    expect((await request.get("/apple-icon.png")).status()).toBe(200);
  });

  test("/api/health risponde ok con DB raggiungibile", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.status()).toBe(200);
    const data = await res.json();
    expect(data.status).toBe("ok");
    expect(data.checks.database).toBe("ok");
  });
});
