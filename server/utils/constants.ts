export const ROOM_CODE_LENGTH = 6;
export const MIN_PLAYERS = 2;
export const MAX_PLAYERS = 8;
export const DEFAULT_INITIAL_CHIPS = 1000;
export const DEFAULT_INITIAL_STAKE = 10;
export const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'] as const;
export const RANK_VALUES: Record<string, number> = {
  'A': 14, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7,
  '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13,
};
export const RECONNECT_TIMEOUT_MS = 30000;
