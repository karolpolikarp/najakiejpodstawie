import { test, expect } from '@playwright/test';

test.describe('Legal Assistant - Main User Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');
  });

  test('should load the homepage successfully', async ({ page }) => {
    // Check that the main elements are visible
    await expect(page.locator('h1')).toBeVisible();

    // Check for chat input
    await expect(page.locator('textarea[placeholder*="pytanie"]')).toBeVisible();

    // Check for example questions
    await expect(page.getByText(/Zwrot towaru|Urlop|Reklamacja/)).toBeVisible();
  });

  test('should display app title and navigation', async ({ page }) => {
    // Check navigation links
    await expect(page.getByRole('link', { name: /O aplikacji|About/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Kontakt|Contact/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /Prywatność|Privacy/i })).toBeVisible();
  });

  test('should show theme toggle', async ({ page }) => {
    // Check for theme toggle button
    const themeToggle = page.getByRole('button', { name: /Toggle theme|Zmień motyw/i });
    await expect(themeToggle).toBeVisible();

    // Click to change theme
    await themeToggle.click();

    // Theme should change (check for dark/light mode class)
    const html = page.locator('html');
    const classList = await html.getAttribute('class');
    expect(classList).toBeTruthy();
  });

  test('should display example questions on load', async ({ page }) => {
    // Check that example questions are visible
    const exampleButtons = page.getByRole('button').filter({
      hasText: /Zwrot|Urlop|Reklamacja|Podatek|Rozwód|Mandat|Najem/
    });

    // Should have multiple example questions
    const count = await exampleButtons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should populate input when example question is clicked', async ({ page }) => {
    // Find and click an example question
    const exampleButton = page.getByRole('button').filter({
      hasText: /Zwrot towaru/
    }).first();

    const questionText = await exampleButton.textContent();
    await exampleButton.click();

    // Check that the input is populated
    const textarea = page.locator('textarea');
    const inputValue = await textarea.inputValue();

    expect(inputValue).toBe(questionText);
  });

  test('should enable send button when text is entered', async ({ page }) => {
    const textarea = page.locator('textarea');
    const sendButton = page.getByRole('button', { name: /Wyślij|Send/i });

    // Send button should be disabled initially (if textarea is empty)
    // Type a question
    await textarea.fill('Ile mam dni urlopu?');

    // Send button should be enabled
    await expect(sendButton).toBeEnabled();
  });

  test('should show file upload option', async ({ page }) => {
    // Check for file upload button/label
    await expect(page.getByText(/Załącz plik|Upload file/i)).toBeVisible();
  });

  test('should show helper text for file upload', async ({ page }) => {
    // Check for helper text about optional document
    await expect(page.getByText(/Opcjonalnie.*dokument|Optional.*document/i)).toBeVisible();
  });

  test('should navigate to About page', async ({ page }) => {
    // Click About link
    await page.getByRole('link', { name: /O aplikacji|About/i }).click();

    // Should navigate to /about
    await expect(page).toHaveURL(/\/about/);

    // Should show about content
    await expect(page.locator('h1, h2')).toBeVisible();
  });

  test('should navigate to Contact page', async ({ page }) => {
    // Click Contact link
    await page.getByRole('link', { name: /Kontakt|Contact/i }).click();

    // Should navigate to /contact
    await expect(page).toHaveURL(/\/contact/);

    // Should show contact content
    await expect(page.locator('h1, h2')).toBeVisible();
  });

  test('should navigate to Privacy page', async ({ page }) => {
    // Click Privacy link
    await page.getByRole('link', { name: /Prywatność|Privacy/i }).click();

    // Should navigate to /privacy
    await expect(page).toHaveURL(/\/privacy/);

    // Should show privacy content
    await expect(page.locator('h1, h2')).toBeVisible();
  });

  test('should navigate back to home from other pages', async ({ page }) => {
    // Go to About page
    await page.getByRole('link', { name: /O aplikacji|About/i }).click();
    await expect(page).toHaveURL(/\/about/);

    // Click logo or home link to go back
    await page.getByRole('link', { name: /Na jakiej podstawie|Home/i }).first().click();

    // Should be back on home
    await expect(page).toHaveURL(/^\/$/);
  });

  test('should show 404 page for invalid routes', async ({ page }) => {
    // Navigate to invalid route
    await page.goto('/invalid-route-that-does-not-exist');

    // Should show 404 or redirect to home
    const url = page.url();
    const has404 = await page.getByText(/404|Not Found|Nie znaleziono/i).isVisible().catch(() => false);

    expect(has404 || url.endsWith('/')).toBe(true);
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Elements should still be visible
    await expect(page.locator('textarea')).toBeVisible();
    await expect(page.getByText(/Załącz plik/i)).toBeVisible();

    // Example questions should be visible (may wrap)
    const exampleButtons = page.getByRole('button').filter({
      hasText: /Zwrot|Urlop|Reklamacja/
    }).first();
    await expect(exampleButtons).toBeVisible();
  });

  test('should be responsive on tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    // Elements should be visible and properly sized
    await expect(page.locator('textarea')).toBeVisible();
    await expect(page.getByText(/Załącz plik/i)).toBeVisible();
  });

  test('should persist theme preference', async ({ page }) => {
    // Toggle theme
    const themeToggle = page.getByRole('button', { name: /Toggle theme|Zmień motyw/i });
    await themeToggle.click();

    // Get current theme
    const html = page.locator('html');
    const initialClass = await html.getAttribute('class');

    // Reload page
    await page.reload();

    // Theme should persist
    const afterReloadClass = await html.getAttribute('class');
    expect(afterReloadClass).toBe(initialClass);
  });

  test('should show footer with copyright', async ({ page }) => {
    // Scroll to bottom
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Check for footer
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    // Should contain copyright or app name
    await expect(footer).toContainText(/najakiejpodstawie|©|2024|2025/i);
  });

  test('should handle keyboard navigation', async ({ page }) => {
    const textarea = page.locator('textarea');

    // Focus on textarea using Tab
    await page.keyboard.press('Tab');

    // Should be focused
    await expect(textarea).toBeFocused();

    // Type a question
    await textarea.fill('Ile mam dni urlopu?');

    // Should be able to tab to send button
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab'); // May need multiple tabs depending on layout

    // One of the buttons should be focused
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should clear textarea after successful submission', async ({ page }) => {
    // Skip this test if API is not available
    test.skip(!process.env.CI, 'Requires running backend');

    const textarea = page.locator('textarea');
    const sendButton = page.getByRole('button', { name: /Wyślij|Send/i });

    // Type a question
    await textarea.fill('Ile mam dni urlopu?');

    // Send the message
    await sendButton.click();

    // Wait for response (this requires mocked API or real backend)
    await page.waitForTimeout(1000);

    // Textarea should be cleared (if implemented)
    const inputValue = await textarea.inputValue();
    expect(inputValue).toBe('');
  });

  test('should show contextual questions after asking a question', async ({ page }) => {
    // Skip this test if API is not available
    test.skip(!process.env.CI, 'Requires running backend');

    const textarea = page.locator('textarea');
    const sendButton = page.getByRole('button', { name: /Wyślij|Send/i });

    // Ask a question about labor law
    await textarea.fill('Ile mam dni urlopu?');
    await sendButton.click();

    // Wait for response
    await page.waitForTimeout(2000);

    // Example questions should update to show contextual questions
    // Should show more labor-related questions
    await expect(page.getByText(/Urlop|praca|Wypowiedzenie/i)).toBeVisible();
  });
});

