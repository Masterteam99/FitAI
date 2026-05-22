import { test as base, type Page } from "@playwright/test";
import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../../src/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
export const prisma = new PrismaClient({ adapter });

export type TestUser = {
  id: string;
  email: string;
  password: string;
  name: string;
};

type CreateOptions = {
  onboarded?: boolean;
  fitnessLevel?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ATHLETE";
  primaryGoal?: "LOSE_WEIGHT" | "BUILD_MUSCLE" | "ENDURANCE" | "FLEXIBILITY" | "GENERAL_FITNESS" | "ATHLETIC_PERFORMANCE";
  isAdmin?: boolean;
};

export async function createTestUser(opts: CreateOptions = {}): Promise<TestUser> {
  const password = "TestPass123!";
  const email = `e2e+${faker.string.alphanumeric(10).toLowerCase()}@fitai-test.local`;
  const name = faker.person.fullName();
  const passwordHash = await bcrypt.hash(password, 4);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      isAdmin: opts.isAdmin ?? false,
      onboardingCompleted: opts.onboarded ?? false,
      fitnessLevel: opts.fitnessLevel ?? "BEGINNER",
      primaryGoal: opts.primaryGoal ?? "GENERAL_FITNESS",
      weightKg: 75,
      heightCm: 175,
      age: 30,
      gender: "male",
    },
  });

  return { id: user.id, email, password, name };
}

export async function deleteTestUser(emailOrId: string): Promise<void> {
  try {
    if (emailOrId.includes("@")) {
      await prisma.user.deleteMany({ where: { email: emailOrId } });
    } else {
      await prisma.user.deleteMany({ where: { id: emailOrId } });
    }
  } catch (err) {
    console.warn("[cleanup] delete failed:", err);
  }
}

export async function loginViaUI(page: Page, email: string, password: string): Promise<void> {
  await page.goto("/login");
  await dismissCookieBanner(page);
  await page.getByPlaceholder("nome@email.com").fill(email);
  await page.getByPlaceholder("••••••••").fill(password);
  await page.getByRole("button", { name: "Accedi" }).click();
  await page.waitForURL(/\/(dashboard|onboarding)/, { timeout: 15_000 });
}

export async function dismissCookieBanner(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.setItem("fitai-cookie-consent", JSON.stringify({ choice: "accepted", at: new Date().toISOString() }));
  });
}

type Fixtures = {
  testUser: TestUser;
  authedPage: Page;
};

export const test = base.extend<Fixtures>({
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      try {
        localStorage.setItem(
          "fitai-cookie-consent",
          JSON.stringify({ choice: "accepted", at: new Date().toISOString() }),
        );
      } catch {}
    });
    await use(page);
  },
  testUser: async ({}, use) => {
    const user = await createTestUser({ onboarded: true });
    await use(user);
    await deleteTestUser(user.id);
  },
  authedPage: async ({ page, testUser }, use) => {
    await loginViaUI(page, testUser.email, testUser.password);
    await use(page);
  },
});

export { expect } from "@playwright/test";
