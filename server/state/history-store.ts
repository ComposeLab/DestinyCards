import type { RoundHistory } from './types';

export class HistoryStore {
  private history: Map<string, RoundHistory[]> = new Map();

  addRound(roomId: string, round: RoundHistory): void {
    if (!this.history.has(roomId)) {
      this.history.set(roomId, []);
    }
    this.history.get(roomId)!.push(round);
  }

  getRoomHistory(roomId: string): RoundHistory[] {
    return this.history.get(roomId) ?? [];
  }

  getLastRound(roomId: string): RoundHistory | null {
    const rounds = this.history.get(roomId);
    if (!rounds || rounds.length === 0) return null;
    return rounds[rounds.length - 1];
  }

  clearRoomHistory(roomId: string): void {
    this.history.delete(roomId);
  }
}
