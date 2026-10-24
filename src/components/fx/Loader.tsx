import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { profile } from "@/data/profile";

const LINES = ["Initializing neural core", "Calibrating star map", "Particle field online", "Ion engines ignited", "All systems nominal"];

export function Loader({ onDone }: { onDone: () => void }) {
  const [pct, setPct] = useState(0);
  const [show, setShow] = useState(true);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let v = 0;
    const id = setInterval(() => {
      v = Math.min(100, v + (reduce ? 25 : Math.random() * 7 + 2));
      setPct(Math.floor(v));
      if (v >= 100) { clearInterval(id); setTimeout(() => { setShow(false); onDone(); }, 500); }
    }, 70);
    return () => clearInterval(id);
  }, [onDone]);
  const step = Math.min(LINES.length, Math.floor(pct / 20) + 1);
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          role="status"
          aria-label={`Loading ${pct}%`}
          exit={{ opacity: 0, scale: 1.08, filter: "blur(12px)" }}
          transition={{ duration: 0.9, ease: [0.7, 0, 0.2, 1] }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[var(--space-5)] text-star"
        >
          <div className="relative h-32 w-32">
            {[0, 1, 2].map((i) => (
              <motion.span key={i} className="absolute inset-0 rounded-full border border-glow/40"
                animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 3 + i, ease: "linear" }}
                style={{ inset: i * 14, borderTopColor: "var(--glow)" }} />
            ))}
            <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 1.6 }}
              className="absolute inset-0 m-auto flex h-12 w-12 items-center justify-center rounded-full bg-glow/20 font-display text-xl text-glow shadow-[var(--shadow-glow)]">
              {profile.initials}
            </motion.div>
          </div>
          <div className="mt-10 font-display text-6xl tabular-nums">{pct}<span className="text-star-soft">%</span></div>
          <div className="mt-4 h-px w-64 overflow-hidden bg-star/10">
            <motion.div className="h-full bg-glow" animate={{ width: `${pct}%` }} />
          </div>
          <ul className="mt-6 h-28 space-y-1 font-mono text-xs text-star-soft">
            {LINES.slice(0, step).map((l) => (
              <motion.li key={l} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                <span className="text-glow">▸</span> {l} … <span className="text-glow">ok</span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
