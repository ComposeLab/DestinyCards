import { test, expect } from '@playwright/test';
import { createRoom } from './helpers';

test.describe('Settings', () => {
  test('should have a sound toggle button', async ({ page }) => {
    await createRoom(page);
    const toggle = page.getByTestId('sound-toggle');
    await expect(toggle).toBeVisible();
    await expect(toggle).toContainText('Sound ON');
  });

  test('should toggle sound state', async ({ page }) => {
    await createRoom(page);
    const toggle = page.getByTestId('sound-toggle');

    await toggle.click();
    await expect(toggle).toContainText('Sound OFF');

    await toggle.click();
    await expect(toggle).toContainText('Sound ON');
  });
});
