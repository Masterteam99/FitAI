import { test, expect, createTestUser, deleteTestUser, prisma } from "./fixtures";
import bcrypt from "bcryptjs";

test.describe("Reset password + email verification", () => {
  test("forgot-password: utente esistente → token creato + UI conferma", async ({ page, request }) => {
    const user = await createTestUser({ onboarded: true });
    try {
      await page.goto("/forgot-password");
      await page.getByPlaceholder("nome@email.com").fill(user.email);
      await page.getByRole("button", { name: /Invia link di reset/i }).click();
      await expect(page.getByText(/Email inviata/i)).toBeVisible({ timeout: 10_000 });

      const token = await prisma.passwordResetToken.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      });
      expect(token).not.toBeNull();
      expect(token!.expiresAt > new Date()).toBe(true);
      expect(token!.usedAt).toBeNull();
    } finally {
      await deleteTestUser(user.id);
    }
  });

  test("forgot-password: email non registrata → UI conferma comunque (no enumeration)", async ({ page }) => {
    await page.goto("/forgot-password");
    await page.getByPlaceholder("nome@email.com").fill("inesistente-xyz@fitai-test.local");
    await page.getByRole("button", { name: /Invia link di reset/i }).click();
    await expect(page.getByText(/Email inviata/i)).toBeVisible({ timeout: 10_000 });
  });

  test("reset-password: nuovo password con token valido → login funziona", async ({ page, request }) => {
    const user = await createTestUser({ onboarded: true });
    try {
      const res = await request.post("http://localhost:3000/api/auth/forgot-password", {
        data: { email: user.email },
        headers: { "content-type": "application/json" },
      });
      expect(res.status()).toBe(200);

      const tokenRecord = await prisma.passwordResetToken.findFirst({
        where: { userId: user.id }, orderBy: { createdAt: "desc" },
      });
      expect(tokenRecord).not.toBeNull();

      await page.goto(`/reset-password?token=${tokenRecord!.token}`);
      const newPassword = "NewPassSicura123!";
      await page.getByPlaceholder("Minimo 8 caratteri").fill(newPassword);
      await page.getByPlaceholder("Ripeti la password").fill(newPassword);
      await page.getByRole("button", { name: /Imposta nuova password/i }).click();
      await expect(page.getByText(/Password aggiornata/i)).toBeVisible({ timeout: 10_000 });

      const updated = await prisma.user.findUnique({ where: { id: user.id }, select: { passwordHash: true } });
      const match = await bcrypt.compare(newPassword, updated!.passwordHash!);
      expect(match).toBe(true);

      const usedToken = await prisma.passwordResetToken.findUnique({ where: { id: tokenRecord!.id } });
      expect(usedToken!.usedAt).not.toBeNull();
    } finally {
      await deleteTestUser(user.id);
    }
  });

  test("reset-password: token scaduto → errore", async ({ page }) => {
    const user = await createTestUser({ onboarded: true });
    try {
      const expired = await prisma.passwordResetToken.create({
        data: {
          token: "expired_" + Math.random().toString(36).slice(2) + "x".repeat(32),
          userId: user.id,
          expiresAt: new Date(Date.now() - 60 * 1000),
        },
      });
      await page.goto(`/reset-password?token=${expired.token}`);
      await page.getByPlaceholder("Minimo 8 caratteri").fill("PasswordOK123!");
      await page.getByPlaceholder("Ripeti la password").fill("PasswordOK123!");
      await page.getByRole("button", { name: /Imposta nuova password/i }).click();
      await expect(page.getByText(/scaduto/i)).toBeVisible({ timeout: 10_000 });
    } finally {
      await deleteTestUser(user.id);
    }
  });

  test("verify-email: GET con token valido → emailVerified settato + redirect status=ok", async ({ page }) => {
    const user = await createTestUser({ onboarded: true });
    try {
      const tokenRecord = await prisma.emailVerificationToken.create({
        data: {
          token: "verify_" + Math.random().toString(36).slice(2) + "y".repeat(32),
          userId: user.id,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        },
      });
      await page.goto(`/api/auth/verify-email?token=${tokenRecord.token}`);
      await page.waitForURL(/\/verify-email\?status=ok/, { timeout: 10_000 });
      await expect(page.getByText(/Email verificata/i)).toBeVisible();

      const updated = await prisma.user.findUnique({ where: { id: user.id }, select: { emailVerified: true } });
      expect(updated!.emailVerified).not.toBeNull();
    } finally {
      await deleteTestUser(user.id);
    }
  });

  test("signup: invia welcome + verify email (dev mode logged)", async ({ page }) => {
    const email = `e2e+signup-${Math.random().toString(36).slice(2, 10)}@fitai-test.local`;
    try {
      await page.goto("/registrati");
      await page.getByPlaceholder("Mario Rossi").fill("Signup Hook Test");
      await page.getByPlaceholder("nome@email.com").fill(email);
      await page.getByPlaceholder("Minimo 8 caratteri").fill("PassSicura123!");
      await page.getByPlaceholder("Ripeti la password").fill("PassSicura123!");
      await page.getByRole("button", { name: "Crea account" }).click();
      await page.waitForURL(/\/onboarding/, { timeout: 15_000 });

      const u = await prisma.user.findUnique({ where: { email } });
      expect(u).not.toBeNull();

      await page.waitForTimeout(500);
      const verifyToken = await prisma.emailVerificationToken.findFirst({
        where: { userId: u!.id },
      });
      expect(verifyToken).not.toBeNull();
    } finally {
      await deleteTestUser(email);
    }
  });
});
