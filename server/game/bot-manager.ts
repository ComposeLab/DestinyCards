import type { Server } from 'socket.io';
import type { RoomManager } from '../state/room-manager';
import type { HistoryStore } from '../state/history-store';
import type { GameEngine } from './engine';
import { decideBotTurn } from './bot-ai';
import { handleRoundEnd } from './round-end';
import { broadcastRoomState } from '../socket/index';
import { canBet, canFold, canSeeCards, canRequestShow } from './validators';

const BOT_DELAY_MS = 1500;
const botTimers = new Map<string, ReturnType<typeof setTimeout>>();

export function clearBotTimer(roomId: string) {
  const timer = botTimers.get(roomId);
  if (timer) {
    clearTimeout(timer);
    botTimers.delete(roomId);
  }
}

export function scheduleBotTurnIfNeeded(
  io: Server,
  roomId: string,
  roomManager: RoomManager,
  historyStore: HistoryStore,
  engine: GameEngine,
) {
  clearBotTimer(roomId);

  const room = roomManager.getRoom(roomId);
  if (!room) return;

  const { game } = room;

  // Handle show-pending phase: check if the show target is a bot
  if (game.phase === 'show-pending' && game.showRequest) {
    const target = game.players.find((p) => p.id === game.showRequest!.toPlayerId);
    if (target?.isBot) {
      const timer = setTimeout(() => {
        botTimers.delete(roomId);
        executeBotShowResponse(io, roomId, roomManager, historyStore, engine);
      }, BOT_DELAY_MS);
      botTimers.set(roomId, timer);
    }
    return;
  }

  if (game.phase !== 'playing') return;

  const currentPlayer = game.players[game.currentPlayerIndex];
  if (!currentPlayer?.isBot) return;

  const timer = setTimeout(() => {
    botTimers.delete(roomId);
    executeBotTurn(io, roomId, roomManager, historyStore, engine);
  }, BOT_DELAY_MS);
  botTimers.set(roomId, timer);
}

function executeBotShowResponse(
  io: Server,
  roomId: string,
  roomManager: RoomManager,
  historyStore: HistoryStore,
  engine: GameEngine,
) {
  const room = roomManager.getRoom(roomId);
  if (!room || room.game.phase !== 'show-pending' || !room.game.showRequest) return;

  const target = room.game.players.find((p) => p.id === room.game.showRequest!.toPlayerId);
  if (!target?.isBot) return;

  const decision = decideBotTurn(room.game, target);
  const accepted = decision.accepted ?? false;

  room.game = engine.respondShow(room.game, accepted);
  roomManager.updateRoom(roomId, room);

  broadcastRoomState(io, roomId, roomManager);
  io.to(roomId).emit('game:action', room.game.lastAction);

  if (room.game.phase === 'round-end') {
    handleRoundEnd(io, roomId, roomManager, historyStore);
  }

  // Continue scheduling if next player is also a bot
  scheduleBotTurnIfNeeded(io, roomId, roomManager, historyStore, engine);
}

function executeBotTurn(
  io: Server,
  roomId: string,
  roomManager: RoomManager,
  historyStore: HistoryStore,
  engine: GameEngine,
) {
  const room = roomManager.getRoom(roomId);
  if (!room || room.game.phase !== 'playing') return;

  const bot = room.game.players[room.game.currentPlayerIndex];
  if (!bot?.isBot) return;

  const decision = decideBotTurn(room.game, bot);

  switch (decision.action) {
    case 'see': {
      const validation = canSeeCards(room.game, bot.id);
      if (!validation.valid) {
        // Fallback to bet if can't see
        room.game = engine.bet(room.game);
      } else {
        room.game = engine.seeCards(room.game, bot.id);
        roomManager.updateRoom(roomId, room);
        broadcastRoomState(io, roomId, roomManager);
        io.to(roomId).emit('game:action', room.game.lastAction);
        // See doesn't advance turn, so schedule another turn for this bot
        scheduleBotTurnIfNeeded(io, roomId, roomManager, historyStore, engine);
        return;
      }
      break;
    }
    case 'bet': {
      const validation = canBet(room.game, bot.id);
      if (!validation.valid) break;
      room.game = engine.bet(room.game);
      break;
    }
    case 'raise': {
      const validation = canBet(room.game, bot.id);
      if (!validation.valid) break;
      room.game = engine.raise(room.game);
      break;
    }
    case 'fold': {
      const validation = canFold(room.game, bot.id);
      if (!validation.valid) {
        // Fallback to bet
        room.game = engine.bet(room.game);
      } else {
        room.game = engine.fold(room.game);
      }
      break;
    }
    case 'show-request': {
      if (!decision.targetId) {
        room.game = engine.bet(room.game);
        break;
      }
      const validation = canRequestShow(room.game, bot.id, decision.targetId);
      if (!validation.valid) {
        room.game = engine.bet(room.game);
      } else {
        room.game = engine.requestShow(room.game, bot.id, decision.targetId);
      }
      break;
    }
    default:
      // Fallback
      room.game = engine.bet(room.game);
      break;
  }

  roomManager.updateRoom(roomId, room);
  broadcastRoomState(io, roomId, roomManager);
  io.to(roomId).emit('game:action', room.game.lastAction);

  if (room.game.phase === 'round-end') {
    handleRoundEnd(io, roomId, roomManager, historyStore);
  }

  // Continue scheduling for cascading bot turns
  scheduleBotTurnIfNeeded(io, roomId, roomManager, historyStore, engine);
}
