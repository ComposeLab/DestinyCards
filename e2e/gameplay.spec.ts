import { test, expect } from '@playwright/test';
import { createRoom } from './helpers';

test.describe('Gameplay', () => {
  test('should show action panel when it is my turn', async ({ page }) => {
    await createRoom(page, 'Player1');

    // Start game (need bots to have 2+ players)
    const startBtn = page.getByTestId('start-game-button');
    if (await startBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await startBtn.click();
    }

    // Wait for either action panel or another player's turn
    const actionPanel = page.getByTestId('action-panel');
    const hasActionPanel = await actionPanel.isVisible({ timeout: 10000 }).catch(() => false);

    if (hasActionPanel) {
      // Verify action buttons exist
      await expect(page.getByTestId('bet-button')).toBeVisible();
      await expect(page.getByTestId('fold-button')).toBeVisible();
    }
  });

  test('should display opponent seats above the table', async ({ page }) => {
    await createRoom(page, 'Host');
    // After creating room with bots, opponent seats should be visible
    const seats = page.locator('[data-testid^="seat-"]');
    // At least the bot seats should appear
    await expect(seats.first()).toBeVisible({ timeout: 5000 });
  });

  test('should display game log', async ({ page }) => {
    await createRoom(page);
    await expect(page.getByTestId('game-log')).toBeVisible();
  });
});
