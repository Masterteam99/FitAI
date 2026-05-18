import { test, expect, createTestUser, deleteTestUser, loginViaUI, prisma } from "./fixtures";

test.describe("M3 — Community + GDPR + statiche", () => {
  test("/privacy e /terms accessibili pubbliche", async ({ page }) => {
    await page.goto("/privacy");
    await expect(page.getByRole("heading", { name: "Privacy Policy", level: 1 })).toBeVisible();

    await page.goto("/terms");
    await expect(page.getByRole("heading", { name: "Termini di Servizio", level: 1 })).toBeVisible();
  });

  test("community feed: workout completato genera SocialPost visibile nel feed", async ({ page, request }) => {
    const user = await createTestUser({ onboarded: true });
    try {
      const ex = await prisma.exercise.findFirst({ where: { slug: "squat" } });
      const plan = await prisma.workoutPlan.create({
        data: {
          userId: user.id, name: "Plan community", durationWeeks: 1, workoutsPerWeek: 1,
          primaryGoal: "GENERAL_FITNESS", isActive: true, generatedByAI: false,
          days: { create: [{
            dayNumber: 1, name: "Lunedì gambe", restDay: false,
            exercises: { create: [{ exerciseId: ex!.id, orderIndex: 0, sets: 3, reps: 10, restSeconds: 60 }] },
          }] },
        },
        include: { days: true },
      });

      await loginViaUI(page, user.email, user.password);
      const cookies = await page.context().cookies();
      const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");

      const createSession = await request.post("http://localhost:3000/api/workout-sessions", {
        data: { planId: plan.id, planDayId: plan.days[0].id },
        headers: { cookie: cookieHeader, "content-type": "application/json" },
      });
      const { id: sessionId } = await createSession.json();

      await request.patch("http://localhost:3000/api/workout-sessions", {
        data: { sessionId, status: "COMPLETED", totalSeconds: 1200 },
        headers: { cookie: cookieHeader, "content-type": "application/json" },
      });

      const post = await prisma.socialPost.findFirst({ where: { userId: user.id }, orderBy: { createdAt: "desc" } });
      expect(post).not.toBeNull();
      expect(post!.type).toBe("WORKOUT_SHARE");
      expect(post!.content).toContain("Lunedì gambe");

      await page.goto("/community");
      await expect(page.getByText(/Lunedì gambe/i)).toBeVisible({ timeout: 10_000 });
    } finally {
      await deleteTestUser(user.id);
    }
  });

  test("community feed: profilo PRIVATE → post non appare per altri", async ({ page, request, browser }) => {
    const privateUser = await createTestUser({ onboarded: true });
    const viewer = await createTestUser({ onboarded: true });
    try {
      await prisma.user.update({ where: { id: privateUser.id }, data: { profileVisibility: "PRIVATE" } });

      await prisma.socialPost.create({
        data: { userId: privateUser.id, type: "WORKOUT_SHARE", content: "Allenamento segreto privato XYZ" },
      });

      await loginViaUI(page, viewer.email, viewer.password);
      const res = await request.get("http://localhost:3000/api/community/feed", {
        headers: { cookie: (await page.context().cookies()).map((c) => `${c.name}=${c.value}`).join("; ") },
      });
      const data = await res.json();
      const found = (data.items ?? []).find((p: { content: string }) => p.content.includes("segreto privato XYZ"));
      expect(found).toBeFalsy();
    } finally {
      await deleteTestUser(privateUser.id);
      await deleteTestUser(viewer.id);
    }
  });

  test("data export: scarica JSON con tutti i dati utente", async ({ page, request }) => {
    const user = await createTestUser({ onboarded: true });
    try {
      await loginViaUI(page, user.email, user.password);
      const cookieHeader = (await page.context().cookies()).map((c) => `${c.name}=${c.value}`).join("; ");

      const res = await request.get("http://localhost:3000/api/account/export", {
        headers: { cookie: cookieHeader },
      });
      expect(res.status()).toBe(200);
      expect(res.headers()["content-disposition"]).toContain("attachment");
      const data = await res.json();
      expect(data.user.email).toBe(user.email);
      expect(data).toHaveProperty("workoutPlans");
      expect(data).toHaveProperty("nutritionLogs");
      expect(data).toHaveProperty("achievements");
      expect(data).toHaveProperty("exportDate");
    } finally {
      await deleteTestUser(user.id);
    }
  });

  test("delete account: hard delete + cascade", async ({ page, request }) => {
    const user = await createTestUser({ onboarded: true });
    try {
      await loginViaUI(page, user.email, user.password);
      const cookieHeader = (await page.context().cookies()).map((c) => `${c.name}=${c.value}`).join("; ");

      const res = await request.delete("http://localhost:3000/api/account", {
        headers: { cookie: cookieHeader, "content-type": "application/json" },
        data: { confirmText: "ELIMINA", password: user.password },
      });
      expect(res.status()).toBe(200);

      const u = await prisma.user.findUnique({ where: { id: user.id } });
      expect(u).toBeNull();
    } finally {
      await deleteTestUser(user.id);
    }
  });

  test("delete account: password sbagliata → 401", async ({ page, request }) => {
    const user = await createTestUser({ onboarded: true });
    try {
      await loginViaUI(page, user.email, user.password);
      const cookieHeader = (await page.context().cookies()).map((c) => `${c.name}=${c.value}`).join("; ");

      const res = await request.delete("http://localhost:3000/api/account", {
        headers: { cookie: cookieHeader, "content-type": "application/json" },
        data: { confirmText: "ELIMINA", password: "passwordSbagliata" },
      });
      expect(res.status()).toBe(401);

      const u = await prisma.user.findUnique({ where: { id: user.id } });
      expect(u).not.toBeNull();
    } finally {
      await deleteTestUser(user.id);
    }
  });

  test("cookie banner appare on first visit + scompare dopo accetta", async ({ browser }) => {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto("/");
    await expect(page.getByText(/Usiamo i cookie/i)).toBeVisible({ timeout: 10_000 });
    await page.getByRole("button", { name: /Accetta tutti/i }).click();
    await expect(page.getByText(/Usiamo i cookie/i)).not.toBeVisible();

    await page.reload();
    await expect(page.getByText(/Usiamo i cookie/i)).not.toBeVisible();
    await ctx.close();
  });
});
