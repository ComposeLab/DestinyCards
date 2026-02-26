'use client';
import { motion } from 'framer-motion';
import { useGameState } from '../../hooks/use-game-state';
import { Seat } from './seat';
import { PotDisplay } from './pot-display';
import { staggerContainer } from '../../lib/animation';
import type { ReactNode } from 'react';

interface TableProps {
  children?: ReactNode;
}

export function Table({ children }: TableProps) {
  const { gameState, playerId } = useGameState();

  if (!gameState) return null;

  const opponents = gameState.players.filter((p) => p.id !== playerId);

  return (
    <div className="w-full mx-auto flex flex-col items-center gap-1">
      {/* Opponents row — horizontal scroll if too many, visible overflow for glow */}
      <motion.div
        className="flex items-end justify-center gap-0 px-1 py-1 sm:gap-1 sm:px-2 sm:py-2 w-full overflow-x-auto overflow-y-visible scrollbar-hide"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {opponents.map((player) => {
          const playerIndex = gameState.players.findIndex((p) => p.id === player.id);
          return (
            <div key={player.id} className="shrink-0">
              <Seat
                name={player.name}
                chips={player.chips}
                status={player.status}
                cards={player.cards}
                isCurrentTurn={gameState.currentPlayerIndex === playerIndex}
                isMe={false}
                totalBet={player.totalBet}
                connected={player.connected}
                gamePhase={gameState.phase}
                isBot={player.isBot}
              />
            </div>
          );
        })}
      </motion.div>

      {/* 3D Perspective table surface — wide */}
      <div className="table-perspective w-full max-w-4xl px-2 sm:px-4 relative">
        <motion.div
          initial={{ opacity: 0, rotateX: 40 }}
          animate={{ opacity: 1, rotateX: 22 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="table-surface relative mx-auto rounded-xl border-[3px] sm:rounded-2xl sm:border-[6px] border-[#3d2510] shadow-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(to bottom, #5c3a1e, #8b6b42, #6b4c2a)',
          }}
          data-testid="table-surface"
        >
          {/* Felt inlay */}
          <div className="absolute inset-1.5 rounded-lg sm:inset-3 sm:rounded-xl bg-gradient-to-b from-green-800 to-green-900 border-2 border-green-700/50" />

          {/* Pot centered on table */}
          <div className="relative z-10 flex items-center justify-center py-3 sm:py-6">
            <PotDisplay amount={gameState.pot} currentStake={gameState.currentStake} gamePhase={gameState.phase} />
          </div>
        </motion.div>

        {/* Win overlay — centered on the table surface */}
        {children && (
          <div className="absolute inset-0 flex items-center justify-center z-30">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
