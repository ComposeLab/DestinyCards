import type { Server, Socket } from 'socket.io';
import type { RoomManager } from '../../state/room-manager';
import type { RoomConfig, Player } from '../../state/types';
import { generatePlayerId } from '../../utils/id-generator';
import { DEFAULT_INITIAL_CHIPS, DEFAULT_INITIAL_STAKE, MAX_PLAYERS } from '../../utils/constants';
import { broadcastRoomState } from '../index';

const BOT_NAMES = ['Bot Alpha', 'Bot Beta', 'Bot Gamma', 'Bot Delta', 'Bot Epsilon', 'Bot Zeta', 'Bot Eta'];

export function registerLobbyHandlers(io: Server, socket: Socket, roomManager: RoomManager) {
  socket.on(
    'room:create',
    (
      data: { roomName: string; playerName: string; config?: Partial<RoomConfig> },
      callback?: (res: { success: boolean; roomId?: string; playerId?: string; error?: string }) => void,
    ) => {
      const playerId = generatePlayerId();
      const botCount = Math.min(Math.max(data.config?.botCount ?? 0, 0), 7);
      const config: RoomConfig = {
        maxPlayers: data.config?.maxPlayers ?? MAX_PLAYERS,
        initialChips: data.config?.initialChips ?? DEFAULT_INITIAL_CHIPS,
        initialStake: data.config?.initialStake ?? DEFAULT_INITIAL_STAKE,
        isPrivate: data.config?.isPrivate ?? false,
        botCount,
      };

      const room = roomManager.createRoom(data.roomName, playerId, socket.id, data.playerName, config);

      // Add bot players
      for (let i = 0; i < botCount; i++) {
        const botId = generatePlayerId();
        const bot: Player = {
          id: botId,
          socketId: `__bot__${botId}`,
          name: BOT_NAMES[i] ?? `Bot ${i + 1}`,
          chips: config.initialChips,
          status: 'waiting',
          cards: null,
          totalBet: 0,
          isHost: false,
          connected: true,
          isBot: true,
        };
        room.game.players.push(bot);
      }
      roomManager.updateRoom(room.id, room);

      socket.join(room.id);

      callback?.({ success: true, roomId: room.id, playerId });
      broadcastRoomState(io, room.id, roomManager);
    },
  );

  socket.on(
    'room:join',
    (
      data: { roomId: string; playerName: string },
      callback?: (res: { success: boolean; roomId?: string; playerId?: string; error?: string }) => void,
    ) => {
      const playerId = generatePlayerId();
      const room = roomManager.joinRoom(data.roomId, playerId, socket.id, data.playerName);

      if (!room) {
        callback?.({ success: false, error: 'Cannot join room' });
        return;
      }

      socket.join(room.id);
      callback?.({ success: true, roomId: room.id, playerId });

      io.to(room.id).emit('room:joined', { playerName: data.playerName, playerId });
      broadcastRoomState(io, room.id, roomManager);
    },
  );

  socket.on('room:leave', (data: { roomId: string; playerId: string }) => {
    const room = roomManager.getRoom(data.roomId);
    if (!room) return;

    roomManager.leaveRoom(data.roomId, data.playerId);
    socket.leave(data.roomId);

    io.to(data.roomId).emit('room:left', { playerId: data.playerId });
    broadcastRoomState(io, data.roomId, roomManager);
  });

  socket.on('lobby:list', (callback?: (rooms: ReturnType<RoomManager['listRooms']>) => void) => {
    const rooms = roomManager.listRooms();
    callback?.(rooms);
  });

  // Handle reconnection
  socket.on(
    'room:reconnect',
    (
      data: { roomId: string; playerId: string },
      callback?: (res: { success: boolean; error?: string }) => void,
    ) => {
      const room = roomManager.getRoom(data.roomId);
      if (!room) {
        callback?.({ success: false, error: 'Room not found' });
        return;
      }

      const player = room.game.players.find((p) => p.id === data.playerId);
      if (!player) {
        callback?.({ success: false, error: 'Player not found' });
        return;
      }

      player.socketId = socket.id;
      player.connected = true;
      socket.join(room.id);

      callback?.({ success: true });
      broadcastRoomState(io, room.id, roomManager);
    },
  );
}
