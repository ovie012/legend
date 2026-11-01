import { useEffect, useRef, useState } from 'react';
import { HiSparkles } from 'react-icons/hi2';
import { FiCheck, FiX } from 'react-icons/fi';
import { EGGS, avatarStage, foundEggs } from './avatarStage';

// Step A item 5 (owner 2026-11-01): show visitors what the avatar can do.
// Hint: on a first visit, a small bubble by his head ("psst… click me 3 times"), once, while the hero is in view.
// Easter eggs: after the first find, a pill bottom-left counts the hidden interactions found (avatarStage.EGGS); it
// opens a list (found ones named, the rest '???'). Remembered in this browser only.
const HINT_KEY = 'avatarHintSeen';
const HINT_AFTER = 3.5;     // seconds after he appears
const HINT_FOR = 7;         // seconds on screen
const TOAST_FOR = 3.2;

const seen = () => { try { return localStorage.getItem(HINT_KEY) === '1'; } catch { return true; } };
const markSeen = () => { try { localStorage.setItem(HINT_KEY, '1'); } catch { /* private mode */ } };

function Hint() {
  const ref = useRef(null);
  const [state, setState] = useState('wait');   // wait | show | done
  const touch = typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches;

  useEffect(() => {
    if (seen() || foundEggs().length) { setState('done'); return undefined; }
    let raf = 0; let since = 0; let shownAt = 0; let st = 'wait';
    const end = () => { if (st === 'show') markSeen(); st = 'done'; setState('done'); };
    const tick = (time) => {
      const h = avatarStage.head;
      const inHero = window.scrollY < window.innerHeight * 0.35;
      if (st === 'wait') {
        since = avatarStage.present && h.on && inHero ? since || time : 0;
        if (since && time - since > HINT_AFTER * 1000) { st = 'show'; shownAt = time; setState('show'); }
      } else if (st === 'show') {
        if (!inHero || time - shownAt > HINT_FOR * 1000) return end();
        const el = ref.current;
        if (el) {
          // beside his head, kept inside the window (phones: tucked into the top-left corner of the frame)
          const w = el.offsetWidth; const vw = window.innerWidth;
          const x = Math.min(Math.max(h.x + 40, 12), vw - w - 12);
          const y = Math.max(h.y - el.offsetHeight - 70, 84);
          el.style.transform = `translate(${x}px, ${y}px)`;
          el.style.setProperty('--tail', `${Math.min(Math.max(h.x - x, 18), w - 18)}px`);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const onEgg = () => end();
    window.addEventListener('legend:egg', onEgg);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('legend:egg', onEgg); };
  }, []);

  if (state !== 'show') return null;
  return (
    <div ref={ref} className="av-hint" role="status">
      <span>Psst… {touch ? 'tap' : 'click'} me 3 times</span>
    </div>
  );
}

function Counter() {
  const [found, setFound] = useState(() => (typeof window !== 'undefined' ? foundEggs() : []));
  const [toast, setToast] = useState(null);
  const [open, setOpen] = useState(false);
  const [onPage, setOnPage] = useState(false);
  const box = useRef(null);

  useEffect(() => {
    let timer = 0;
    const onEgg = (e) => {
      setFound(e.detail.found);
      if (!e.detail.isNew) return;
      const egg = EGGS.find((x) => x.id === e.detail.id);
      setToast(e.detail.found.length === EGGS.length ? `All ${EGGS.length} found! You know him well.` : `Found: ${egg.name}`);
      clearTimeout(timer);
      timer = setTimeout(() => setToast(null), TOAST_FOR * 1000);
    };
    window.addEventListener('legend:egg', onEgg);
    // shown only while he is on the page (hidden once he has left below the footer)
    const id = setInterval(() => setOnPage(avatarStage.present), 300);
    return () => { window.removeEventListener('legend:egg', onEgg); clearInterval(id); clearTimeout(timer); };
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => { if (e.key === 'Escape' || (e.type === 'pointerdown' && !box.current?.contains(e.target))) setOpen(false); };
    document.addEventListener('pointerdown', close);
    document.addEventListener('keydown', close);
    return () => { document.removeEventListener('pointerdown', close); document.removeEventListener('keydown', close); };
  }, [open]);

  if (!found.length) return null;
  return (
    <div ref={box} className={`av-eggs ${onPage || open ? 'is-on' : ''} ${toast ? 'has-toast' : ''}`}>
      {open && (
        <div className="av-eggs-panel" id="av-eggs-list">
          <p className="av-eggs-title">Easter eggs <span>{found.length}/{EGGS.length}</span></p>
          <ul>
            {EGGS.map((egg) => {
              const got = found.includes(egg.id);
              return (
                <li key={egg.id} className={got ? 'is-found' : ''}>
                  <span className="av-eggs-mark">{got ? <FiCheck /> : '?'}</span>
                  <span>
                    <strong>{got ? egg.name : '???'}</strong>
                    <small>{got ? egg.how : 'Keep playing with him'}</small>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      <button type="button" className="av-eggs-pill" aria-expanded={open} aria-controls="av-eggs-list" onClick={() => setOpen((o) => !o)}>
        {open ? <FiX /> : <HiSparkles />}
        <span aria-live="polite">{toast ?? <><span className="av-eggs-word">Easter eggs </span><b>{found.length}/{EGGS.length}</b></>}</span>
      </button>
    </div>
  );
}

export default function AvatarEggs() {
  return (
    <>
      <Hint />
      <Counter />
    </>
  );
}
