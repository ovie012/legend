/* eslint-disable react/no-unknown-property -- react-three-fiber JSX props */
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Character } from './HomeAvatar';
import { CLIP_OF, clipReady, loadLaterClips, standIn } from './avatarClipStore';
import { ACTIONS, emptyPose, sampleAction } from './avatarActions';
import { SMALL_MODELS, onThemeIntent } from './avatarModels';
import { AVATAR_RIG as RIG } from './avatarRig';

if (import.meta.hot) import.meta.hot.decline();   // the avatar reloads the page instead of hot-patching

// Step A item 6 (owner 2026-11-01): a small version of him in the corner of About, Projects, Contact and Privacy.
// He slides up and waves when you arrive (Privacy: then puts his glasses on), then shrinks into a round badge that
// still shows his live face; click it and he comes back with a gesture. Contact: a thumbs-up when the form is sent
// (event 'legend:contact-sent'). Projects (mouse): he comes up to look at the card you hover, a nod for favourites.
const STAY_UP = 3.5;          // seconds he stays up after his last gesture before docking
const CARD = '.pj-card';
const NOD_AGAIN = 8;
const CLICK_GESTURES = ['tiltWave', 'laugh', 'wink', 'headTilt', 'nodYes', 'smile', 'shrug'];
const BODY_CHANNELS = ['headX', 'headY', 'headZ', 'chestX', 'chestY', 'x', 'y', 'ry', 's'];
const now = () => performance.now() / 1000;
const durationOf = (name) => CLIP_OF(name)?.duration ?? ACTIONS[name].duration;

// the reaction now playing + the face/head pose sampled from it (what the homepage director does, in small)
function useMiniDirector() {
  return useMemo(() => {
    const d = {
      playing: { current: { id: 0, name: null, start: 0, duration: 0 } },
      pose: { current: emptyPose() },
      glasses: { current: { reading: false, pinned: false, worn: false } },
      attention: { current: { el: null } },
      busyUntil: 0,
      // a move still on its way (avatarClipStore.js): a nod now, the move itself as soon as it arrives (within 4 s)
      play(name) {
        if (!clipReady(name)) {
          const want = { name, at: now() };
          d.waiting = want;
          loadLaterClips().then(() => {
            if (d.waiting !== want || now() - want.at > 4 || !clipReady(want.name)) return;
            d.waiting = null; d.play(want.name); d.onLate?.();
          });
          name = standIn();
        } else d.waiting = null;
        const duration = durationOf(name);
        d.playing.current = { id: d.playing.current.id + 1, name, start: now(), duration };
        d.busyUntil = now() + duration;
        return duration;
      },
      update() {
        const pl = d.playing.current; const t = now();
        if (pl.name && t < pl.start + pl.duration) {
          sampleAction(ACTIONS[pl.name], (t - pl.start) / pl.duration, d.pose.current);
          if (CLIP_OF(pl.name)) BODY_CHANNELS.forEach((c) => { d.pose.current[c] = 0; });
        } else Object.keys(d.pose.current).forEach((c) => { d.pose.current[c] = 0; });
      },
    };
    return d;
  }, []);
}

function Stage({ director, url, visible, pointer, frame, onReady, onFace }) {
  const meshRef = useRef(null);
  const v = useMemo(() => new THREE.Vector3(), []);
  // where his face is in the canvas (the head click capsule), every frame: the round badge centres on it
  useFrame((state) => {
    const head = visible && meshRef.current?.children.find((m) => m.name === 'head');
    if (!head) return;
    head.getWorldPosition(v).project(state.camera);
    onFace((v.x + 1) / 2 * state.size.width, (1 - v.y) / 2 * state.size.height);
  });
  const scroll = useMemo(() => ({ current: { y: 0, velocity: 0 } }), []);
  const shared = useMemo(() => ({ current: { shimmerAt: -10 } }), []);
  return (
    <Character
      url={url} visible={visible} pointer={pointer} scroll={scroll} reaction={director.pose} playing={director.playing}
      glassesState={director.glasses} attention={director.attention} meshRef={meshRef} shared={shared} frame={frame} onReady={onReady}
    />
  );
}

function Scene({ director, lightMode, pointer, frame, onReady, onFace }) {
  const want = lightMode ? 'light' : 'dark';
  const [mounted, setMounted] = useState({ [want]: true });
  const [shown, setShown] = useState(want);
  const [ready, setReady] = useState({});
  useEffect(() => onThemeIntent(() => setMounted({ light: true, dark: true })), []);
  useEffect(() => { setMounted((m) => ({ ...m, [want]: true })); if (ready[want]) setShown(want); }, [want, ready]);
  useFrame(() => director.update());
  return (
    <>
      <hemisphereLight args={['#ffffff', lightMode ? '#e3d3c3' : '#141a26', lightMode ? 1.5 : 1.15]} />
      <directionalLight position={[-2, 3, 5]} color="#fff6ec" intensity={lightMode ? 1.5 : 1.7} />
      <directionalLight position={[3.5, 1.8, -3]} intensity={2.6} color="#FFC27A" />
      {['light', 'dark'].map((k) => mounted[k] && (
        <Suspense key={k} fallback={null}>
          <Stage director={director} url={SMALL_MODELS[k]} visible={shown === k} pointer={pointer} frame={frame} onFace={onFace}
            onReady={() => { setReady((r) => ({ ...r, [k]: true })); if (k === want) onReady(); }} />
        </Suspense>
      ))}
    </>
  );
}

