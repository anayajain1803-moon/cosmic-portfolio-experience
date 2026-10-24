import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import Lenis from "lenis";
import { profile } from "@/data/profile";
import { Nav } from "@/components/site/Nav";
import { Hero, About, Skills, Projects, Experience, Certifications, Contact, Footer } from "@/components/site/Sections";
import { Cursor } from "@/components/fx/Cursor";
import { Loader } from "@/components/fx/Loader";

const Universe = lazy(() => import("@/components/universe/Universe"));

const title = `${profile.name} — ${profile.tagline}`;
const description = `Portfolio of ${profile.name}: ${profile.tagline}. Projects, skills, experience and contact.`;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({ "@context": "https://schema.org", "@type": "Person", name: profile.name, jobTitle: profile.titles[0], email: profile.email, sameAs: Object.values(profile.social) }),
      },
    ],
  }),
  component: Index,
});

function Backdrop() {
  const { scrollYProgress } = useScroll();
  const bg = useTransform(scrollYProgress, [0, 0.12, 0.28, 0.45, 0.65, 1], ["var(--space-0)", "var(--space-1)", "var(--space-2)", "var(--space-3)", "var(--space-4)", "var(--space-5)"]);
  return <motion.div aria-hidden className="fixed inset-0 -z-20" style={{ backgroundColor: bg }} />;
}

function Index() {
  const [ready, setReady] = useState(false);
  const done = useCallback(() => setReady(true), []);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.08 });
    (window as unknown as { __lenis: Lenis }).__lenis = lenis;
    let raf = 0;
    const loop = (t: number) => { lenis.raf(t); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); lenis.destroy(); };
  }, []);
  return (
    <>
      <Backdrop />
      <ClientOnly fallback={null}>
        <Suspense fallback={null}><Universe /></Suspense>
        <Cursor />
        <Loader onDone={done} />
      </ClientOnly>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[300] focus:rounded focus:bg-glow focus:px-4 focus:py-2 focus:text-ink">Skip to content</a>
      <Nav />
      <main id="main" className={ready ? "" : "invisible"}>
        <Hero />
        <About />
        <Skills />
        <Projects />
        <Experience />
        <Certifications />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
