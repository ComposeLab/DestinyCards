import { test, expect } from '@playwright/test';
import { createRoom, getRoomCode, joinRoom } from './helpers';

test.describe('Room Management', () => {
  test('should create a room and see the game table', async ({ page }) => {
    await createRoom(page);
    await expect(page.getByTestId('table-surface')).toBeVisible();
    await expect(page.getByTestId('my-seat')).toBeVisible();
  });

  test('should show start game button for host', async ({ page }) => {
    await createRoom(page);
    // With bots, start button should appear
    await expect(page.getByTestId('start-game-button')).toBeVisible({ timeout: 5000 });
  });

  test('should show pot display on the table', async ({ page }) => {
    await createRoom(page);
    await expect(page.getByTestId('pot-display')).toBeVisible();
  });

  test('should allow leaving a room', async ({ page }) => {
    await createRoom(page);
    await page.getByRole('button', { name: /leave/i }).click();
    await expect(page).toHaveURL('/');
  });
});
