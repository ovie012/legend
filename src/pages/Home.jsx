import React, { Suspense, lazy, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MotionConfig,
  motion,
  useAnimationFrame,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'framer-motion';
import { FiArrowUpRight, FiArrowDown, FiDownload, FiEye, FiCheck, FiMonitor, FiSmartphone, FiCpu, FiLayers } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import { AppContext } from '../AppProvider';
import { expectTask } from '../loadProgress';

const HomeScene = lazy(() => import('../components/HomeScene'));

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

const supports3D = typeof window !== 'undefined'
  && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  && !!document.createElement('canvas').getContext('webgl2');

// the preloader waits for the avatar when the site opens on the homepage
if (supports3D && window.location.pathname === '/') expectTask('3d');

const useIsDesktop = () => {
  const [desktop, setDesktop] = useState(() => window.matchMedia('(min-width: 801px)').matches);
  useLayoutEffect(() => {
    const mq = window.matchMedia('(min-width: 801px)');
    const onChange = () => setDesktop(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return desktop;
};

// The 3D scene takes its colours from the page's CSS tokens, so the palette lives in App.css only.
const usePageColors = (ref, lightMode) => {
  const [colors, setColors] = useState({ accent: '#90FF00', rim: '#FFC27A', fill: '#8FB4FF', halo: '#FFB65C' });
  useLayoutEffect(() => {
    const css = getComputedStyle(ref.current);
    const read = (name) => css.getPropertyValue(name).trim();
    setColors({ accent: read('--hm-accent'), rim: read('--hm-rim'), fill: read('--hm-fill'), halo: read('--hm-halo') });
  }, [lightMode]);
  return colors;
};

// 3D tilt that follows the cursor; writes CSS vars directly so React never re-renders.
const handleTilt = (e) => {
  if (e.pointerType !== 'mouse') return;
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  const x = (e.clientX - rect.left) / rect.width - 0.5;
  const y = (e.clientY - rect.top) / rect.height - 0.5;
  el.style.setProperty('--rx', `${(-y * 8).toFixed(2)}deg`);
  el.style.setProperty('--ry', `${(x * 10).toFixed(2)}deg`);
  el.style.setProperty('--mx', `${((x + 0.5) * 100).toFixed(1)}%`);
  el.style.setProperty('--my', `${((y + 0.5) * 100).toFixed(1)}%`);
};

const resetTilt = (e) => {
  e.currentTarget.style.setProperty('--rx', '0deg');
  e.currentTarget.style.setProperty('--ry', '0deg');
};

function SplitWords({ text, accent = [], delay = 0 }) {
  return text.split(' ').map((word, i) => (
    <span className="hm-word-mask" key={i}>
      <motion.span
        className={`hm-word ${accent.includes(i) ? 'hm-accent' : ''}`}
        initial={{ y: '110%' }}
        animate={{ y: '0%' }}
        transition={{ duration: 0.9, delay: delay + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
      >
        {word}
      </motion.span>
    </span>
  ));
}

// Words light up one after another as the heading scrolls through the viewport.
function ScrollWords({ text }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'start 0.3'] });
  const words = text.split(' ');
  return (
    <h3 ref={ref} className="hm-scroll-words">
      {words.map((word, i) => (
        <ScrollWord key={i} progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
          {word}
        </ScrollWord>
      ))}
    </h3>
  );
}

function ScrollWord({ children, progress, range }) {
  const opacity = useTransform(progress, range, [0.18, 1]);
  return <motion.span style={{ opacity }}>{children} </motion.span>;
}

// Brand four-point star, drawn in currentColor so it follows the theme accent.
const Star = () => (
  <svg viewBox="0 0 40 41" aria-hidden="true">
    <path d="M20 0.41626L25.4018 15.0144L40 20.4163L25.4018 25.8181L20 40.4163L14.5982 25.8181L0 20.4163L14.5982 15.0144L20 0.41626Z" fill="currentColor" />
  </svg>
);

const wrap = (min, max, v) => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

// Infinite band whose speed and direction follow the scroll velocity.
function VelocityBand({ items, baseVelocity }) {
  const x = useMotionValue(0);
  const { scrollY } = useScroll();
  const smoothVelocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const factor = useTransform(smoothVelocity, [-1000, 0, 1000], [-4, 0, 4], { clamp: false });
  const direction = useRef(1);
  const reduced = useReducedMotion();

  useAnimationFrame((t, delta) => {
    if (reduced) return;
    const f = factor.get();
    if (f < 0) direction.current = -1;
    else if (f > 0) direction.current = 1;
    const moveBy = direction.current * baseVelocity * (delta / 1000) * (1 + Math.abs(f));
    x.set(wrap(-50, 0, x.get() + moveBy));
  });

  const translate = useTransform(x, (v) => `${v}%`);
  return (
    <div className="hm-band">
      <motion.div className="hm-band-track" style={{ x: translate }}>
        {[...items, ...items].map((item, i) => (
          <span key={i}>
            {item}
            <Star />
          </span>
        ))}
      </motion.div>
    </div>
  );
}

function HorizontalWorks({ projects, desktop, children }) {
  const section = useRef(null);
  const track = useRef(null);
  const [distance, setDistance] = useState(0);
  const { scrollYProgress } = useScroll({ target: section, offset: ['start start', 'end end'] });
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);
  const bar = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  useLayoutEffect(() => {
    if (!desktop) return setDistance(0);
    const measure = () => setDistance(Math.max(track.current.scrollWidth - window.innerWidth + 80, 0));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track.current);
    return () => ro.disconnect();
  }, [desktop, projects.length]);

  return (
    <section
      ref={section}
      className="hm-works-pin"
      style={desktop ? { height: `calc(100vh + ${distance}px)` } : undefined}
    >
      <div className="hm-works-sticky">
        {children}
        <motion.div ref={track} className="hm-works-track" style={desktop ? { x } : undefined}>
          {projects.map((item, index) => (
            <article
              key={item.link}
              className="hm-work-card"
              onClick={() => window.open(item.link, '_blank')}
              onPointerMove={handleTilt}
              onPointerLeave={resetTilt}
            >
              <div className="hm-work-media">
                <img src={item.src.desktop} alt={item.alt} loading="lazy" />
                <span className="hm-work-index">{String(index + 1).padStart(2, '0')}</span>
              </div>
              <div className="hm-work-body">
                <h6>{item.title}</h6>
                <p>{item.description}</p>
              </div>
              <div className="hm-work-hover">
                <h4>{item.titleLong}</h4>
                <p>{item.descriptionLong}</p>
                <span className="hm-work-open">Open project <FiArrowUpRight /></span>
              </div>
            </article>
          ))}
        </motion.div>
        {desktop && (
          <div className="hm-works-progress">
            <motion.span style={{ width: bar }} />
          </div>
        )}
      </div>
    </section>
  );
}

// Skills & Services: what I build, one line each. The tech itself orbits next to it.
const SERVICES = [
  { icon: <FiMonitor />, title: 'Web apps & platforms', detail: 'Dashboards, SaaS, e-commerce and marketing sites in React and TypeScript.' },
  { icon: <FiSmartphone />, title: 'Mobile apps', detail: 'Cross-platform iOS and Android apps with React Native.' },
  { icon: <FiCpu />, title: 'AI features', detail: 'Chat, search and automation powered by language models and Python.' },
  { icon: <FiLayers />, title: 'Interfaces & motion', detail: 'Polished UI, 3D and animation that make a product feel premium.' },
];

// How I build: five stages around the brand orbit. Scrolling through the section moves the star
// around the tilted ring and lights up the stage it reaches.
const PROCESS = [
  { title: 'Understand', detail: 'I start with the people and the problem: goals, constraints and what success looks like.' },
  { title: 'Design', detail: 'Flows, interfaces and motion that feel obvious, in light and in dark.' },
  { title: 'Engineer', detail: 'Clean, typed and tested web and mobile apps, APIs and data built to scale.' },
  { title: 'Add intelligence', detail: 'Language models, retrieval and automation, wherever they genuinely help the user.' },
  { title: 'Ship & refine', detail: 'Fast, accessible releases, measured and improved after launch.' },
];

function HowIBuild({ desktop }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.1', 'end 0.95'] });
  const [p, setP] = useState(0);
  useMotionValueEvent(scrollYProgress, 'change', (v) => setP(Math.min(Math.max(v, 0), 1)));
  const active = Math.min(Math.floor(p * PROCESS.length), PROCESS.length - 1);

  return (
    <section ref={ref} className="hm-process">
      <div className="hm-about-spacer" aria-hidden="true"></div>
      {/* the pinned block carries the avatar anchor, so he holds his pose while it is pinned */}
      <div className="hm-orb-content" data-stage="journey" data-stage-mobile="none">
        <motion.div className="hm-orb-head" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }}>
          <motion.span className="hm-eyebrow" variants={fadeUp} custom={0}><HiSparkles /> How I build</motion.span>
          <motion.h2 variants={fadeUp} custom={1}>From idea to <span className="hm-accent">intelligent product</span></motion.h2>
          <motion.p variants={fadeUp} custom={2}>
            Every project travels the same orbit: understand, design, engineer, then add AI where it earns its
            place, and keep refining after launch.
          </motion.p>
        </motion.div>
        <div className="hm-orb-body">
          <div className="hm-orb" style={{ '--p': p * 100 }} aria-hidden="true">
            <div className="hm-orb-tilt">
              <div className="hm-orb-ring"></div>
              <div className="hm-orb-ring hm-orb-ring-fill"></div>
              {PROCESS.map((_, i) => (
                <div key={i} className={`hm-orb-station ${i <= active ? 'is-lit' : ''}`} style={{ '--a': `${(i / PROCESS.length) * 360}deg` }}><span></span></div>
              ))}
              <div className="hm-orb-star-arm"><span className="hm-orb-star"></span></div>
              <div className="hm-orb-ring hm-orb-ring-outer"></div>
            </div>
            <div className="hm-orb-core">
              <strong>{String(active + 1).padStart(2, '0')}<span>/{String(PROCESS.length).padStart(2, '0')}</span></strong>
              <small>{PROCESS[active].title}</small>
            </div>
          </div>
          <ol className="hm-orb-steps">
            {PROCESS.map((step, i) => (
              <li key={step.title} className={`hm-orb-step ${i === active ? 'is-active' : ''} ${i < active ? 'is-done' : ''}`}>
                <span className="hm-orb-mark">{i < active ? <FiCheck /> : String(i + 1).padStart(2, '0')}</span>
                <div>
                  <h6>{step.title}</h6>
                  <p>{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

// Appears on the homepage as soon as `aiProjects` (AppProvider) has at least one project.
function AIBuilds({ projects }) {
  if (!projects.length) return null;

  return (
    <section className="hm-aibuilds" data-stage="aibuilds" data-stage-mobile="none">
      <motion.div className="hm-works-head" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }}>
        <div>
          <motion.span className="hm-eyebrow" variants={fadeUp} custom={0}><HiSparkles /> AI builds</motion.span>
          <motion.h2 variants={fadeUp} custom={1}>Built with <span className="hm-accent">AI</span></motion.h2>
        </div>
        <motion.div className="hm-works-cta" variants={fadeUp} custom={2}>
          <p>Language pipelines, retrieval-powered assistants and AI-driven products.</p>
          <Link to="/Projects?track=ai" className="hm-btn hm-btn-ghost">All AI projects <FiArrowUpRight /></Link>
        </motion.div>
      </motion.div>
      <div className="hm-aibuilds-grid">
        {projects.map((item, index) => (
          <motion.article
            key={item.link}
            className="hm-work-card"
            onClick={() => window.open(item.link, '_blank')}
            onPointerMove={handleTilt}
            onPointerLeave={resetTilt}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="hm-work-media">
              <img src={item.src.desktop} alt={item.alt} loading="lazy" />
              <span className="hm-work-index">{String(index + 1).padStart(2, '0')}</span>
            </div>
            <div className="hm-work-body">
              <h6>{item.title}</h6>
              <p>{item.description}</p>
            </div>
            <div className="hm-work-hover">
              <h4>{item.titleLong}</h4>
              <p>{item.descriptionLong}</p>
              <span className="hm-work-open">Open project <FiArrowUpRight /></span>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

function Home() {
  const { lightMode, projects, projectsData, skills, development, downloadResume, aiProjects } = useContext(AppContext);
  const desktop = useIsDesktop();
  const year = new Date().getFullYear();
  const page = useRef(null);
  const colors = usePageColors(page, lightMode);

  const projectCount = useMemo(
    () => new Set(projectsData.flatMap((group) => group.projects.map((p) => p.link))).size,
    [projectsData]
  );

  return (
    <MotionConfig reducedMotion="user">
      <div className="hm-page" ref={page}>
        {supports3D && (
          <Suspense fallback={null}>
            <HomeScene colors={colors} lightMode={lightMode} />
          </Suspense>
        )}

        {/* HERO */}
        <section className="hm-hero" data-stage="hero">
          <div className="hm-hero-glow" aria-hidden="true"></div>
          <motion.div className="hm-hero-text" initial="hidden" animate="visible">
            <motion.span className="hm-eyebrow" variants={fadeUp} custom={0}>
              <HiSparkles /> Hi, I&apos;m Emonefe Ovie
            </motion.span>
            <h1>
              {/* Hero line options (swap the text, keep accent on the last word):
                  A "I build web & mobile apps that think."                     accent={[7]}
                  B "Software that looks good, works fast and gets smarter."    accent={[7, 8]}
                  C "Lagos-born. Building the next wave of intelligent apps."   accent={[6, 7]} */}
              <SplitWords text="I build web & mobile apps that think." accent={[7]} delay={0.15} />
            </h1>
            <motion.p variants={fadeUp} custom={5}>
              <strong className="hm-hero-role">AI Engineer &amp; Software Developer, Lagos.</strong> I design and ship fast,
              polished products for the web and mobile, and add AI where it genuinely makes life easier for the people using them.
            </motion.p>
            <motion.div className="hm-actions" variants={fadeUp} custom={6}>
              <Link to="/Contact" className="hm-btn hm-btn-primary">
                Contact me <FiArrowUpRight />
              </Link>
              <Link to="/Projects" className="hm-btn hm-btn-ghost">
                Explore projects
              </Link>
            </motion.div>
            <motion.div className="hm-stats" variants={fadeUp} custom={7}>
              <div><strong>2022</strong><span>Building since</span></div>
              <div><strong>{projectCount}+</strong><span>Projects</span></div>
              <div><strong>{skills.length}</strong><span>Technologies</span></div>
            </motion.div>
          </motion.div>
          {!supports3D && (
            <figure className="hm-hero-fallback">
              <img src="/Legend-himself.webp" alt="Emonefe Ovie" />
            </figure>
          )}
          {/* <span className="hm-hero-pointer" aria-hidden="true"></span> */}
          <motion.span
            className="hm-scroll-cue"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6 }}
          >
            <FiArrowDown /> Scroll
          </motion.span>
        </section>

        {/* DEVELOPMENT BANDS */}
        <section className="hm-bands" aria-hidden="true">
          <VelocityBand items={development} baseVelocity={-2} />
          <VelocityBand items={development} baseVelocity={2} />
        </section>

        {/* ABOUT */}
        <section className="hm-about" data-stage="about">
          <div className="hm-about-spacer" aria-hidden="true"></div>
          <motion.div
            className="hm-about-text"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            <motion.span className="hm-eyebrow" variants={fadeUp} custom={0}>about me</motion.span>
            <ScrollWords text="Maths taught me to think in systems. Code lets me build them." />
            <motion.p variants={fadeUp} custom={1}>
              I studied Mathematics Education at the University of Lagos, where my research explored how OpenAI technology
              can help secondary school students learn maths. That mix of logic, teaching and AI still shapes how I work: I break
              hard problems into clear steps, design for the people who will actually use the product, and only reach for AI
              when it makes their day easier.
            </motion.p>
            <motion.div className="hm-actions" variants={fadeUp} custom={2}>
              <Link to="/Contact" className="hm-btn hm-btn-primary">
                Hire me now <FiArrowUpRight />
              </Link>
              <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" className="hm-btn hm-btn-ghost">
                <FiEye /> View CV
              </a>
              <button type="button" onClick={downloadResume} className="hm-btn hm-btn-ghost">
                <FiDownload /> Download CV
              </button>
            </motion.div>
          </motion.div>
        </section>

        {/* SELECTED WORKS */}
        <section className="hm-works" data-stage="works">
          <HorizontalWorks projects={projects} desktop={desktop}>
            <motion.div
              className="hm-works-head"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.5 }}
            >
              <div>
                <motion.span className="hm-eyebrow" variants={fadeUp} custom={0}>
                  <HiSparkles /> 2022 - {year}
                </motion.span>
                <motion.h2 variants={fadeUp} custom={1}>Selected <span className="hm-accent">works</span></motion.h2>
              </div>
              <motion.div className="hm-works-cta" variants={fadeUp} custom={2}>
                <p>Check out more projects I've worked on</p>
                <Link to="/Projects" className="hm-btn hm-btn-ghost">
                  View all <FiArrowUpRight />
                </Link>
              </motion.div>
            </motion.div>
          </HorizontalWorks>
        </section>

        {/* SKILLS AND SERVICES */}
        <section className="hm-skills" data-stage="skills" data-stage-mobile="none">
          <div className="hm-skills-stage" data-stage-mobile="skills" aria-hidden="true"></div>
          <motion.div
            className="hm-skills-text"
            data-stage-mobile="works"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
          >
            <motion.h2 variants={fadeUp} custom={0}>Skills and <span className="hm-accent">Services</span></motion.h2>
            <motion.p variants={fadeUp} custom={1}>What I can build for you, from first idea to launch:</motion.p>
            <ul className="hm-services">
              {SERVICES.map((service, i) => (
                <motion.li key={service.title} variants={fadeUp} custom={2 + i * 0.5}>
                  <span className="hm-service-icon">{service.icon}</span>
                  <div>
                    <h6>{service.title}</h6>
                    <p>{service.detail}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </motion.div>
          <div className="hm-skills-orbit">
            <div className="hm-skills-ring" style={{ '--count': skills.length }}>
              {skills.map((item, i) => (
                <span key={item.name} className="hm-skill" style={{ '--angle': `${(360 / skills.length) * i}deg` }}>
                  {item.icon} {item.name}
                </span>
              ))}
            </div>
          </div>
          <ul className="hm-skills-list">
            {skills.map((item) => (
              <li key={item.name}>{item.icon} {item.name}</li>
            ))}
          </ul>
        </section>

        {/* HOW I BUILD: scroll-driven orbit through the process */}
        <HowIBuild desktop={desktop} />

        {/* AI BUILDS: shows as soon as aiProjects in AppProvider has entries */}
        <AIBuilds projects={aiProjects} />

        <div className="hm-exit" data-stage="exit" aria-hidden="true"></div>
      </div>
    </MotionConfig>
  );
}

export default Home;
