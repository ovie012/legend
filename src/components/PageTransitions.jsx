import { useEffect } from 'react';
import { flushSync } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';

// Page transitions (owner 2026-11-01, from the audit): moving to another page glides instead of jumping. The same
// View Transitions technique as the theme crossfade (Header.jsx switchTheme): the header stays still, the old page
// fades out with a small lift, the new one fades in from slightly below, already at its top (App.css "PAGE
// TRANSITIONS"). Clicks on links to the site's pages are taken over here; back / forward, reduced motion and browsers
// without View Transitions keep the normal instant change.
const PAGES = ['/', '/about', '/projects', '/contact', '/privacy'];

function PageTransitions() {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    const onClick = (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest?.('a[href]');
      if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || url.hash || !PAGES.includes(url.pathname.toLowerCase().replace(/(.)\/$/, '$1'))) return;
      if (url.pathname === window.location.pathname) return;                       // same page: the link scrolls up
      if (!document.startViewTransition || document.documentElement.classList.contains('theme-switching')) return;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      e.preventDefault();                       // the router's own handler sees this and leaves the navigation to us
      const root = document.documentElement;
      // the page's own colour behind the crossfade (no white or black flash between the two pages)
      const page = document.querySelector('.container');
      root.style.setProperty('--pt-bg', page ? getComputedStyle(page).backgroundColor : 'transparent');
      root.classList.add('page-switching');
      const transition = document.startViewTransition(() => {
        flushSync(() => navigate(url.pathname + url.search));
        window.scrollTo({ top: 0, behavior: 'instant' });
      });
      transition.finished.finally(() => root.classList.remove('page-switching'));
    };
    // capture: before the router's link handler runs (the link's own onClick, e.g. closing the menu, still runs)
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [navigate, pathname]);

  return null;
}

export default PageTransitions;
