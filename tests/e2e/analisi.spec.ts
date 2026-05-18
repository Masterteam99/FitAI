import { test, expect, createTestUser, deleteTestUser, loginViaUI } from "./fixtures";

test.describe("Analisi v2", () => {
  test("/analisi: lista esercizi con biomechanicalSpec caricata", async ({ page }) => {
    const user = await createTestUser({ onboarded: true });
    try {
      await loginViaUI(page, user.email, user.password);
      await page.goto("/analisi");
      await expect(page.getByText(/Analisi AI in Tempo Reale/i)).toBeVisible();
      await expect(page.getByText(/Esercizi con Analisi AI/i)).toBeVisible();
      await expect(page.getByText("Squat", { exact: true }).first()).toBeVisible({ timeout: 10_000 });
    } finally {
      await deleteTestUser(user.id);
    }
  });

  test("/analisi: card esercizio porta a /analisi/sessione", async ({ page }) => {
    const user = await createTestUser({ onboarded: true });
    try {
      await loginViaUI(page, user.email, user.password);
      await page.goto("/analisi");
      const squatCard = page.getByRole("link").filter({ hasText: "Squat" }).first();
      await squatCard.click();
      await page.waitForURL(/\/analisi\/sessione/, { timeout: 10_000 });
      expect(page.url()).toContain("/analisi/sessione");
    } finally {
      await deleteTestUser(user.id);
    }
  });
});
