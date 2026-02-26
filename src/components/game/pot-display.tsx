'use client';
import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';
import { useGameStore } from '../../stores/game-store';
import type { GamePhase } from '../../lib/types';

interface PotDisplayProps {
  amount: number;
  currentStake: number;
  gamePhase: GamePhase;
}

function AnimatedNumber({ value }: { value: number }) {
  const spring = useSpring(0, { stiffness: 100, damping: 20 });
  const display = useTransform(spring, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span>{display}</motion.span>;
}

export function PotDisplay({ amount, currentStake, gamePhase }: PotDisplayProps) {
  const previousPot = useGameStore((s) => s.previousPot);
  const changed = amount !== previousPot;

  const isWaiting = gamePhase === 'waiting';

  return (
    <div
      className={`flex items-center ${isWaiting ? 'invisible' : ''}`}
      data-testid="pot-display"
    >
      <div className="bg-black/40 border border-amber-700/60 rounded-xl px-3 py-1.5 sm:px-6 sm:py-3 backdrop-blur flex items-center gap-3 sm:gap-6">
        <div className="flex flex-col items-center">
          <div className="text-amber-200/60 text-xs font-semibold tracking-wider">POT</div>
          <div className="text-amber-400 text-xl sm:text-3xl font-bold leading-tight">
            {isWaiting ? '0' : <AnimatedNumber value={amount} />}
          </div>
        </div>
        <div className="w-px h-5 sm:h-8 bg-amber-700/40" />
        <div className="flex flex-col items-center">
          <div className="text-emerald-200/60 text-xs font-semibold tracking-wider">STAKE</div>
          <div className="text-emerald-400 text-base sm:text-xl font-bold leading-tight">{currentStake}</div>
        </div>
      </div>
    </div>
  );
}
