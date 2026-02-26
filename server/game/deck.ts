import type { Card } from '../state/types';
import { SUITS, RANKS } from '../utils/constants';

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank });
    }
  }
  return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  // Fisher-Yates shuffle
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function dealCards(deck: Card[], playerCount: number): { hands: [Card, Card, Card][]; remainingDeck: Card[] } {
  if (playerCount <= 0) throw new Error('Player count must be > 0');
  const cardsNeeded = playerCount * 3;
  if (deck.length < cardsNeeded) throw new Error('Not enough cards');

  const hands: [Card, Card, Card][] = [];
  let idx = 0;
  for (let i = 0; i < playerCount; i++) {
    hands.push([deck[idx], deck[idx + 1], deck[idx + 2]]);
    idx += 3;
  }
  return { hands, remainingDeck: deck.slice(idx) };
}
