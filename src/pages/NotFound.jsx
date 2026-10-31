import React, { Suspense, lazy, useContext, useLayoutEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowLeft, FiGrid, FiMail } from "react-icons/fi";
import { AppContext } from "../AppProvider";
import { expectTask } from "../loadProgress";

const NotFoundScene = lazy(() => import("../components/NotFoundScene"));

const supports3D = typeof window !== "undefined"
  && !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  && !!document.createElement("canvas").getContext("webgl2");

// the preloader waits for the 3D stage only when the site opens on an unknown address
const ROUTES = ["/", "/about", "/projects", "/contact", "/privacy"];
const opensHere = typeof window !== "undefined"
  && !ROUTES.includes(window.location.pathname.toLowerCase().replace(/(.)\/$/, "$1"));
if (supports3D && opensHere) expectTask("3d");

const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: 0.15 + i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

// wide = copy on the left, stage on the right; stacked = stage on top, copy below (tablets, phones)
const WIDE = "(min-aspect-ratio: 5/4) and (min-width: 901px)";
const useLayout = () => {
  const [wide, setWide] = useState(() => typeof window !== 'undefined' && window.matchMedia(WIDE).matches);
  useLayoutEffect(() => {
    const mq = window.matchMedia(WIDE);
    const onChange = () => setWide(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return wide ? "wide" : "stacked";
};

// the 3D stage takes its colours from the page's CSS tokens (palette blocks in App.css)
const useStageColors = (ref, lightMode) => {
  const [colors, setColors] = useState(null);
  useLayoutEffect(() => {
    const css = getComputedStyle(ref.current);
    const read = (name) => css.getPropertyValue(name).trim();
    setColors({
      light: lightMode, accent: read("--nf-accent"), front: read("--nf-digit-front"), side: read("--nf-digit-side"),
      ground: read("--nf-ground"), rim: read("--nf-rim"), fill: read("--nf-fill"),
    });
  }, [lightMode]);
  return colors;
};

function NotFound() {
  const { lightMode, scrollToTop } = useContext(AppContext);
  const { pathname } = useLocation();
  const page = useRef(null);
  const colors = useStageColors(page, lightMode);
  const layout = useLayout();

  return (
    <div className={`nf-page nf-${layout}`} ref={page}>
      <section className="nf-hero">
        <div className="nf-stage">
          <div className="nf-glow" aria-hidden="true"></div>
          {supports3D && colors ? (
            <Suspense fallback={null}>
              <NotFoundScene colors={colors} lightMode={lightMode} layout={layout} />
            </Suspense>
          ) : (
            <div className="nf-fallback" aria-hidden="true">
              <span>404</span>
            </div>
          )}
        </div>

        <motion.div className="nf-copy" initial="hidden" animate="visible">
          <motion.span className="nf-eyebrow" variants={fadeUp} custom={0}>
            <span className="nf-eyebrow-dot" /> Error 404
          </motion.span>
          {/* alternatives: "Well, this is awkward." / "You found my hiding spot." */}
          <motion.h1 variants={fadeUp} custom={1}>
            This page <span className="nf-accent">wandered off</span>.
          </motion.h1>
          <motion.p variants={fadeUp} custom={2}>
            The link may be old, or the page has moved. I’ll keep the seat warm while you find your way back.
          </motion.p>
          <motion.p className="nf-path" variants={fadeUp} custom={3}>
            <span>Nothing lives at</span> <code title={pathname}>{pathname}</code>
          </motion.p>
          <motion.div className="nf-actions" variants={fadeUp} custom={4}>
            <Link to="/" onClick={scrollToTop} className="nf-btn nf-btn-primary">
              <FiArrowLeft /> Back home
            </Link>
            <Link to="/Projects" onClick={scrollToTop} className="nf-btn nf-btn-ghost">
              <FiGrid /> See projects
            </Link>
            <Link to="/Contact" onClick={scrollToTop} className="nf-btn nf-btn-ghost">
              <FiMail /> Contact
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}

export default NotFound;
