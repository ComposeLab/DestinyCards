'use client';
import { motion } from 'framer-motion';
import type { Card as CardType } from '../../lib/types';
import { getSuitSymbol, getSuitColor } from '../../lib/card-utils';

interface CardProps {
  card: CardType | null;
  faceUp?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  xs: 'w-8 h-[2.8rem] text-[0.6rem]',
  sm: 'w-10 h-[3.5rem] text-xs sm:w-12 sm:h-[4.2rem]',
  md: 'w-14 h-[4.9rem] text-sm sm:w-16 sm:h-[5.6rem]',
  lg: 'w-16 h-[5.6rem] text-base sm:w-20 sm:h-[7rem]',
  xl: 'w-24 h-[8.4rem] text-xl sm:w-28 sm:h-[9.8rem]',
};

const centerSuitSize: Record<string, string> = {
  xs: 'text-base',
  sm: 'text-lg sm:text-lg',
  md: 'text-xl sm:text-2xl',
  lg: 'text-2xl sm:text-3xl',
  xl: 'text-4xl sm:text-5xl',
};

export function Card({ card, faceUp = false, size = 'md' }: CardProps) {
  const showFace = faceUp && card;

  return (
    <motion.div
      className={`${sizeClasses[size]} perspective-500`}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 transform-3d ${showFace ? 'rotate-y-180' : ''}`}
      >
        {/* Back */}
        <div className="absolute inset-0 backface-hidden rounded-lg bg-gradient-to-br from-indigo-900 to-purple-900 border-2 border-indigo-700 flex items-center justify-center shadow-lg">
          <span className="text-indigo-400 font-bold text-sm sm:text-lg">DC</span>
        </div>
        {/* Front */}
        <div className="absolute inset-0 backface-hidden rotate-y-180 rounded-lg bg-white border border-gray-300 p-1 shadow-lg flex flex-col justify-between">
          {card && (
            <>
              <div className={`font-bold leading-none ${getSuitColor(card.suit)}`}>
                <div>{card.rank}</div>
                <div>{getSuitSymbol(card.suit)}</div>
              </div>
              <div className={`text-center ${centerSuitSize[size]} ${getSuitColor(card.suit)}`}>
                {getSuitSymbol(card.suit)}
              </div>
              <div className={`font-bold leading-none self-end rotate-180 ${getSuitColor(card.suit)}`}>
                <div>{card.rank}</div>
                <div>{getSuitSymbol(card.suit)}</div>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}
