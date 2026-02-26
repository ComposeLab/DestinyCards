import { describe, it, expect } from 'vitest';
import { createDeck, shuffleDeck, dealCards } from '../game/deck';
import type { Card } from '../state/types';

describe('deck', () => {
  describe('createDeck', () => {
    it('should create a 52-card deck', () => {
      const deck = createDeck();
      expect(deck).toHaveLength(52);
    });

    it('should have 13 cards per suit', () => {
      const deck = createDeck();
      const suits = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
      for (const suit of suits) {
        const suitCards = deck.filter((c) => c.suit === suit);
        expect(suitCards).toHaveLength(13);
      }
    });

    it('should have 4 cards per rank', () => {
      const deck = createDeck();
      const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const;
      for (const rank of ranks) {
        const rankCards = deck.filter((c) => c.rank === rank);
        expect(rankCards).toHaveLength(4);
      }
    });

    it('should have no duplicate cards', () => {
      const deck = createDeck();
      const keys = deck.map((c) => `${c.rank}-${c.suit}`);
      const unique = new Set(keys);
      expect(unique.size).toBe(52);
    });
  });

  describe('shuffleDeck', () => {
    it('should return a deck with 52 cards', () => {
      const deck = createDeck();
      const shuffled = shuffleDeck(deck);
      expect(shuffled).toHaveLength(52);
    });

    it('should contain all original cards', () => {
      const deck = createDeck();
      const shuffled = shuffleDeck(deck);
      const originalKeys = new Set(deck.map((c) => `${c.rank}-${c.suit}`));
      const shuffledKeys = new Set(shuffled.map((c) => `${c.rank}-${c.suit}`));
      expect(shuffledKeys).toEqual(originalKeys);
    });

    it('should not mutate the original deck', () => {
      const deck = createDeck();
      const original = [...deck];
      shuffleDeck(deck);
      expect(deck).toEqual(original);
    });

    it('should produce different orders (probabilistic)', () => {
      const deck = createDeck();
      const shuffled1 = shuffleDeck(deck);
      const shuffled2 = shuffleDeck(deck);
      // Extremely unlikely both shuffles produce same order
      const keys1 = shuffled1.map((c) => `${c.rank}-${c.suit}`).join(',');
      const keys2 = shuffled2.map((c) => `${c.rank}-${c.suit}`).join(',');
      expect(keys1).not.toBe(keys2);
    });
  });

  describe('dealCards', () => {
    it('should deal 3 cards per player', () => {
      const deck = createDeck();
      const shuffled = shuffleDeck(deck);
      const { hands, remainingDeck } = dealCards(shuffled, 3);
      expect(hands).toHaveLength(3);
      for (const hand of hands) {
        expect(hand).toHaveLength(3);
      }
    });

    it('should remove dealt cards from deck', () => {
      const deck = createDeck();
      const shuffled = shuffleDeck(deck);
      const { remainingDeck } = dealCards(shuffled, 4);
      expect(remainingDeck).toHaveLength(52 - 12); // 4 players * 3 cards
    });

    it('should deal unique cards (no overlaps between hands)', () => {
      const deck = createDeck();
      const shuffled = shuffleDeck(deck);
      const { hands } = dealCards(shuffled, 4);
      const allCards = hands.flat();
      const keys = allCards.map((c) => `${c.rank}-${c.suit}`);
      const unique = new Set(keys);
      expect(unique.size).toBe(12);
    });

    it('should not deal to 0 players', () => {
      const deck = createDeck();
      expect(() => dealCards(deck, 0)).toThrow();
    });

    it('should handle max players (8)', () => {
      const deck = createDeck();
      const shuffled = shuffleDeck(deck);
      const { hands, remainingDeck } = dealCards(shuffled, 8);
      expect(hands).toHaveLength(8);
      expect(remainingDeck).toHaveLength(52 - 24);
    });
  });
});
