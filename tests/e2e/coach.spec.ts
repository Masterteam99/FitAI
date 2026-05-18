import { test, expect, createTestUser, deleteTestUser, loginViaUI } from "./fixtures";

test.describe("AI Coach", () => {
  test("invio messaggio → assistant risponde via stream SSE (mocked)", async ({ page }) => {
    const user = await createTestUser({ onboarded: true });
    try {
      await loginViaUI(page, user.email, user.password);

      await page.route("**/api/ai/chat", (route) =>
        route.fulfill({
          status: 200,
          contentType: "text/plain; charset=utf-8",
          body: "Ciao! Per migliorare lo squat, mantieni la schiena dritta e scendi controllando il movimento.",
        })
      );

      await page.goto("/ai-coach");
      await expect(page.getByText(/Sono il tuo AI Coach/i)).toBeVisible();

      await page.getByPlaceholder("Scrivi un messaggio...").fill("Come miglioro lo squat?");
      await page.getByRole("button", { name: "Invia messaggio" }).click();

      await expect(page.getByText(/mantieni la schiena dritta/i)).toBeVisible({ timeout: 10_000 });
    } finally {
      await deleteTestUser(user.id);
    }
  });
});
