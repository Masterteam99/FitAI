import { test, expect, createTestUser, deleteTestUser, loginViaUI, prisma } from "./fixtures";

test.describe("M8 — Daily Mission", () => {
  test("render base: dashboard mostra mission card con 3 task", async ({ page }) => {
    const user = await createTestUser({ onboarded: true });
    try {
      await page.addInitScript(() => {
        localStorage.setItem("fitai-tour-completed", "1");
      });
      await loginViaUI(page, user.email, user.password);
      await page.waitForURL(/\/dashboard/);

      await expect(page.getByText(/missione di oggi|missione completata/i)).toBeVisible({ timeout: 10_000 });
      await expect(page.getByText(/Pasti loggati: 0\/3/i)).toBeVisible();
      await expect(page.getByText(/Come ti senti oggi/i)).toBeVisible();
    } finally {
      await deleteTestUser(user.id);
    }
  });

  test("empty state: senza piano attivo, task 1 mostra 'Crea il tuo piano AI'", async ({ page }) => {
    const user = await createTestUser({ onboarded: true });
    try {
      await page.addInitScript(() => {
        localStorage.setItem("fitai-tour-completed", "1");
      });
      await loginViaUI(page, user.email, user.password);

      await expect(page.getByText(/Crea il tuo piano AI/i)).toBeVisible({ timeout: 10_000 });
    } finally {
      await deleteTestUser(user.id);
    }
  });

  test("check-in flow: click emoji salva mood e aggiorna progresso", async ({ page }) => {
    const user = await createTestUser({ onboarded: true });
    try {
      await page.addInitScript(() => {
        localStorage.setItem("fitai-tour-completed", "1");
      });
      await loginViaUI(page, user.email, user.password);

      await expect(page.getByText(/Come ti senti oggi/i)).toBeVisible({ timeout: 10_000 });

      const responsePromise = page.waitForResponse((res) =>
        res.url().includes("/api/daily-checkin") && res.request().method() === "POST",
      );
      await page.getByRole("button", { name: "Mood 5" }).click();
      const res = await responsePromise;
      expect(res.ok()).toBe(true);

      await expect(page.getByText(/Oggi ti senti 💪/i)).toBeVisible({ timeout: 5_000 });

      const today = new Date();
      const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
      const checkin = await prisma.dailyCheckin.findUnique({
        where: { userId_date: { userId: user.id, date: todayUtc } },
      });
      expect(checkin?.mood).toBe(5);
    } finally {
      await deleteTestUser(user.id);
    }
  });

  test("nutrition progress: dopo 3 NutritionLog di oggi, task 2 risulta done", async ({ page }) => {
    const user = await createTestUser({ onboarded: true });
    try {
      const now = new Date();
      for (let i = 0; i < 3; i++) {
        await prisma.nutritionLog.create({
          data: {
            userId: user.id,
            date: now,
            mealType: "BREAKFAST",
            foodName: `Test meal ${i}`,
            quantity: 100,
            unit: "g",
            calories: 200,
          },
        });
      }
      await page.addInitScript(() => {
        localStorage.setItem("fitai-tour-completed", "1");
      });
      await loginViaUI(page, user.email, user.password);

      await expect(page.getByText(/Pasti loggati: 3\/3/i)).toBeVisible({ timeout: 10_000 });
    } finally {
      await deleteTestUser(user.id);
    }
  });

  test("workout done: WorkoutSession COMPLETED oggi marca task 1 come done", async ({ page }) => {
    const user = await createTestUser({ onboarded: true });
    try {
      const exercise = await prisma.exercise.findFirst({ where: { isActive: true } });
      if (!exercise) test.skip(true, "Nessun esercizio seedato");

      const plan = await prisma.workoutPlan.create({
        data: {
          userId: user.id, name: "Test Plan",
          durationWeeks: 1, workoutsPerWeek: 1,
          primaryGoal: "GENERAL_FITNESS", isActive: true, generatedByAI: false,
          days: { create: [{
            dayNumber: 1, name: "Petto", restDay: false,
            exercises: { create: [{ exerciseId: exercise!.id, orderIndex: 0, sets: 3, reps: 10, restSeconds: 60 }] },
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

      await page.addInitScript(() => {
        localStorage.setItem("fitai-tour-completed", "1");
      });
      await loginViaUI(page, user.email, user.password);

      const row = page.locator("text=/Day 1.*Petto/i").first();
      await expect(row).toBeVisible({ timeout: 10_000 });
      await expect(row).toHaveClass(/line-through/);
    } finally {
      await deleteTestUser(user.id);
    }
  });
});