export default function MiniCompanion({ page, lightMode }) {
  const director = useMiniDirector();
  const frame = useRef(null);      // the canvas area: the cursor and the looked-at card are measured against it
  const button = useRef(null);
  const pointer = useRef({ x: 0, y: 0, time: -10 });
  const [ready, setReady] = useState(false);
  const [up, setUp] = useState(false);
  const dockTimer = useRef(0);
  const hovered = useRef(false);
  const nods = useRef({});
  const upNow = useRef(false);
  useEffect(() => { upNow.current = up; }, [up]);

  // dock again a while after his last gesture (not while the pointer is on him or on a project card)
  const dockLater = (extra = 0) => {
    clearTimeout(dockTimer.current);
    const wait = Math.max(0, director.busyUntil - now()) + STAY_UP + extra;
    dockTimer.current = setTimeout(() => {
      if (hovered.current || director.attention.current.el) return dockLater();
      setUp(false);
    }, wait * 1000);
  };
  director.onLate = () => dockLater();
  const perform = (name, delay = 0) => {
    setUp(true);
    setTimeout(() => { director.play(name); dockLater(); }, delay * 1000);
  };

  // arrival: up, wave; on Privacy he then puts his glasses on (and keeps them)
  useEffect(() => {
    if (!ready) return undefined;
    setUp(true);
    const t1 = setTimeout(() => {
      const wave = director.play('tiltWave');
      if (page === 'privacy') setTimeout(() => { director.play('glassesOn'); dockLater(); }, wave * 1000);
      else dockLater();
    }, 600);
    return () => clearTimeout(t1);
  }, [ready]);

  useEffect(() => {
    const onMove = (e) => {
      const r = frame.current?.getBoundingClientRect(); if (!r) return;
      // docked he mostly faces you (a big head turn would slide his face out of the round badge)
      const k = upNow.current ? 1 : 0.15;
      pointer.current = { x: (((e.clientX - r.left) / r.width) * 2 - 1) * k, y: (1 - ((e.clientY - r.top) / r.height) * 2) * k, time: now() };
    };
    const onSent = () => perform('thumbsUp', 0.35);
    const onCardOver = (e) => {
      if (e.pointerType !== 'mouse' || page !== 'projects') return;
      const card = e.target.closest?.(CARD);
      if (!card || card === director.attention.current.el) return;
      director.attention.current.el = card;
      setUp(true);
      const key = card.dataset.favorite;
      if (key && (nods.current[key] ?? 0) < now()) { nods.current[key] = now() + NOD_AGAIN; setTimeout(() => director.play('cardNod'), 350); }
      clearTimeout(dockTimer.current);
    };
    const onCardOut = (e) => {
      const card = e.target.closest?.(CARD);
      if (card && card === director.attention.current.el && !card.contains(e.relatedTarget)) { director.attention.current.el = null; dockLater(); }
    };
    const onFormFocus = (e) => { if (e.target.closest?.('form')) loadLaterClips(); };
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('focusin', onFormFocus);
    window.addEventListener('legend:contact-sent', onSent);
    document.addEventListener('pointerover', onCardOver);
    document.addEventListener('pointerout', onCardOut);
    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('focusin', onFormFocus);
      window.removeEventListener('legend:contact-sent', onSent);
      document.removeEventListener('pointerover', onCardOver);
      document.removeEventListener('pointerout', onCardOut);
      clearTimeout(dockTimer.current);
      director.attention.current.el = null;
    };
  }, [page]);

  const onClick = () => {
    const pick = CLICK_GESTURES[Math.floor(Math.random() * CLICK_GESTURES.length)];
    perform(up ? pick : 'tiltWave', up ? 0 : 0.4);
  };

  return (
    <button
      type="button"
      ref={button}
      className={`mc ${ready ? 'is-ready' : ''} ${up ? 'is-up' : 'is-docked'}`}
      aria-label="Say hi to Legend's 3D avatar"
      onClick={onClick}
      onPointerEnter={() => { hovered.current = true; loadLaterClips(); }}
      onPointerLeave={() => { hovered.current = false; }}
    >
      <span ref={frame} className="mc-stage" aria-hidden="true">
        <Canvas camera={{ fov: 30, position: [RIG.neck.pivot[0], 0.18, 4.6] }} dpr={[1, 2]} gl={{ alpha: true, antialias: true }}>
          <Scene director={director} lightMode={lightMode} pointer={pointer} frame={frame} onReady={() => setReady(true)}
            onFace={(x, y) => { const s = button.current?.style; if (s) { s.setProperty('--mc-face-x', `${x.toFixed(1)}px`); s.setProperty('--mc-face-y', `${y.toFixed(1)}px`); } }} />
        </Canvas>
      </span>
    </button>
  );
}
