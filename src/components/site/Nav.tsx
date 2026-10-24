import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useEffect, useState } from "react";
import { profile } from "@/data/profile";

export const SECTIONS = ["home", "about", "skills", "projects", "experience", "tools", "contact"] as const;

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  const lenis = (window as unknown as { __lenis?: { scrollTo: (e: Element) => void } }).__lenis;
  if (el) lenis ? lenis.scrollTo(el) : el.scrollIntoView({ behavior: "smooth" });
}

export function Nav() {
  const { scrollY, scrollYProgress } = useScroll();
  const [small, setSmall] = useState(false);
  const [dark, setDark] = useState(false);
  const [active, setActive] = useState("home");
  useMotionValueEvent(scrollY, "change", (v) => setSmall(v > 60));
  useMotionValueEvent(scrollYProgress, "change", (v) => setDark(v > 0.2));
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: "-45% 0px -50% 0px" });
    SECTIONS.forEach((s) => { const el = document.getElementById(s); if (el) io.observe(el); });
    return () => io.disconnect();
  }, []);
  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 120, damping: 18, delay: 0.2 }}
      className="fixed inset-x-0 top-4 z-50 flex justify-center px-3"
    >
      <motion.nav
        aria-label="Primary"
        animate={{ paddingTop: small ? 6 : 12, paddingBottom: small ? 6 : 12, scale: small ? 0.96 : 1 }}
        className={`flex items-center gap-1 rounded-full px-3 ${dark ? "glass text-star" : "glass-light text-ink"}`}
      >
        <button onClick={() => scrollToId("home")} className="mr-2 rounded-full px-3 font-display text-lg" aria-label="Home">{profile.initials}</button>
        <ul className="hidden items-center md:flex">
          {SECTIONS.slice(1).map((s) => (
            <li key={s} className="relative">
              <button onClick={() => scrollToId(s)} className="relative z-10 px-3 py-1.5 text-xs capitalize opacity-80 transition-opacity hover:opacity-100">{s}</button>
              {active === s && <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-glow/25" transition={{ type: "spring", stiffness: 300, damping: 25 }} />}
            </li>
          ))}
        </ul>
        <button onClick={() => scrollToId("contact")} className="ml-1 rounded-full bg-glow px-4 py-1.5 text-xs font-medium text-ink md:hidden">Contact</button>
      </motion.nav>
    </motion.header>
  );
}