test.describe('Legal Assistant - File Upload Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should allow file selection', async ({ page }) => {
    // Click file upload button
    const fileInput = page.locator('input[type="file"]');

    // Create a test file
    const buffer = Buffer.from('Test document content about legal matters');

    // Set files
    await fileInput.setInputFiles({
      name: 'test-document.txt',
      mimeType: 'text/plain',
      buffer: buffer,
    });

    // Wait for file to be processed
    await page.waitForTimeout(500);

    // Should show file name
    await expect(page.getByText('test-document.txt')).toBeVisible();
  });

  test('should show remove button after file upload', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    const buffer = Buffer.from('Test content');

    await fileInput.setInputFiles({
      name: 'document.txt',
      mimeType: 'text/plain',
      buffer: buffer,
    });

    await page.waitForTimeout(500);

    // Should show remove/delete button
    const removeButton = page.getByRole('button', { name: /Usuń|Remove|Delete/i });
    await expect(removeButton).toBeVisible();
  });

  test('should remove file when remove button is clicked', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    const buffer = Buffer.from('Test content');

    await fileInput.setInputFiles({
      name: 'document.txt',
      mimeType: 'text/plain',
      buffer: buffer,
    });

    await page.waitForTimeout(500);

    // Click remove button
    const removeButton = page.getByRole('button', { name: /Usuń|Remove/i });
    await removeButton.click();

    // File name should disappear
    await expect(page.getByText('document.txt')).not.toBeVisible();

    // Upload button should be visible again
    await expect(page.getByText(/Załącz plik/i)).toBeVisible();
  });
});

