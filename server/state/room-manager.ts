import type { Room, RoomConfig, RoomInfo, Player, GameState } from './types';
import { generateRoomCode, generatePlayerId } from '../utils/id-generator';

export class RoomManager {
  private rooms: Map<string, Room> = new Map();

  createRoom(name: string, playerId: string, socketId: string, playerName: string, config: RoomConfig): Room {
    const roomId = generateRoomCode();
    const host: Player = {
      id: playerId,
      socketId,
      name: playerName,
      chips: config.initialChips,
      status: 'waiting',
      cards: null,
      totalBet: 0,
      isHost: true,
      connected: true,
      isBot: false,
    };
    const game: GameState = {
      phase: 'waiting',
      players: [host],
      pot: 0,
      currentStake: config.initialStake,
      currentPlayerIndex: 0,
      dealerIndex: 0,
      deck: [],
      showRequest: null,
      roundNumber: 0,
      lastAction: null,
    };
    const room: Room = {
      id: roomId,
      name,
      hostId: playerId,
      config,
      game,
      createdAt: Date.now(),
    };
    this.rooms.set(roomId, room);
    return room;
  }

  getRoom(roomId: string): Room | undefined {
    return this.rooms.get(roomId);
  }

  joinRoom(roomId: string, playerId: string, socketId: string, playerName: string): Room | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    if (room.game.players.length >= room.config.maxPlayers) return null;
    if (room.game.players.some(p => p.id === playerId)) return null;

    const player: Player = {
      id: playerId,
      socketId,
      name: playerName,
      chips: room.config.initialChips,
      status: 'waiting',
      cards: null,
      totalBet: 0,
      isHost: false,
      connected: true,
      isBot: false,
    };
    room.game.players.push(player);
    return room;
  }

  leaveRoom(roomId: string, playerId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    room.game.players = room.game.players.filter(p => p.id !== playerId);

    if (room.game.players.length === 0) {
      this.rooms.delete(roomId);
      return;
    }

    // Transfer host if needed
    if (room.hostId === playerId) {
      room.hostId = room.game.players[0].id;
      room.game.players[0].isHost = true;
    }
  }

  listRooms(): RoomInfo[] {
    const result: RoomInfo[] = [];
    for (const room of this.rooms.values()) {
      if (!room.config.isPrivate) {
        result.push({
          id: room.id,
          name: room.name,
          playerCount: room.game.players.length,
          maxPlayers: room.config.maxPlayers,
          phase: room.game.phase,
          isPrivate: false,
        });
      }
    }
    return result;
  }

  // Helper methods
  updateRoom(roomId: string, room: Room): void {
    this.rooms.set(roomId, room);
  }

  deleteRoom(roomId: string): void {
    this.rooms.delete(roomId);
  }

  findRoomBySocketId(socketId: string): Room | undefined {
    for (const room of this.rooms.values()) {
      if (room.game.players.some(p => p.socketId === socketId)) {
        return room;
      }
    }
    return undefined;
  }

  findPlayerBySocketId(socketId: string): { room: Room; player: Player } | undefined {
    for (const room of this.rooms.values()) {
      const player = room.game.players.find(p => p.socketId === socketId);
      if (player) return { room, player };
    }
    return undefined;
  }
}
