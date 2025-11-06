# Testing Guide

This document provides comprehensive information about the testing setup and how to run tests for the Legal Assistant application.

## Table of Contents

- [Testing Stack](#testing-stack)
- [Running Tests](#running-tests)
- [Unit Tests](#unit-tests)
- [Integration Tests](#integration-tests)
- [End-to-End Tests](#end-to-end-tests)
- [Test Coverage](#test-coverage)
- [Writing Tests](#writing-tests)
- [CI/CD Integration](#cicd-integration)

## Testing Stack

This project uses a modern testing stack:

### Unit & Integration Testing
- **Vitest** - Fast unit test framework built on Vite
- **@testing-library/react** - React component testing utilities
- **@testing-library/user-event** - User interaction simulation
- **@testing-library/jest-dom** - Custom Jest matchers for DOM nodes
- **jsdom** - DOM implementation for Node.js

### End-to-End Testing
- **Playwright** - Browser automation for E2E tests
- Supports Chromium, Firefox, and WebKit
- Mobile and desktop viewports

## Running Tests

### Unit Tests

```bash
# Run all unit tests in watch mode
npm test

# Run tests once (useful for CI)
npm run test:run

# Run tests with UI (visual test runner)
npm run test:ui

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### End-to-End Tests

First, install Playwright browsers (only needed once):

```bash
npm run playwright:install
```

Then run E2E tests:

```bash
# Run E2E tests (headless)
npm run test:e2e

# Run E2E tests with UI mode (recommended for development)
npm run test:e2e:ui

# Run E2E tests in headed mode (see browser)
npm run test:e2e:headed

# Debug E2E tests
npm run test:e2e:debug
```

### Run All Tests

```bash
# Run unit tests and E2E tests
npm run test:run && npm run test:e2e
```

## Unit Tests

Unit tests are located alongside the components they test:

```
src/
  components/
    ChatMessage.tsx
    ChatMessage.test.tsx          # Unit tests for ChatMessage
    ExampleQuestions.tsx
    ExampleQuestions.test.tsx     # Unit tests for ExampleQuestions
    FileUpload.tsx
    FileUpload.test.tsx           # Unit tests for FileUpload
```

### Covered Components

#### ChatMessage Component
- ✅ User and assistant message rendering
- ✅ Message parsing and section formatting
- ✅ Content formatting (lists, paragraphs)
- ✅ Copy functionality
- ✅ Error message detection
- ✅ Retry and remove functionality
- ✅ Memoization

**Location:** `src/components/ChatMessage.test.tsx`

#### ExampleQuestions Component
- ✅ Basic rendering of example questions
- ✅ Category detection based on keywords
- ✅ Contextual questions based on user's last question
- ✅ Question selection handling
- ✅ Disabled state
- ✅ Memoization
- ✅ All law categories (Consumer, Labor, Rental, Tax, Family, Criminal, Traffic)

**Location:** `src/components/ExampleQuestions.test.tsx`

#### FileUpload Component
- ✅ Upload button rendering
- ✅ File selection and validation
- ✅ File type validation (TXT, PDF)
- ✅ File size validation (max 5MB)
- ✅ Empty file detection
- ✅ Content truncation for large files
- ✅ File removal
- ✅ Loading states
- ✅ Error handling

**Location:** `src/components/FileUpload.test.tsx`

## Integration Tests

Integration tests verify the interaction between multiple components and external services.

### Edge Function Integration Tests

Tests for the Supabase Edge Function that handles AI requests.

**Vitest Version:** `src/test/edge-function.integration.test.ts`
**Deno Version:** `supabase/functions/legal-assistant/index.test.ts`

#### Covered Functionality
- ✅ CORS configuration
- ✅ Request/response format
- ✅ Legal question validation
- ✅ Non-legal question rejection
- ✅ File context processing
- ✅ File context truncation
- ✅ Error handling (rate limits, auth errors)
- ✅ Response structure validation

**Note:** Integration tests are marked as `skip: true` by default. To run them:
1. Start the Edge Function locally: `supabase functions serve legal-assistant`
2. Update tests to set `skip: false`
3. Run: `npm run test:run edge-function.integration.test.ts`

## End-to-End Tests

E2E tests simulate real user interactions in a browser environment.

**Location:** `e2e/main-flows.spec.ts`

### Covered User Flows

#### Main User Flows
- ✅ Homepage loading
- ✅ App title and navigation
- ✅ Theme toggle
- ✅ Example questions display
- ✅ Example question selection
- ✅ Send button state management
- ✅ File upload UI
- ✅ Navigation to About, Contact, Privacy pages
- ✅ 404 page handling
- ✅ Responsive design (mobile, tablet)
- ✅ Theme persistence
- ✅ Footer display
- ✅ Keyboard navigation

#### File Upload Flow
- ✅ File selection
- ✅ File display after upload
- ✅ File removal

#### Error Handling
- ✅ Invalid file type errors
- ✅ Empty file errors
- ✅ Network error handling

#### Accessibility
- ✅ Heading hierarchy
- ✅ Accessible form elements
- ✅ Accessible buttons
- ✅ Keyboard-only navigation
- ✅ Color contrast

## Test Coverage

Generate a coverage report:

```bash
npm run test:coverage
```

This will:
1. Run all unit tests
2. Generate coverage reports in multiple formats (text, JSON, HTML)
3. Create a `coverage/` directory with detailed HTML report

View the HTML report:

```bash
# Open in browser (adjust path for your OS)
open coverage/index.html
```

### Coverage Goals
- **Statements:** > 80%
- **Branches:** > 75%
- **Functions:** > 80%
- **Lines:** > 80%

### Coverage Exclusions
The following are excluded from coverage:
- `node_modules/`
- `src/test/` (test utilities)
- Configuration files (`*.config.*`)
- Mock data
- Type definitions (`*.d.ts`)

## Writing Tests

### Unit Test Example

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('should handle click events', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<MyComponent onClick={handleClick} />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';

test('should navigate to about page', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('link', { name: /About/i }).click();

  await expect(page).toHaveURL(/\/about/);
  await expect(page.locator('h1')).toBeVisible();
});
```

### Best Practices

1. **Test Behavior, Not Implementation**
   - Focus on what the user sees and does
   - Avoid testing internal state or implementation details

2. **Use Testing Library Queries**
   - Prefer `getByRole`, `getByLabelText`, `getByText`
   - Avoid `getByTestId` unless necessary

3. **User-Centric Tests**
   - Simulate real user interactions
   - Use `userEvent` instead of `fireEvent`

4. **Async Operations**
   - Use `waitFor` for async state changes
   - Use `findBy` queries for elements that appear asynchronously

5. **Mock External Dependencies**
   - Mock API calls
   - Mock third-party libraries when needed
   - Keep mocks simple and focused

6. **Keep Tests Independent**
   - Each test should run in isolation
   - Use `beforeEach` for setup
   - Clean up after tests

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run unit tests
        run: npm run test:run

      - name: Generate coverage
        run: npm run test:coverage

      - name: Install Playwright browsers
        run: npm run playwright:install

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: |
            coverage/
            playwright-report/
```

## Troubleshooting

### Common Issues

#### Vitest: "Cannot find module"
- Ensure `vite.config.ts` has the correct path alias configuration
- Check that TypeScript paths match Vite aliases

#### Playwright: Browsers not installed
```bash
npm run playwright:install
```

#### Playwright: Connection refused
- Ensure dev server is running: `npm run dev`
- Check `playwright.config.ts` for correct `baseURL`

#### Tests timing out
- Increase timeout in test: `test('...', { timeout: 60000 }, async () => {})`
- Check for unresolved promises
- Verify async operations are properly awaited

#### Coverage not generating
- Ensure `@vitest/coverage-v8` is installed
- Check `vite.config.ts` has coverage configuration

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)
- [React Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Contributing

When adding new features:
1. Write unit tests for new components
2. Add integration tests for complex interactions
3. Add E2E tests for new user flows
4. Ensure coverage doesn't decrease
5. Run all tests before submitting PR

```bash
# Pre-commit checklist
npm run lint           # Check code quality
npm run test:run      # Run unit tests
npm run test:coverage # Check coverage
npm run test:e2e      # Run E2E tests
npm run build         # Verify build works
```
