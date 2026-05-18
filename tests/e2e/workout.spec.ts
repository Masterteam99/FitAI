import { test, expect, createTestUser, deleteTestUser, loginViaUI, prisma } from "./fixtures";

const MOCK_PLAN_STREAM = `\`\`\`json
{
  "name": "Piano Workout E2E",
  "durationWeeks": 4,
  "workoutsPerWeek": 3,
  "days": [
    {
      "dayNumber": 1,
      "name": "Giorno 1",
      "restDay": false,
      "exercises": [
        { "exerciseSlug": "squat", "sets": 3, "reps": 10, "restSeconds": 60 }
      ]
    }
  ]
}
\`\`\`
`;

test.describe("Workout", () => {
  test("API workout-plans: crea piano via POST → list lo include", async ({ page, request }) => {
    const user = await createTestUser({ onboarded: true });
    try {
      await loginViaUI(page, user.email, user.password);
      const cookies = await page.context().cookies();
      const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");

      const ex = await prisma.exercise.findFirst({ where: { slug: "squat" } });
      expect(ex).not.toBeNull();

      const createRes = await request.post("http://localhost:3000/api/workout-plans", {
        headers: { cookie: cookieHeader, "content-type": "application/json" },
        data: {
          name: "Piano API E2E",
          durationWeeks: 4,
          workoutsPerWeek: 3,
          primaryGoal: "GENERAL_FITNESS",
          generatedByAI: false,
          setActive: true,
          days: [
            {
              dayNumber: 1,
              name: "Giorno 1",
              restDay: false,
              exercises: [{ exerciseId: ex!.id, orderIndex: 0, sets: 3, reps: 10, restSeconds: 60 }],
            },
          ],
        },
      });
      expect(createRes.status()).toBe(201);

      await page.goto("/allenamento");
      await expect(page.getByText("Piano API E2E")).toBeVisible({ timeout: 10_000 });

      const plan = await prisma.workoutPlan.findFirst({ where: { userId: user.id, name: "Piano API E2E" } });
      expect(plan).not.toBeNull();
      expect(plan!.isActive).toBe(true);
    } finally {
      await deleteTestUser(user.id);
    }
  });

  test("UI /allenamento/genera-ai: form caricato con tutte le opzioni", async ({ page }) => {
    const user = await createTestUser({ onboarded: true });
    try {
      await loginViaUI(page, user.email, user.password);
      await page.goto("/allenamento/genera-ai");
      await expect(page.getByRole("button", { name: /Forma fisica generale/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /Principiante/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /Genera piano personalizzato/i })).toBeVisible();
    } finally {
      await deleteTestUser(user.id);
    }
  });

  test("completa sessione → achievement first_workout + streak", async ({ page, request }) => {
    const user = await createTestUser({ onboarded: true });
    try {
      const ex = await prisma.exercise.findFirst({ where: { slug: "squat" } });
      expect(ex).not.toBeNull();

      const plan = await prisma.workoutPlan.create({
        data: {
          userId: user.id,
          name: "Plan test",
          durationWeeks: 1,
          workoutsPerWeek: 1,
          primaryGoal: "GENERAL_FITNESS",
          isActive: true,
          generatedByAI: false,
          days: {
            create: [{
              dayNumber: 1, name: "Day 1", restDay: false,
              exercises: { create: [{ exerciseId: ex!.id, orderIndex: 0, sets: 3, reps: 10, restSeconds: 60 }] },
            }],
          },
        },
        include: { days: true },
      });

      await loginViaUI(page, user.email, user.password);
      const cookies = await page.context().cookies();
      const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");

      const createRes = await request.post("http://localhost:3000/api/workout-sessions", {
        data: { planId: plan.id, planDayId: plan.days[0].id },
        headers: { cookie: cookieHeader, "content-type": "application/json" },
      });
      expect(createRes.status()).toBe(201);
      const { id: sessionId } = await createRes.json();

      const patchRes = await request.patch("http://localhost:3000/api/workout-sessions", {
        data: { sessionId, status: "COMPLETED", totalSeconds: 600 },
        headers: { cookie: cookieHeader, "content-type": "application/json" },
      });
      expect(patchRes.status()).toBe(200);

      const updated = await prisma.user.findUnique({ where: { id: user.id }, select: { currentStreak: true, totalPoints: true } });
      expect(updated!.currentStreak).toBe(1);
      expect(updated!.totalPoints).toBeGreaterThanOrEqual(10);

      const ach = await prisma.userAchievement.findFirst({
        where: { userId: user.id, achievement: { key: "first_workout" } },
      });
      expect(ach).not.toBeNull();
    } finally {
      await deleteTestUser(user.id);
    }
  });
});
