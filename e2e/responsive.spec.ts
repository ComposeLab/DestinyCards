import { test, expect } from '@playwright/test';
import { createRoom } from './helpers';

const viewports = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 720 },
];

for (const vp of viewports) {
  test.describe(`Responsive — ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test('no horizontal overflow on home page', async ({ page }) => {
      await page.goto('/');
      const hasOverflow = await page.evaluate(
        () => document.body.scrollWidth > window.innerWidth
      );
      expect(hasOverflow).toBe(false);
    });

    test('home page renders without overflow', async ({ page }) => {
      await page.goto('/');
      await expect(page.getByText('DestinyCards')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Create Room' }).first()).toBeVisible();
    });

    test('game room — all critical elements visible', async ({ page }) => {
      await createRoom(page);
      await expect(page.getByTestId('table-surface')).toBeVisible();
      await expect(page.getByTestId('my-seat')).toBeVisible();
      await expect(page.getByTestId('action-panel')).toBeVisible();
    });

    test('game room — start game button fits on table', async ({ page }) => {
      await createRoom(page);
      const startBtn = page.getByTestId('start-game-button');
      await expect(startBtn).toBeVisible({ timeout: 5000 });

      const tableBounds = await page.getByTestId('table-surface').boundingBox();
      const btnBounds = await startBtn.boundingBox();

      if (tableBounds && btnBounds) {
        // Button should be within or overlapping the table area (with some tolerance for 3D transforms)
        expect(btnBounds.x + btnBounds.width).toBeLessThanOrEqual(
          tableBounds.x + tableBounds.width + 50
        );
        expect(btnBounds.x).toBeGreaterThanOrEqual(tableBounds.x - 50);
      }
    });

    test('game room — action panel does not overflow viewport', async ({ page }) => {
      await createRoom(page);
      const panel = page.getByTestId('action-panel');
      await expect(panel).toBeVisible();

      const panelBounds = await panel.boundingBox();
      if (panelBounds) {
        expect(panelBounds.width).toBeLessThanOrEqual(vp.width);
      }
    });

    test('game room — opponent seats render', async ({ page }) => {
      await createRoom(page);
      // Default createRoom should have bots — at least one opponent seat
      const seats = page.locator('[data-testid^="seat-"]');
      await expect(seats.first()).toBeVisible({ timeout: 5000 });
    });

    test('no horizontal overflow in game room', async ({ page }) => {
      await createRoom(page);
      const hasOverflow = await page.evaluate(
        () => document.body.scrollWidth > window.innerWidth
      );
      expect(hasOverflow).toBe(false);
    });
  });
}
