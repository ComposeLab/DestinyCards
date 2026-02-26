import type { Server } from 'socket.io';
import type { RoomManager } from '../state/room-manager';
import type { HistoryStore } from '../state/history-store';
import type { RoundHistory } from '../state/types';

export function handleRoundEnd(io: Server, roomId: string, roomManager: RoomManager, historyStore: HistoryStore) {
  const room = roomManager.getRoom(roomId);
  if (!room) return;

  const winner = room.game.players.find((p) => p.status !== 'folded' && p.status !== 'eliminated');

  const roundHistory: RoundHistory = {
    roundNumber: room.game.roundNumber,
    players: room.game.players.map((p) => ({
      id: p.id,
      name: p.name,
      cards: p.cards,
      finalStatus: p.status,
      chipChange: p.id === winner?.id ? room.game.pot - p.totalBet : -p.totalBet,
    })),
    pot: room.game.pot,
    winnerId: winner?.id ?? null,
    winnerHand: null,
    actions: [],
  };

  historyStore.addRound(roomId, roundHistory);

  io.to(roomId).emit('game:round-end', {
    winnerId: winner?.id,
    winnerName: winner?.name,
    pot: room.game.pot,
    players: room.game.players.map((p) => ({
      id: p.id,
      name: p.name,
      cards: p.cards,
      status: p.status,
    })),
  });
}
