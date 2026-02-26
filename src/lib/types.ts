// Client-side type definitions (duplicated from server to avoid cross-boundary imports)

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  suit: Suit;
  rank: Rank;
}

export type HandRank =
  | 'two-three-five'
  | 'trail'
  | 'pure-sequence'
  | 'sequence'
  | 'color'
  | 'pair'
  | 'high-card';

export interface HandResult {
  rank: HandRank;
  cards: [Card, Card, Card];
  value: number;
  kicker?: number;
}

export type PlayerStatus = 'waiting' | 'blind' | 'seen' | 'folded' | 'eliminated';

export type GamePhase = 'waiting' | 'playing' | 'show-pending' | 'round-end';

export type GameActionType = 'bet' | 'raise' | 'fold' | 'see' | 'show-request' | 'show-accept' | 'show-reject';

export interface GameAction {
  playerId: string;
  type: GameActionType;
  amount?: number;
  timestamp: number;
}

export interface ShowRequest {
  fromPlayerId: string;
  toPlayerId: string;
}

export interface ClientGameState {
  phase: GamePhase;
  players: Array<{
    id: string;
    name: string;
    chips: number;
    status: PlayerStatus;
    cards: [Card, Card, Card] | null;
    totalBet: number;
    isHost: boolean;
    connected: boolean;
    isBot: boolean;
  }>;
  pot: number;
  currentStake: number;
  currentPlayerIndex: number;
  dealerIndex: number;
  showRequest: ShowRequest | null;
  roundNumber: number;
  lastAction: GameAction | null;
  myPlayerId: string;
}

export interface RoomConfig {
  maxPlayers: number;
  initialChips: number;
  initialStake: number;
  isPrivate: boolean;
  botCount: number;
}

export interface RoomInfo {
  id: string;
  name: string;
  playerCount: number;
  maxPlayers: number;
  phase: GamePhase;
  isPrivate: boolean;
}

export interface RoundHistory {
  roundNumber: number;
  players: Array<{
    id: string;
    name: string;
    cards: [Card, Card, Card] | null;
    finalStatus: PlayerStatus;
    chipChange: number;
  }>;
  pot: number;
  winnerId: string | null;
  winnerHand: HandResult | null;
  actions: GameAction[];
}
