'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameState } from '../../hooks/use-game-state';
import { slideInRight } from '../../lib/animation';

export function GameLog() {
  const { actionLog, gameState } = useGameState();

  if (!gameState) return null;

  const getPlayerName = (playerId: string) => {
    return gameState.players.find((p) => p.id === playerId)?.name ?? 'Unknown';
  };

  const formatAction = (action: any): string => {
    const name = getPlayerName(action.playerId);
    switch (action.type) {
      case 'bet': return `${name} bet ${action.amount ?? ''}`;
      case 'raise': return `${name} raised to ${action.amount ?? ''}`;
      case 'fold': return `${name} folded`;
      case 'see': return `${name} looked at cards`;
      case 'show-request': return `${name} requests a show`;
      case 'show-accept': return `${name} accepted the show`;
      case 'show-reject': return `${name} rejected the show`;
      case 'round-start': return `Round ${action.roundNumber} started`;
      default: return `${name}: ${action.type}`;
    }
  };

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-3 max-h-48 overflow-y-auto game-scrollbar" data-testid="game-log">
      <h3 className="text-sm font-semibold text-gray-400 uppercase mb-2">Game Log</h3>
      {actionLog.length === 0 ? (
        <p className="text-gray-600 text-sm">No actions yet</p>
      ) : (
        <div className="space-y-1">
          <AnimatePresence initial={false}>
            {[...actionLog].reverse().map((action, i) => (
              <motion.div
                key={`${action.type}-${actionLog.length - i}`}
                variants={slideInRight}
                initial="hidden"
                animate="visible"
                className="text-sm text-gray-300"
              >
                {formatAction(action)}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
