'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../../../hooks/use-socket';
import { useGameState } from '../../../hooks/use-game-state';
import { useGameStore } from '../../../stores/game-store';
import { Table } from '../../../components/game/table';
import { MySeat } from '../../../components/game/my-seat';
import { ActionPanel } from '../../../components/game/action-panel';
import { TurnIndicator } from '../../../components/game/turn-indicator';
import { HistoryPanel } from '../../../components/history/history-panel';
import { Confetti } from '../../../components/game/confetti';
import { Button } from '../../../components/ui/button';
import { scaleIn } from '../../../lib/animation';
import { playSound, setMuted } from '../../../lib/sounds';
import { getSocket } from '../../../lib/socket-client';

function SoundToggle() {
  const [muted, setMutedState] = useState(false);

  const toggle = useCallback(() => {
    const next = !muted;
    setMutedState(next);
    setMuted(next);
  }, [muted]);

  return (
    <button
      onClick={toggle}
      className="text-gray-400 hover:text-white transition-colors px-2 py-1 rounded text-sm"
      data-testid="sound-toggle"
      title={muted ? 'Unmute' : 'Mute'}
    >
      <span className="sm:hidden">{muted ? '🔇' : '🔊'}</span>
      <span className="hidden sm:inline">{muted ? 'Sound OFF' : 'Sound ON'}</span>
    </button>
  );
}

function StartGameOverlay() {
  const { gameState, myPlayer } = useGameState();
  const roomId = useGameStore((s) => s.roomId);

  if (!gameState || !myPlayer || !roomId) return null;
  if (gameState.phase !== 'waiting' || !myPlayer.isHost) return null;

  const socket = getSocket();
  const canStart = gameState.players.filter((p) => p.connected).length >= 2;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
    >
      <div className="pointer-events-auto">
        <Button
          size="lg"
          className="text-base px-6 py-3 sm:text-xl sm:px-10 sm:py-5 shadow-2xl"
          onClick={() => socket.emit('game:start', { roomId, playerId: myPlayer.id })}
          disabled={!canStart}
          data-testid="start-game-button"
        >
          {canStart ? 'Start Game' : 'Waiting for Players...'}
        </Button>
      </div>
    </motion.div>
  );
}

function WinOverlay() {
  const { roundEndInfo } = useGameState();
  const { gameState } = useGameState();

  if (gameState?.phase !== 'round-end' || !roundEndInfo) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="win-overlay"
        variants={scaleIn}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="bg-gray-900/90 border-2 border-amber-500 rounded-xl px-4 py-3 sm:rounded-2xl sm:px-8 sm:py-5 text-center backdrop-blur-sm shadow-2xl"
        data-testid="win-overlay"
      >
        <Confetti />
        <motion.h2
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15, delay: 0.2 }}
          className="text-2xl font-bold text-amber-400 mb-1"
        >
          {roundEndInfo.winnerName} wins!
        </motion.h2>
        <p className="text-lg text-gray-300">Pot: <span className="text-amber-400 font-bold">{roundEndInfo.pot}</span></p>
      </motion.div>
    </AnimatePresence>
  );
}

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const socket = useSocket();
  const { gameState, myPlayer, roundEndInfo } = useGameState();
  const roomId = useGameStore((s) => s.roomId);
  const playerId = useGameStore((s) => s.playerId);
  const playerName = useGameStore((s) => s.playerName);

  useEffect(() => {
    if (gameState?.phase === 'round-end' && roundEndInfo) {
      playSound('win-fanfare');
    }
  }, [gameState?.phase, roundEndInfo]);

  useEffect(() => {
    if (!playerId || !roomId) {
      router.push('/');
    }
  }, [playerId, roomId, router]);

  const handleLeave = () => {
    if (roomId && playerId) {
      socket.emit('room:leave', { roomId, playerId });
      useGameStore.getState().clearIdentity();
    }
    router.push('/');
  };

  if (!gameState) {
    return (
      <div className="h-dvh game-bg flex items-center justify-center">
        <div className="text-gray-400 text-lg">Connecting to room...</div>
      </div>
    );
  }

  return (
    <div className="h-dvh game-bg flex flex-col overflow-hidden">
      {/* Header — compact */}
      <header className="bg-gray-900/60 border-b border-gray-800 px-2 py-1 sm:px-4 sm:py-1.5 flex items-center justify-between backdrop-blur-sm z-40 shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-3">
          <h1 className="text-xs sm:text-sm font-bold text-white">Room: {params.roomId}</h1>
          <span className="hidden sm:inline text-xs text-gray-500">Round {gameState.roundNumber}</span>
        </div>
        <div className="flex items-center gap-2">
          <SoundToggle />
          <HistoryPanel />
          <span className="hidden sm:inline text-xs text-gray-400">{playerName}</span>
          <Button variant="ghost" size="sm" onClick={handleLeave}>
            Leave
          </Button>
        </div>
      </header>

      {/* Zone 1: Opponents + Table — fills remaining space, no scroll */}
      <div className="flex-1 min-h-0 flex flex-col items-center relative px-1 pt-0.5 sm:px-2 sm:pt-1">
        <TurnIndicator />

        <div className="relative w-full flex-1 min-h-0 flex flex-col items-center justify-center">
          <Table>
            {gameState.phase === 'round-end' && roundEndInfo ? <WinOverlay /> : <StartGameOverlay />}
          </Table>
        </div>
      </div>

      {/* Zone 2: My cards + actions — fixed at bottom, never scrolls */}
      <div className="shrink-0 px-1.5 pb-1.5 pt-0.5 sm:px-3 sm:pb-2 sm:pt-1 flex flex-col items-center gap-1 sm:gap-1.5 border-t border-gray-800/50">
        {myPlayer && (
          <MySeat
            name={myPlayer.name}
            chips={myPlayer.chips}
            status={myPlayer.status}
            cards={myPlayer.cards}
            isCurrentTurn={gameState.players[gameState.currentPlayerIndex]?.id === playerId}
            totalBet={myPlayer.totalBet}
            connected={myPlayer.connected}
            gamePhase={gameState.phase}
          />
        )}
        <ActionPanel />
      </div>

    </div>
  );
}
