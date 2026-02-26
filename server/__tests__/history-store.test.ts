import { describe, it, expect, beforeEach } from 'vitest';
import { HistoryStore } from '../state/history-store';
import type { RoundHistory, Card } from '../state/types';

function createRoundHistory(roundNumber: number): RoundHistory {
  return {
    roundNumber,
    players: [
      {
        id: 'p1',
        name: 'Alice',
        cards: [
          { suit: 'hearts', rank: 'A' },
          { suit: 'hearts', rank: 'K' },
          { suit: 'hearts', rank: 'Q' },
        ] as [Card, Card, Card],
        finalStatus: 'seen',
        chipChange: 50,
      },
      {
        id: 'p2',
        name: 'Bob',
        cards: [
          { suit: 'clubs', rank: '2' },
          { suit: 'diamonds', rank: '3' },
          { suit: 'spades', rank: '5' },
        ] as [Card, Card, Card],
        finalStatus: 'folded',
        chipChange: -50,
      },
    ],
    pot: 100,
    winnerId: 'p1',
    winnerHand: null,
    actions: [],
  };
}

describe('HistoryStore', () => {
  let store: HistoryStore;

  beforeEach(() => {
    store = new HistoryStore();
  });

  describe('addRound', () => {
    it('should store a round for a room', () => {
      store.addRound('room1', createRoundHistory(1));
      const history = store.getRoomHistory('room1');
      expect(history).toHaveLength(1);
    });

    it('should store multiple rounds', () => {
      store.addRound('room1', createRoundHistory(1));
      store.addRound('room1', createRoundHistory(2));
      store.addRound('room1', createRoundHistory(3));
      const history = store.getRoomHistory('room1');
      expect(history).toHaveLength(3);
    });
  });

  describe('getRoomHistory', () => {
    it('should return empty array for unknown room', () => {
      const history = store.getRoomHistory('nonexistent');
      expect(history).toEqual([]);
    });

    it('should return rounds in order', () => {
      store.addRound('room1', createRoundHistory(1));
      store.addRound('room1', createRoundHistory(2));
      const history = store.getRoomHistory('room1');
      expect(history[0].roundNumber).toBe(1);
      expect(history[1].roundNumber).toBe(2);
    });
  });

  describe('getLastRound', () => {
    it('should return the most recent round', () => {
      store.addRound('room1', createRoundHistory(1));
      store.addRound('room1', createRoundHistory(2));
      const last = store.getLastRound('room1');
      expect(last).toBeDefined();
      expect(last!.roundNumber).toBe(2);
    });

    it('should return null for room with no history', () => {
      const last = store.getLastRound('nonexistent');
      expect(last).toBeNull();
    });
  });

  describe('clearRoomHistory', () => {
    it('should remove all history for a room', () => {
      store.addRound('room1', createRoundHistory(1));
      store.addRound('room1', createRoundHistory(2));
      store.clearRoomHistory('room1');
      expect(store.getRoomHistory('room1')).toEqual([]);
    });
  });
});
