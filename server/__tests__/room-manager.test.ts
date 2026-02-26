import { describe, it, expect, beforeEach } from 'vitest';
import { RoomManager } from '../state/room-manager';
import type { RoomConfig } from '../state/types';
import { DEFAULT_INITIAL_CHIPS, DEFAULT_INITIAL_STAKE, MAX_PLAYERS } from '../utils/constants';

const defaultConfig: RoomConfig = {
  maxPlayers: MAX_PLAYERS,
  initialChips: DEFAULT_INITIAL_CHIPS,
  initialStake: DEFAULT_INITIAL_STAKE,
  isPrivate: false,
  botCount: 0,
};

describe('RoomManager', () => {
  let manager: RoomManager;

  beforeEach(() => {
    manager = new RoomManager();
  });

  describe('createRoom', () => {
    it('should create a room and return it', () => {
      const room = manager.createRoom('Test Room', 'p1', 'socket1', 'Alice', defaultConfig);
      expect(room).toBeDefined();
      expect(room.name).toBe('Test Room');
      expect(room.hostId).toBe('p1');
    });

    it('should generate a room code', () => {
      const room = manager.createRoom('Test Room', 'p1', 'socket1', 'Alice', defaultConfig);
      expect(room.id).toBeTruthy();
      expect(room.id.length).toBe(6);
    });

    it('should add the creator as first player', () => {
      const room = manager.createRoom('Test Room', 'p1', 'socket1', 'Alice', defaultConfig);
      expect(room.game.players).toHaveLength(1);
      expect(room.game.players[0].id).toBe('p1');
      expect(room.game.players[0].name).toBe('Alice');
      expect(room.game.players[0].isHost).toBe(true);
    });
  });

  describe('getRoom', () => {
    it('should return room by id', () => {
      const room = manager.createRoom('Test', 'p1', 'socket1', 'Alice', defaultConfig);
      const found = manager.getRoom(room.id);
      expect(found).toBeDefined();
      expect(found!.id).toBe(room.id);
    });

    it('should return undefined for non-existent room', () => {
      expect(manager.getRoom('NONEXIST')).toBeUndefined();
    });
  });

  describe('joinRoom', () => {
    it('should add player to room', () => {
      const room = manager.createRoom('Test', 'p1', 'socket1', 'Alice', defaultConfig);
      const updated = manager.joinRoom(room.id, 'p2', 'socket2', 'Bob');
      expect(updated).toBeDefined();
      expect(updated!.game.players).toHaveLength(2);
    });

    it('should fail to join full room', () => {
      const config: RoomConfig = { ...defaultConfig, maxPlayers: 2 };
      const room = manager.createRoom('Test', 'p1', 'socket1', 'Alice', config);
      manager.joinRoom(room.id, 'p2', 'socket2', 'Bob');
      const result = manager.joinRoom(room.id, 'p3', 'socket3', 'Charlie');
      expect(result).toBeNull();
    });

    it('should fail to join non-existent room', () => {
      const result = manager.joinRoom('NONEXIST', 'p2', 'socket2', 'Bob');
      expect(result).toBeNull();
    });

    it('should not add duplicate player', () => {
      const room = manager.createRoom('Test', 'p1', 'socket1', 'Alice', defaultConfig);
      const result = manager.joinRoom(room.id, 'p1', 'socket1', 'Alice');
      expect(result).toBeNull();
    });
  });

  describe('leaveRoom', () => {
    it('should remove player from room', () => {
      const room = manager.createRoom('Test', 'p1', 'socket1', 'Alice', defaultConfig);
      manager.joinRoom(room.id, 'p2', 'socket2', 'Bob');
      manager.leaveRoom(room.id, 'p2');
      const updated = manager.getRoom(room.id);
      expect(updated!.game.players).toHaveLength(1);
    });

    it('should delete room when last player leaves', () => {
      const room = manager.createRoom('Test', 'p1', 'socket1', 'Alice', defaultConfig);
      manager.leaveRoom(room.id, 'p1');
      expect(manager.getRoom(room.id)).toBeUndefined();
    });

    it('should transfer host when host leaves', () => {
      const room = manager.createRoom('Test', 'p1', 'socket1', 'Alice', defaultConfig);
      manager.joinRoom(room.id, 'p2', 'socket2', 'Bob');
      manager.leaveRoom(room.id, 'p1');
      const updated = manager.getRoom(room.id);
      expect(updated!.hostId).toBe('p2');
      expect(updated!.game.players[0].isHost).toBe(true);
    });
  });

  describe('listRooms', () => {
    it('should list all public rooms', () => {
      manager.createRoom('Room 1', 'p1', 'socket1', 'Alice', defaultConfig);
      manager.createRoom('Room 2', 'p2', 'socket2', 'Bob', defaultConfig);
      const rooms = manager.listRooms();
      expect(rooms).toHaveLength(2);
    });

    it('should not list private rooms', () => {
      manager.createRoom('Public', 'p1', 'socket1', 'Alice', defaultConfig);
      manager.createRoom('Private', 'p2', 'socket2', 'Bob', { ...defaultConfig, isPrivate: true });
      const rooms = manager.listRooms();
      expect(rooms).toHaveLength(1);
      expect(rooms[0].name).toBe('Public');
    });
  });
});
