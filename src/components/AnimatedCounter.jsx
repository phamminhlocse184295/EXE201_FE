import { useEffect, useRef, useState } from "react";

/**
 * AnimatedCounter — smoothly counts up from 0 to `value`
 * Supports numbers and strings like "1,234đ" or "42"
 */
export default function AnimatedCounter({ value, duration = 1200, style }) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef(null);
  const rafRef = useRef(null);

  // Extract numeric part
  const numeric = parseFloat(String(value).replace(/[^\d.]/g, "")) || 0;
  const prefix = String(value).match(/^[^\d]*/)?.[0] || "";
  const suffix = String(value).match(/[^\d.]+$/)?.[0] || "";
  const isFloat = String(value).includes(".");

  useEffect(() => {
    startRef.current = null;
    const animate = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * numeric;
      setDisplay(isFloat ? current : Math.round(current));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [numeric, duration]);

  const formatted = typeof display === "number"
    ? (isFloat ? display.toFixed(1) : Math.round(display).toLocaleString())
    : display;

  return <span style={style}>{prefix}{formatted}{suffix}</span>;
}