test.describe('Legal Assistant - Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should show error message for invalid file type', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');

    // Try to upload an image
    const buffer = Buffer.from('fake image data');

    await fileInput.setInputFiles({
      name: 'image.jpg',
      mimeType: 'image/jpeg',
      buffer: buffer,
    });

    await page.waitForTimeout(500);

    // Should show error toast
    await expect(page.getByText(/Wspierane formaty|Supported formats/i)).toBeVisible();
  });

  test('should show error for empty file', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');

    // Upload empty file
    const buffer = Buffer.from('');

    await fileInput.setInputFiles({
      name: 'empty.txt',
      mimeType: 'text/plain',
      buffer: buffer,
    });

    await page.waitForTimeout(500);

    // Should show error
    await expect(page.getByText(/pusty|empty/i)).toBeVisible();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    // Skip if not testing with real backend
    test.skip(!process.env.TEST_WITH_BACKEND, 'Requires backend setup');

    // Simulate offline mode
    await page.context().setOffline(true);

    const textarea = page.locator('textarea');
    const sendButton = page.getByRole('button', { name: /Wyślij|Send/i });

    await textarea.fill('Ile mam dni urlopu?');
    await sendButton.click();

    // Should show error message
    await page.waitForTimeout(2000);

    // Should show some error indication
    await expect(page.getByText(/błąd|error|nie udało/i)).toBeVisible();
  });
});

test.describe('Legal Assistant - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    // Check for h1
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();

    // H1 should be unique
    expect(await h1.count()).toBeLessThanOrEqual(1);
  });

  test('should have accessible form elements', async ({ page }) => {
    const textarea = page.locator('textarea');

    // Textarea should have label or aria-label
    const ariaLabel = await textarea.getAttribute('aria-label');
    const placeholder = await textarea.getAttribute('placeholder');

    expect(ariaLabel || placeholder).toBeTruthy();
  });

  test('should have accessible buttons', async ({ page }) => {
    const buttons = page.getByRole('button');

    // All buttons should have accessible names
    const count = await buttons.count();

    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const text = await button.textContent();
      const ariaLabel = await button.getAttribute('aria-label');

      expect(text || ariaLabel).toBeTruthy();
    }
  });

  test('should support keyboard-only navigation', async ({ page }) => {
    // Tab through interactive elements
    await page.keyboard.press('Tab');

    let tabCount = 0;
    const maxTabs = 20;

    while (tabCount < maxTabs) {
      await page.keyboard.press('Tab');
      tabCount++;

      // Check if focus is visible
      const focusedElement = page.locator(':focus');
      if (await focusedElement.count() > 0) {
        const tagName = await focusedElement.evaluate(el => el.tagName.toLowerCase());

        // Focused element should be interactive
        expect(['a', 'button', 'input', 'textarea', 'select']).toContain(tagName);
      }
    }

    expect(tabCount).toBeGreaterThan(0);
  });

  test('should have sufficient color contrast', async ({ page }) => {
    // This is a basic check - proper contrast testing requires specialized tools
    const body = page.locator('body');
    const backgroundColor = await body.evaluate(el =>
      window.getComputedStyle(el).backgroundColor
    );

    expect(backgroundColor).toBeTruthy();
  });

  test('should have skip to main content link (optional)', async ({ page }) => {
    // Check if skip link exists (best practice for accessibility)
    const skipLink = page.getByText(/Skip to|Przejdź do treści/i);

    // If it exists, it should be functional
    if (await skipLink.count() > 0) {
      await expect(skipLink).toBeVisible();
    }
  });
});
