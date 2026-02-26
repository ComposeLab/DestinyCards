import type { GameState } from '../state/types';

interface ValidationResult {
  valid: boolean;
  reason?: string;
}

export function canBet(state: GameState, playerId: string): ValidationResult {
  if (state.phase !== 'playing') {
    return { valid: false, reason: 'Game is not in playing phase' };
  }

  const currentPlayer = state.players[state.currentPlayerIndex];
  if (!currentPlayer || currentPlayer.id !== playerId) {
    return { valid: false, reason: 'Not your turn' };
  }

  if (currentPlayer.status !== 'blind' && currentPlayer.status !== 'seen') {
    return { valid: false, reason: 'Player cannot bet in current status' };
  }

  const betAmount = currentPlayer.status === 'blind' ? state.currentStake : state.currentStake * 2;
  if (currentPlayer.chips < betAmount) {
    return { valid: false, reason: 'Insufficient chips' };
  }

  return { valid: true };
}

export function canFold(state: GameState, playerId: string): ValidationResult {
  if (state.phase !== 'playing') {
    return { valid: false, reason: 'Game is not in playing phase' };
  }

  const currentPlayer = state.players[state.currentPlayerIndex];
  if (!currentPlayer || currentPlayer.id !== playerId) {
    return { valid: false, reason: 'Not your turn' };
  }

  if (currentPlayer.status !== 'blind' && currentPlayer.status !== 'seen') {
    return { valid: false, reason: 'Player cannot fold in current status' };
  }

  return { valid: true };
}

export function canSeeCards(state: GameState, playerId: string): ValidationResult {
  if (state.phase !== 'playing') {
    return { valid: false, reason: 'Game is not in playing phase' };
  }

  const currentPlayer = state.players[state.currentPlayerIndex];
  if (!currentPlayer || currentPlayer.id !== playerId) {
    return { valid: false, reason: 'Not your turn' };
  }

  const player = state.players.find((p) => p.id === playerId);
  if (!player) {
    return { valid: false, reason: 'Player not found' };
  }

  if (player.status !== 'blind') {
    return { valid: false, reason: 'Player is not blind' };
  }

  return { valid: true };
}

export function canRequestShow(
  state: GameState,
  fromPlayerId: string,
  toPlayerId: string
): ValidationResult {
  if (state.phase !== 'playing') {
    return { valid: false, reason: 'Game is not in playing phase' };
  }

  if (fromPlayerId === toPlayerId) {
    return { valid: false, reason: 'Cannot show against yourself' };
  }

  const currentPlayer = state.players[state.currentPlayerIndex];
  if (!currentPlayer || currentPlayer.id !== fromPlayerId) {
    return { valid: false, reason: 'Not your turn' };
  }

  const fromPlayer = state.players.find((p) => p.id === fromPlayerId);
  if (!fromPlayer || fromPlayer.status !== 'seen') {
    return { valid: false, reason: 'Requester must be seen' };
  }

  const toPlayer = state.players.find((p) => p.id === toPlayerId);
  if (!toPlayer || toPlayer.status !== 'seen') {
    return { valid: false, reason: 'Target must be seen' };
  }

  return { valid: true };
}

export function canStartGame(state: GameState, _playerId: string): ValidationResult {
  if (state.phase !== 'waiting') {
    return { valid: false, reason: 'Game is not in waiting phase' };
  }

  const connectedPlayers = state.players.filter((p) => p.connected);
  if (connectedPlayers.length < 2) {
    return { valid: false, reason: 'Need at least 2 connected players' };
  }

  return { valid: true };
}
