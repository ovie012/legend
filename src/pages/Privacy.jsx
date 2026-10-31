import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import {
  FiShield, FiCalendar, FiClock, FiMapPin, FiEyeOff, FiMessageSquare, FiSend, FiSlash, FiArchive,
  FiUserCheck, FiEdit3, FiInbox, FiEye, FiTrash2, FiPauseCircle, FiDownload, FiRotateCcw,
  FiArrowUpRight, FiCopy, FiCheck, FiMail, FiAlertCircle,
} from "react-icons/fi";

const EMAIL = "ovieemonefe012@gmail.com";
const UPDATED = "31 October 2026"; // change this whenever the policy changes

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

const inView = {
  initial: "hidden",
  whileInView: "visible",
  viewport: { once: true, amount: 0.15 },
};

const summary = [
  { icon: FiEyeOff, title: "No tracking", text: "No cookies, analytics, ad pixels or social trackers on this site." },
  { icon: FiMessageSquare, title: "Only what you send", text: "I only get personal data when you send me a message." },
  { icon: FiSend, title: "Used to reply", text: "Your details are used to answer you, and nothing else." },
  { icon: FiSlash, title: "Never sold", text: "I don’t sell, rent or trade your data. Not to anyone." },
  { icon: FiArchive, title: "Kept up to 3 years", text: "Then deleted. Sooner, if you ask me to." },
  { icon: FiUserCheck, title: "You’re in control", text: "See, fix or delete your data any time, free of charge." },
];

const collected = [
  {
    tag: "You provide",
    title: "The contact form",
    text: "Only what you type, and only once you press Send. The live code preview runs in your browser; nothing leaves it before then.",
    required: ["Name", "Email", "Message"],
    optional: ["Project type", "Role", "Favourite language", "Tech stack"],
  },
  {
    tag: "You provide",
    title: "Emails you send me",
    text: "If you email me directly, I receive your email address, your name as it appears in your email, and whatever you write.",
  },
  {
    tag: "Automatic",
    title: "Technical data",
    text: "Like every website, the hosting provider (Vercel) processes your IP address, browser, device type and the pages you request, to deliver the site and keep it secure. I don’t use this to identify you.",
  },
  {
    tag: "Stays on your device",
    title: "Browser storage",
    text: "Two small settings saved in your browser, never sent to me: themeChoice (light or dark, only after you use the toggle) and preloaderLastShown (so the loading animation doesn’t replay on every visit).",
  },
];

const purposes = [
  { what: "Reading and replying to your message, and talking about a possible project", why: "Steps you asked me to take before a possible contract, and my legitimate interest in answering enquiries" },
  { what: "Running the project and our communication, if we work together", why: "Performance of our contract" },
  { what: "Keeping the site working and secure, and stopping spam and abuse", why: "Legitimate interests" },
  { what: "Keeping records the law requires, such as tax and invoicing records", why: "Legal obligation" },
];

const providers = [
  { name: "EmailJS", role: "Delivers the contact form to my inbox", gets: "What you type in the form, plus technical request data such as your IP address", link: "https://www.emailjs.com/legal/privacy-policy/" },
  { name: "Google (Gmail)", role: "My email inbox, where messages are received and stored", gets: "Your name, email address and message", link: "https://policies.google.com/privacy" },
  { name: "Vercel", role: "Hosts this website", gets: "Technical data: IP address, browser and pages requested", link: "https://vercel.com/legal/privacy-policy" },
];

const retention = [
  { what: "Contact form messages and emails", how: "Up to 3 years from our last contact, then deleted" },
  { what: "Project and invoicing records, if we work together", how: "As long as the work needs them and the law requires (for example, tax records)" },
  { what: "Hosting logs", how: "A short period, set by Vercel’s own policy" },
  { what: "Browser storage", how: "Until you clear your browser’s site data" },
];

