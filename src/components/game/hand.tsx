'use client';
import { motion } from 'framer-motion';
import type { Card as CardType } from '../../lib/types';
import { Card } from './card';
import { cardDeal, staggerContainer } from '../../lib/animation';

interface HandProps {
  cards: [CardType, CardType, CardType] | null;
  faceUp?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export function Hand({ cards, faceUp = false, size = 'md' }: HandProps) {
  return (
    <motion.div
      className="flex gap-0.5 sm:gap-1"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {[0, 1, 2].map((i) => (
        <motion.div key={i} variants={cardDeal}>
          <Card card={cards ? cards[i] : null} faceUp={faceUp} size={size} />
        </motion.div>
      ))}
    </motion.div>
  );
}
