import { test, expect, createTestUser, deleteTestUser, prisma } from "./fixtures";
import { faker } from "@faker-js/faker";

test.describe("Auth", () => {
  test("signup: nuovo utente → redirect onboarding step1", async ({ page }) => {
    const email = `e2e+${faker.string.alphanumeric(10).toLowerCase()}@fitai-test.local`;
    const password = "PassSicura123!";
    const name = faker.person.fullName();

    try {
      await page.goto("/registrati");
      await page.getByPlaceholder("Mario Rossi").fill(name);
      await page.getByPlaceholder("nome@email.com").fill(email);
      await page.getByPlaceholder("Minimo 8 caratteri").fill(password);
      await page.getByPlaceholder("Ripeti la password").fill(password);
      await page.getByRole("button", { name: "Crea account" }).click();

      await page.waitForURL(/\/onboarding/, { timeout: 15_000 });
      expect(page.url()).toMatch(/\/onboarding/);

      const user = await prisma.user.findUnique({ where: { email } });
      expect(user).not.toBeNull();
      expect(user!.onboardingCompleted).toBe(false);
    } finally {
      await deleteTestUser(email);
    }
  });

  test("login: credenziali corrette → dashboard", async ({ page }) => {
    const user = await createTestUser({ onboarded: true });
    try {
      await page.goto("/login");
      await page.getByPlaceholder("nome@email.com").fill(user.email);
      await page.getByPlaceholder("••••••••").fill(user.password);
      await page.getByRole("button", { name: "Accedi" }).click();

      await page.waitForURL(/\/dashboard/, { timeout: 15_000 });
      await expect(page.getByText(/Ciao,/)).toBeVisible();
    } finally {
      await deleteTestUser(user.id);
    }
  });

  test("login: credenziali errate → messaggio errore", async ({ page }) => {
    const user = await createTestUser({ onboarded: true });
    try {
      await page.goto("/login");
      await page.getByPlaceholder("nome@email.com").fill(user.email);
      await page.getByPlaceholder("••••••••").fill("PasswordSbagliata123");
      await page.getByRole("button", { name: "Accedi" }).click();

      await expect(page.getByText("Email o password non corretti.")).toBeVisible({ timeout: 10_000 });
      expect(page.url()).toContain("/login");
    } finally {
      await deleteTestUser(user.id);
    }
  });
});
