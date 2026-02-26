import type { Card, Suit } from './types';

const SUIT_SYMBOLS: Record<Suit, string> = {
  hearts: '\u2665',
  diamonds: '\u2666',
  clubs: '\u2663',
  spades: '\u2660',
};

const SUIT_COLORS: Record<Suit, string> = {
  hearts: 'text-red-500',
  diamonds: 'text-red-500',
  clubs: 'text-gray-900',
  spades: 'text-gray-900',
};

export function getSuitSymbol(suit: Suit): string {
  return SUIT_SYMBOLS[suit];
}

export function getSuitColor(suit: Suit): string {
  return SUIT_COLORS[suit];
}

export function formatCard(card: Card): string {
  return `${card.rank}${SUIT_SYMBOLS[card.suit]}`;
}
