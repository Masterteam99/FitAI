import { test, expect, createTestUser, deleteTestUser, loginViaUI, prisma } from "./fixtures";

test.describe("Nutrizione", () => {
  test("aggiungi pasto via UI → macros salvati correttamente (bug fix M6.1)", async ({ page }) => {
    const user = await createTestUser({ onboarded: true });
    try {
      await loginViaUI(page, user.email, user.password);
      await page.goto("/nutrizione");

      await page.getByRole("button", { name: /^Aggiungi$/ }).click();
      await page.getByPlaceholder("Nome alimento *").fill("Pasta integrale");
      await page.getByPlaceholder("Calorie *").fill("450");
      await page.getByPlaceholder("Proteine (g)").fill("18");
      await page.getByPlaceholder("Carboidrati (g)").fill("85");
      await page.getByPlaceholder("Grassi (g)").fill("3");
      await page.locator('form, .space-y-3').getByRole("button", { name: /^Aggiungi$/ }).click();

      await expect(page.getByText("Pasta integrale")).toBeVisible({ timeout: 10_000 });

      const log = await prisma.nutritionLog.findFirst({ where: { userId: user.id, foodName: "Pasta integrale" } });
      expect(log).not.toBeNull();
      expect(log!.calories).toBe(450);
      expect(log!.proteinG).toBe(18);
      expect(log!.carbsG).toBe(85);
      expect(log!.fatG).toBe(3);
    } finally {
      await deleteTestUser(user.id);
    }
  });

  test("API nutrition: POST + GET ritornano totali corretti", async ({ page, request }) => {
    const user = await createTestUser({ onboarded: true });
    try {
      await loginViaUI(page, user.email, user.password);
      const cookies = await page.context().cookies();
      const cookieHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");

      const today = new Date().toISOString().slice(0, 10);
      const post = await request.post("http://localhost:3000/api/nutrition", {
        headers: { cookie: cookieHeader, "content-type": "application/json" },
        data: { date: today, mealType: "BREAKFAST", foodName: "Yogurt greco", calories: 150, proteinG: 15, carbsG: 8, fatG: 5 },
      });
      expect(post.status()).toBe(201);

      const get = await request.get(`http://localhost:3000/api/nutrition?date=${today}`, {
        headers: { cookie: cookieHeader },
      });
      expect(get.status()).toBe(200);
      const data = await get.json();
      expect(data.totals.calories).toBeGreaterThanOrEqual(150);
      expect(data.logs.find((l: { foodName: string }) => l.foodName === "Yogurt greco")).toBeTruthy();
    } finally {
      await deleteTestUser(user.id);
    }
  });
});
