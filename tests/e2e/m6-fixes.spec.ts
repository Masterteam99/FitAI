import { test, expect, createTestUser, deleteTestUser, loginViaUI, prisma } from "./fixtures";

test.describe("M6 — Bug fixes", () => {
  test("/allenamento/nuovo: form caricato, crea piano manuale → DB", async ({ page }) => {
    const user = await createTestUser({ onboarded: true });
    try {
      await loginViaUI(page, user.email, user.password);
      await page.goto("/allenamento/nuovo");

      await expect(page.getByRole("heading", { name: /Nuovo piano manuale/i })).toBeVisible({ timeout: 10_000 });

      await page.getByPlaceholder("Es. Forza base 4 settimane").fill("Piano M6 test");

      const ex = await prisma.exercise.findFirst({ where: { slug: "squat" } });
      const exerciseSelect = page.locator('select').filter({ hasText: /Aggiungi esercizio/i }).first();
      await exerciseSelect.locator(`option[value="${ex!.id}"]`).waitFor({ state: "attached", timeout: 10_000 });
      await exerciseSelect.selectOption(ex!.id);

      await expect(page.getByRole("paragraph").filter({ hasText: /^Squat$/ })).toBeVisible({ timeout: 5_000 });

      const respPromise = page.waitForResponse((r) => r.url().endsWith("/api/workout-plans") && r.request().method() === "POST");
      await page.getByRole("button", { name: /^Crea piano$/ }).click();
      const resp = await respPromise;
      expect(resp.status()).toBe(201);
      await page.waitForURL(/\/allenamento\/[^/]+/, { timeout: 15_000 });

      const plan = await prisma.workoutPlan.findFirst({
        where: { userId: user.id, name: "Piano M6 test" },
        include: { days: { include: { exercises: true } } },
      });
      expect(plan).not.toBeNull();
      expect(plan!.generatedByAI).toBe(false);
      expect(plan!.isActive).toBe(true);
      expect(plan!.days[0].exercises).toHaveLength(1);
    } finally {
      await deleteTestUser(user.id);
    }
  });
});
