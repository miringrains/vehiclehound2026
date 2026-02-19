import type { Variants, Transition } from "framer-motion";

const easeOut = [0.16, 1, 0.3, 1] as const;
const easeIn = [0.7, 0, 0.84, 0] as const;
const easeInOut = [0.87, 0, 0.13, 1] as const;

const smooth = 0.3;
const slow = 0.5;

export const transitions = {
  fast: { duration: 0.1, ease: easeOut } satisfies Transition,
  normal: { duration: 0.2, ease: easeOut } satisfies Transition,
  smooth: { duration: smooth, ease: easeOut } satisfies Transition,
  slow: { duration: slow, ease: easeOut } satisfies Transition,
  spring: { type: "spring", stiffness: 300, damping: 30 } satisfies Transition,
} as const;

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: smooth, ease: easeOut } },
  exit: { opacity: 0, transition: { duration: 0.2, ease: easeIn } },
};

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: smooth, ease: easeOut } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: easeIn } },
};

export const fadeDown: Variants = {
  hidden: { opacity: 0, y: -12 },
  visible: { opacity: 1, y: 0, transition: { duration: smooth, ease: easeOut } },
  exit: { opacity: 0, y: 12, transition: { duration: 0.2, ease: easeIn } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: smooth, ease: easeOut },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.2, ease: easeIn },
  },
};

export const slideInLeft: Variants = {
  hidden: { x: -16, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: smooth, ease: easeOut } },
  exit: { x: -16, opacity: 0, transition: { duration: 0.2, ease: easeIn } },
};

export const slideInRight: Variants = {
  hidden: { x: 16, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: smooth, ease: easeOut } },
  exit: { x: 16, opacity: 0, transition: { duration: 0.2, ease: easeIn } },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: smooth, ease: easeOut } },
};

export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: smooth,
      ease: easeOut,
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

void easeInOut;
