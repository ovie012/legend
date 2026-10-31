import React, { useContext, useEffect } from 'react';
import './App.css';
import { AppProvider, AppContext } from './AppProvider';
import { Routes, Route, useLocation } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Projects from './pages/Projects';
import Contact from './pages/Contact';
import About from './pages/About';
import Privacy from './pages/Privacy';
import NotFound from './pages/NotFound';
import Preloader from './components/Preloader';
import { onProgress } from './loadProgress';
import { NOT_FOUND, PAGES, pageKey, urlOf } from './seo';

// ⏱ How often the preloader plays again for a returning visitor, in minutes.
// 0 = on every page load; 30 = at most once every 30 minutes.
const PRELOADER_EVERY_MINUTES = 30;

// title, description, canonical and link-preview tags for the page (src/seo.js; the build writes them into each
// page's HTML, this keeps them right while moving between pages)
function syncHead(pathname) {
  const key = pageKey(pathname);
  const page = PAGES[key] ?? NOT_FOUND;
  document.title = page.title;
  const set = (selector, attr, value) => { const el = document.head.querySelector(selector); if (el) el.setAttribute(attr, value); };
  set('meta[name="description"]', 'content', page.description);
  set('meta[property="og:title"]', 'content', page.title);
  set('meta[property="og:description"]', 'content', page.description);
  set('meta[name="twitter:title"]', 'content', page.title);
  set('meta[name="twitter:description"]', 'content', page.description);
  set('meta[name="robots"]', 'content', key ? 'index, follow, max-image-preview:large, max-snippet:-1' : 'noindex, follow');
  if (key) { set('link[rel="canonical"]', 'href', urlOf(key)); set('meta[property="og:url"]', 'content', urlOf(key)); }
}

function InnerApp () {
  const { lightMode, preloader, setLoadingPercentage, setPreloader, setFadeAway } = useContext(AppContext);
  const { pathname } = useLocation();

  useEffect(() => { syncHead(pathname); }, [pathname]);

  // Preloader driven by real loading progress: at least 1.2 s so it never flickers, at most ~3 s so
  // nobody waits on a slow 3D download, and at most once every PRELOADER_EVERY_MINUTES.
  useEffect(() => {
    let seen = false;
    try {
      const last = Number(localStorage.getItem('preloaderLastShown') || 0);
      seen = Date.now() - last < PRELOADER_EVERY_MINUTES * 60000;
    } catch { /* storage blocked */ }
    if (seen) {
      setPreloader(false);
      return;
    }

    const MIN = 1200;
    const MAX = 3000;
    const start = performance.now();
    let target = 0;
    let shown = 0;
    let frame;
    let finished = false;
    const unsubscribe = onProgress((value) => { target = value * 100; });

    const finish = () => {
      if (finished) return;
      finished = true;
      setLoadingPercentage(100);
      try { localStorage.setItem('preloaderLastShown', String(Date.now())); } catch { /* storage blocked */ }
      setFadeAway(true);
      setTimeout(() => setPreloader(false), 500);
    };

    const tick = (now) => {
      const elapsed = now - start;
      // ease the number toward real progress, and never let it sit still near the end
      const goal = Math.max(target, Math.min((elapsed / MAX) * 90, 90));
      shown += (goal - shown) * 0.12;
      setLoadingPercentage(Math.min(shown, 99));
      if ((target >= 100 && elapsed >= MIN) || elapsed >= MAX) return finish();
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      unsubscribe();
    };
  }, []);

//   useEffect(() => {
//   const hasVisited = localStorage.getItem('hasVisited');

//   if (!hasVisited) {
//     localStorage.setItem('hasVisited', 'true');

//     let startTimestamp = null;

//     const animateProgress = (timestamp) => {
//       if (!startTimestamp) startTimestamp = timestamp;
//       const elapsed = timestamp - startTimestamp;

//       const progress = Math.min((elapsed / 6000) * 100, 100);
//       setLoadingPercentage(progress);

//       if (elapsed < 6000) {
//         requestAnimationFrame(animateProgress);
//       }
//     };

//     requestAnimationFrame(animateProgress);

//     setTimeout(() => {
//       setAnimationStart(false);
//     }, 1000);

//     setTimeout(() => {
//       setAnimationStart(true);
//     }, 6300);

//     setTimeout(() => {
//       setFadeAway(true);
//     }, 7300);

//     setTimeout(() => {
//       setPreloader(false);
//     }, 7700);
//   } else {
//     setPreloader(false);
//   }
// }, []);
  
  return (
    <MotionConfig reducedMotion="user">
      {preloader && <Preloader />}
      <div className={`container ${lightMode ? 'light-mode' : ''}`}>
        <Header />
        <main id="main" tabIndex={-1}>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/Projects' element={<Projects />} />
          <Route path='/Contact' element={<Contact />} />
          <Route path='/About' element={<About />} />
          <Route path='/Privacy' element={<Privacy />} />
          <Route path='*' element={<NotFound />} />
        </Routes>
        </main>
        <Footer />
      </div>
    </MotionConfig>
  );
};

function App() {

  return (
    <AppProvider>
      <InnerApp />
    </AppProvider>
  );
};

export default App


// LEGEND.DEV CODED THIS 