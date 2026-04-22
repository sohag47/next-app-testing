import { test, expect } from "@playwright/test";

test.describe("Login Page", () => {
  test.beforeEach(async ({ page }) => {
    // Log console errors to help debug
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        console.log(`BROWSER ERROR: ${msg.text()}`);
      }
    });

    await page.goto("/");

    // Wait for the page to be ready
    await expect(page.locator("h1")).toBeVisible();

    // RELIABLE HYDRATION WAIT:
    // We wait for the 'data-ready' attribute to be 'true'.
    // If this fails, the 'onSubmit' handler won't be attached yet.
    const clientReady = page.locator('[data-testid="client-ready"]');
    await expect(clientReady).toHaveAttribute("data-ready", "true", {
      timeout: 15000,
    });
  });

  test("should display the login form with correct elements", async ({
    page,
  }) => {
    await expect(page.locator("h1")).toHaveText("Sign in to your account");
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign In" })).toBeVisible();
  });

  test("should have demo credentials pre-filled", async ({ page }) => {
    await expect(page.locator("#email")).toHaveValue("demo@example.com");
    await expect(page.locator("#password")).toHaveValue("password123");
  });

  test("should fail if the API response message does not match", async ({
    page,
  }) => {
    // 1. Remove page.route if you want to test your REAL API (POST function).
    // If you keep page.route, it will ALWAYS match because you are defining the answer.

    await page.fill("#email", "demo@example.com");
    await page.fill("#password", "password123");

    // 2. Setup the listener for the response
    const responsePromise = page.waitForResponse("**/api/login");

    await page.getByRole("button", { name: "Sign In" }).click();

    // Check loading state while waiting for response
    await expect(
      page.getByRole("button", { name: "Signing In..." }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Signing In..." }),
    ).toBeDisabled();

    // 3. Wait for the API to finish
    const response = await responsePromise;
    const responseBody = await response.json();

    // 4. ASSERTION: This will fail the test if the message is not exactly what you expect
    // For your real API, this should be: "Fake API login successful. Welcome back!"
    expect(responseBody.message).toBe("Login Successfully");
    expect(responseBody.data).toMatchObject({
      id: 1,
      name: "Demo",
      email: "demo@example.com",
      token: expect.any(String),
    });

    // 5. Also check the UI matches the API data
    const uiMessage = page.locator('[aria-live="polite"]');
    await expect(uiMessage).toBeVisible();
    await expect(uiMessage).toHaveText(responseBody.message);
    await expect(uiMessage).toHaveClass(/text-emerald-700/);
    await expect(page.locator("#password")).toHaveValue("");
  });

  // test("should handle a successful login with mocked API", async ({ page }) => {
  //   const successMessage = "Success! You are now logged in.";

  //   await page.route("**/api/login", async (route) => {
  //     // Add a slight delay to ensure we can catch the loading state
  //     await new Promise((resolve) => setTimeout(resolve, 500));
  //     await route.fulfill({
  //       status: 200,
  //       contentType: "application/json",
  //       body: JSON.stringify({ message: successMessage }),
  //     });
  //   });

  //   await page.fill("#email", "user@example.com");
  //   await page.fill("#password", "password123");

  //   // Click and wait for the request/response
  //   const loginResponse = page.waitForResponse("**/api/login");
  //   await page.getByRole("button", { name: "Sign In" }).click();

  //   // Check loading state while waiting for response
  //   await expect(
  //     page.getByRole("button", { name: "Signing In..." }),
  //   ).toBeVisible();
  //   await expect(
  //     page.getByRole("button", { name: "Signing In..." }),
  //   ).toBeDisabled();

  //   await loginResponse;

  //   const message = page.locator('[aria-live="polite"]');
  //   await expect(message).toBeVisible();
  //   await expect(message).toHaveText(successMessage);
  //   await expect(message).toHaveClass(/text-emerald-700/);
  //   await expect(page.locator("#password")).toHaveValue("");
  // });

  test("should handle login failure (401)", async ({ page }) => {
    const errorMessage = "Invalid credentials.";

    await page.route("**/api/login", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ message: errorMessage }),
      });
    });

    await page.fill("#email", "wrong@example.com");
    await page.fill("#password", "wrong-password");

    const loginResponse = page.waitForResponse("**/api/login");
    await page.getByRole("button", { name: "Sign In" }).click();
    await loginResponse;

    const message = page.locator('[aria-live="polite"]');
    await expect(message).toBeVisible();
    await expect(message).toHaveText(errorMessage);
    await expect(message).toHaveClass(/text-rose-700/);
  });

  test("should handle server/network errors", async ({ page }) => {
    await page.route("**/api/login", (route) => route.abort("failed"));

    await page.getByRole("button", { name: "Sign In" }).click();

    const message = page.locator('[aria-live="polite"]');
    await expect(message).toHaveText(
      "Unable to reach the server. Please try again.",
    );
    await expect(message).toHaveClass(/text-rose-700/);
  });

  test("should validate required fields", async ({ page }) => {
    await page.fill("#email", "");
    await page.fill("#password", "");
    await page.getByRole("button", { name: "Sign In" }).click();

    const emailInput = page.locator("#email");
    const isInvalid = await emailInput.evaluate(
      (el: HTMLInputElement) => !el.checkValidity(),
    );
    expect(isInvalid).toBe(true);
  });

  test("should focus the correct input when labels are clicked", async ({
    page,
  }) => {
    // Click label and check focus
    await page.getByText("Email", { exact: true }).click();
    await expect(page.locator("#email")).toBeFocused();

    await page.getByText("Password", { exact: true }).click();
    await expect(page.locator("#password")).toBeFocused();
  });
});
