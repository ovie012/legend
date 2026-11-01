import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { CLIPS } from './avatarClips';
import { ANIMS } from './avatarModels';

// Lighter 3D (owner 2026-11-01): his moves come in two files (designs/avatar-work/shot/split_anims.mjs). The start
// file loads with him: idle, greeting, waves, pointing, theme twirl, glasses, nod, surprise, laugh, shy, shrug. The
// later file (dances, Easter-egg moves, bows...) loads once the page has settled, or as soon as the visitor reaches for
// him. A reaction whose move hasn't arrived yet plays a stand-in from the start file (the directors: standIn).
export const clipStore = {};          // clip name -> THREE.AnimationClip, shared by every character and outfit
export const addClips = (gltf) => gltf.animations.forEach((a) => { clipStore[a.name] ??= a; });

// the phone badge hop: the jump from the bottom of its second crouch through the take-off and landing
const HOP = { clip: 'jump', duration: 0.85, window: [0.9, 1.75] };
// reaction name -> its clip (thumbsUp borrows the cheer); undefined = face/head only
export const CLIP_OF = (name) => CLIPS[name] ?? { thumbsUp: CLIPS.cheer, hopDown: HOP, hopUp: HOP }[name];
export const clipReady = (name) => { const info = CLIP_OF(name); return !info || !!clipStore[info.clip]; };
// what plays while a move is still on its way: a wave for goodbyes and hellos, a nod otherwise
export const standIn = (kind) => (kind === 'farewell' ? 'winkBye' : 'nodYes');

let later = null;
let laterDone = false;
export function loadLaterClips() {
  later ??= new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(ANIMS.later)
    .then((gltf) => { addClips(gltf); laterDone = true; })
    .catch(() => new Promise((ok) => { setTimeout(() => { later = null; ok(); }, 5000); }));   // offline: retry later
  return later;
}

// React Suspense: wait for the later moves (the 404 page uses most of them)
export function useLaterClips() {
  if (!laterDone) throw loadLaterClips();
}

// start the later file when the page is quiet (after `delay` s), or at once on the first sign of interest
export function loadLaterWhenIdle(delay, intentTarget = window) {
  const events = ['pointerdown', 'keydown', 'wheel', 'touchstart'];
  const go = () => { done(); loadLaterClips(); };
  const done = () => { clearTimeout(timer); events.forEach((e) => intentTarget.removeEventListener(e, go, true)); };
  const timer = setTimeout(() => (window.requestIdleCallback ?? setTimeout)(go), delay * 1000);
  events.forEach((e) => intentTarget.addEventListener(e, go, { capture: true, passive: true }));
  return done;
}
