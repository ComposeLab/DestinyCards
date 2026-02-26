import { Server as HTTPServer } from 'http';
import { Server } from 'socket.io';
import { RoomManager } from '../state/room-manager';
import { HistoryStore } from '../state/history-store';
import { GameEngine } from '../game/engine';
import { registerLobbyHandlers } from './handlers/lobby.handler';
import { registerGameHandlers } from './handlers/game.handler';

export function setupSocketIO(httpServer: HTTPServer) {
  const io = new Server(httpServer, {
    cors: { origin: '*' },
  });

  const roomManager = new RoomManager();
  const historyStore = new HistoryStore();
  const engine = new GameEngine();

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    registerLobbyHandlers(io, socket, roomManager);
    registerGameHandlers(io, socket, roomManager, historyStore, engine);

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      handleDisconnect(io, socket, roomManager);
    });
  });

  return io;
}

function handleDisconnect(io: Server, socket: { id: string }, roomManager: RoomManager) {
  const found = roomManager.findPlayerBySocketId(socket.id);
  if (!found) return;

  const { room, player } = found;
  player.connected = false;

  // Broadcast updated state to room
  broadcastRoomState(io, room.id, roomManager);
}

export function broadcastRoomState(io: Server, roomId: string, roomManager: RoomManager) {
  const room = roomManager.getRoom(roomId);
  if (!room) return;

  // Send personalized state to each player (skip bots)
  for (const player of room.game.players) {
    if (player.isBot) continue;

    const clientState = {
      phase: room.game.phase,
      players: room.game.players.map((p) => ({
        id: p.id,
        name: p.name,
        chips: p.chips,
        status: p.status,
        // Only show cards to the player themselves (if seen) or everyone at round-end
        cards:
          (p.id === player.id && p.status === 'seen') || room.game.phase === 'round-end'
            ? p.cards
            : null,
        totalBet: p.totalBet,
        isHost: p.isHost,
        connected: p.connected,
        isBot: p.isBot,
      })),
      pot: room.game.pot,
      currentStake: room.game.currentStake,
      currentPlayerIndex: room.game.currentPlayerIndex,
      dealerIndex: room.game.dealerIndex,
      showRequest: room.game.showRequest,
      roundNumber: room.game.roundNumber,
      lastAction: room.game.lastAction,
      myPlayerId: player.id,
    };
    io.to(player.socketId).emit('game:state', clientState);
  }
}
