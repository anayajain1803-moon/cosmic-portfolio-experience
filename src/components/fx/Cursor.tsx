import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export function Cursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 300, damping: 25, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 300, damping: 25, mass: 0.6 });
  const tx = useSpring(x, { stiffness: 80, damping: 20 });
  const ty = useSpring(y, { stiffness: 80, damping: 20 });
  const [hover, setHover] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);
    const parts: { x: number; y: number; vx: number; vy: number; life: number }[] = [];
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const t = e.target as HTMLElement;
      setHover(!!t.closest("a,button,[data-magnetic]"));
      if (parts.length < 80) parts.push({ x: e.clientX, y: e.clientY, vx: (Math.random() - 0.5) * 0.8, vy: (Math.random() - 0.5) * 0.8, life: 1 });
    };
    window.addEventListener("pointermove", move);
    const c = canvas.current!;
    const ctx = c.getContext("2d")!;
    let raf = 0;
    const resize = () => { c.width = innerWidth; c.height = innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const tick = () => {
      ctx.clearRect(0, 0, c.width, c.height);
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.x += p.vx; p.y += p.vy; p.life -= 0.025;
        if (p.life <= 0) { parts.splice(i, 1); continue; }
        ctx.fillStyle = `rgba(140,180,255,${p.life * 0.7})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, 2 * p.life, 0, Math.PI * 2); ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { cancelAnimationFrame(raf); window.removeEventListener("pointermove", move); window.removeEventListener("resize", resize); };
  }, [x, y]);

  if (!enabled) return <canvas ref={canvas} className="hidden" />;
  return (
    <div className="pointer-events-none fixed inset-0 z-[100]" aria-hidden>
      <canvas ref={canvas} className="absolute inset-0 mix-blend-screen" />
      <motion.div style={{ x: tx, y: ty }} className="absolute -left-6 -top-6 h-12 w-12 rounded-full bg-glow/20 blur-xl" />
      <motion.div style={{ x: sx, y: sy }} className="absolute left-0 top-0">
        <motion.div
          animate={{ scale: hover ? 2.6 : 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
          className="-ml-2 -mt-2 h-4 w-4 rounded-full bg-glow shadow-[var(--shadow-glow)] mix-blend-difference"
        />
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 3, ease: "linear" }} className="absolute -left-5 -top-5 h-10 w-10">
          <span className="absolute left-1/2 top-0 h-1 w-1 rounded-full bg-glow" />
          <span className="absolute bottom-0 left-1/2 h-1 w-1 rounded-full bg-glow/60" />
        </motion.div>
      </motion.div>
    </div>
  );
}
