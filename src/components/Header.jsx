import React, { useEffect, useRef, useState, useContext } from 'react';
import { flushSync } from 'react-dom';
import { AppContext } from '../AppProvider';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useSpring } from 'framer-motion';
import { FaSun, FaMoon } from "react-icons/fa";
import { FiArrowUpRight, FiDownload } from 'react-icons/fi';
import Logo3D from './Logo3D';

const links = [
    { label: 'home', to: '/' },
    { label: 'about', to: '/About' },
    { label: 'projects', to: '/Projects' },
    { label: 'contact', to: '/Contact' },
];

const sheet = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.08 } },
};

const sheetItem = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

// The whole page crossfades from the old theme to the new one in one piece (View Transitions: the browser fades a
// snapshot of the old page into the new one), so every element changes at the same moment. Per-element CSS fades are
// switched off meanwhile (html.theme-switching, App.css "THEME SWITCH"). Without support, or with reduced motion,
// the theme simply changes at once.
function switchTheme(next, setLightMode) {
    const apply = () => flushSync(() => setLightMode(next));
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!document.startViewTransition || reduce) { apply(); return; }
    const root = document.documentElement;
    root.classList.add('theme-switching');
    const transition = document.startViewTransition(apply);
    transition.finished.finally(() => root.classList.remove('theme-switching'));
}

function ThemeToggle({ lightMode, setLightMode, className = '' }) {
    return (
        <button
            type="button"
            className={`hd-theme light-dark-mode ${className}`}
            onClick={() => switchTheme(!lightMode, setLightMode)}
            aria-label={lightMode ? 'Switch to dark mode' : 'Switch to light mode'}
            title={lightMode ? 'Dark mode' : 'Light mode'}
        >
            <AnimatePresence mode="wait" initial={false}>
                <motion.span
                    key={lightMode ? 'moon' : 'sun'}
                    initial={{ rotate: -90, scale: 0.4, opacity: 0 }}
                    animate={{ rotate: 0, scale: 1, opacity: 1 }}
                    exit={{ rotate: 90, scale: 0.4, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {lightMode ? <FaMoon /> : <FaSun />}
                </motion.span>
            </AnimatePresence>
        </button>
    );
}

function Header() {
    const { lightMode, setLightMode, scrollToTop, mobileNav, setMobileNav, socials, downloadResume } = useContext(AppContext);
    const [isScrolled, setIsScrolled] = useState(false);
    const [hidden, setHidden] = useState(false);
    const lastY = useRef(0);
    const menuRef = useRef(null);
    const burgerRef = useRef(null);
    const { pathname } = useLocation();
    const { scrollYProgress } = useScroll();
    const progress = useSpring(scrollYProgress, { stiffness: 200, damping: 30, restDelta: 0.001 });

    // solid once scrolled; slides away while scrolling down, comes back on the way up
    useEffect(() => {
        const handleScroll = () => {
            const y = window.scrollY;
            setIsScrolled(y > 0);
            setHidden(y > 160 && y > lastY.current + 4);
            if (y < lastY.current - 4 || y < 160) setHidden(false);
            lastY.current = y;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // mobile menu: lock page scroll, close on Escape, keep focus inside
    useEffect(() => {
        if (!mobileNav) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        menuRef.current?.querySelector('a')?.focus();

        const onKey = (e) => {
            if (e.key === 'Escape') {
                setMobileNav(false);
                burgerRef.current?.focus();
            }
            if (e.key === 'Tab') {
                const items = [...menuRef.current.querySelectorAll('a, button')];
                const first = items[0];
                const last = items[items.length - 1];
                if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
                else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
            }
        };
        document.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = previous;
            document.removeEventListener('keydown', onKey);
        };
    }, [mobileNav]);

    useEffect(() => { setMobileNav(false); }, [pathname]);

    const isActive = (to) => (to === '/' ? pathname === '/' : pathname.toLowerCase().startsWith(to.toLowerCase()));

  return (
    <>
        <a href="#main" className="skip-link">Skip to content</a>
        <header className={`${isScrolled ? 'scrolled' : ''} ${hidden && !mobileNav ? 'hd-hidden' : ''}`}>
            <div className="hd-bar">
                <Link to='/' onClick={scrollToTop} className="hd-logo" aria-label="Legend.dev, home">
                    <Logo3D className="logo" />
                </Link>

                <nav className='desktop-nav' aria-label="Main">
                    <ul>
                        {links.map((item) => (
                            <li key={item.to}>
                                <NavLink to={item.to} onClick={scrollToTop} className="hd-link" end={item.to === '/'}>
                                    {isActive(item.to) && (
                                        <motion.span layoutId="hd-active" className="hd-active" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />
                                    )}
                                    <span className="hd-link-text">{item.label}</span>
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="hd-actions">
                    <ThemeToggle lightMode={lightMode} setLightMode={setLightMode} />
                    <Link to='/Contact' onClick={scrollToTop} className="hd-cta">
                        <span className="hd-dot" aria-hidden="true"></span>
                        Let&apos;s talk <FiArrowUpRight />
                    </Link>
                    <button
                        ref={burgerRef}
                        type="button"
                        className={`hd-burger ${mobileNav ? 'open' : ''}`}
                        onClick={() => setMobileNav(!mobileNav)}
                        aria-label={mobileNav ? 'Close menu' : 'Open menu'}
                        aria-expanded={mobileNav}
                        aria-controls="mobile-menu"
                    >
                        <span></span>
                        <span></span>
                    </button>
                </div>

                <motion.span className="hd-progress" style={{ scaleX: progress }} aria-hidden="true" />
            </div>
        </header>

        <AnimatePresence>
            {mobileNav && (
                <motion.div
                    id="mobile-menu"
                    ref={menuRef}
                    className="hd-sheet"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Menu"
                    initial={{ clipPath: 'circle(0% at calc(100% - 40px) 40px)' }}
                    animate={{ clipPath: 'circle(150% at calc(100% - 40px) 40px)' }}
                    exit={{ clipPath: 'circle(0% at calc(100% - 40px) 40px)' }}
                    transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                >
                    <motion.nav aria-label="Mobile" variants={sheet} initial="hidden" animate="visible">
                        <ul>
                            {links.map((item, i) => (
                                <motion.li key={item.to} variants={sheetItem}>
                                    <NavLink to={item.to} onClick={() => { scrollToTop(); setMobileNav(false); }} className="hd-sheet-link" end={item.to === '/'}>
                                        <span className="hd-sheet-index">{String(i + 1).padStart(2, '0')}</span>
                                        {item.label}
                                    </NavLink>
                                </motion.li>
                            ))}
                        </ul>
                        <motion.div className="hd-sheet-foot" variants={sheetItem}>
                            <div className="hd-sheet-row">
                                <button type="button" className="hd-sheet-cv" onClick={downloadResume}>
                                    <FiDownload /> Download CV
                                </button>
                            </div>
                            <div className="hd-sheet-socials">
                                {socials.map((item) => (
                                    <a key={item.link} href={item.link} target="_blank" rel="noopener noreferrer" aria-label={new URL(item.link).hostname.replace('www.', '')}>
                                        <item.title />
                                    </a>
                                ))}
                            </div>
                        </motion.div>
                    </motion.nav>
                </motion.div>
            )}
        </AnimatePresence>
    </>
  )
}

export default Header
