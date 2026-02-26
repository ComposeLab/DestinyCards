'use client';

import { useGameStore } from '../stores/game-store';
import type { ClientGameState } from '../lib/types';

export function useGameState() {
  const gameState = useGameStore((s) => s.gameState);
  const playerId = useGameStore((s) => s.playerId);
  const actionLog = useGameStore((s) => s.actionLog);
  const roundEndInfo = useGameStore((s) => s.roundEndInfo);

  const myPlayer = gameState?.players.find((p) => p.id === playerId) ?? null;
  const isMyTurn = gameState
    ? gameState.players[gameState.currentPlayerIndex]?.id === playerId
    : false;
  const activePlayers = gameState?.players.filter(
    (p) => p.status === 'blind' || p.status === 'seen'
  ) ?? [];
  const isShowTarget = gameState?.showRequest?.toPlayerId === playerId;

  return {
    gameState,
    myPlayer,
    isMyTurn,
    activePlayers,
    isShowTarget,
    playerId,
    actionLog,
    roundEndInfo,
  };
}
