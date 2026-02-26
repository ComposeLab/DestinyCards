import { ROOM_CODE_LENGTH } from './constants';

export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars
  let code = '';
  for (let i = 0; i < ROOM_CODE_LENGTH; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function generatePlayerId(): string {
  return `p_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}
