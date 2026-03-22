import { motion } from "framer-motion";

/**
 * Stagger a list of items with fade+slide-up animation
 * Usage: wrap table <tbody> rows or card grids
 */

export const staggerContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.055, delayChildren: 0.1 },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  show: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

/** Animated container for staggered children */
export function StaggerList({ children, style, className }) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      style={style}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Animated item inside StaggerList */
export function StaggerItem({ children, style, className }) {
  return (
    <motion.div variants={staggerItem} style={style} className={className}>
      {children}
    </motion.div>
  );
}

/** Fade in from nothing */
export function FadeIn({ children, delay = 0, duration = 0.4, style }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: "easeOut" }}
      style={style}
    >
      {children}
    </motion.div>
  );
}

/** Fade in + scale for cards */
export function ScaleFade({ children, delay = 0, style }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      style={style}
    >
      {children}
    </motion.div>
  );
}

/** Animated modal overlay + panel */
export function AnimatedModal({ open, children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: open ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      style={{ position: "fixed", inset: 0, zIndex: 100, display: "grid", placeItems: "center", padding: 16, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
    >
      <motion.div
        initial={{ scale: 0.92, y: 24, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 12, opacity: 0 }}
        transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
