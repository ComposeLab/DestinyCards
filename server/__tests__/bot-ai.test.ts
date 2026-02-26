import { describe, it, expect, vi } from 'vitest';
import { decideBotTurn } from '../game/bot-ai';
import type { GameState, Player, Card } from '../state/types';

function makeCard(rank: string, suit: string): Card {
  return { rank: rank as Card['rank'], suit: suit as Card['suit'] };
}

function makeBot(overrides: Partial<Player> = {}): Player {
  return {
    id: 'bot-1',
    socketId: '__bot__bot-1',
    name: 'Bot Alpha',
    chips: 1000,
    status: 'blind',
    cards: [
      makeCard('7', 'hearts'),
      makeCard('J', 'diamonds'),
      makeCard('3', 'clubs'),
    ],
    totalBet: 0,
    isHost: false,
    connected: true,
    isBot: true,
    ...overrides,
  };
}

function makeState(overrides: Partial<GameState> = {}, bot?: Player): GameState {
  const botPlayer = bot ?? makeBot();
  return {
    phase: 'playing',
    players: [
      {
        id: 'human-1',
        socketId: 'sock-1',
        name: 'Human',
        chips: 1000,
        status: 'seen',
        cards: [makeCard('A', 'hearts'), makeCard('K', 'diamonds'), makeCard('Q', 'clubs')],
        totalBet: 10,
        isHost: true,
        connected: true,
        isBot: false,
      },
      botPlayer,
    ],
    pot: 20,
    currentStake: 10,
    currentPlayerIndex: 1,
    dealerIndex: 0,
    deck: [],
    showRequest: null,
    roundNumber: 1,
    lastAction: null,
    ...overrides,
  };
}

describe('bot-ai', () => {
  describe('blind bot', () => {
    it('returns see or bet or fold when blind', () => {
      const bot = makeBot({ status: 'blind' });
      const state = makeState({}, bot);
      const validActions = ['see', 'bet', 'fold'];

      // Run multiple times to verify only valid actions are returned
      for (let i = 0; i < 50; i++) {
        const decision = decideBotTurn(state, bot);
        expect(validActions).toContain(decision.action);
      }
    });
  });

  describe('premium hand (trail)', () => {
    it('never folds with a trail', () => {
      const bot = makeBot({
        status: 'seen',
        cards: [makeCard('K', 'hearts'), makeCard('K', 'diamonds'), makeCard('K', 'clubs')],
      });
      const state = makeState({}, bot);

      for (let i = 0; i < 100; i++) {
        const decision = decideBotTurn(state, bot);
        expect(decision.action).not.toBe('fold');
      }
    });
  });

  describe('weak hand', () => {
    it('sometimes folds with a weak hand', () => {
      const bot = makeBot({
        status: 'seen',
        cards: [makeCard('7', 'hearts'), makeCard('J', 'diamonds'), makeCard('3', 'clubs')],
      });
      const state = makeState({}, bot);

      let foldCount = 0;
      const iterations = 200;
      for (let i = 0; i < iterations; i++) {
        const decision = decideBotTurn(state, bot);
        if (decision.action === 'fold') foldCount++;
      }

      // With 35% fold rate, over 200 iterations we should get some folds
      expect(foldCount).toBeGreaterThan(0);
    });
  });

  describe('show-pending (bot is target)', () => {
    it('returns show-respond when bot is show target', () => {
      const bot = makeBot({
        status: 'seen',
        cards: [makeCard('A', 'hearts'), makeCard('A', 'diamonds'), makeCard('A', 'clubs')],
      });
      const state = makeState(
        {
          phase: 'show-pending',
          showRequest: { fromPlayerId: 'human-1', toPlayerId: 'bot-1' },
        },
        bot,
      );

      const decision = decideBotTurn(state, bot);
      expect(decision.action).toBe('show-respond');
      expect(decision.accepted).toBeDefined();
    });

    it('accepts show more often with premium hand', () => {
      const bot = makeBot({
        status: 'seen',
        cards: [makeCard('A', 'hearts'), makeCard('A', 'diamonds'), makeCard('A', 'clubs')],
      });
      const state = makeState(
        {
          phase: 'show-pending',
          showRequest: { fromPlayerId: 'human-1', toPlayerId: 'bot-1' },
        },
        bot,
      );

      let acceptCount = 0;
      for (let i = 0; i < 100; i++) {
        const decision = decideBotTurn(state, bot);
        if (decision.accepted) acceptCount++;
      }

      // Trail is premium — always accepts
      expect(acceptCount).toBe(100);
    });
  });
});
