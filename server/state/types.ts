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

export const HAND_RANK_ORDER: Record<HandRank, number> = {
  'two-three-five': 7,
  'trail': 6,
  'pure-sequence': 5,
  'sequence': 4,
  'color': 3,
  'pair': 2,
  'high-card': 1,
};

export interface HandResult {
  rank: HandRank;
  cards: [Card, Card, Card];
  /** For high-card: baccarat mod-10 value. For pair: pair rank value. For trail: card value. For sequence/color: high card value. */
  value: number;
  /** Secondary value for tiebreaking within same rank */
  kicker?: number;
}

export type PlayerStatus = 'waiting' | 'blind' | 'seen' | 'folded' | 'eliminated';

export interface Player {
  id: string;
  socketId: string;
  name: string;
  chips: number;
  status: PlayerStatus;
  cards: [Card, Card, Card] | null;
  totalBet: number;
  isHost: boolean;
  connected: boolean;
  isBot: boolean;
}

export type GamePhase = 'waiting' | 'playing' | 'show-pending' | 'round-end';

export interface ShowRequest {
  fromPlayerId: string;
  toPlayerId: string;
}

export interface GameState {
  phase: GamePhase;
  players: Player[];
  pot: number;
  currentStake: number;
  currentPlayerIndex: number;
  dealerIndex: number;
  deck: Card[];
  showRequest: ShowRequest | null;
  roundNumber: number;
  lastAction: GameAction | null;
}

export type GameActionType = 'bet' | 'raise' | 'fold' | 'see' | 'show-request' | 'show-accept' | 'show-reject';

export interface GameAction {
  playerId: string;
  type: GameActionType;
  amount?: number;
  timestamp: number;
}

export interface RoomConfig {
  maxPlayers: number;
  initialChips: number;
  initialStake: number;
  isPrivate: boolean;
  botCount: number;
}

export interface Room {
  id: string;
  name: string;
  hostId: string;
  config: RoomConfig;
  game: GameState;
  createdAt: number;
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

export interface ClientGameState {
  phase: GamePhase;
  players: Array<{
    id: string;
    name: string;
    chips: number;
    status: PlayerStatus;
    cards: [Card, Card, Card] | null; // only populated for self or at round-end
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

export interface RoomInfo {
  id: string;
  name: string;
  playerCount: number;
  maxPlayers: number;
  phase: GamePhase;
  isPrivate: boolean;
}
