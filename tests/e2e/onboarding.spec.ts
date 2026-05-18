import { test, expect, createTestUser, deleteTestUser, loginViaUI, prisma } from "./fixtures";

const MOCK_PLAN_STREAM = `Ecco il tuo piano:

\`\`\`json
{
  "name": "Piano E2E Test",
  "durationWeeks": 4,
  "workoutsPerWeek": 3,
  "days": [
    {
      "dayNumber": 1,
      "name": "Lunedì — Full Body",
      "restDay": false,
      "exercises": [
        { "exerciseSlug": "squat", "sets": 3, "reps": 10, "restSeconds": 60 },
        { "exerciseSlug": "push-up", "sets": 3, "reps": 12, "restSeconds": 60 }
      ]
    },
    { "dayNumber": 2, "name": "Martedì", "restDay": true, "exercises": [] }
  ]
}
\`\`\`
`;

test.describe("Onboarding", () => {
  test("flusso completo 4 step → onboardingCompleted=true + piano AI salvato", async ({ page }) => {
    const user = await createTestUser({ onboarded: false });
    try {
      await loginViaUI(page, user.email, user.password);
      await page.waitForURL(/\/onboarding/, { timeout: 15_000 });

      await page.route("**/api/ai/generate-plan", (route) =>
        route.fulfill({
          status: 200,
          contentType: "text/plain; charset=utf-8",
          body: MOCK_PLAN_STREAM,
        })
      );

      await page.goto("/onboarding/step1");
      await page.getByRole("button", { name: /Forma fisica generale/i }).click();
      await page.getByRole("button", { name: /Principiante/i }).click();
      await page.getByRole("button", { name: /Continua/i }).click();

      await page.waitForURL("**/step2");
      await page.getByRole("button", { name: /Solo peso corporeo/i }).click();
      await page.getByRole("button", { name: /Continua/i }).click();

      await page.waitForURL("**/step3");
      await page.getByPlaceholder("30", { exact: true }).fill("30");
      await page.getByPlaceholder("75", { exact: true }).fill("75");
      await page.getByPlaceholder("175", { exact: true }).fill("175");
      await page.getByRole("button", { name: "Uomo" }).click();
      await page.getByRole("button", { name: /Continua/i }).click();

      await page.waitForURL("**/step4");
      await expect(page.getByText(/Tutto pronto/i)).toBeVisible();
      await page.getByRole("button", { name: /Genera piano e inizia/i }).click();

      await page.waitForURL(/\/dashboard/, { timeout: 30_000 });

      const updated = await prisma.user.findUnique({ where: { id: user.id } });
      expect(updated?.onboardingCompleted).toBe(true);
      expect(updated?.age).toBe(30);
      expect(updated?.weightKg).toBe(75);

      const plan = await prisma.workoutPlan.findFirst({ where: { userId: user.id, isActive: true } });
      expect(plan).not.toBeNull();
      expect(plan!.name).toBe("Piano E2E Test");
    } finally {
      await deleteTestUser(user.id);
    }
  });

  test("back tra step preserva i dati", async ({ page }) => {
    const user = await createTestUser({ onboarded: false });
    try {
      await loginViaUI(page, user.email, user.password);
      await page.goto("/onboarding/step1");

      await page.getByRole("button", { name: /Aumento massa muscolare/i }).click();
      await page.getByRole("button", { name: /Intermedio/i }).click();
      await page.getByRole("button", { name: /Continua/i }).click();

      await page.waitForURL("**/step2");
      await page.getByRole("button", { name: /Manubri/i }).click();
      await page.getByRole("button", { name: /Indietro/i }).click();

      await page.waitForURL("**/step1");
      const selectedGoal = page.getByRole("button", { name: /Aumento massa muscolare/i });
      const selectedLevel = page.getByRole("button", { name: /Intermedio/i });
      await expect(selectedGoal).toHaveClass(/border-primary/);
      await expect(selectedLevel).toHaveClass(/border-primary/);
    } finally {
      await deleteTestUser(user.id);
    }
  });
});
