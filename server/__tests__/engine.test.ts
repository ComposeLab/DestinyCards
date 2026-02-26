import { describe, it, expect, beforeEach } from 'vitest';
import { GameEngine } from '../game/engine';
import type { Player, GameState, Card } from '../state/types';
import { DEFAULT_INITIAL_CHIPS, DEFAULT_INITIAL_STAKE } from '../utils/constants';

function createTestPlayer(id: string, name: string, chips = DEFAULT_INITIAL_CHIPS): Player {
  return {
    id,
    socketId: `socket_${id}`,
    name,
    chips,
    status: 'waiting',
    cards: null,
    totalBet: 0,
    isHost: false,
    connected: true,
    isBot: false,
  };
}

describe('GameEngine', () => {
  let engine: GameEngine;
  let players: Player[];

  beforeEach(() => {
    players = [
      { ...createTestPlayer('p1', 'Alice'), isHost: true },
      createTestPlayer('p2', 'Bob'),
      createTestPlayer('p3', 'Charlie'),
    ];
    engine = new GameEngine();
  });

  describe('startRound', () => {
    it('should deal 3 cards to each player', () => {
      const state = engine.startRound(players, DEFAULT_INITIAL_STAKE);
      for (const p of state.players) {
        expect(p.cards).toHaveLength(3);
      }
    });

    it('should set all players to blind status', () => {
      const state = engine.startRound(players, DEFAULT_INITIAL_STAKE);
      for (const p of state.players) {
        expect(p.status).toBe('blind');
      }
    });

    it('should set phase to playing', () => {
      const state = engine.startRound(players, DEFAULT_INITIAL_STAKE);
      expect(state.phase).toBe('playing');
    });

    it('should set initial stake', () => {
      const state = engine.startRound(players, 20);
      expect(state.currentStake).toBe(20);
    });

    it('should set pot to 0', () => {
      const state = engine.startRound(players, DEFAULT_INITIAL_STAKE);
      expect(state.pot).toBe(0);
    });
  });

  describe('bet', () => {
    let state: GameState;

    beforeEach(() => {
      state = engine.startRound(players, DEFAULT_INITIAL_STAKE);
    });

    it('blind player bets X (current stake)', () => {
      const currentPlayer = state.players[state.currentPlayerIndex];
      const chipsBefore = currentPlayer.chips;
      const result = engine.bet(state);
      const updatedPlayer = result.players[state.currentPlayerIndex];
      expect(chipsBefore - updatedPlayer.chips).toBe(DEFAULT_INITIAL_STAKE);
    });

    it('seen player bets 2X (double current stake)', () => {
      // First player sees their cards
      state = engine.seeCards(state, state.players[state.currentPlayerIndex].id);
      const currentPlayer = state.players[state.currentPlayerIndex];
      expect(currentPlayer.status).toBe('seen');

      const chipsBefore = currentPlayer.chips;
      const result = engine.bet(state);
      const updatedPlayer = result.players[state.currentPlayerIndex];
      expect(chipsBefore - updatedPlayer.chips).toBe(DEFAULT_INITIAL_STAKE * 2);
    });

    it('should add bet amount to pot', () => {
      const potBefore = state.pot;
      const result = engine.bet(state);
      expect(result.pot).toBe(potBefore + DEFAULT_INITIAL_STAKE);
    });

    it('should advance to next player', () => {
      const idxBefore = state.currentPlayerIndex;
      const result = engine.bet(state);
      expect(result.currentPlayerIndex).not.toBe(idxBefore);
    });

    it('should skip folded players when advancing turn', () => {
      // Player 2 (index 1) folds
      state.currentPlayerIndex = 1;
      state = engine.fold(state);
      // Now it should be player 3's turn (index 2), not player 2
      // After player 3 acts, it should wrap to player 1 (index 0), skipping folded player 2
      state = engine.bet(state); // player 3 bets
      expect(state.currentPlayerIndex).toBe(0); // should skip to player 1
    });
  });

  describe('raise', () => {
    let state: GameState;

    beforeEach(() => {
      state = engine.startRound(players, DEFAULT_INITIAL_STAKE);
    });

    it('should double the current stake', () => {
      const result = engine.raise(state);
      expect(result.currentStake).toBe(DEFAULT_INITIAL_STAKE * 2);
    });

    it('blind player raising pays new stake X', () => {
      const currentPlayer = state.players[state.currentPlayerIndex];
      const chipsBefore = currentPlayer.chips;
      const result = engine.raise(state);
      const updatedPlayer = result.players[state.currentPlayerIndex];
      // After raise, stake is doubled. Blind player pays new stake.
      expect(chipsBefore - updatedPlayer.chips).toBe(DEFAULT_INITIAL_STAKE * 2);
    });
  });

  describe('fold', () => {
    let state: GameState;

    beforeEach(() => {
      state = engine.startRound(players, DEFAULT_INITIAL_STAKE);
    });

    it('should set player status to folded', () => {
      const idx = state.currentPlayerIndex;
      const result = engine.fold(state);
      expect(result.players[idx].status).toBe('folded');
    });

    it('should advance to next player', () => {
      const idxBefore = state.currentPlayerIndex;
      const result = engine.fold(state);
      expect(result.currentPlayerIndex).not.toBe(idxBefore);
    });

    it('should end round when only 1 active player left', () => {
      // 3 players: fold 2 of them
      state = engine.fold(state); // p1 folds
      state = engine.fold(state); // p2 folds
      // Only p3 left → round should end
      expect(state.phase).toBe('round-end');
    });

    it('winner gets the pot when all others fold', () => {
      // First, some bets to build pot
      state = engine.bet(state); // p1 bets
      state = engine.bet(state); // p2 bets
      const potBefore = state.pot;
      state = engine.fold(state); // p3 folds
      // Back to p1
      state = engine.fold(state); // p1 folds
      // p2 wins
      expect(state.phase).toBe('round-end');
      const winner = state.players.find(
        (p) => p.status !== 'folded'
      );
      expect(winner).toBeDefined();
    });
  });

  describe('seeCards', () => {
    let state: GameState;

    beforeEach(() => {
      state = engine.startRound(players, DEFAULT_INITIAL_STAKE);
    });

    it('should change player status from blind to seen', () => {
      const playerId = state.players[state.currentPlayerIndex].id;
      const result = engine.seeCards(state, playerId);
      const player = result.players.find((p) => p.id === playerId);
      expect(player!.status).toBe('seen');
    });

    it('should not change turn (seeing is free action)', () => {
      const idxBefore = state.currentPlayerIndex;
      const playerId = state.players[idxBefore].id;
      const result = engine.seeCards(state, playerId);
      expect(result.currentPlayerIndex).toBe(idxBefore);
    });
  });

  describe('show mechanic', () => {
    let state: GameState;

    beforeEach(() => {
      state = engine.startRound(players, DEFAULT_INITIAL_STAKE);
      // Make player 1 and 2 seen
      state = engine.seeCards(state, 'p1');
      state = engine.seeCards(state, 'p2');
    });

    it('should create a show request', () => {
      state.currentPlayerIndex = 0; // p1's turn
      const result = engine.requestShow(state, 'p1', 'p2');
      expect(result.showRequest).toEqual({
        fromPlayerId: 'p1',
        toPlayerId: 'p2',
      });
      expect(result.phase).toBe('show-pending');
    });

    it('show accept should eliminate the loser', () => {
      state.currentPlayerIndex = 0;
      state = engine.requestShow(state, 'p1', 'p2');
      const result = engine.respondShow(state, true);
      // One of p1 or p2 should be eliminated
      const p1 = result.players.find((p) => p.id === 'p1')!;
      const p2 = result.players.find((p) => p.id === 'p2')!;
      const eliminated = [p1.status, p2.status].filter((s) => s === 'folded');
      expect(eliminated).toHaveLength(1);
    });

    it('show reject should resume normal play', () => {
      state.currentPlayerIndex = 0;
      state = engine.requestShow(state, 'p1', 'p2');
      const result = engine.respondShow(state, false);
      expect(result.showRequest).toBeNull();
      expect(result.phase).toBe('playing');
    });

    it('show should cost the requester X', () => {
      state.currentPlayerIndex = 0;
      const chipsBefore = state.players[0].chips;
      state = engine.requestShow(state, 'p1', 'p2');
      state = engine.respondShow(state, true);
      const p1 = state.players.find((p) => p.id === 'p1')!;
      expect(chipsBefore - p1.chips).toBeGreaterThanOrEqual(state.currentStake);
    });
  });

  describe('turn rotation', () => {
    it('should wrap around to first player after last', () => {
      let state = engine.startRound(players, DEFAULT_INITIAL_STAKE);
      // 3 players, advance through all
      state = engine.bet(state); // p1
      state = engine.bet(state); // p2
      state = engine.bet(state); // p3
      // Should wrap back to p1 (index 0)
      expect(state.currentPlayerIndex).toBe(0);
    });
  });
});
