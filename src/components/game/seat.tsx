'use client';
import { motion } from 'framer-motion';
import type { PlayerStatus, GamePhase } from '../../lib/types';
import type { Card as CardType } from '../../lib/types';
import { Hand } from './hand';
import { seatEntrance } from '../../lib/animation';

interface SeatProps {
  name: string;
  chips: number;
  status: PlayerStatus;
  cards: [CardType, CardType, CardType] | null;
  isCurrentTurn: boolean;
  isMe: boolean;
  totalBet: number;
  connected: boolean;
  gamePhase: GamePhase;
  isBot: boolean;
}

export function Seat({ name, chips, status, cards, isCurrentTurn, isMe, totalBet, connected, gamePhase, isBot }: SeatProps) {
  const showCards = (isMe && status === 'seen') || gamePhase === 'round-end';
  const isFolded = status === 'folded' || status === 'eliminated';

  return (
    <motion.div
      variants={seatEntrance}
      initial="hidden"
      animate="visible"
      className={`flex flex-col items-center gap-0.5 px-1.5 py-1 m-1 sm:gap-1 sm:px-3 sm:py-2 sm:m-2 rounded-xl border transition-colors ${
        isFolded
          ? 'opacity-40 border-red-900/50 bg-red-950/20'
          : isCurrentTurn
            ? 'border-amber-500/60 bg-amber-950/20'
            : 'border-gray-700/50 bg-gray-800/20'
      } ${!connected ? 'opacity-30' : ''}`}
      data-testid={`seat-${name}`}
    >
      {/* Avatar with status overlay */}
      <div className="relative">
        <div className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shrink-0 ${
          isCurrentTurn ? 'avatar-blink bg-amber-500 text-black' : 'bg-gray-700 text-gray-300'
        }`}>
          {name.charAt(0).toUpperCase()}
        </div>
        {/* Seen: eye icon overlay */}
        {status === 'seen' && !isFolded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-sm sm:text-lg drop-shadow-lg" title="Seen">👁</span>
          </div>
        )}
        {/* Folded: red X overlay */}
        {isFolded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl sm:text-2xl font-black text-red-500 drop-shadow-lg leading-none">✕</span>
          </div>
        )}
      </div>

      {/* Name */}
      <div className={`font-bold text-xs sm:text-base max-w-[60px] sm:max-w-none truncate ${isMe ? 'text-amber-400' : 'text-white'} text-center leading-tight whitespace-nowrap`}>
        {name}{isBot ? <span className="text-xs text-blue-400 ml-1">Bot</span> : null}
      </div>

      {/* Chips and Bet — side by side, always reserve bet space */}
      <div className="flex items-center gap-2 leading-none">
        <span className="text-amber-400 font-bold text-sm sm:text-lg">{chips}</span>
        <span className={`font-bold text-sm sm:text-lg ${
          isFolded && totalBet > 0 ? 'text-red-400' : totalBet > 0 ? 'text-emerald-400' : 'invisible'
        }`}>
          {isFolded && totalBet > 0 ? `-${totalBet}` : totalBet > 0 ? totalBet : '0'}
        </span>
      </div>

      {/* Cards (small) */}
      <Hand cards={cards} faceUp={showCards || status === 'folded'} size="xs" />

      {!connected && <span className="text-xs text-red-400 font-semibold">Disconnected</span>}
    </motion.div>
  );
}
