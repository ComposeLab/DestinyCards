import { test, expect } from '@playwright/test';
import { createRoom } from './helpers';

test.describe('Animations and Visual Elements', () => {
  test('should render the perspective table surface', async ({ page }) => {
    await createRoom(page);
    const table = page.getByTestId('table-surface');
    await expect(table).toBeVisible();
    // Table should have the wooden gradient style
    await expect(table).toHaveCSS('border-radius', '16px');
  });

  test('should show my-seat with cards area', async ({ page }) => {
    await createRoom(page);
    await expect(page.getByTestId('my-seat')).toBeVisible();
  });

  test('should show pot display with animated counter', async ({ page }) => {
    await createRoom(page);
    const pot = page.getByTestId('pot-display');
    await expect(pot).toBeVisible();
    await expect(pot).toContainText('POT');
  });

  test('should show win overlay when round ends', async ({ page }) => {
    await createRoom(page, 'Host');

    // Start game
    const startBtn = page.getByTestId('start-game-button');
    if (await startBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await startBtn.click();
    }

    // Keep folding until we see a win overlay (bots will play)
    for (let i = 0; i < 10; i++) {
      const foldBtn = page.getByTestId('fold-button');
      if (await foldBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await foldBtn.click();
        break;
      }
      await page.waitForTimeout(1000);
    }

    // Win overlay should appear after round ends
    const winOverlay = page.getByTestId('win-overlay');
    await expect(winOverlay).toBeVisible({ timeout: 15000 });
  });
});
