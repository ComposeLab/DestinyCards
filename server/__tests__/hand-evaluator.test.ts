import { describe, it, expect } from 'vitest';
import { evaluateHand, compareHands } from '../game/hand-evaluator';
import type { Card, HandResult } from '../state/types';

// Helper to create cards concisely
function c(rank: string, suit: string): Card {
  return { rank: rank as Card['rank'], suit: suit as Card['suit'] };
}

describe('hand-evaluator', () => {
  describe('evaluateHand', () => {
    it('should detect 2-3-5 (any suits)', () => {
      const hand: [Card, Card, Card] = [c('2', 'hearts'), c('3', 'diamonds'), c('5', 'clubs')];
      const result = evaluateHand(hand);
      expect(result.rank).toBe('two-three-five');
    });

    it('should detect 2-3-5 regardless of order', () => {
      const hand: [Card, Card, Card] = [c('5', 'spades'), c('2', 'hearts'), c('3', 'clubs')];
      const result = evaluateHand(hand);
      expect(result.rank).toBe('two-three-five');
    });

    it('should detect 2-3-5 of same suit as two-three-five (not pure sequence)', () => {
      const hand: [Card, Card, Card] = [c('2', 'hearts'), c('3', 'hearts'), c('5', 'hearts')];
      const result = evaluateHand(hand);
      expect(result.rank).toBe('two-three-five');
    });

    it('should detect trail (three of a kind)', () => {
      const hand: [Card, Card, Card] = [c('K', 'hearts'), c('K', 'diamonds'), c('K', 'clubs')];
      const result = evaluateHand(hand);
      expect(result.rank).toBe('trail');
    });

    it('should detect trail of 2s', () => {
      const hand: [Card, Card, Card] = [c('2', 'hearts'), c('2', 'diamonds'), c('2', 'clubs')];
      const result = evaluateHand(hand);
      expect(result.rank).toBe('trail');
    });

    it('should detect pure sequence (straight flush)', () => {
      const hand: [Card, Card, Card] = [c('7', 'hearts'), c('8', 'hearts'), c('9', 'hearts')];
      const result = evaluateHand(hand);
      expect(result.rank).toBe('pure-sequence');
    });

    it('should detect A-2-3 pure sequence', () => {
      const hand: [Card, Card, Card] = [c('A', 'spades'), c('2', 'spades'), c('3', 'spades')];
      const result = evaluateHand(hand);
      expect(result.rank).toBe('pure-sequence');
    });

    it('should detect Q-K-A pure sequence', () => {
      const hand: [Card, Card, Card] = [c('Q', 'diamonds'), c('K', 'diamonds'), c('A', 'diamonds')];
      const result = evaluateHand(hand);
      expect(result.rank).toBe('pure-sequence');
    });

    it('should detect sequence (straight, mixed suits)', () => {
      const hand: [Card, Card, Card] = [c('7', 'hearts'), c('8', 'diamonds'), c('9', 'clubs')];
      const result = evaluateHand(hand);
      expect(result.rank).toBe('sequence');
    });

    it('should detect A-2-3 sequence', () => {
      const hand: [Card, Card, Card] = [c('A', 'hearts'), c('2', 'diamonds'), c('3', 'clubs')];
      const result = evaluateHand(hand);
      expect(result.rank).toBe('sequence');
    });

    it('should detect Q-K-A sequence', () => {
      const hand: [Card, Card, Card] = [c('Q', 'hearts'), c('K', 'diamonds'), c('A', 'clubs')];
      const result = evaluateHand(hand);
      expect(result.rank).toBe('sequence');
    });

    it('should NOT detect K-A-2 as sequence (wrap-around invalid)', () => {
      const hand: [Card, Card, Card] = [c('K', 'hearts'), c('A', 'diamonds'), c('2', 'clubs')];
      const result = evaluateHand(hand);
      expect(result.rank).not.toBe('sequence');
      expect(result.rank).not.toBe('pure-sequence');
    });

    it('should detect color (flush)', () => {
      const hand: [Card, Card, Card] = [c('2', 'hearts'), c('7', 'hearts'), c('K', 'hearts')];
      const result = evaluateHand(hand);
      expect(result.rank).toBe('color');
    });

    it('should detect pair', () => {
      const hand: [Card, Card, Card] = [c('J', 'hearts'), c('J', 'diamonds'), c('5', 'clubs')];
      const result = evaluateHand(hand);
      expect(result.rank).toBe('pair');
    });

    it('should detect high card', () => {
      const hand: [Card, Card, Card] = [c('3', 'hearts'), c('7', 'diamonds'), c('K', 'clubs')];
      const result = evaluateHand(hand);
      expect(result.rank).toBe('high-card');
    });

    it('should compute baccarat mod-10 for high card', () => {
      // 3 + 7 + 13(K) = 23, mod 10 = 3
      const hand: [Card, Card, Card] = [c('3', 'hearts'), c('7', 'diamonds'), c('K', 'clubs')];
      const result = evaluateHand(hand);
      expect(result.rank).toBe('high-card');
      expect(result.value).toBe(3); // (3+7+13) % 10 = 3
    });

    it('should compute baccarat mod-10 correctly for face cards', () => {
      // J(11) + Q(12) + 4 = 27, mod 10 = 7
      const hand: [Card, Card, Card] = [c('J', 'hearts'), c('Q', 'diamonds'), c('4', 'clubs')];
      const result = evaluateHand(hand);
      expect(result.rank).toBe('high-card');
      expect(result.value).toBe(7);
    });
  });

  describe('compareHands', () => {
    it('2-3-5 should beat trail', () => {
      const h1 = evaluateHand([c('2', 'hearts'), c('3', 'diamonds'), c('5', 'clubs')]);
      const h2 = evaluateHand([c('A', 'hearts'), c('A', 'diamonds'), c('A', 'clubs')]);
      expect(compareHands(h1, h2)).toBeGreaterThan(0);
    });

    it('trail should beat pure sequence', () => {
      const h1 = evaluateHand([c('7', 'hearts'), c('7', 'diamonds'), c('7', 'clubs')]);
      const h2 = evaluateHand([c('J', 'spades'), c('Q', 'spades'), c('K', 'spades')]);
      expect(compareHands(h1, h2)).toBeGreaterThan(0);
    });

    it('pure sequence should beat sequence', () => {
      const h1 = evaluateHand([c('7', 'hearts'), c('8', 'hearts'), c('9', 'hearts')]);
      const h2 = evaluateHand([c('J', 'hearts'), c('Q', 'diamonds'), c('K', 'clubs')]);
      expect(compareHands(h1, h2)).toBeGreaterThan(0);
    });

    it('sequence should beat color', () => {
      const h1 = evaluateHand([c('7', 'hearts'), c('8', 'diamonds'), c('9', 'clubs')]);
      const h2 = evaluateHand([c('2', 'spades'), c('7', 'spades'), c('K', 'spades')]);
      expect(compareHands(h1, h2)).toBeGreaterThan(0);
    });

    it('color should beat pair', () => {
      const h1 = evaluateHand([c('2', 'hearts'), c('7', 'hearts'), c('K', 'hearts')]);
      const h2 = evaluateHand([c('A', 'hearts'), c('A', 'diamonds'), c('K', 'clubs')]);
      expect(compareHands(h1, h2)).toBeGreaterThan(0);
    });

    it('pair should beat high card', () => {
      const h1 = evaluateHand([c('3', 'hearts'), c('3', 'diamonds'), c('5', 'clubs')]);
      const h2 = evaluateHand([c('A', 'hearts'), c('K', 'diamonds'), c('9', 'clubs')]);
      expect(compareHands(h1, h2)).toBeGreaterThan(0);
    });

    it('higher trail beats lower trail', () => {
      const h1 = evaluateHand([c('A', 'hearts'), c('A', 'diamonds'), c('A', 'clubs')]);
      const h2 = evaluateHand([c('K', 'hearts'), c('K', 'diamonds'), c('K', 'clubs')]);
      expect(compareHands(h1, h2)).toBeGreaterThan(0);
    });

    it('higher pair beats lower pair', () => {
      const h1 = evaluateHand([c('K', 'hearts'), c('K', 'diamonds'), c('3', 'clubs')]);
      const h2 = evaluateHand([c('J', 'hearts'), c('J', 'diamonds'), c('A', 'clubs')]);
      expect(compareHands(h1, h2)).toBeGreaterThan(0);
    });

    it('same pair uses kicker', () => {
      const h1 = evaluateHand([c('K', 'hearts'), c('K', 'diamonds'), c('A', 'clubs')]);
      const h2 = evaluateHand([c('K', 'clubs'), c('K', 'spades'), c('3', 'clubs')]);
      expect(compareHands(h1, h2)).toBeGreaterThan(0);
    });

    it('higher sequence beats lower sequence', () => {
      const h1 = evaluateHand([c('Q', 'hearts'), c('K', 'diamonds'), c('A', 'clubs')]);
      const h2 = evaluateHand([c('9', 'hearts'), c('10', 'diamonds'), c('J', 'clubs')]);
      expect(compareHands(h1, h2)).toBeGreaterThan(0);
    });

    it('A-2-3 is the lowest sequence', () => {
      const h1 = evaluateHand([c('2', 'hearts'), c('3', 'diamonds'), c('4', 'clubs')]);
      const h2 = evaluateHand([c('A', 'hearts'), c('2', 'diamonds'), c('3', 'clubs')]);
      // Note: A-2-3 would be detected as two-three-five? No - this is A-2-3, not 2-3-5
      // A-2-3 is a valid sequence, 2-3-4 is higher
      expect(compareHands(h1, h2)).toBeGreaterThan(0);
    });

    it('higher baccarat mod-10 beats lower for high card', () => {
      // Hand 1: 9 + 8 + 2 = 19, mod 10 = 9
      const h1 = evaluateHand([c('9', 'hearts'), c('8', 'diamonds'), c('2', 'clubs')]);
      // Hand 2: 3 + 7 + K(13) = 23, mod 10 = 3
      const h2 = evaluateHand([c('3', 'hearts'), c('7', 'diamonds'), c('K', 'clubs')]);
      // Both should be high-card, h1 value=9 > h2 value=3
      expect(h1.rank).toBe('high-card');
      expect(h2.rank).toBe('high-card');
      expect(compareHands(h1, h2)).toBeGreaterThan(0);
    });

    it('equal hands return 0', () => {
      const h1 = evaluateHand([c('7', 'hearts'), c('7', 'diamonds'), c('7', 'clubs')]);
      const h2 = evaluateHand([c('7', 'spades'), c('7', 'hearts'), c('7', 'diamonds')]);
      expect(compareHands(h1, h2)).toBe(0);
    });
  });
});
