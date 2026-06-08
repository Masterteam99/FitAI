import { test, expect, createTestUser, deleteTestUser, loginViaUI, prisma } from "./fixtures";

test.describe("M9 — Admin Video PT upload", () => {
  test("non autenticato: GET /admin/exercises redirect a /login", async ({ page }) => {
    await page.goto("/admin/exercises");
    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });

  test("loggato non-admin: GET /admin/exercises redirect a /dashboard", async ({ page }) => {
    const user = await createTestUser({ onboarded: true, isAdmin: false });
    try {
      await loginViaUI(page, user.email, user.password);
      await page.goto("/admin/exercises");
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 });
    } finally {
      await deleteTestUser(user.id);
    }
  });

  test("loggato admin: vede tabella esercizi con badge mancante", async ({ page }) => {
    const user = await createTestUser({ onboarded: true, isAdmin: true });
    try {
      await loginViaUI(page, user.email, user.password);
      await page.goto("/admin/exercises");
      await expect(page.getByRole("heading", { name: /Video PT/i })).toBeVisible({ timeout: 10_000 });
      // almeno 1 badge "Mancante" presente (gli esercizi seedati non hanno videoUrl)
      await expect(page.getByText("Mancante").first()).toBeVisible();
      // bottone "Carica" presente
      await expect(page.getByRole("button", { name: /^Carica$/i }).first()).toBeVisible();
    } finally {
      await deleteTestUser(user.id);
    }
  });

  test("admin: POST upload video PT aggiorna Exercise.videoUrl, DELETE lo rimuove", async ({ page }) => {
    test.skip(
      !process.env.NEXT_PUBLIC_SUPABASE_URL,
      "Richiede Supabase Storage, non configurato in questo ambiente (es. CI)",
    );
    const user = await createTestUser({ onboarded: true, isAdmin: true });
    const exercise = await prisma.exercise.create({
      data: {
        slug: `e2e-pt-${Date.now()}`,
        name: "E2E PT Test",
        description: "Exercise temporaneo per test M9",
        muscleGroupPrimary: "CHEST",
        muscleGroupsSecondary: [],
        difficulty: "BEGINNER",
        category: "STRENGTH",
        equipment: ["NONE"],
        isActive: false,
      },
    });
    try {
      await loginViaUI(page, user.email, user.password);

      const webmHeader = Buffer.from([0x1a, 0x45, 0xdf, 0xa3, 0x9f, 0x42, 0x86, 0x81]);
      const uploadRes = await page.request.post(`/api/admin/exercises/${exercise.id}/pt-video`, {
        multipart: {
          file: { name: "test.webm", mimeType: "video/webm", buffer: webmHeader },
        },
      });
      expect(uploadRes.status()).toBe(200);
      const uploadBody = await uploadRes.json();
      expect(uploadBody.videoUrl).toMatch(/exercise-videos\/pt\/e2e-pt-/);

      const after = await prisma.exercise.findUnique({ where: { id: exercise.id } });
      expect(after?.videoUrl).toBe(uploadBody.videoUrl);

      const delRes = await page.request.delete(`/api/admin/exercises/${exercise.id}/pt-video`);
      expect(delRes.status()).toBe(200);

      const cleared = await prisma.exercise.findUnique({ where: { id: exercise.id } });
      expect(cleared?.videoUrl).toBeNull();
    } finally {
      await prisma.exercise.delete({ where: { id: exercise.id } }).catch(() => {});
      await deleteTestUser(user.id);
    }
  });
});
