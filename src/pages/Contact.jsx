import React, { useContext, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiArrowUpRight, FiCopy, FiCheck, FiMail } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi2';
import { AppContext } from '../AppProvider';
import ContactForm from '../components/ContactForm';

const EMAIL = 'ovieemonefe012@gmail.com';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] },
  }),
};

const socialNames = {
  'linkedin.com': 'LinkedIn',
  'github.com': 'GitHub',
  'x.com': 'X (Twitter)',
  'tiktok.com': 'TikTok',
  'instagram.com': 'Instagram',
};

const lagosTime = new Intl.DateTimeFormat('en-US', {
  timeZone: 'Africa/Lagos',
  hour: 'numeric',
  minute: '2-digit',
  second: '2-digit',
  hour12: true,
});

function moodFor(hour) {
  if (hour < 5) return 'Late night, probably still coding. I’m a late-night thinker.';
  if (hour < 12) return 'Morning. Coffee, standups and fresh ideas.';
  if (hour < 17) return 'Afternoon. Deep in focus mode.';
  if (hour < 21) return 'Evening. Still building, still answering.';
  return 'Night owl hours. My most creative stretch.';
}

function LagosClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const parts = lagosTime.formatToParts(now);
  const get = (type) => parts.find((p) => p.type === type)?.value;
  const hour24 = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Lagos', hour: '2-digit', hour12: false }).format(now)) % 24;

  return (
    <div className="ct-clock">
      <div className="ct-clock-head">
        <span className="ct-live-dot" />
        <span>Lagos, Nigeria · WAT</span>
      </div>
      <p className="ct-clock-time">
        {get('hour')}
        <span className="ct-clock-colon">:</span>
        {get('minute')}
        <span className="ct-clock-sec">{get('second')}</span>
        <span className="ct-clock-ampm">{get('dayPeriod')}</span>
      </p>
      <p className="ct-clock-mood">{moodFor(hour24)}</p>
    </div>
  );
}

function Contact() {
  const { socials } = useContext(AppContext);
  const [copied, setCopied] = useState(false);

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
    <div className="ct-page">
      <div className="ct-glow" aria-hidden="true"></div>
      <div className="ct-grid-bg" aria-hidden="true"></div>

      {/* HERO */}
      <section className="ct-hero">
        <motion.div className="ct-hero-text" initial="hidden" animate="visible">
          <motion.span className="ct-eyebrow" variants={fadeUp} custom={0}>
            <HiSparkles /> Contact
          </motion.span>
          <motion.h1 variants={fadeUp} custom={1}>
            Got an idea? <br />
            Let’s <span className="ct-accent">ship it</span>.
          </motion.h1>
          <motion.p variants={fadeUp} custom={2}>
            Fill in the form and watch your message compile in real time. Or skip the ceremony and email me directly.
          </motion.p>
          <motion.div className="ct-hero-actions" variants={fadeUp} custom={3}>
            <a href={`mailto:${EMAIL}`} className="ct-btn ct-btn-primary">
              <FiMail /> Email me
            </a>
            <button type="button" className="ct-btn ct-btn-ghost" onClick={copyEmail}>
              {copied ? <><FiCheck /> Copied!</> : <><FiCopy /> Copy address</>}
            </button>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <LagosClock />
        </motion.div>
      </section>

      {/* FORM + LIVE EDITOR */}
      <motion.section
        className="ct-main"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <ContactForm />
      </motion.section>

      {/* CHANNELS */}
      <section className="ct-channels-wrap">
        <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          Or find me where I hang out
        </motion.h2>
        <motion.div className="ct-channels" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }}>
          {socials.map((item, i) => {
            const host = new URL(item.link).hostname.replace('www.', '');
            const handle = new URL(item.link).pathname.replace(/\/(in\/)?/g, '').replace('@', '') || host;
            return (
              <motion.a
                key={item.link}
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="ct-channel"
                variants={fadeUp}
                custom={i}
              >
                <span className="ct-channel-icon"><item.title /></span>
                <span className="ct-channel-text">
                  <strong>{socialNames[host] ?? host}</strong>
                  <span>@{handle}</span>
                </span>
                <FiArrowUpRight className="ct-channel-arrow" />
              </motion.a>
            );
          })}
        </motion.div>
      </section>
    </div>
  );
}

export default Contact;
