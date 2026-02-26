import type { Server, Socket } from 'socket.io';
import type { RoomManager } from '../../state/room-manager';
import type { HistoryStore } from '../../state/history-store';
import type { GameEngine } from '../../game/engine';
import type { RoundHistory } from '../../state/types';
import { canBet, canFold, canSeeCards, canRequestShow, canStartGame } from '../../game/validators';
import { broadcastRoomState } from '../index';
import { handleRoundEnd } from '../../game/round-end';
import { scheduleBotTurnIfNeeded } from '../../game/bot-manager';

type ActionCallback = (res: { success: boolean; error?: string }) => void;

export function registerGameHandlers(
  io: Server,
  socket: Socket,
  roomManager: RoomManager,
  historyStore: HistoryStore,
  engine: GameEngine,
) {
  socket.on('game:start', (data: { roomId: string; playerId: string }, callback?: ActionCallback) => {
    const room = roomManager.getRoom(data.roomId);
    if (!room) {
      callback?.({ success: false, error: 'Room not found' });
      return;
    }

    const validation = canStartGame(room.game, data.playerId);
    if (!validation.valid) {
      callback?.({ success: false, error: validation.reason });
      return;
    }

    const prevRoundNumber = room.game.roundNumber;
    const prevDealerIndex = room.game.dealerIndex;
    const connectedPlayers = room.game.players.filter((p) => p.connected);

    room.game = engine.startRound(connectedPlayers, room.config.initialStake);
    room.game.roundNumber = prevRoundNumber + 1;
    room.game.dealerIndex = prevDealerIndex;
    roomManager.updateRoom(room.id, room);

    callback?.({ success: true });
    broadcastRoomState(io, room.id, roomManager);
    io.to(room.id).emit('game:action', { type: 'round-start', roundNumber: room.game.roundNumber });
    scheduleBotTurnIfNeeded(io, room.id, roomManager, historyStore, engine);
  });

  socket.on('game:bet', (data: { roomId: string; playerId: string }, callback?: ActionCallback) => {
    const room = roomManager.getRoom(data.roomId);
    if (!room) {
      callback?.({ success: false, error: 'Room not found' });
      return;
    }

    const validation = canBet(room.game, data.playerId);
    if (!validation.valid) {
      callback?.({ success: false, error: validation.reason });
      return;
    }

    room.game = engine.bet(room.game);
    roomManager.updateRoom(room.id, room);

    callback?.({ success: true });
    broadcastRoomState(io, room.id, roomManager);
    io.to(room.id).emit('game:action', room.game.lastAction);
    scheduleBotTurnIfNeeded(io, room.id, roomManager, historyStore, engine);
  });

  socket.on('game:raise', (data: { roomId: string; playerId: string }, callback?: ActionCallback) => {
    const room = roomManager.getRoom(data.roomId);
    if (!room) {
      callback?.({ success: false, error: 'Room not found' });
      return;
    }

    const validation = canBet(room.game, data.playerId);
    if (!validation.valid) {
      callback?.({ success: false, error: validation.reason });
      return;
    }

    room.game = engine.raise(room.game);
    roomManager.updateRoom(room.id, room);

    callback?.({ success: true });
    broadcastRoomState(io, room.id, roomManager);
    io.to(room.id).emit('game:action', room.game.lastAction);
    scheduleBotTurnIfNeeded(io, room.id, roomManager, historyStore, engine);
  });

  socket.on('game:fold', (data: { roomId: string; playerId: string }, callback?: ActionCallback) => {
    const room = roomManager.getRoom(data.roomId);
    if (!room) {
      callback?.({ success: false, error: 'Room not found' });
      return;
    }

    const validation = canFold(room.game, data.playerId);
    if (!validation.valid) {
      callback?.({ success: false, error: validation.reason });
      return;
    }

    room.game = engine.fold(room.game);
    roomManager.updateRoom(room.id, room);

    callback?.({ success: true });
    broadcastRoomState(io, room.id, roomManager);
    io.to(room.id).emit('game:action', room.game.lastAction);

    if (room.game.phase === 'round-end') {
      handleRoundEnd(io, room.id, roomManager, historyStore);
    }
    scheduleBotTurnIfNeeded(io, room.id, roomManager, historyStore, engine);
  });

  socket.on('game:see', (data: { roomId: string; playerId: string }, callback?: ActionCallback) => {
    const room = roomManager.getRoom(data.roomId);
    if (!room) {
      callback?.({ success: false, error: 'Room not found' });
      return;
    }

    const validation = canSeeCards(room.game, data.playerId);
    if (!validation.valid) {
      callback?.({ success: false, error: validation.reason });
      return;
    }

    room.game = engine.seeCards(room.game, data.playerId);
    roomManager.updateRoom(room.id, room);

    callback?.({ success: true });
    broadcastRoomState(io, room.id, roomManager);
    io.to(room.id).emit('game:action', room.game.lastAction);
    scheduleBotTurnIfNeeded(io, room.id, roomManager, historyStore, engine);
  });

  socket.on(
    'game:show-request',
    (data: { roomId: string; playerId: string; targetId: string }, callback?: ActionCallback) => {
      const room = roomManager.getRoom(data.roomId);
      if (!room) {
        callback?.({ success: false, error: 'Room not found' });
        return;
      }

      const validation = canRequestShow(room.game, data.playerId, data.targetId);
      if (!validation.valid) {
        callback?.({ success: false, error: validation.reason });
        return;
      }

      room.game = engine.requestShow(room.game, data.playerId, data.targetId);
      roomManager.updateRoom(room.id, room);

      callback?.({ success: true });
      broadcastRoomState(io, room.id, roomManager);
      io.to(room.id).emit('game:action', room.game.lastAction);
      scheduleBotTurnIfNeeded(io, room.id, roomManager, historyStore, engine);
    },
  );

  socket.on(
    'game:show-respond',
    (data: { roomId: string; playerId: string; accepted: boolean }, callback?: ActionCallback) => {
      const room = roomManager.getRoom(data.roomId);
      if (!room) {
        callback?.({ success: false, error: 'Room not found' });
        return;
      }
      if (!room.game.showRequest) {
        callback?.({ success: false, error: 'No pending show request' });
        return;
      }
      if (room.game.showRequest.toPlayerId !== data.playerId) {
        callback?.({ success: false, error: 'Not the target of the show request' });
        return;
      }

      room.game = engine.respondShow(room.game, data.accepted);
      roomManager.updateRoom(room.id, room);

      callback?.({ success: true });
      broadcastRoomState(io, room.id, roomManager);
      io.to(room.id).emit('game:action', room.game.lastAction);

      if (room.game.phase === 'round-end') {
        handleRoundEnd(io, room.id, roomManager, historyStore);
      }
      scheduleBotTurnIfNeeded(io, room.id, roomManager, historyStore, engine);
    },
  );

  socket.on('game:history', (data: { roomId: string }, callback?: (rounds: RoundHistory[]) => void) => {
    const history = historyStore.getRoomHistory(data.roomId);
    callback?.(history);
  });

  socket.on('game:next-round', (data: { roomId: string; playerId: string }, callback?: ActionCallback) => {
    const room = roomManager.getRoom(data.roomId);
    if (!room) {
      callback?.({ success: false, error: 'Room not found' });
      return;
    }
    if (room.game.phase !== 'round-end') {
      callback?.({ success: false, error: 'Round not ended' });
      return;
    }

    const prevRoundNumber = room.game.roundNumber;

    // Reset player statuses, keep chips
    for (const p of room.game.players) {
      if ((p.connected || p.isBot) && p.chips > 0) {
        p.status = 'waiting';
        p.cards = null;
        p.totalBet = 0;
      }
    }

    // Move dealer
    const nextDealerIndex = (room.game.dealerIndex + 1) % room.game.players.length;

    const activePlayers = room.game.players.filter((p) => (p.connected || p.isBot) && p.chips > 0);
    if (activePlayers.length < 2) {
      room.game.phase = 'waiting';
      room.game.dealerIndex = nextDealerIndex;
      roomManager.updateRoom(room.id, room);
      callback?.({ success: true });
      broadcastRoomState(io, room.id, roomManager);
      return;
    }

    room.game = engine.startRound(activePlayers, room.config.initialStake);
    room.game.roundNumber = prevRoundNumber + 1;
    room.game.dealerIndex = nextDealerIndex;
    roomManager.updateRoom(room.id, room);

    callback?.({ success: true });
    broadcastRoomState(io, room.id, roomManager);
    scheduleBotTurnIfNeeded(io, room.id, roomManager, historyStore, engine);
  });
}
