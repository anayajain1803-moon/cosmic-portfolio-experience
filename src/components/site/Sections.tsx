import { AnimatePresence, motion, useInView, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { FiArrowUpRight, FiDownload, FiGithub, FiLinkedin, FiTwitter, FiInstagram, FiMail, FiMapPin, FiPhone, FiAward } from "react-icons/fi";
import { profile } from "@/data/profile";
import { Magnetic, Tilt } from "@/components/fx/Magnetic";
import { scrollToId } from "./Nav";

const spring = { type: "spring" as const, stiffness: 90, damping: 18 };

function Reveal({ children, delay = 0, className }: { children: ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 40, filter: "blur(8px)" }} whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }} viewport={{ once: true, margin: "-80px" }} transition={{ ...spring, delay }}>
      {children}
    </motion.div>
  );
}

function Heading({ eyebrow, title, light }: { eyebrow: string; title: string; light?: boolean }) {
  return (
    <Reveal className="mb-14">
      <p className={`eyebrow ${light ? "text-ink-soft" : "text-glow"}`}>{eyebrow}</p>
      <h2 className={`mt-3 font-display text-5xl leading-none md:text-7xl ${light ? "text-ink" : "text-star text-glow"}`}>{title}</h2>
    </Reveal>
  );
}

function Btn({ children, onClick, href, variant = "solid" }: { children: ReactNode; onClick?: () => void; href?: string; variant?: "solid" | "ghost" }) {
  const cls = `relative inline-flex items-center gap-2 overflow-hidden rounded-full px-6 py-3 text-sm font-medium transition-shadow hover:shadow-[var(--shadow-glow)] ${variant === "solid" ? "bg-ink text-star" : "glass-light text-ink"}`;
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const ripple = (e: React.MouseEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples((p) => [...p, { id, x: e.clientX - r.left, y: e.clientY - r.top }]);
    setTimeout(() => setRipples((p) => p.filter((q) => q.id !== id)), 700);
    onClick?.();
  };
  const inner = (
    <>
      {children}
      {ripples.map((r) => (
        <motion.span key={r.id} className="pointer-events-none absolute h-4 w-4 rounded-full bg-glow/50" style={{ left: r.x - 8, top: r.y - 8 }} initial={{ scale: 0, opacity: 1 }} animate={{ scale: 14, opacity: 0 }} transition={{ duration: 0.7 }} />
      ))}
    </>
  );
  return (
    <Magnetic>
      <motion.div whileTap={{ scale: 0.94 }}>
        {href ? <a href={href} target="_blank" rel="noreferrer" onClick={ripple} className={cls}>{inner}</a> : <button onClick={ripple} className={cls}>{inner}</button>}
      </motion.div>
    </Magnetic>
  );
}

