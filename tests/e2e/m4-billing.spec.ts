import { test, expect, createTestUser, deleteTestUser, loginViaUI, prisma } from "./fixtures";

test.describe("M4 — Billing + gating", () => {
  test("/abbonamento accessibile per utente FREE, mostra confronto piani", async ({ page }) => {
    const user = await createTestUser({ onboarded: true });
    try {
      await loginViaUI(page, user.email, user.password);
      await page.goto("/abbonamento");
      await expect(page.getByRole("heading", { name: "Abbonamento", level: 1 })).toBeVisible({ timeout: 10_000 });
      await expect(page.getByText("Free", { exact: true }).first()).toBeVisible();
      await expect(page.getByText("Premium", { exact: true }).first()).toBeVisible();
      await expect(page.getByText("€9.99", { exact: true })).toBeVisible();
    } finally {
      await deleteTestUser(user.id);
    }
  });

  test("/api/billing/status: FREE per nuovo utente", async ({ page, request }) => {
    const user = await createTestUser({ onboarded: true });
    try {
      await loginViaUI(page, user.email, user.password);
      const cookieHeader = (await page.context().cookies()).map((c) => `${c.name}=${c.value}`).join("; ");
      const res = await request.get("http://localhost:3000/api/billing/status", { headers: { cookie: cookieHeader } });
      const data = await res.json();
      expect(data.subscriptionStatus).toBe("FREE");
      expect(data.subscriptionPlan).toBeNull();
    } finally {
      await deleteTestUser(user.id);
    }
  });

  test("gating: AI Coach restituisce 402 per utente FREE", async ({ page, request }) => {
    const user = await createTestUser({ onboarded: true });
    try {
      await loginViaUI(page, user.email, user.password);
      const cookieHeader = (await page.context().cookies()).map((c) => `${c.name}=${c.value}`).join("; ");
      const res = await request.post("http://localhost:3000/api/ai/chat", {
        headers: { cookie: cookieHeader, "content-type": "application/json" },
        data: { message: "ciao" },
      });
      expect(res.status()).toBe(402);
      const body = await res.json();
      expect(body.code).toBe("PREMIUM_REQUIRED");
    } finally {
      await deleteTestUser(user.id);
    }
  });

  test("gating: AI Coach NON ritorna 402 per utente ACTIVE (gating bypassed)", async ({ page, request }) => {
    const user = await createTestUser({ onboarded: true });
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          subscriptionStatus: "ACTIVE",
          subscriptionPlan: "MONTHLY",
          subscriptionCurrentPeriodEnd: new Date(Date.now() + 30 * 24 * 3600 * 1000),
        },
      });
      await loginViaUI(page, user.email, user.password);
      const cookieHeader = (await page.context().cookies()).map((c) => `${c.name}=${c.value}`).join("; ");
      const res = await request
        .post("http://localhost:3000/api/ai/chat", {
          headers: { cookie: cookieHeader, "content-type": "application/json" },
          data: { message: "ciao" },
          timeout: 5_000,
        })
        .catch(() => null);
      // Il gating non blocca → o passa ad Anthropic (200/500) o socket hang up.
      // Quello che NON deve essere è 402 (PREMIUM_REQUIRED).
      if (res) expect(res.status()).not.toBe(402);
    } finally {
      await deleteTestUser(user.id);
    }
  });

  test("quota: generate-plan FREE conta uso, blocca al 4°", async ({ page, request }) => {
    const user = await createTestUser({ onboarded: true });
    try {
      const period = `${new Date().getUTCFullYear()}-${String(new Date().getUTCMonth() + 1).padStart(2, "0")}`;
      await prisma.usageCounter.create({
        data: { userId: user.id, feature: "generate_plan", period, count: 3 },
      });

      await loginViaUI(page, user.email, user.password);
      const cookieHeader = (await page.context().cookies()).map((c) => `${c.name}=${c.value}`).join("; ");
      const res = await request.post("http://localhost:3000/api/ai/generate-plan", {
        headers: { cookie: cookieHeader, "content-type": "application/json" },
        data: { goal: "GENERAL_FITNESS", fitnessLevel: "BEGINNER", daysPerWeek: 3, equipment: ["BODYWEIGHT"] },
      });
      expect(res.status()).toBe(402);
      const body = await res.json();
      expect(body.code).toBe("QUOTA_EXCEEDED");
      expect(body.limit).toBe(3);
    } finally {
      await deleteTestUser(user.id);
    }
  });

  test("/api/billing/checkout: 503 se Stripe non configurato", async ({ page, request }) => {
    const stripeConfigured = !!process.env.STRIPE_SECRET_KEY;
    test.skip(stripeConfigured, "Stripe configurato, skip test 503");

    const user = await createTestUser({ onboarded: true });
    try {
      await loginViaUI(page, user.email, user.password);
      const cookieHeader = (await page.context().cookies()).map((c) => `${c.name}=${c.value}`).join("; ");
      const res = await request.post("http://localhost:3000/api/billing/checkout", {
        headers: { cookie: cookieHeader, "content-type": "application/json" },
        data: { plan: "MONTHLY" },
      });
      expect(res.status()).toBe(503);
    } finally {
      await deleteTestUser(user.id);
    }
  });

  test("webhook: 503 se webhook secret non configurato", async ({ request }) => {
    const configured = !!process.env.STRIPE_WEBHOOK_SECRET && !!process.env.STRIPE_SECRET_KEY;
    test.skip(configured, "Stripe webhook configurato, skip");
    const res = await request.post("http://localhost:3000/api/billing/webhook", {
      data: { test: 1 },
      headers: { "content-type": "application/json" },
    });
    expect([400, 503]).toContain(res.status());
  });
});
