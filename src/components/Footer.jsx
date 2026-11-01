import React, { useContext, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowUpRight, FiArrowUp, FiCopy, FiCheck } from 'react-icons/fi';
import { AppContext } from '../AppProvider';
import Logo3D from './Logo3D';

const EMAIL = 'ovieemonefe012@gmail.com';

const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'About', to: '/About' },
    { label: 'Projects', to: '/Projects' },
    { label: 'Contact', to: '/Contact' },
];

// Pages that already end with their own call to action get a slim footer: no big "Let's create something" block
// (owner 2026-11-01, from the audit: one goodbye, not two). Home, Projects and the 404 keep it.
const SLIM = new Set(['/about', '/contact', '/privacy']);

const reveal = {
    hidden: { opacity: 0, y: 40 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
    }),
};

function Footer() {
    const { socials, scrollToTop } = useContext(AppContext);
    const { pathname } = useLocation();
    const slim = SLIM.has(pathname.toLowerCase().replace(/\/$/, ''));
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
    <footer className={`footer ${slim ? 'footer-slim' : ''}`}>
        <div className="footer-glow" aria-hidden="true"></div>

        {!slim && <>
        <motion.section
            className="footer-cta"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
        >
            <motion.span className="footer-status" variants={reveal} custom={0}>
                <span className="footer-status-dot"></span>
                Available for new projects
            </motion.span>
            <motion.h2 variants={reveal} custom={1}>
                Let’s create something <span className="footer-highlight">extraordinary</span> together.
            </motion.h2>
            <motion.div className="footer-cta-actions" variants={reveal} custom={2}>
                <a href={`mailto:${EMAIL}`} className="footer-btn footer-btn-primary">
                    Say Hi <FiArrowUpRight />
                </a>
                <button type="button" className="footer-btn footer-btn-ghost" onClick={copyEmail}>
                    {copied ? <><FiCheck /> Copied!</> : <><FiCopy /> {EMAIL}</>}
                </button>
            </motion.div>
        </motion.section>

        <div className="footer-divider"></div>
        </>}

        <motion.section
            className="footer-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
        >
            <motion.div className="footer-brand" variants={reveal} custom={0}>
                <Link to="/" onClick={scrollToTop} aria-label="Back to home">
                    <Logo3D className="logo" />
                </Link>
                <p>AI Engineer &amp; Software Developer building fast, intelligent web and mobile apps.</p>
            </motion.div>

            <motion.div className="footer-col" variants={reveal} custom={1}>
                <h6>Navigation</h6>
                <ul>
                    {navLinks.map((item) => (
                        <li key={item.to}>
                            <Link to={item.to} onClick={scrollToTop} className="footer-link">
                                {item.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </motion.div>

            <motion.div className="footer-col" variants={reveal} custom={2}>
                <h6>Connect</h6>
                <div className="footer-socials">
                    {socials.map((item, index) => (
                        <a
                            key={index}
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="footer-social"
                            aria-label={new URL(item.link).hostname.replace('www.', '')}
                        >
                            <item.title />
                        </a>
                    ))}
                </div>
            </motion.div>

            <motion.div className="footer-col" variants={reveal} custom={3}>
                <h6>Get in touch</h6>
                <a href={`mailto:${EMAIL}`} className="footer-link footer-email">
                    {EMAIL} <FiArrowUpRight />
                </a>
                {slim && (
                    <p className="footer-available">
                        <span className="footer-status-dot"></span>
                        Available for new projects
                    </p>
                )}
            </motion.div>
        </motion.section>

        <div className="footer-wordmark" aria-hidden="true">LEGEND.DEV</div>

        <section className="footer-bottom">
            <p>
                © {new Date().getFullYear()} Legend.dev. All rights reserved.
                <span className="footer-legal-sep" aria-hidden="true">·</span>
                <Link to="/Privacy" onClick={scrollToTop} className="footer-legal-link">Privacy Policy</Link>
            </p>
            <button type="button" className="footer-top-btn" onClick={scrollToTop} aria-label="Back to top">
                Back to top <span><FiArrowUp /></span>
            </button>
        </section>
    </footer>
  )
}

export default Footer;
