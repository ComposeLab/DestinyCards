# E2E Test Patterns

## File Structure

```typescript
import { test, expect } from '<e2e-test-runner>';

test.describe('Feature Area', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the main view', async ({ page }) => {
    await expect(page.getByTestId('main-view')).toBeVisible();
  });

  test('should complete a user flow', async ({ page }) => {
    await page.getByTestId('action-btn').click();
    await page.getByTestId('name-input').fill('Test Name');
    await page.getByTestId('submit-btn').click();
    await expect(page.getByTestId('result-view')).toBeVisible();
  });
});
```

## Locator Patterns

Always prefer `data-testid` for element selection:

```typescript
// Preferred — stable and decoupled from UI text
page.getByTestId('action-btn')
page.getByTestId('player-seat-0')
page.getByTestId('status-display')

// Acceptable for text content assertions
page.getByText('Ready')
page.getByRole('button', { name: 'Submit' })
```

## Common Test Patterns

### Wait for Connection

```typescript
async function waitForConnection(page: Page) {
  await expect(page.getByTestId('connection-status')).toHaveText('connected', {
    timeout: 5000,
  });
}
```

### Multi-Client Setup

```typescript
async function setupTwoClients(browser: Browser) {
  const context1 = await browser.newContext();
  const context2 = await browser.newContext();
  const page1 = await context1.newPage();
  const page2 = await context2.newPage();

  // Client 1 creates a session
  await page1.goto('/lobby');
  await page1.getByTestId('create-btn').click();
  await page1.getByTestId('name-input').fill('Test Session');
  await page1.getByTestId('submit-btn').click();

  // Get session ID from URL
  const sessionId = page1.url().split('/session/')[1];

  // Client 2 joins
  await page2.goto(`/session/${sessionId}`);

  return { page1, page2, sessionId };
}
```

### Action Helpers

```typescript
async function performAction(page: Page, action: string) {
  await page.getByTestId(`action-${action}-btn`).click();
}
```

## Conventions

- Always use `data-testid` attributes for element selection
- Use `test.describe` to group related scenarios
- Use `test.beforeEach` for common navigation/setup
- Set appropriate timeouts for async waits (default 5s)
- Test at different viewport sizes for responsive tests
- Use `page.waitForTimeout()` sparingly — prefer waiting for elements
- Each test should be independent — don't rely on test order
- Use `test.slow()` for tests with many roundtrips

## Test ID Naming Convention

```
<component>-<element>[-<qualifier>]

Examples:
  main-view
  player-seat-0
  player-seat-1
  action-submit-btn
  action-cancel-btn
  status-display
  score-display
  name-input
  create-btn
  submit-btn
  item-list
  item-card-<id>
  connection-status
  activity-log
  history-summary
```
