'use client';

import { useEffect, useRef } from 'react';
import { connectSocket, disconnectSocket, getSocket } from '../lib/socket-client';
import { useGameStore } from '../stores/game-store';

export function useSocket() {
  const initialized = useRef(false);
  const { setConnected, setGameState, addAction, setRoundEndInfo } = useGameStore();

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const socket = connectSocket();

    socket.on('connect', () => {
      setConnected(true);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('game:state', (state) => {
      setGameState(state);
    });

    socket.on('game:action', (action) => {
      addAction(action);
    });

    socket.on('game:round-end', (info) => {
      setRoundEndInfo(info);
    });

    return () => {
      // Don't disconnect on unmount in dev (StrictMode double-mount)
    };
  }, [setConnected, setGameState, addAction, setRoundEndInfo]);

  return getSocket();
}
