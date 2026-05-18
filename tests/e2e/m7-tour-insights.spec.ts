import { test, expect, createTestUser, deleteTestUser, loginViaUI, prisma } from "./fixtures";

test.describe("M7 — Welcome tour + insights", () => {
  test("welcome tour: appare on first visit dashboard + skip lo nasconde definitivamente", async ({ browser }) => {
    const user = await createTestUser({ onboarded: true });
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.addInitScript(() => {
      localStorage.setItem("fitai-cookie-consent", JSON.stringify({ choice: "accepted", at: new Date().toISOString() }));
    });
    try {
      await page.goto("/login");
      await page.getByPlaceholder("nome@email.com").fill(user.email);
      await page.getByPlaceholder("••••••••").fill(user.password);
      await page.getByRole("button", { name: "Accedi" }).click();
      await page.waitForURL(/\/dashboard/, { timeout: 15_000 });

      await expect(page.getByText(/Benvenuto in FitAI/i)).toBeVisible({ timeout: 10_000 });

      await page.getByRole("button", { name: /Salta il tour/i }).click();
      await expect(page.getByText(/Benvenuto in FitAI/i)).not.toBeVisible();

      await page.reload();
      await expect(page.getByText(/Benvenuto in FitAI/i)).not.toBeVisible();
    } finally {
      await ctx.close();
      await deleteTestUser(user.id);
    }
  });

  test("welcome tour: avanti porta a step 2", async ({ browser }) => {
    const user = await createTestUser({ onboarded: true });
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.addInitScript(() => {
      localStorage.setItem("fitai-cookie-consent", JSON.stringify({ choice: "accepted", at: new Date().toISOString() }));
    });
    try {
      await page.goto("/login");
      await page.getByPlaceholder("nome@email.com").fill(user.email);
      await page.getByPlaceholder("••••••••").fill(user.password);
      await page.getByRole("button", { name: "Accedi" }).click();
      await page.waitForURL(/\/dashboard/);

      await expect(page.getByText(/Benvenuto in FitAI/i)).toBeVisible();
      await page.getByRole("button", { name: /Avanti/i }).click();
      await expect(page.getByText(/Genera il tuo piano AI/i)).toBeVisible();
    } finally {
      await ctx.close();
      await deleteTestUser(user.id);
    }
  });

  test("/api/progressi: include insights (daysActive30, weeklyVolume, avgFeeling)", async ({ page, request }) => {
    const user = await createTestUser({ onboarded: true });
    try {
      await loginViaUI(page, user.email, user.password);
      const cookieHeader = (await page.context().cookies()).map((c) => `${c.name}=${c.value}`).join("; ");
      const res = await request.get("http://localhost:3000/api/progressi", { headers: { cookie: cookieHeader } });
      expect(res.status()).toBe(200);
      const data = await res.json();
      expect(data).toHaveProperty("daysActive30");
      expect(data).toHaveProperty("weeklyVolume");
      expect(Array.isArray(data.weeklyVolume)).toBe(true);
      expect(data.weeklyVolume).toHaveLength(8);
      expect(data).toHaveProperty("avgFeeling");
    } finally {
      await deleteTestUser(user.id);
    }
  });

  test("/progressi: pagina mostra card 'I tuoi insight' dopo almeno 1 sessione", async ({ page }) => {
    const user = await createTestUser({ onboarded: true });
    try {
      const ex = await prisma.exercise.findFirst({ where: { slug: "squat" } });
      const plan = await prisma.workoutPlan.create({
        data: {
          userId: user.id, name: "P", durationWeeks: 1, workoutsPerWeek: 1,
          primaryGoal: "GENERAL_FITNESS", isActive: true, generatedByAI: false,
          days: { create: [{
            dayNumber: 1, name: "D1", restDay: false,
            exercises: { create: [{ exerciseId: ex!.id, orderIndex: 0, sets: 3, reps: 10, restSeconds: 60 }] },
          }] },
        },
        include: { days: true },
      });
      await prisma.workoutSession.create({
        data: {
          userId: user.id, planId: plan.id, planDayId: plan.days[0].id,
          status: "COMPLETED", totalSeconds: 1800, completedAt: new Date(),
        },
      });

      await loginViaUI(page, user.email, user.password);
      await page.goto("/progressi");
      await expect(page.getByText(/I tuoi insight/i)).toBeVisible({ timeout: 10_000 });
      await expect(page.getByText(/Giorni attivi/i)).toBeVisible();
      await expect(page.getByText(/Min\/sessione media/i)).toBeVisible();
    } finally {
      await deleteTestUser(user.id);
    }
  });
});
