import { Page, expect } from '@playwright/test';

export async function createRoom(page: Page, playerName = 'TestHost') {
  await page.goto('/');
  await page.getByPlaceholder(/your name/i).fill(playerName);
  await page.getByPlaceholder(/room name/i).fill('TestRoom');
  await page.locator('form').getByRole('button', { name: /create/i }).click();
  await expect(page).toHaveURL(/\/room\//);
}

export async function joinRoom(page: Page, roomCode: string, playerName = 'TestPlayer') {
  await page.goto('/');
  // Click "Join Room" tab
  await page.getByText(/join room/i).click();
  await page.getByPlaceholder(/room code/i).fill(roomCode);
  await page.getByPlaceholder(/your name/i).fill(playerName);
  await page.getByRole('button', { name: /join/i }).click();
  await expect(page).toHaveURL(/\/room\//);
}

export function getRoomCode(page: Page): string {
  const url = page.url();
  const match = url.match(/\/room\/([A-Z0-9]+)/);
  return match?.[1] ?? '';
}
