import { useEffect, useMemo, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { ACTIONS, STAGE_MOMENTS, createPicker, emptyPose, sampleAction } from './avatarActions';
import { CLIPS, DANCES } from './avatarClips';
import { clipReady, loadLaterClips, standIn } from './avatarClipStore';
import { AVATAR_RIG as RIG } from './avatarRig';
import { EGGS, avatarStage, findEgg } from './avatarStage';

if (import.meta.hot) import.meta.hot.decline();   // reload the page instead of hot-patching the avatar

// Higher priority interrupts lower; equal priority only after a short beat so rapid clicks don't stutter.
const PRIORITY = { idle: 0, moment: 1, hover: 1, read: 1, surprise: 1, click: 2, theme: 2, spin: 2, farewell: 3 };

// Clicks on these belong to the page, not the avatar.
const IGNORE = 'a, button, input, textarea, select, label, [role="button"], header, .footer, .hm-work-card, .hm-skill, .light-dark-mode, .av-eggs, .av-hint';

const IDLE_AFTER = 15;
// phone Home: docked in the corner badge he just looks around now and then (no section moments, no dances)
const DOCKED_LOOK = [5, 9];
// a click whose move was still loading: the stand-in plays, then the move itself if it arrives within this many seconds
const LATE_OK = 4;
// After this many bored idle moments in a row (picked at random each time), he does one dance.
const DANCE_AFTER = [2, 3];
// Grab-and-flick: drag turns him directly; letting go faster than FLICK_SPEED (px/s) sends him spinning.
const DRAG_TURN = 0.012;     // radians per pixel dragged
const FLICK_SPEED = 900;
const MAX_SPIN = 28;         // radians per second
const TAU = Math.PI * 2;
const FAST_SCROLL = 2800;
// Reading: while the pointer is over a heading or paragraph of the hero or About section (owner: only there) he puts
// his glasses on (glassesOn, his hand), and takes them off (glassesOff) shortly after it leaves; the short wait stops
// them flapping between lines.
const TEXT = 'h1, h2, h3, h4, h5, h6, p';
const READ_IN = '.hm-hero, .hm-about';
const readable = (el) => !!(el?.closest?.(TEXT) && el.closest(READ_IN));
const READ_OFF = 0.6;
// Quick clicks on his space (not buttons/links): 3 in a row = a random dance, 4 in a row = glasses on and kept on
// (the next 4 take them off). Clicks count as one group while each comes within MULTI_GAP of the last; after the
// 3rd we wait MULTI_WAIT for a 4th before dancing. The 1st click still reacts at once as before.
const MULTI_GAP = 0.45;
// Project cards (Step A item 4): while the mouse is on a card he turns to it (HomeAvatar reads attention.el); a
// favourite (data-favorite) gets a small nod, at most once per card every NOD_AGAIN seconds.
const WORK_CARD = '.hm-work-card';
const NOD_AGAIN = 8;
const MULTI_WAIT = 0.4;
const now = () => performance.now() / 1000;
// a reaction with an animation clip lasts as long as the clip; the clip moves the body, so its keyframes keep the face only
const durationOf = (name) => CLIPS[name]?.duration ?? ACTIONS[name].duration;
const BODY_CHANNELS = ['headX', 'headY', 'headZ', 'chestX', 'chestY', 'x', 'y', 'ry', 's'];

// Decides what the avatar does and when. Returns the live reaction pose (read by the avatar every
// frame) and an update() for the scene loop, which reports whether the exit should wait for a goodbye.
export function useAvatarDirector({ meshRef, lightMode, scroll }) {
  const { camera } = useThree();
  const pick = useMemo(createPicker, []);
  const pose = useRef(emptyPose());
  // the reaction now playing, for the avatar's animation mixer (id changes on every new reaction)
  const playing = useRef({ id: 0, name: null, start: 0, duration: 0 });
  // reading: is the pointer on text; pinned: kept on by 4 clicks; worn: are the glasses on his face (the avatar sets
  // it as his hand puts them on/off)
  const glasses = useRef({ reading: false, pinned: false, worn: false });
  const clicks = useRef({ count: 0, last: 0, timer: 0 });
  // the project card he is looking at (mouse over it), or null
  const attention = useRef({ el: null });
  // angle is added to the avatar's yaw by the scene
  const spin = useRef({ angle: 0, vel: 0, dragging: false, lastX: 0, lastT: 0, speed: 0, moved: 0, pendingFace: false, noClickUntil: 0, last: now() });
  const s = useRef({
    current: null, cooldown: {}, lastInput: now(), nextIdle: 0,
    stage: null, stageSince: 0, momentDone: false, greeted: false,
    farewell: 'present', holdUntil: 0,
    idleStreak: 0, danceAt: 3,
  });
  const newDanceAt = () => DANCE_AFTER[0] + Math.floor(Math.random() * (DANCE_AFTER[1] - DANCE_AFTER[0] + 1));

  const waiting = useRef(null);
  const play = (name, kind) => {
    const st = s.current;
    let want = null;
    if (!clipReady(name)) {
      want = { name, kind, at: now() };
      if (kind === 'click') {
        waiting.current = want;
        loadLaterClips().then(() => {
          const cur = st.current;
          if (waiting.current !== want || now() - want.at > LATE_OK || !clipReady(want.name)) return;
          waiting.current = null;
          if (cur?.standIn === want) st.current = null;      // replace the stand-in at once
          else if (cur && now() < cur.start + cur.duration) return;
          play(want.name, kind);
        });
      } else loadLaterClips();
      name = standIn(kind);
    }
    const cur = st.current;
    const priority = PRIORITY[kind];
    if (cur && now() < cur.start + cur.duration) {
      if (priority < cur.priority) return false;
      if (priority === cur.priority && now() - cur.start < 0.35) return false;
    }
    st.current = { name, action: ACTIONS[name], start: now(), duration: durationOf(name), priority, standIn: want };
    playing.current = { id: playing.current.id + 1, name, start: st.current.start, duration: st.current.duration };
    return true;
  };

  const cooled = (key, seconds) => {
    const st = s.current;
    if ((st.cooldown[key] ?? 0) > now()) return false;
    st.cooldown[key] = now() + seconds;
    return true;
  };

  useEffect(() => {
    const raycaster = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const centre = new THREE.Vector3();
    s.current.danceAt = newDanceAt();
    // any real input ends the idle streak (and his dance party)
    const touch = () => {
      s.current.lastInput = now();
      if (s.current.idleStreak) s.current.danceAt = newDanceAt();
      s.current.idleStreak = 0;
    };

    const hitsAvatar = (e) => {
      const mesh = meshRef.current;
      if (!mesh || e.target.closest?.(IGNORE)) return null;
      ndc.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      return raycaster.intersectObject(mesh, true)[0] ?? null;
    };

    const onDown = (e) => {
      if (s.current.farewell !== 'present' || (e.pointerType === 'mouse' && e.button !== 0) || !hitsAvatar(e)) return;
      Object.assign(spin.current, { dragging: true, lastX: e.clientX, lastT: performance.now(), speed: 0, moved: 0, vel: 0, pendingFace: false });
      document.body.style.cursor = 'grabbing';
    };

    const onDrag = (e) => {
      const sp = spin.current;
      if (sp.dragging) {
        const t = performance.now();
        const dx = e.clientX - sp.lastX;
        const dt = Math.max(t - sp.lastT, 1) / 1000;
        sp.angle += dx * DRAG_TURN;
        sp.speed = sp.speed * 0.6 + (dx / dt) * 0.4;   // smoothed px/s
        sp.moved += Math.abs(dx);
        sp.lastX = e.clientX;
        sp.lastT = t;
        return;
      }
      // grab cursor while hovering him (checked at most ~10 times a second)
      if (e.pointerType === 'mouse' && performance.now() - (sp.hoverCheck ?? 0) > 100) {
        sp.hoverCheck = performance.now();
        const over = s.current.farewell === 'present' && !!hitsAvatar(e);
        if (over !== sp.hovering) {
          sp.hovering = over;
          document.body.style.cursor = over ? 'grab' : '';
        }
      }
    };

    const onUp = () => {
      const sp = spin.current;
      if (!sp.dragging) return;
      sp.dragging = false;
      document.body.style.cursor = sp.hovering ? 'grab' : '';
      if (sp.moved > 8) sp.noClickUntil = now() + 0.35;   // a drag is not a click
      // the last move must be recent for it to count as a flick
      const fresh = performance.now() - sp.lastT < 80;
      if (fresh && Math.abs(sp.speed) > FLICK_SPEED) {
        sp.vel = THREE.MathUtils.clamp(sp.speed * DRAG_TURN, -MAX_SPIN, MAX_SPIN);
        sp.pendingFace = true;
        play('bugEyes', 'spin');   // wide-eyed while he whirls
        findEgg('spin');
      }
    };

    const onClick = (e) => {
      touch();
      const mesh = meshRef.current;
      if (now() < spin.current.noClickUntil) return;
      if (!mesh || s.current.farewell !== 'present' || e.target.closest?.(IGNORE)) return;
      // only react while he is actually on screen (the rigged body's origin is at his feet: use its anchor)
      (mesh.userData.anchor ?? mesh).getWorldPosition(centre).project(camera);
      if (Math.abs(centre.x) > 1.1 || Math.abs(centre.y) > 1.1) return;

      // multi-click: 2nd click of a group does nothing new, 3rd = a dance (unless a 4th follows), 4th = glasses toggle
      const c = clicks.current; const t = now();
      c.count = t - c.last < MULTI_GAP ? c.count + 1 : 1; c.last = t;
      if (c.count === 2) return;
      if (c.count === 3) {
        clearTimeout(c.timer);
        c.timer = setTimeout(() => { if (clicks.current.count === 3 && play(pick('dance'), 'click')) findEgg('dance'); }, MULTI_WAIT * 1000);
        return;
      }
      if (c.count >= 4) {
        clearTimeout(c.timer); c.count = 0; c.last = 0;
        const g = glasses.current; g.pinned = !g.pinned;
        if (g.pinned) findEgg('glasses');
        // at once (interrupts the gesture the 1st click started); the update loop retries if anything gets in the way
        if (g.pinned && !g.worn) play('glassesOn', 'click');
        else if (!g.pinned && g.worn && !g.reading) play('glassesOff', 'click');
        return;
      }

      ndc.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      const hit = raycaster.intersectObject(mesh, true)[0];
      if (!hit) return play(pick('emptyClick'), 'click');
      const face = mesh.userData.isFace ? mesh.userData.isFace(hit.point) : mesh.worldToLocal(hit.point.clone()).y > RIG.neck.band[1];
      if (play(pick(face ? 'avatarFace' : 'avatarBody'), 'click') && face) findEgg('shy');
    };

    const onOver = (e) => {
      if (e.target.closest?.('.hm-btn-primary') && cooled('smile', 2.5)) play('smile', 'hover');
    };

    let offTimer = 0;
    const onTextOver = (e) => {
      if (!readable(e.target)) return;
      clearTimeout(offTimer);
      glasses.current.reading = true;
    };
    const onTextOut = (e) => {
      // moving between parts of the same text (a <strong> inside a <p>) is still reading
      if (!readable(e.target) || readable(e.relatedTarget)) return;
      offTimer = setTimeout(() => { glasses.current.reading = false; }, READ_OFF * 1000);
    };
    const onCardOver = (e) => {
      if (e.pointerType !== 'mouse') return;
      const card = e.target.closest?.(WORK_CARD);
      if (!card || card === attention.current.el) return;
      attention.current.el = card;
      if (card.dataset.favorite !== undefined && s.current.farewell === 'present' && cooled(`nod:${card.dataset.favorite}`, NOD_AGAIN)) play('cardNod', 'hover');
    };
    const onCardOut = (e) => {
      const card = e.target.closest?.(WORK_CARD);
      if (card && card === attention.current.el && !card.contains(e.relatedTarget)) attention.current.el = null;
    };
    // every Easter egg found (AvatarEggs counts them): he cheers
    const onEgg = (e) => { if (e.detail.isNew && e.detail.found.length === EGGS.length) setTimeout(() => play('cheer', 'click'), 1200); };
    window.addEventListener('legend:egg', onEgg);
    const multi = clicks.current;
    // rapid clicks on his space would otherwise select page text (double/triple click); form fields keep it
    const onMouseDown = (e) => {
      if (e.detail > 1 && !e.target.closest?.(IGNORE) && !e.target.closest?.('[contenteditable]')) e.preventDefault();
    };
    document.addEventListener('pointerover', onCardOver);
    document.addEventListener('pointerout', onCardOut);
    document.addEventListener('pointerover', onTextOver);
    document.addEventListener('pointerout', onTextOut);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('click', onClick);
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onDrag, { passive: true });
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    window.addEventListener('pointermove', touch, { passive: true });
    window.addEventListener('scroll', touch, { passive: true });
    window.addEventListener('keydown', touch);
    document.addEventListener('pointerover', onOver);
    return () => {
      window.removeEventListener('legend:egg', onEgg);
      window.removeEventListener('mousedown', onMouseDown);
      clearTimeout(multi.timer);
      window.removeEventListener('click', onClick);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onDrag);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      document.body.style.cursor = '';
      window.removeEventListener('pointermove', touch);
      window.removeEventListener('scroll', touch);
      window.removeEventListener('keydown', touch);
      document.removeEventListener('pointerover', onOver);
      document.removeEventListener('pointerover', onCardOver);
      document.removeEventListener('pointerout', onCardOut);
      attention.current.el = null;
      document.removeEventListener('pointerover', onTextOver);
      document.removeEventListener('pointerout', onTextOut);
      clearTimeout(offTimer);
    };
  }, [camera, meshRef, pick]);

  // dev only: window.__avatarPlay('checkWatch') plays any reaction (for checking clips; stripped from builds)
  useEffect(() => {
    if (!import.meta.env.DEV) return undefined;
    window.__avatarPlay = (name, kind = 'farewell') => play(name, kind);
    window.__avatarNow = () => `${playing.current.id}:${playing.current.name}`;
    window.__avatarStop = () => { s.current.current = null; };
    // what a click at (x, y) px would hit, without moving the pointer: 'face' | 'body' | null
    window.__avatarHit = (x, y) => {
      const rc = new THREE.Raycaster(); const mesh = meshRef.current;
      rc.setFromCamera(new THREE.Vector2((x / window.innerWidth) * 2 - 1, -(y / window.innerHeight) * 2 + 1), camera);
      const hit = mesh && rc.intersectObject(mesh, true)[0];
      return hit ? (mesh.userData.isFace?.(hit.point) ? 'face' : 'body') : null;
    };
    return () => { delete window.__avatarPlay; delete window.__avatarNow; delete window.__avatarStop; delete window.__avatarHit; };
  }, []);

  const firstTheme = useRef(true);
  useEffect(() => {
    if (firstTheme.current) { firstTheme.current = false; return; }
    play('themeSwap', 'theme');
  }, [lightMode]);

  // stageName: section he is in; exitness: 0 on the page .. 1 gone below the footer; docked: in the phone's corner badge
  const update = (stageName, exitness, docked = false) => {
    const st = s.current;
    const t = now();
    if (docked !== st.docked) {
      st.docked = docked;
      st.nextIdle = t + DOCKED_LOOK[0];
      // out of the badge: the section's moment waits until he has landed from the hop
      if (!docked) { st.stageSince = t + 0.8; st.momentDone = false; }
      // a dance zooms out to his whole body: not inside the badge
      if (docked && st.current && DANCES.includes(st.current.name) && t < st.current.start + st.current.duration) {
        st.current = null;
        playing.current = { id: playing.current.id + 1, name: null, start: t, duration: 0 };
      }
    }

    // spin physics: friction, then settle back to facing forward and pull a funny face
    const sp = spin.current;
    const dt = Math.min(t - sp.last, 0.05);
    sp.last = t;
    if (!sp.dragging) {
      sp.angle += sp.vel * dt;
      sp.vel *= Math.exp(-1.5 * dt);
      if (Math.abs(sp.vel) < 1.2) {
        sp.vel = 0;
        const target = Math.round(sp.angle / TAU) * TAU;
        sp.angle = THREE.MathUtils.damp(sp.angle, target, 5, dt);
        if (Math.abs(sp.angle - target) < 0.002) sp.angle = 0;
        if (sp.pendingFace && Math.abs(sp.angle - target) < 0.35) {
          sp.pendingFace = false;
          st.current = null;
          play(pick('funnyFace'), 'spin');
        }
      }
    }

    if (st.farewell === 'present' && exitness > 0.05) {
      const name = pick('goodbye');
      play(name, 'farewell');
      st.farewell = 'leaving';
      st.holdUntil = t + durationOf(name) * 0.85;
    } else if (st.farewell === 'leaving' && t > st.holdUntil) {
      if (exitness > 0.6) st.farewell = 'gone';
      else if (exitness < 0.02) st.farewell = 'present';
    } else if (st.farewell === 'gone' && exitness < 0.5) {
      play(pick('welcomeBack'), 'farewell');
      st.farewell = 'present';
    }

    if (st.farewell === 'present') {
      if (Math.abs(scroll.current.velocity) > FAST_SCROLL && cooled('surprise', 8)) play('surprised', 'surprise');

      if (stageName !== st.stage) {
        st.stage = stageName;
        st.stageSince = t;
        st.momentDone = false;
      }
      const moment = !docked && STAGE_MOMENTS[stageName];
      if (moment && !st.momentDone && t - st.stageSince > 0.6) {
        st.momentDone = true;
        if ((stageName !== 'hero' || !st.greeted) && cooled(`moment:${stageName}`, 8)) play(moment, 'moment');
        if (stageName === 'hero') st.greeted = true;
      }

      // glasses follow the reading state (or stay on while pinned by 4 clicks); retried each frame, so a click that
      // interrupts the move just delays it
      const g = glasses.current;
      const want = g.reading || g.pinned;
      const doing = st.current && t < st.current.start + st.current.duration ? st.current.name : null;
      if (want && !g.worn && doing !== 'glassesOn' && play('glassesOn', 'read') && g.reading) findEgg('reading');
      else if (!want && g.worn && doing !== 'glassesOff') play('glassesOff', 'read');

      const busy = st.current && t < st.current.start + st.current.duration;
      if (docked) {
        if (!busy && t > st.nextIdle) {
          play('lookAround', 'idle');
          st.nextIdle = t + DOCKED_LOOK[0] + Math.random() * (DOCKED_LOOK[1] - DOCKED_LOOK[0]);
        }
      } else if (!busy && t - st.lastInput > IDLE_AFTER && t > st.nextIdle) {
        // 3–5 bored moments, then one random dance, then the count starts again.
        // The shuffle bag in pick() means no dance repeats until all 10 have played.
        const dancing = st.idleStreak >= st.danceAt;
        play(pick(dancing ? 'dance' : 'idle'), 'idle');
        if (dancing) {
          st.idleStreak = 0;
          st.danceAt = newDanceAt();
        } else {
          st.idleStreak += 1;
        }
        st.nextIdle = t + 9 + Math.random() * 5;
      }
    }

    const cur = st.current;
    if (cur && t < cur.start + cur.duration) {
      sampleAction(cur.action, (t - cur.start) / cur.duration, pose.current);
      if (CLIPS[cur.name]) BODY_CHANNELS.forEach((c) => { pose.current[c] = 0; });
    } else Object.keys(pose.current).forEach((c) => { pose.current[c] = 0; });

    avatarStage.present = st.farewell === 'present';
    return { hold: st.farewell === 'leaving' && t < st.holdUntil };
  };

  // the phone badge (HomeScene): its taps play gestures here; busyFor = seconds left of what he is doing
  const busyFor = () => { const cur = s.current.current; return cur ? Math.max(0, cur.start + cur.duration - now()) : 0; };
  return { pose, spin, playing, glasses, attention, update, play, busyFor };
}
