import type { Transition, Variants } from 'framer-motion';

// Spring configs
export const spring = {
  snappy: { type: 'spring', stiffness: 400, damping: 30 } as Transition,
  gentle: { type: 'spring', stiffness: 200, damping: 20 } as Transition,
  bouncy: { type: 'spring', stiffness: 300, damping: 15 } as Transition,
};

// Duration constants
export const duration = {
  fast: 0.15,
  normal: 0.3,
  slow: 0.5,
};

// Reusable variants
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: spring.gentle },
  exit: { opacity: 0, y: -10, transition: { duration: duration.fast } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: spring.bouncy },
  exit: { opacity: 0, scale: 0.8, transition: { duration: duration.fast } },
};

export const slideInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: spring.gentle },
  exit: { opacity: 0, x: 20, transition: { duration: duration.fast } },
};

export const cardDeal: Variants = {
  hidden: { opacity: 0, y: -80, scale: 0.5 },
  visible: { opacity: 1, y: 0, scale: 1, transition: spring.bouncy },
};

export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

export const seatEntrance: Variants = {
  hidden: { opacity: 0, scale: 0.6, y: -20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: spring.bouncy },
};
