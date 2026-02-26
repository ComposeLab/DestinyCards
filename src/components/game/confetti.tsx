'use client';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

const COLORS = ['#f59e0b', '#ef4444', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function Confetti({ count = 25 }: { count?: number }) {
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      x: randomBetween(-200, 200),
      y: randomBetween(-400, -100),
      rotation: randomBetween(0, 360),
      color: COLORS[i % COLORS.length],
      size: randomBetween(6, 12),
      delay: randomBetween(0, 0.5),
      duration: randomBetween(1.5, 3),
    }));
  }, [count]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{
            x: '50%',
            y: '40%',
            opacity: 1,
            scale: 0,
            rotate: 0,
          }}
          animate={{
            x: `calc(50% + ${p.x}px)`,
            y: `calc(40% + ${p.y * -1}px)`,
            opacity: [1, 1, 0],
            scale: [0, 1, 0.5],
            rotate: p.rotation,
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            ease: 'easeOut',
          }}
          style={{
            position: 'absolute',
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: p.size > 9 ? '2px' : '50%',
          }}
        />
      ))}
    </div>
  );
}
