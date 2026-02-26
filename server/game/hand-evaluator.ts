import type { Card, HandResult } from '../state/types';
import { HAND_RANK_ORDER } from '../state/types';
import { RANK_VALUES } from '../utils/constants';

// Helper: get numeric value for a rank
function rankValue(rank: string): number {
  return RANK_VALUES[rank] ?? 0;
}

function sortedValues(cards: [Card, Card, Card]): number[] {
  return cards.map(c => rankValue(c.rank)).sort((a, b) => a - b);
}

function isTwoThreeFive(cards: [Card, Card, Card]): boolean {
  const vals = sortedValues(cards);
  return vals[0] === 2 && vals[1] === 3 && vals[2] === 5;
}

function isTrail(cards: [Card, Card, Card]): boolean {
  return cards[0].rank === cards[1].rank && cards[1].rank === cards[2].rank;
}

function isSameSuit(cards: [Card, Card, Card]): boolean {
  return cards[0].suit === cards[1].suit && cards[1].suit === cards[2].suit;
}

function isSequence(cards: [Card, Card, Card]): boolean {
  const vals = sortedValues(cards);
  // Normal sequence: consecutive values
  if (vals[2] - vals[1] === 1 && vals[1] - vals[0] === 1) return true;
  // A-2-3 (Ace low): vals would be [2, 3, 14]
  if (vals[0] === 2 && vals[1] === 3 && vals[2] === 14) return true;
  // Q-K-A: vals would be [12, 13, 14] - already covered by normal consecutive
  return false;
}

function getPairValue(cards: [Card, Card, Card]): { pairVal: number; kicker: number } | null {
  const vals = sortedValues(cards);
  if (vals[0] === vals[1]) return { pairVal: vals[0], kicker: vals[2] };
  if (vals[1] === vals[2]) return { pairVal: vals[1], kicker: vals[0] };
  return null;
}

function getSequenceHighValue(cards: [Card, Card, Card]): number {
  const vals = sortedValues(cards);
  // A-2-3 special case: high card is 3 (Ace is low here)
  if (vals[0] === 2 && vals[1] === 3 && vals[2] === 14) return 3;
  return vals[2];
}

function getBaccaratValue(cards: [Card, Card, Card]): number {
  const sum = cards.reduce((acc, c) => acc + rankValue(c.rank), 0);
  return sum % 10;
}

export function evaluateHand(cards: [Card, Card, Card]): HandResult {
  // Check in priority order

  // 1. Two-Three-Five (special: beats everything)
  if (isTwoThreeFive(cards)) {
    return { rank: 'two-three-five', cards, value: 0 };
  }

  // 2. Trail (three of a kind)
  if (isTrail(cards)) {
    return { rank: 'trail', cards, value: rankValue(cards[0].rank) };
  }

  const sameSuit = isSameSuit(cards);
  const sequence = isSequence(cards);

  // 3. Pure Sequence (straight flush)
  if (sameSuit && sequence) {
    return { rank: 'pure-sequence', cards, value: getSequenceHighValue(cards) };
  }

  // 4. Sequence (straight)
  if (sequence) {
    return { rank: 'sequence', cards, value: getSequenceHighValue(cards) };
  }

  // 5. Color (flush)
  if (sameSuit) {
    const vals = sortedValues(cards);
    return { rank: 'color', cards, value: vals[2], kicker: vals[1] * 100 + vals[0] };
  }

  // 6. Pair
  const pair = getPairValue(cards);
  if (pair) {
    return { rank: 'pair', cards, value: pair.pairVal, kicker: pair.kicker };
  }

  // 7. High Card (baccarat mod-10)
  return { rank: 'high-card', cards, value: getBaccaratValue(cards) };
}

// Compare two hands. Returns positive if h1 wins, negative if h2 wins, 0 if tie.
export function compareHands(h1: HandResult, h2: HandResult): number {
  const rank1 = HAND_RANK_ORDER[h1.rank];
  const rank2 = HAND_RANK_ORDER[h2.rank];

  if (rank1 !== rank2) return rank1 - rank2;

  // Same rank category - compare by value
  if (h1.value !== h2.value) return h1.value - h2.value;

  // Compare kickers
  return (h1.kicker ?? 0) - (h2.kicker ?? 0);
}
