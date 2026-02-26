'use client';
import { motion } from 'framer-motion';
import type { PlayerStatus, GamePhase } from '../../lib/types';
import type { Card as CardType } from '../../lib/types';
import { Hand } from './hand';
import { fadeInUp } from '../../lib/animation';

interface MySeatProps {
  name: string;
  chips: number;
  status: PlayerStatus;
  cards: [CardType, CardType, CardType] | null;
  isCurrentTurn: boolean;
  totalBet: number;
  connected: boolean;
  gamePhase: GamePhase;
}

export function MySeat({ name, chips, status, cards, isCurrentTurn, totalBet, connected, gamePhase }: MySeatProps) {
  const showCards = status === 'seen' || gamePhase === 'round-end';
  const isFolded = status === 'folded' || status === 'eliminated';

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      className={`flex flex-col items-center gap-1 sm:gap-1.5 ${isFolded ? 'opacity-50' : ''}`}
      data-testid="my-seat"
    >
      {/* Cards */}
      <Hand cards={cards} faceUp={showCards || status === 'folded'} size="lg" />

      {/* Info row */}
      <div className="flex items-center gap-1.5 sm:gap-3 flex-wrap justify-center">
        <span className="text-amber-400 font-bold text-sm sm:text-base">{name} (You)</span>
        <div className="flex items-center gap-2">
          <span className="text-amber-400 font-bold text-base sm:text-xl">{chips}</span>
          <span className={`font-bold text-base sm:text-xl ${totalBet > 0 ? 'text-emerald-400' : 'invisible'}`}>
            {totalBet > 0 ? totalBet : '0'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
