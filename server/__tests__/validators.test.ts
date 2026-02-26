import { describe, it, expect } from 'vitest';
import {
  canBet,
  canFold,
  canSeeCards,
  canRequestShow,
  canStartGame,
} from '../game/validators';
import type { GameState, Player } from '../state/types';
import { DEFAULT_INITIAL_CHIPS, DEFAULT_INITIAL_STAKE } from '../utils/constants';

function createPlayer(id: string, overrides: Partial<Player> = {}): Player {
  return {
    id,
    socketId: `socket_${id}`,
    name: `Player ${id}`,
    chips: DEFAULT_INITIAL_CHIPS,
    status: 'blind',
    cards: null,
    totalBet: 0,
    isHost: false,
    connected: true,
    isBot: false,
    ...overrides,
  };
}

function createGameState(overrides: Partial<GameState> = {}): GameState {
  return {
    phase: 'playing',
    players: [createPlayer('p1'), createPlayer('p2'), createPlayer('p3')],
    pot: 0,
    currentStake: DEFAULT_INITIAL_STAKE,
    currentPlayerIndex: 0,
    dealerIndex: 0,
    deck: [],
    showRequest: null,
    roundNumber: 1,
    lastAction: null,
    ...overrides,
  };
}

describe('validators', () => {
  describe('canBet', () => {
    it('should allow current player to bet', () => {
      const state = createGameState();
      expect(canBet(state, 'p1').valid).toBe(true);
    });

    it('should not allow non-current player to bet', () => {
      const state = createGameState();
      expect(canBet(state, 'p2').valid).toBe(false);
    });

    it('should not allow bet when not in playing phase', () => {
      const state = createGameState({ phase: 'waiting' });
      expect(canBet(state, 'p1').valid).toBe(false);
    });

    it('should not allow bet when player has insufficient chips', () => {
      const state = createGameState({
        players: [
          createPlayer('p1', { chips: 0 }),
          createPlayer('p2'),
          createPlayer('p3'),
        ],
      });
      expect(canBet(state, 'p1').valid).toBe(false);
    });

    it('should not allow folded player to bet', () => {
      const state = createGameState({
        players: [
          createPlayer('p1', { status: 'folded' }),
          createPlayer('p2'),
          createPlayer('p3'),
        ],
      });
      expect(canBet(state, 'p1').valid).toBe(false);
    });
  });

  describe('canFold', () => {
    it('should allow current player to fold', () => {
      const state = createGameState();
      expect(canFold(state, 'p1').valid).toBe(true);
    });

    it('should not allow non-current player to fold', () => {
      const state = createGameState();
      expect(canFold(state, 'p2').valid).toBe(false);
    });
  });

  describe('canSeeCards', () => {
    it('should allow blind player to see cards', () => {
      const state = createGameState();
      // p1 is at index 0, is current player, and is blind
      expect(canSeeCards(state, 'p1').valid).toBe(true);
    });

    it('should not allow already-seen player to see again', () => {
      const state = createGameState({
        players: [
          createPlayer('p1', { status: 'seen' }),
          createPlayer('p2'),
          createPlayer('p3'),
        ],
      });
      expect(canSeeCards(state, 'p1').valid).toBe(false);
    });
  });

  describe('canRequestShow', () => {
    it('should allow seen player to request show against another seen player', () => {
      const state = createGameState({
        players: [
          createPlayer('p1', { status: 'seen' }),
          createPlayer('p2', { status: 'seen' }),
          createPlayer('p3'),
        ],
      });
      expect(canRequestShow(state, 'p1', 'p2').valid).toBe(true);
    });

    it('should not allow blind player to request show', () => {
      const state = createGameState({
        players: [
          createPlayer('p1', { status: 'blind' }),
          createPlayer('p2', { status: 'seen' }),
          createPlayer('p3'),
        ],
      });
      expect(canRequestShow(state, 'p1', 'p2').valid).toBe(false);
    });

    it('should not allow show against blind player', () => {
      const state = createGameState({
        players: [
          createPlayer('p1', { status: 'seen' }),
          createPlayer('p2', { status: 'blind' }),
          createPlayer('p3'),
        ],
      });
      expect(canRequestShow(state, 'p1', 'p2').valid).toBe(false);
    });

    it('should not allow show when not current player turn', () => {
      const state = createGameState({
        currentPlayerIndex: 1,
        players: [
          createPlayer('p1', { status: 'seen' }),
          createPlayer('p2', { status: 'seen' }),
          createPlayer('p3'),
        ],
      });
      expect(canRequestShow(state, 'p1', 'p2').valid).toBe(false);
    });

    it('should not allow show against self', () => {
      const state = createGameState({
        players: [
          createPlayer('p1', { status: 'seen' }),
          createPlayer('p2', { status: 'seen' }),
          createPlayer('p3'),
        ],
      });
      expect(canRequestShow(state, 'p1', 'p1').valid).toBe(false);
    });
  });

  describe('canStartGame', () => {
    it('should allow start with 2+ players in waiting phase', () => {
      const state = createGameState({
        phase: 'waiting',
        players: [createPlayer('p1'), createPlayer('p2')],
      });
      expect(canStartGame(state, 'p1').valid).toBe(true);
    });

    it('should not allow start with < 2 players', () => {
      const state = createGameState({
        phase: 'waiting',
        players: [createPlayer('p1')],
      });
      expect(canStartGame(state, 'p1').valid).toBe(false);
    });

    it('should not allow start when already playing', () => {
      const state = createGameState({
        phase: 'playing',
      });
      expect(canStartGame(state, 'p1').valid).toBe(false);
    });
  });
});
