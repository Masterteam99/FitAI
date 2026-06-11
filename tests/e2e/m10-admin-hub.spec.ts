import { test, expect, prisma } from "./fixtures";

test.describe("M10 admin hub", () => {
  test("non admin → /admin → redirect /dashboard", async ({ authedPage }) => {
    await authedPage.goto("/admin");
    await authedPage.waitForURL(/\/dashboard$/, { timeout: 15_000 });
    expect(authedPage.url()).toMatch(/\/dashboard$/);
  });

  test("admin → /admin → redirect /admin/users e vede heading", async ({ authedAdminPage }) => {
    await authedAdminPage.goto("/admin");
    await authedAdminPage.waitForURL(/\/admin\/users$/, { timeout: 15_000 });
    await expect(authedAdminPage.getByRole("heading", { name: "Utenti" })).toBeVisible({ timeout: 15_000 });
  });

  test("admin → naviga tab Abbonamenti via sidebar", async ({ authedAdminPage }) => {
    await authedAdminPage.goto("/admin/users");
    await authedAdminPage.getByRole("link", { name: /Abbonamenti/i }).first().click();
    await authedAdminPage.waitForURL(/\/admin\/subscriptions$/);
    await expect(authedAdminPage.getByRole("heading", { name: "Abbonamenti" })).toBeVisible();
  });

  test("admin → promuove un user normale → verifica DB + audit log", async ({ authedAdminPage, testUser }) => {
    const resp = await authedAdminPage.request.post(`/api/admin/users/${testUser.id}/admin`);
    expect(resp.status()).toBe(200);
    const dbUser = await prisma.user.findUnique({ where: { id: testUser.id }, select: { isAdmin: true } });
    expect(dbUser?.isAdmin).toBe(true);
    const log = await prisma.adminActionLog.findFirst({ where: { action: "PROMOTE_ADMIN", targetId: testUser.id } });
    expect(log).not.toBeNull();
    await prisma.adminActionLog.deleteMany({ where: { targetId: testUser.id } });
  });

  test("admin → revoca admin a se stesso → 400 con messaggio", async ({ authedAdminPage, adminUser }) => {
    const resp = await authedAdminPage.request.delete(`/api/admin/users/${adminUser.id}/admin`);
    expect(resp.status()).toBe(400);
    const body = await resp.json();
    expect(body.error).toMatch(/te stesso/i);
  });

  test("admin → grant premium 30g → premiumGrantedUntil futuro, Stripe non toccato", async ({ authedAdminPage, testUser }) => {
    const resp = await authedAdminPage.request.post(`/api/admin/users/${testUser.id}/grant-premium`);
    expect(resp.status()).toBe(200);
    const dbUser = await prisma.user.findUnique({
      where: { id: testUser.id },
      select: { subscriptionStatus: true, premiumGrantedUntil: true },
    });
    // Il grant manuale vive in premiumGrantedUntil; i campi subscription*
    // restano di proprietà esclusiva del webhook Stripe
    expect(dbUser?.premiumGrantedUntil).not.toBeNull();
    expect(dbUser!.premiumGrantedUntil!.getTime()).toBeGreaterThan(Date.now());
    expect(dbUser?.subscriptionStatus).toBe("FREE");
    await prisma.adminActionLog.deleteMany({ where: { targetId: testUser.id } });
  });

  test("admin → toggle exercise active → flag flippa + audit log", async ({ authedAdminPage }) => {
    const exercise = await prisma.exercise.findFirst({
      where: { isActive: true },
      select: { id: true, isActive: true },
    });
    test.skip(!exercise, "Nessun esercizio nel DB");
    const resp = await authedAdminPage.request.patch(`/api/admin/exercises/${exercise!.id}/active`);
    expect(resp.status()).toBe(200);
    const updated = await prisma.exercise.findUnique({
      where: { id: exercise!.id },
      select: { isActive: true },
    });
    expect(updated?.isActive).toBe(!exercise!.isActive);
    await prisma.exercise.update({ where: { id: exercise!.id }, data: { isActive: exercise!.isActive } });
    await prisma.adminActionLog.deleteMany({ where: { targetId: exercise!.id } });
  });

  test("admin → /admin/activity → vede log azioni", async ({ authedAdminPage, adminUser }) => {
    await prisma.adminActionLog.create({
      data: {
        actorId: adminUser.id,
        actorEmail: adminUser.email,
        action: "PROMOTE_ADMIN",
        targetType: "user",
        targetId: "test-target-m10",
        payload: { targetEmail: "test@test.com" },
      },
    });
    await authedAdminPage.goto("/admin/activity");
    await expect(authedAdminPage.getByText("PROMOTE_ADMIN").first()).toBeVisible({ timeout: 15_000 });
    await prisma.adminActionLog.deleteMany({ where: { targetId: "test-target-m10" } });
  });
});
