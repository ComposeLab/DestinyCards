import { create } from 'zustand';
import type { ClientGameState, GameAction, RoomInfo, RoomConfig } from '../lib/types';

interface GameStore {
  // Connection
  connected: boolean;
  setConnected: (connected: boolean) => void;

  // Player identity
  playerId: string | null;
  playerName: string | null;
  roomId: string | null;
  setIdentity: (playerId: string, playerName: string, roomId: string) => void;
  clearIdentity: () => void;

  // Game state (from server)
  gameState: ClientGameState | null;
  previousPot: number;
  setGameState: (state: ClientGameState) => void;

  // Lobby
  lobbyRooms: RoomInfo[];
  setLobbyRooms: (rooms: RoomInfo[]) => void;

  // Action log
  actionLog: GameAction[];
  addAction: (action: GameAction) => void;
  clearActionLog: () => void;

  // Round end info
  roundEndInfo: {
    winnerId: string | null;
    winnerName: string | null;
    pot: number;
    players: Array<{ id: string; name: string; cards: any; status: string }>;
  } | null;
  setRoundEndInfo: (info: GameStore['roundEndInfo']) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  connected: false,
  setConnected: (connected) => set({ connected }),

  playerId: null,
  playerName: null,
  roomId: null,
  setIdentity: (playerId, playerName, roomId) => set({ playerId, playerName, roomId }),
  clearIdentity: () => set({ playerId: null, playerName: null, roomId: null }),

  gameState: null,
  previousPot: 0,
  setGameState: (gameState) => set((state) => ({
    gameState,
    previousPot: state.gameState?.pot ?? 0,
  })),

  lobbyRooms: [],
  setLobbyRooms: (lobbyRooms) => set({ lobbyRooms }),

  actionLog: [],
  addAction: (action) => set((state) => ({ actionLog: [...state.actionLog.slice(-49), action] })),
  clearActionLog: () => set({ actionLog: [] }),

  roundEndInfo: null,
  setRoundEndInfo: (roundEndInfo) => set({ roundEndInfo }),
}));