function Rotator() {
  const [i, setI] = useState(0);
  useEffect(() => { const id = setInterval(() => setI((v) => (v + 1) % profile.titles.length), 2200); return () => clearInterval(id); }, []);
  return (
    <span className="relative inline-flex h-[1.3em] min-w-[12ch] overflow-hidden align-bottom">
      <AnimatePresence mode="popLayout">
        <motion.span key={i} initial={{ y: "100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: "-100%", opacity: 0 }} transition={spring} className="italic text-ink">
          {profile.titles[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function Hero() {
  return (
    <section id="home" className="relative flex min-h-[100svh] flex-col items-center justify-end px-6 pb-20 text-center text-ink">
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="eyebrow text-ink-soft">AI Core · online · {profile.location}</motion.p>
      <h1 className="mt-4 font-display text-[clamp(3.5rem,13vw,11rem)] leading-[0.85] tracking-tight">
        {profile.name.split("").map((c, i) => (
          <motion.span key={i} className="inline-block" initial={{ y: "110%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ ...spring, delay: 0.3 + i * 0.04 }}>
            {c === " " ? "\u00A0" : c}
          </motion.span>
        ))}
      </h1>
      <p className="mt-6 text-lg text-ink-soft md:text-2xl">I am an <Rotator /></p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Btn onClick={() => scrollToId("projects")}>View Projects <FiArrowUpRight /></Btn>
        <Btn href={profile.resume} variant="ghost"><FiDownload /> Download Resume</Btn>
        <Btn onClick={() => scrollToId("contact")} variant="ghost">Contact Me</Btn>
      </div>
    </section>
  );
}

function Counter({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const s = useSpring(0, { stiffness: 40, damping: 20 });
  const v = useTransform(s, (n) => Math.round(n).toString());
  useEffect(() => { if (inView) s.set(to); }, [inView, s, to]);
  return <motion.span ref={ref}>{v}</motion.span>;
}

export function About() {
  const [tab, setTab] = useState<"bio" | "edu" | "wins">("bio");
  return (
    <section id="about" className="mx-auto max-w-6xl px-6 py-32 text-ink">
      <Heading eyebrow="01 — Identity" title="About the pilot" light />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Reveal className="glass-light rounded-2xl p-8">
          <div role="tablist" aria-label="Biography" className="mb-6 flex gap-2">
            {(["bio", "edu", "wins"] as const).map((t) => (
              <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={`rounded-full px-4 py-1.5 text-xs uppercase tracking-widest ${tab === t ? "bg-ink text-star" : "text-ink-soft hover:text-ink"}`}>
                {t === "bio" ? "Bio" : t === "edu" ? "Education" : "Achievements"}
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={spring} className="min-h-40 text-lg leading-relaxed">
              {tab === "bio" && <p>{profile.about}</p>}
              {tab === "edu" && (
                <dl className="grid grid-cols-2 gap-4">
                  {Object.entries(profile.education).map(([k, v]) => (<div key={k}><dt className="eyebrow text-ink-soft">{k}</dt><dd className="mt-1">{v}</dd></div>))}
                </dl>
              )}
              {tab === "wins" && <ul className="space-y-3">{profile.achievements.map((a) => <li key={a} className="flex gap-3"><FiAward className="mt-1 shrink-0" /> {a}</li>)}</ul>}
            </motion.div>
          </AnimatePresence>
        </Reveal>
        <div className="grid grid-cols-2 gap-4">
          {profile.stats.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08}>
              <Tilt className="glass-light group h-full rounded-2xl p-6">
                <div className="font-display text-5xl"><Counter to={s.value} />+</div>
                <div className="mt-2 text-xs uppercase tracking-widest text-ink-soft">{s.label}</div>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </div>
      <ol className="relative mt-16 grid gap-6 md:grid-cols-4">
        <span aria-hidden className="absolute left-0 right-0 top-3 hidden h-px bg-ink/20 md:block" />
        {profile.timeline.map((t, i) => (
          <Reveal key={t.year} delay={i * 0.1} className="relative">
            <span className="block h-6 w-6 rounded-full border border-ink/30 bg-glow/60" />
            <p className="mt-4 font-mono text-xs text-ink-soft">{t.year}</p>
            <h3 className="font-display text-2xl">{t.title}</h3>
            <p className="mt-1 text-sm text-ink-soft">{t.text}</p>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}

export function Skills() {
  const [sel, setSel] = useState(0);
  const s = profile.skills[sel];
  return (
    <section id="skills" className="mx-auto max-w-6xl px-6 py-32 text-star">
      <Heading eyebrow="02 — Arsenal" title="A system of planets" />
      <div className="grid items-center gap-12 lg:grid-cols-[1.3fr_1fr]">
        <div className="grid grid-cols-3 gap-6 sm:gap-10">
          {profile.skills.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.06} className="flex justify-center">
              <motion.button
                data-magnetic
                aria-label={`${p.name} details`}
                onMouseEnter={() => setSel(i)} onFocus={() => setSel(i)} onClick={() => setSel(i)}
                animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4 + i * 0.5, ease: "easeInOut" }}
                whileHover={{ scale: 1.15 }}
                className="relative aspect-square w-20 sm:w-28"
              >
                <span className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle at 30% 30%, oklch(0.98 0 0), ${p.color} 45%, oklch(0.15 0.05 268) 100%)`, boxShadow: `0 0 ${sel === i ? 60 : 25}px -5px ${p.color}` }} />
                <motion.span className="absolute -inset-3" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 6 + i, ease: "linear" }}>
                  <span className="absolute left-1/2 top-0 h-1.5 w-1.5 rounded-full bg-star" />
                  <span className="absolute bottom-2 right-0 h-1 w-1 rounded-full bg-star/60" />
                </motion.span>
                <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-xs text-star-soft">{p.name}</span>
              </motion.button>
            </Reveal>
          ))}
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={s.name} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={spring} className="glass rounded-2xl p-8" aria-live="polite">
            <p className="eyebrow text-glow">Planet data</p>
            <h3 className="mt-2 font-display text-5xl">{s.name}</h3>
            <p className="mt-4 text-star-soft">{s.desc}</p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div><p className="eyebrow text-star-soft">Experience</p><p className="font-display text-3xl">{s.years} yrs</p></div>
              <div><p className="eyebrow text-star-soft">Projects</p><p className="font-display text-3xl">{s.projects}</p></div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">{s.stack.map((t) => <span key={t} className="rounded-full border px-3 py-1 text-xs">{t}</span>)}</div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

export function Projects() {
  const [feat, ...rest] = profile.projects;
  const Card = ({ p, big }: { p: typeof feat; big?: boolean }) => (
    <Tilt className={`glass group h-full rounded-2xl p-8 ${big ? "md:col-span-2" : ""}`}>
      <div className="[transform:translateZ(40px)]">
        <div className={`relative mb-6 overflow-hidden rounded-xl border ${big ? "h-56 md:h-72" : "h-40"}`} style={{ background: "radial-gradient(circle at 70% 30%, color-mix(in oklab, var(--glow) 45%, transparent), transparent 60%), linear-gradient(135deg, var(--space-3), var(--space-5))" }}>
          <motion.div className="absolute inset-0 flex items-center justify-center font-display text-6xl text-star/80 italic" animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 5 }}>{p.name}</motion.div>
          {big && <span className="absolute left-4 top-4 rounded-full bg-glow px-3 py-1 text-xs font-medium text-ink">Featured</span>}
        </div>
        <h3 className="font-display text-3xl">{p.name}</h3>
        <p className="mt-2 text-star-soft">{p.desc}</p>
        <div className="mt-4 flex flex-wrap gap-2">{p.stack.map((t) => <span key={t} className="rounded-full bg-star/10 px-3 py-1 font-mono text-xs">{t}</span>)}</div>
        <div className="mt-6 flex gap-4 text-sm">
          <a href={p.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-glow"><FiGithub /> GitHub</a>
          <a href={p.demo} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-glow"><FiArrowUpRight /> Live demo</a>
        </div>
      </div>
    </Tilt>
  );
  return (
    <section id="projects" className="mx-auto max-w-6xl px-6 py-32 text-star">
      <Heading eyebrow="03 — Missions" title="Selected work" />
      <div className="grid gap-6 md:grid-cols-2">
        <Reveal className="md:col-span-2"><Card p={feat} big /></Reveal>
        {rest.map((p, i) => <Reveal key={p.name} delay={i * 0.1}><Card p={p} /></Reveal>)}
      </div>
    </section>
  );
}

export function Experience() {
  return (
    <section id="experience" className="mx-auto max-w-4xl px-6 py-32 text-star">
      <Heading eyebrow="04 — Flight log" title="Experience" />
      <ol className="relative border-l border-star/15 pl-8">
        {profile.experience.map((e, i) => (
          <motion.li key={e.company} className="relative mb-10" initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ ...spring, delay: i * 0.1 }}>
            <motion.span className="absolute -left-[41px] top-6 h-4 w-4 rounded-full bg-glow shadow-[var(--shadow-glow)]" animate={{ scale: [1, 1.3, 1] }} transition={{ repeat: Infinity, duration: 2.4, delay: i * 0.3 }} />
            <Tilt className="glass group rounded-2xl p-6">
              <p className="font-mono text-xs text-glow">{e.duration}</p>
              <h3 className="mt-1 font-display text-3xl">{e.role}</h3>
              <p className="text-star-soft">{e.company}</p>
              <p className="mt-3 text-sm text-star-soft">{e.text}</p>
            </Tilt>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}

export function Certifications() {
  return (
    <section id="certifications" className="mx-auto max-w-6xl px-6 py-32 text-star">
      <Heading eyebrow="05 — Clearances" title="Certifications" />
      <div className="grid gap-6 md:grid-cols-3">
        {profile.certifications.map((c, i) => (
          <Reveal key={c.name} delay={i * 0.08}>
            <Tilt className="glass group h-full rounded-2xl p-6">
              <motion.div whileHover={{ rotate: 180 }} transition={spring} className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full border text-glow"><FiAward size={20} /></motion.div>
              <h3 className="font-display text-2xl">{c.name}</h3>
              <p className="mt-2 text-sm text-star-soft">{c.issuer} · {c.year}</p>
            </Tilt>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function Contact() {
  const [state, setState] = useState<"idle" | "launch" | "done">("idle");
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setState("launch");
    setTimeout(() => {
      setState("done");
      window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(`Hello from ${f.get("name")}`)}&body=${encodeURIComponent(String(f.get("message")))}`;
    }, 1100);
  };
  const input = "w-full rounded-xl border bg-star/5 px-4 py-3 text-star placeholder:text-star-soft/60 outline-none transition focus:border-glow focus:shadow-[var(--shadow-glow)]";
  return (
    <section id="contact" className="mx-auto max-w-6xl px-6 py-32 text-star">
      <Heading eyebrow="06 — Mission control" title="Open a channel" />
      <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr]">
        <Reveal className="space-y-4">
          {[{ i: FiMail, v: profile.email, h: `mailto:${profile.email}` }, { i: FiPhone, v: profile.phone, h: `tel:${profile.phone}` }, { i: FiMapPin, v: profile.location }].map(({ i: Icon, v, h }) => (
            <a key={v} href={h} className="glass flex items-center gap-4 rounded-2xl p-5 transition hover:shadow-[var(--shadow-glow)]"><Icon className="text-glow" /> {v}</a>
          ))}
          <p className="pt-6 font-display text-3xl italic text-star-soft">“{profile.quote}”</p>
        </Reveal>
        <Reveal>
          <form onSubmit={submit} className="glass space-y-4 rounded-2xl p-8">
            <label className="block"><span className="eyebrow text-star-soft">Callsign</span><input required name="name" className={`${input} mt-2`} placeholder="Your name" /></label>
            <label className="block"><span className="eyebrow text-star-soft">Frequency</span><input required type="email" name="email" className={`${input} mt-2`} placeholder="you@domain.com" /></label>
            <label className="block"><span className="eyebrow text-star-soft">Transmission</span><textarea required name="message" rows={5} className={`${input} mt-2 resize-none`} placeholder="Tell me about your mission…" /></label>
            <Magnetic>
              <button type="submit" disabled={state === "launch"} className="relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-glow px-8 py-3 font-medium text-ink">
                <motion.span animate={state === "launch" ? { y: -120, x: 60, rotate: -45, opacity: 0 } : { y: 0, x: 0, rotate: 0, opacity: 1 }} transition={{ duration: 1, ease: [0.6, 0, 0.4, 1] }} aria-hidden>🚀</motion.span>
                {state === "done" ? "Transmission sent" : state === "launch" ? "Launching…" : "Launch message"}
              </button>
            </Magnetic>
          </form>
        </Reveal>
      </div>
    </section>
  );
}

export function Footer() {
  const pts = [[10, 30], [22, 12], [35, 25], [48, 8], [62, 22], [75, 10], [88, 28]];
  const socials = [{ i: FiGithub, h: profile.social.github, l: "GitHub" }, { i: FiLinkedin, h: profile.social.linkedin, l: "LinkedIn" }, { i: FiTwitter, h: profile.social.twitter, l: "Twitter" }, { i: FiInstagram, h: profile.social.instagram, l: "Instagram" }];
  return (
    <footer className="relative px-6 pb-12 pt-20 text-star">
      <svg viewBox="0 0 100 40" className="mx-auto h-32 w-full max-w-3xl" aria-hidden>
        <motion.polyline points={pts.map((p) => p.join(",")).join(" ")} fill="none" stroke="currentColor" strokeOpacity="0.3" strokeWidth="0.2" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 2.5 }} />
        {pts.map(([x, y], i) => <motion.circle key={i} cx={x} cy={y} r="0.7" fill="currentColor" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2 + i * 0.3 }} />)}
      </svg>
      <div className="mx-auto mt-8 flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
        <p className="font-display text-2xl">{profile.name}</p>
        <ul className="flex gap-3">
          {socials.map(({ i: Icon, h, l }) => (
            <li key={l}><Magnetic><motion.a whileHover={{ rotate: 15, scale: 1.1 }} href={h} target="_blank" rel="noreferrer" aria-label={l} className="glass flex h-11 w-11 items-center justify-center rounded-full"><Icon /></motion.a></Magnetic></li>
          ))}
        </ul>
        <p className="font-mono text-xs text-star-soft">© {new Date().getFullYear()} · Drifting through deep space</p>
      </div>
    </footer>
  );
}
