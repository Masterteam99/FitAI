import { test, expect, createTestUser, deleteTestUser, loginViaUI, prisma } from "./fixtures";

test.describe("Progressi & Profilo", () => {
  test("/progressi: pagina si carica con stats", async ({ page }) => {
    const user = await createTestUser({ onboarded: true });
    try {
      await loginViaUI(page, user.email, user.password);
      await page.goto("/progressi");
      await expect(page.getByRole("heading", { name: /Progressi/i }).first()).toBeVisible({ timeout: 10_000 });
    } finally {
      await deleteTestUser(user.id);
    }
  });

  test("/profilo: modifica peso → persiste in DB", async ({ page }) => {
    const user = await createTestUser({ onboarded: true });
    try {
      await loginViaUI(page, user.email, user.password);
      await page.goto("/profilo");
      await expect(page.getByText(/Il mio Profilo/i)).toBeVisible();

      const weightInput = page.getByPlaceholder("75", { exact: true });
      await weightInput.fill("82");
      await page.getByRole("button", { name: /Salva modifiche/i }).click();
      await expect(page.getByRole("button", { name: /Salvato!/i })).toBeVisible({ timeout: 5_000 });

      const updated = await prisma.user.findUnique({ where: { id: user.id }, select: { weightKg: true } });
      expect(updated?.weightKg).toBe(82);
    } finally {
      await deleteTestUser(user.id);
    }
  });

  test("/profilo: logout → navigazione fuori da /profilo", async ({ page }) => {
    const user = await createTestUser({ onboarded: true });
    try {
      await loginViaUI(page, user.email, user.password);
      await page.goto("/profilo");
      await expect(page.getByRole("button", { name: /^Esci$/ })).toBeVisible();
      await page.getByRole("button", { name: /^Esci$/ }).click();
      await page.waitForURL((url) => !url.pathname.startsWith("/profilo"), { timeout: 10_000 });
      expect(page.url()).not.toContain("/profilo");
    } finally {
      await deleteTestUser(user.id);
    }
  });
});
