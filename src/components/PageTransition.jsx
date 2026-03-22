import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";

const variants = {
  initial: { opacity: 0, y: 16, scale: 0.99, filter: "blur(4px)" },
  animate: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" },
  exit:    { opacity: 0, y: -8, scale: 1.01, filter: "blur(2px)" },
};

export default function PageTransition({ children }) {
  const { pathname } = useLocation();
  return (
    <AnimatePresence mode="wait" initial={true}>
      <motion.div
        key={pathname}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{ width: "100%", height: "100%" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
