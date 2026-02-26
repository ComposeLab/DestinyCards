'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameState } from '../../hooks/use-game-state';

export function TurnIndicator() {
  const { gameState, isMyTurn } = useGameState();

  if (!gameState) return null;

  const fixedClass = "text-center py-1 px-3 sm:py-1.5 sm:px-5 rounded-lg shrink-0 h-[28px] sm:h-[36px] flex items-center justify-center";

  if (gameState.phase === 'show-pending' && gameState.showRequest) {
    return (
      <div className={`${fixedClass} bg-orange-500/20 text-orange-400`}>
        <span className="font-semibold text-sm sm:text-base">Show in progress...</span>
      </div>
    );
  }

  if (gameState.phase !== 'playing') {
    return <div className={`${fixedClass} invisible`}>&nbsp;</div>;
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  if (!currentPlayer) return <div className={`${fixedClass} invisible`}>&nbsp;</div>;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentPlayer.id}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className={`${fixedClass} ${
          isMyTurn ? 'bg-amber-500/20 text-amber-400 blink-pulse' : 'bg-gray-800/60 text-gray-400'
        }`}
      >
        <span className="font-bold text-sm sm:text-base">
          {isMyTurn ? "Your turn!" : `${currentPlayer.name}'s turn`}
        </span>
      </motion.div>
    </AnimatePresence>
  );
}
