import React, { useContext, useRef } from "react";
import { Link } from "react-router-dom";
import { AppContext } from "../AppProvider";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { FaGraduationCap, FaMapMarkerAlt, FaCode } from "react-icons/fa";
import { FiDownload, FiEye, FiArrowUpRight, FiShuffle, FiCpu, FiUsers, FiTrendingUp } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const inView = {
  initial: "hidden",
  whileInView: "visible",
  viewport: { once: true, amount: 0.2 },
};

// My story, oldest first. `detail` is optional (shown as a small highlighted line).
const journey = [
  {
    icon: FaMapMarkerAlt,
    when: "Childhood · Lagos",
    title: "The cyber café kid",
    text: "Born and raised in Lagos, with roots in Delta State. Between the ages of 8 and 12, my mum paid an older boy to take me to a cyber café to learn computers. He mostly chatted while I watched, and sometimes we spent the change at the game house playing football. Soon I was going on my own, searching the internet for anything I could find.",
    detail: "That curiosity never left.",
  },
  {
    icon: FaGraduationCap,
    when: "University of Lagos",
    title: "Maths, by way of a detour",
    text: "I wanted to study Computer Science. When that didn't work out, I chose Mathematics, a subject I had grown to love after secondary school, and studied Mathematics Education at UNILAG.",
  },
  {
    icon: FaCode,
    when: "2022",
    title: "The moment it clicked",
    text: "People around me kept talking about WordPress. Then I discovered programming and realised I could build real software with code, something I had wanted to do for years. I started that year and never looked back.",
  },
  {
    icon: FiCpu,
    when: "2024 · Graduated",
    title: "Where AI met the classroom",
    text: "My final-year research explored how AI can help secondary school students understand mathematics. It is where my interest in AI, people and learning first came together.",
    detail: "OpenAI Technologies and Their Potential to Improve Mathematics Learning Outcomes Among Secondary School Students",
  },
  {
    icon: FiUsers,
    when: "2024 → today · Scrybe",
    title: "From intern to frontend lead",
    text: "I joined Scrybe as an intern and grew into the main frontend developer behind the administrative side of its school management platform. Being chosen to lead the frontend team, ahead of people who were already there when I arrived, showed me how far I had come.",
    detail: "Trust earned, responsibility taken.",
  },
  {
    icon: FiTrendingUp,
    when: "Next",
    title: "Building intelligent products",
    text: "I want to go beyond using AI tools to building them into software that solves real problems. The goal: a senior AI full-stack engineer, and one day, my own technology business.",
    detail: "Open to full-time roles and client projects in frontend, full-stack and AI engineering.",
  },
];

// Story timeline: the centre line fills as you scroll through it.
function StoryTimeline() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.7", "end 0.6"] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });

  return (
    <div ref={ref} className="ab-timeline">
      <span className="ab-timeline-line" aria-hidden="true">
        <motion.span style={{ scaleY: fill }} />
      </span>
      <ol>
        {journey.map((step, i) => (
          <motion.li
            key={step.title}
            className={`ab-chapter ${i % 2 ? "is-right" : "is-left"} ${step.when === "Next" ? "is-next" : ""}`}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="ab-chapter-dot" aria-hidden="true"><step.icon /></span>
            <article className="ab-card ab-chapter-card">
              <span className="ab-step">{String(i + 1).padStart(2, "0")} · {step.when}</span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
              {step.detail && <p className="ab-chapter-detail">{step.detail}</p>}
            </article>
          </motion.li>
        ))}
      </ol>
    </div>
  );
}