const rights = [
  { icon: FiEye, title: "Access", text: "Ask for a copy of the personal data I hold about you." },
  { icon: FiEdit3, title: "Correction", text: "Ask me to fix anything inaccurate or incomplete." },
  { icon: FiTrash2, title: "Deletion", text: "Ask me to erase your data." },
  { icon: FiPauseCircle, title: "Restrict or object", text: "Ask me to pause or stop using your data." },
  { icon: FiDownload, title: "Portability", text: "Get your data in a common, machine-readable format." },
  { icon: FiRotateCcw, title: "Withdraw consent", text: "Where I rely on your consent, withdraw it at any time." },
];

const mail = (subject) => `mailto:${EMAIL}?subject=${encodeURIComponent(subject)}`;

const ExtLink = ({ href, children }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className="pv-link">
    {children}
  </a>
);

const sections = [
  {
    id: "who",
    title: "Who I am",
    body: (
      <>
        <p>
          This website, Legend.dev, is the personal portfolio of <strong>Emonefe Ovie Ezekiel</strong>, a software and AI engineer based in
          Lagos, Nigeria. When this policy says “I”, “me” or “my”, it means me.
        </p>
        <p>
          I decide how personal data collected through this site is used, so I am its <strong>data controller</strong> under the Nigeria Data
          Protection Act 2023 (NDPA) and, where they apply, the EU and UK GDPR.
        </p>
        <div className="pv-contact-line">
          <FiMail />
          <span>
            Privacy questions: <a href={mail("Privacy question")} className="pv-link">{EMAIL}</a>
          </span>
        </div>
      </>
    ),
  },
  {
    id: "collect",
    title: "What I collect",
    body: (
      <>
        <p>I keep this small on purpose. Here is everything, in one place:</p>
        <div className="pv-cards">
          {collected.map((c) => (
            <div key={c.title} className="pv-card">
              <span className="pv-tag">{c.tag}</span>
              <h3>{c.title}</h3>
              <p>{c.text}</p>
              {c.required && (
                <div className="pv-chips">
                  {c.required.map((r) => <span key={r} className="pv-chip is-required">{r}</span>)}
                  {c.optional.map((o) => <span key={o} className="pv-chip">{o}<em>optional</em></span>)}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="pv-callout">
          <FiEyeOff />
          <div>
            <strong>No cookies, no analytics, no ads.</strong>
            <p>This site uses no tracking cookies, analytics tools, advertising pixels or social media trackers. That’s why there’s no cookie banner.</p>
          </div>
        </div>
        <p className="pv-note">
          Please don’t include sensitive information (health, finances, religion, passwords and so on) in your message. I don’t need it to reply.
        </p>
      </>
    ),
  },
  {
    id: "use",
    title: "How and why I use it",
    body: (
      <>
        <p>Data protection law asks me to have a lawful reason (a “legal basis”) for each use. These are mine:</p>
        <div className="pv-table" role="table" aria-label="Purposes and legal bases">
          <div className="pv-row pv-row-head" role="row">
            <span role="columnheader">What I use it for</span>
            <span role="columnheader">Legal basis</span>
          </div>
          {purposes.map((p) => (
            <div key={p.what} className="pv-row" role="row">
              <span role="cell">{p.what}</span>
              <span role="cell">{p.why}</span>
            </div>
          ))}
        </div>
        <div className="pv-callout">
          <FiSlash />
          <div>
            <strong>What I never do</strong>
            <p>Sell or rent your data, add you to a mailing list or send you marketing without asking first, or use your data for automated decisions or profiling.</p>
          </div>
        </div>
      </>
    ),
  },
  {
    id: "share",
    title: "Who else handles it",
    body: (
      <>
        <p>
          A few trusted services handle your data on my behalf, only to make this site and the contact form work. None of them get it for their own
          marketing.
        </p>
        <div className="pv-providers">
          {providers.map((p) => (
            <div key={p.name} className="pv-provider">
              <h3>{p.name}</h3>
              <p className="pv-provider-role">{p.role}</p>
              <p><span className="pv-provider-label">Receives</span>{p.gets}</p>
              <ExtLink href={p.link}>Their privacy policy <FiArrowUpRight /></ExtLink>
            </div>
          ))}
        </div>
        <p>
          I may also share data if a law, court order or regulator requires it. Links to other sites, such as my social profiles and projects I’ve
          built, are covered by those sites’ own privacy policies.
        </p>
      </>
    ),
  },
  {
    id: "transfers",
    title: "Data sent outside Nigeria",
    body: (
      <p>
        EmailJS, Google and Vercel may process data on servers outside Nigeria, including in the United States and the European Union. When your
        data leaves Nigeria, I rely on these providers’ safeguards, such as standard contractual clauses and security certifications, and on the
        transfer being necessary to deliver the message you asked to send, as the NDPA allows.
      </p>
    ),
  },
  {
    id: "retention",
    title: "How long I keep it",
    body: (
      <>
        <ol className="pv-timeline">
          {retention.map((r) => (
            <li key={r.what}>
              <strong>{r.what}</strong>
              <span>{r.how}</span>
            </li>
          ))}
        </ol>
        <p>You can ask me to delete your messages sooner at any time.</p>
      </>
    ),
  },
  {
    id: "security",
    title: "How I protect it",
    body: (
      <>
        <p>
          The site is served over an encrypted HTTPS connection, and the form is sent to EmailJS over HTTPS. Messages are kept in a
          password-protected email account that only I can access, with reputable providers.
        </p>
        <p>
          No way of sending or storing data online is 100% secure, but I take reasonable steps to protect it. If something ever goes wrong, I’ll
          act quickly and tell you and the regulator where the law requires it.
        </p>
      </>
    ),
  },
  {
    id: "rights",
    title: "Your rights",
    body: (
      <>
        <p>Under the NDPA (and the GDPR, if it applies to you), you can:</p>
        <div className="pv-rights">
          {rights.map((r) => (
            <div key={r.title} className="pv-right">
              <span className="pv-right-icon"><r.icon /></span>
              <h3>{r.title}</h3>
              <p>{r.text}</p>
            </div>
          ))}
        </div>
        <p>
          <strong>How:</strong> email <a href={mail("Privacy request")} className="pv-link">{EMAIL}</a> with the subject “Privacy request”. It’s
          free, and I’ll reply within 30 days. I may ask you to confirm who you are first, so I never hand your data to someone else.
        </p>
        <div className="pv-callout">
          <FiAlertCircle />
          <div>
            <strong>Not happy?</strong>
            <p>
              Please tell me first so I can put it right. You can also complain to the{" "}
              <ExtLink href="https://ndpc.gov.ng">Nigeria Data Protection Commission</ExtLink> or, if you live in the EU or UK, your local data
              protection authority.
            </p>
          </div>
        </div>
      </>
    ),
  },
  {
    id: "children",
    title: "Children",
    body: (
      <p>
        This site is for adults who want to work with me. I don’t knowingly collect data from anyone under 18. If you’re under 18, please ask a
        parent or guardian before contacting me. If I find I’ve received a child’s data without that, I’ll delete it.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: (
      <p>
        If I change how I handle personal data, I’ll update this page and the “Last updated” date at the top. The current version always lives
        here.
      </p>
    ),
  },
];

/* ---------- hero card: where a message goes ---------- */

function MessageFlow() {
  const steps = [
    { icon: FiEdit3, title: "You", text: "fill in the contact form" },
    { icon: FiSend, title: "EmailJS", text: "delivers it over HTTPS" },
    { icon: FiInbox, title: "My inbox", text: "kept up to 3 years, then deleted" },
  ];

  return (
    <div className="pv-flow">
      <p className="pv-flow-title"><FiShield /> Where your message goes</p>
      <ol className="pv-flow-steps">
        {steps.map((s) => (
          <li key={s.title}>
            <span className="pv-flow-icon"><s.icon /></span>
            <span className="pv-flow-text">
              <strong>{s.title}</strong>
              <span>{s.text}</span>
            </span>
          </li>
        ))}
      </ol>
      <p className="pv-flow-foot">No cookies · No analytics · No ads</p>
    </div>
  );
}

/* ---------- page ---------- */

function Privacy() {
  const [active, setActive] = useState(sections[0].id);
  const [copied, setCopied] = useState(false);
  const bodyRef = useRef(null);

  const { scrollYProgress } = useScroll({ target: bodyRef, offset: ["start 140px", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });

  // highlight the section being read in the table of contents: the last one whose top has passed 35% of the screen
  useEffect(() => {
    let frame;
    const update = () => {
      frame = null;
      const line = window.innerHeight * 0.35;
      let current = sections[0].id;
      sections.forEach((s) => {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= line) current = s.id;
      });
      setActive(current);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  // deep links like /Privacy#rights (after ScrollToTop has run)
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    const t = setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 400);
    return () => clearTimeout(t);
  }, []);

  const jump = (id) => (e) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    window.history.replaceState(null, "", `#${id}`);
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${EMAIL}`;
    }
  };

  return (
    <div className="pv-page">
      <div className="pv-glow" aria-hidden="true"></div>
      <div className="pv-grid-bg" aria-hidden="true"></div>

      {/* HERO */}
      <section className="pv-hero">
        <motion.div className="pv-hero-text" initial="hidden" animate="visible">
          <motion.span className="pv-eyebrow" variants={fadeUp} custom={0}>
            <FiShield /> Privacy Policy
          </motion.span>
          <motion.h1 variants={fadeUp} custom={1}>
            Your data, <br />
            <span className="pv-accent">handled with care</span>.
          </motion.h1>
          <motion.p variants={fadeUp} custom={2}>
            I only collect what I need to reply to you, I never sell it, and you can ask me to delete it any time. Here’s exactly how it works, in
            plain English.
          </motion.p>
          <motion.ul className="pv-meta" variants={fadeUp} custom={3}>
            <li><FiCalendar /> Last updated {UPDATED}</li>
            <li><FiClock /> 5 min read</li>
            <li><FiMapPin /> Lagos, Nigeria</li>
          </motion.ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <MessageFlow />
        </motion.div>
      </section>

      {/* THE SHORT VERSION */}
      <section className="pv-summary">
        <motion.h2 {...inView} variants={fadeUp}>The short version</motion.h2>
        <motion.div className="pv-summary-grid" {...inView}>
          {summary.map((s, i) => (
            <motion.div key={s.title} className="pv-summary-card" variants={fadeUp} custom={i}>
              <span className="pv-summary-icon"><s.icon /></span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* FULL POLICY */}
      <div className="pv-layout">
        <aside className="pv-toc" aria-label="On this page">
          <p className="pv-toc-title">On this page</p>
          <div className="pv-toc-rail" aria-hidden="true">
            <motion.span style={{ scaleY: progress }} />
          </div>
          <ol>
            {sections.map((s, i) => (
              <li key={s.id}>
                <a href={`#${s.id}`} onClick={jump(s.id)} className={active === s.id ? "is-active" : ""} aria-current={active === s.id ? "true" : undefined}>
                  <span className="pv-toc-num">{String(i + 1).padStart(2, "0")}</span>
                  {s.title}
                </a>
              </li>
            ))}
          </ol>
        </aside>

        <article className="pv-body" ref={bodyRef}>
          {sections.map((s, i) => (
            <motion.section key={s.id} id={s.id} className="pv-section" {...inView} variants={fadeUp}>
              <div className="pv-section-head">
                <span className="pv-section-num">{String(i + 1).padStart(2, "0")}</span>
                <h2>{s.title}</h2>
              </div>
              <div className="pv-section-body">{s.body}</div>
            </motion.section>
          ))}
        </article>
      </div>

      {/* CTA */}
      <motion.section className="pv-cta" {...inView} variants={fadeUp}>
        <span className="pv-cta-icon"><FiShield /></span>
        <h2>Questions about your data?</h2>
        <p>Email me any time. I’m happy to explain anything on this page, or to act on a request.</p>
        <div className="pv-cta-actions">
          <a href={mail("Privacy question")} className="pv-btn pv-btn-primary">
            <FiMail /> Email me
          </a>
          <button type="button" className="pv-btn pv-btn-ghost" onClick={copyEmail}>
            {copied ? <><FiCheck /> Copied!</> : <><FiCopy /> Copy address</>}
          </button>
        </div>
      </motion.section>
    </div>
  );
}

export default Privacy;
