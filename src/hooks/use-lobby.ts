'use client';

import { useCallback } from 'react';
import { useGameStore } from '../stores/game-store';
import { getSocket } from '../lib/socket-client';
import type { RoomConfig } from '../lib/types';

export function useLobby() {
  const lobbyRooms = useGameStore((s) => s.lobbyRooms);
  const setLobbyRooms = useGameStore((s) => s.setLobbyRooms);
  const setIdentity = useGameStore((s) => s.setIdentity);

  const refreshRooms = useCallback(() => {
    const socket = getSocket();
    socket.emit('lobby:list', (rooms: any[]) => {
      setLobbyRooms(rooms);
    });
  }, [setLobbyRooms]);

  const createRoom = useCallback(
    (roomName: string, playerName: string, config?: Partial<RoomConfig>) => {
      return new Promise<string>((resolve, reject) => {
        const socket = getSocket();
        socket.emit('room:create', { roomName, playerName, config }, (res: any) => {
          if (res.success) {
            setIdentity(res.playerId, playerName, res.roomId);
            resolve(res.roomId);
          } else {
            reject(new Error(res.error));
          }
        });
      });
    },
    [setIdentity]
  );

  const joinRoom = useCallback(
    (roomId: string, playerName: string) => {
      return new Promise<string>((resolve, reject) => {
        const socket = getSocket();
        socket.emit('room:join', { roomId, playerName }, (res: any) => {
          if (res.success) {
            setIdentity(res.playerId, playerName, res.roomId);
            resolve(res.roomId);
          } else {
            reject(new Error(res.error));
          }
        });
      });
    },
    [setIdentity]
  );

  const leaveRoom = useCallback((roomId: string, playerId: string) => {
    const socket = getSocket();
    socket.emit('room:leave', { roomId, playerId });
    useGameStore.getState().clearIdentity();
    useGameStore.getState().setGameState(null as any);
  }, []);

  return { lobbyRooms, refreshRooms, createRoom, joinRoom, leaveRoom };
}