function AboutMe() {
  const { funFact, skills, animationKey, handleFunFacts, downloadResume, projectsData, scrollToTop } =
    useContext(AppContext);

  const projectCount = projectsData.reduce((total, group) => total + group.projects.length, 0);

  const stats = [
    { value: `${projectCount}+`, label: "Projects built" },
    { value: "2022", label: "Building since" },
    { value: `${skills.length}`, label: "Technologies in my stack" },
  ];

  return (
    <div className="ab-page">
      <div className="ab-glow" aria-hidden="true"></div>

      {/* HERO */}
      <section className="ab-hero">
        <motion.div className="ab-hero-text" initial="hidden" animate="visible">
          <motion.span className="ab-eyebrow" variants={fadeUp} custom={0}>
            <HiSparkles /> About me
          </motion.span>
          <motion.h1 variants={fadeUp} custom={1}>
            Hi, I’m <span className="ab-accent">Ovie</span>. I turn ideas into polished web &amp; mobile apps.
          </motion.h1>
          <motion.p variants={fadeUp} custom={2}>
            I’m Emonefe Ovie Ezekiel, a passionate AI Engineer and Software Developer from Delta State, Nigeria, born and based in Lagos.
            I care about clean code, thoughtful design and building things people genuinely enjoy using.
          </motion.p>
          <motion.div className="ab-actions" variants={fadeUp} custom={3}>
            <a href="/resume.pdf" target="_blank" rel="noopener noreferrer" className="ab-btn ab-btn-primary">
              <FiEye /> View CV
            </a>
            <button type="button" onClick={downloadResume} className="ab-btn ab-btn-ghost">
              <FiDownload /> Download CV
            </button>
          </motion.div>
        </motion.div>

        <motion.div
          className="ab-portrait"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="ab-portrait-frame">
            <img src="/Legend-himself.webp" alt="Emonefe Ovie" />
          </div>
          <motion.div
            className="ab-badge ab-badge-top"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <FaMapMarkerAlt /> Lagos, Nigeria
          </motion.div>
          <motion.div
            className="ab-badge ab-badge-bottom"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="ab-dot"></span> Open to work
          </motion.div>
        </motion.div>
      </section>

      {/* STATS */}
      <motion.section className="ab-stats" {...inView}>
        {stats.map((stat, i) => (
          <motion.div className="ab-stat" key={stat.label} variants={fadeUp} custom={i}>
            <h3>{stat.value}</h3>
            <p>{stat.label}</p>
          </motion.div>
        ))}
      </motion.section>

      {/* JOURNEY */}
      <section className="ab-section">
        <motion.div className="ab-section-head" {...inView}>
          <motion.span className="ab-eyebrow" variants={fadeUp}>My story</motion.span>
          <motion.h2 variants={fadeUp} custom={1}>From a Lagos cyber café to <span className="ab-accent">intelligent products</span></motion.h2>
        </motion.div>
        <StoryTimeline />
      </section>

      {/* SKILLS */}
      <section className="ab-section">
        <motion.div className="ab-section-head" {...inView}>
          <motion.span className="ab-eyebrow" variants={fadeUp}>Toolkit</motion.span>
          <motion.h2 variants={fadeUp} custom={1}>Technologies I work with</motion.h2>
        </motion.div>
        <motion.div className="ab-skills" {...inView}>
          {skills.map((skill, i) => (
            <motion.div
              className="ab-skill"
              key={skill.name}
              variants={fadeUp}
              custom={i * 0.4}
              whileHover={{ y: -6 }}
            >
              <span className="ab-skill-icon">{skill.icon}</span>
              <p>{skill.name}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* FUN FACT */}
      <section className="ab-section">
        <motion.div className="ab-funfact" {...inView} variants={fadeUp}>
          <div className="ab-funfact-head">
            <span className="ab-eyebrow">Fun fact</span>
            <motion.button
              type="button"
              className="ab-btn ab-btn-primary"
              onClick={handleFunFacts}
              whileTap={{ scale: 0.94 }}
            >
              <FiShuffle /> Another one
            </motion.button>
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={animationKey}
              className="ab-funfact-body"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.45 }}
            >
              <h3>{funFact.heading}</h3>
              <p>{funFact.paragraph}</p>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </section>

      {/* CTA */}
      <motion.section className="ab-cta" {...inView}>
        <motion.h2 variants={fadeUp}>Curious about what I’ve built?</motion.h2>
        <motion.div className="ab-actions" variants={fadeUp} custom={1}>
          <Link to="/Projects" onClick={scrollToTop} className="ab-btn ab-btn-primary">
            See my projects <FiArrowUpRight />
          </Link>
          <Link to="/Contact" onClick={scrollToTop} className="ab-btn ab-btn-ghost">
            Get in touch
          </Link>
        </motion.div>
      </motion.section>
    </div>
  );
}

export default AboutMe;
