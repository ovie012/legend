import * as THREE from 'three';
import { ACTIONS } from './avatarActions';
import { CLIPS } from './avatarClips';
import { BLOCK, SEAT_DROP, SPOTS } from './notFoundStage';
import { Motion, hipsHeight, motionContext, wrapAngle } from './notFoundMotion';

// What the 404 avatar does. He sits on the front edge of the "0". After 7–10 s he does one of 15 bored "episodes"
// (seated gestures, or he jumps down, does something on the stage and climbs back). After 2–3 episodes he jumps down and dances (all 9 dances, no repeats until
// each has played), then climbs back. 3 quick clicks = dance now; 4 = glasses on (4 again = off); text hover = glasses.

const H = BLOCK.height;
const rand = (a, b) => a + Math.random() * (b - a);
const pickOne = (list) => list[Math.floor(Math.random() * list.length)];
const k = (t, pose = {}) => [t, pose];

// faces for the 404 clips (same channels as avatarActions.js; times are 0..1 of the step)
const FACE = {
  jump: { keys: [k(0), k(0.3, { grin: 0.3, gazeY: 0.5 }), k(0.55, { eyeOpen: 0.5, jaw: 0.25 }), k(0.8, { grin: 0.5, squint: 0.3 }), k(1)] },
  effort: { keys: [k(0), k(0.15, { scowl: 0.45, press: 0.5, squint: 0.35, gazeY: -0.3 }), k(0.7, { scowl: 0.5, press: 0.6, squint: 0.4 }), k(0.92, { grin: 0.45, squint: 0.3 }), k(1)] },
  comfy: { keys: [k(0), k(0.15, { grin: 0.35, squint: 0.25 }), k(0.5, { grin: 0.25, blinkL: 0.3, blinkR: 0.3 }), k(0.85, { grin: 0.35 }), k(1)] },
  dance: { keys: [k(0), k(0.1, { grin: 0.55, squint: 0.35 }), k(0.5, { grin: 0.7, squint: 0.4, jaw: 0.15 }), k(0.9, { grin: 0.6, squint: 0.35 }), k(1)] },
  proud: { keys: [k(0), k(0.3, { grin: 0.6, squint: 0.4 }), k(0.8, { grin: 0.5, squint: 0.3 }), k(1)] },
};
for (const f of Object.values(FACE)) f.mouth = f.keys;          // sampleAction reads the mouth channels from .mouth
export const faceOf = (step) => (typeof step?.face === 'string' ? FACE[step.face] : step?.face);

const HAND = {
  tiltWave: 'open', winkBye: 'open', clap: 'open', shrug: 'open', stretch: 'open', doubleTake: 'open',
  cheer: 'fist', hop: 'fist', sittingClap: 'open', sittingThumbsUp: 'thumb', cheeringWhileSitting: 'fist',
  sittingDisbelief: 'open', climbingToTop: 'grip', jumpingDown: 'open',
};

const DANCES_404 = ['bounceGroove', 'sideSway', 'shoulderShimmy', 'twirl', 'robot', 'disco', 'moonwalk', 'shuffling', 'waveHipHopDance'];
// homepage reactions the 404 uses (body clip from avatarClips.js, face from avatarActions.js)
const REACTIONS = ['tiltWave', 'suspicious', 'shrug', 'doubleTake', 'shakeNo', 'checkWatch', 'stretch', 'hop', 'cheer', 'bow',
  'thankBow', 'dizzy', 'nodYes', ...DANCES_404.filter((d) => CLIPS[d])];
const clipKey = (info) => info.clip + (info.window ? `@${info.window}` : '');

// ---- load: every clip the director uses, root-motion ready, on this character
export function createMotion(c, anims404) {
  const NF = Object.fromEntries(anims404.animations.map((a) => [a.name, a]));
  const ctx = motionContext(c, c.clips[CLIPS.baseIdle.clip]);
  const m = new Motion(c, ctx);
  const seatY = hipsHeight(NF.sittingIdle, ctx);
  const seated = (name) => { const d = hipsHeight(NF[name], ctx) - seatY; return { floor: [d, d] }; };
  const CFG = {
    climbingToTop: { floor: [0, 1.464], to: H, ramp: [0.15, 0.62] },
    jumpingDown: { yaw: true, floor: [1.3, 0], to: -H, ramp: [0.37, 0.53] },
    standToSit: { move: false, to: -SEAT_DROP, ramp: [0.42, 0.95] },
    sitToStand: { move: false, to: SEAT_DROP, ramp: [0.05, 0.5] },
    leftTurn90: { yaw: true }, rightTurn90: { yaw: true },
    sittingIdle2: { floor: [-SEAT_DROP, -SEAT_DROP] },
  };
  for (const name of ['sittingLaughing', 'sittingClap', 'sittingThumbsUp', 'cheeringWhileSitting', 'sittingDisbelief', 'sittingRubbingArm']) CFG[name] = seated(name);
  for (const [name, clip] of Object.entries(NF)) m.add(name, clip, CFG[name]);
  m.add('idle', c.clips[CLIPS.baseIdle.clip]);
  for (const r of REACTIONS) {
    const info = CLIPS[r]; let clip = c.clips[info.clip];
    if (!clip) continue;
    if (info.window) clip = THREE.AnimationUtils.subclip(clip, clipKey(info), Math.round(info.window[0] * 30), Math.round(info.window[1] * 30), 30);
    m.add(clipKey(info), clip);
  }
  m.addOverlay('glassesOn', c.clips.glassesOn);
  m.addOverlay('glassesOff', c.clips.glassesOff);
  m.turnSign = Math.sign(m.lib.leftTurn90.root.yaw.at(-1));      // which way "left turn 90" turns in our frame
  return m;
}

// ---- steps
const sitBase = () => ({ clip: 'sittingIdle', loop: true, hold: Infinity, fade: 0.5, overlay: true, legs: true, look: 1 });
const stand = (hold, fade = 0.5, extra) => ({ clip: 'idle', loop: true, hold, fade, look: 0.8, overlay: true, ...extra });
const walk = (x, z, extra) => ({ clip: 'walking', walk: { x, z }, fade: 0.35, look: 0.55, dancePoint: true, overlay: true, ...extra });
const react = (name, extra) => {
  const info = CLIPS[name];
  return { clip: clipKey(info), loop: (info.repeat ?? 1) > 1, hold: info.duration, face: ACTIONS[name], hands: HAND[name],
    fade: 0.4, look: 0.45, ...extra };
};
const seated = (clip, face, extra) => ({ clip, face, hands: HAND[clip], fade: 0.55, look: 0.5, ...extra });

const getDown = () => [
  { clip: 'sitToStand', fade: 0.45, look: 0.5 },
  { clip: 'jumpingDown', until: 2.45, align: { x: 0, z: SPOTS.jumpZ, yaw: 0 }, alignTime: 0.6, fade: 0.3, look: 0.15, face: 'jump', hands: 'open' },
  stand(0.45, 0.7, { dancePoint: true }),
];

// from up on the "0" (standing, facing anywhere) to sitting on its front edge
const sitDownTop = () => [
  { turn: 0 },
  walk(0, SPOTS.seat.z, { clip: 'happyWalk', speed: 0.5, dancePoint: false, look: 0.7, turnRate: 2 }),
  { clip: 'standToSit', align: { x: 0, z: SPOTS.seat.z, yaw: 0 }, alignTime: 0.5, fade: 0.4, look: 0.6 },
];

const climbFront = () => [
  walk(0, SPOTS.climbFrontZ + 0.3),
  { turn: Math.PI },
  { clip: 'climbingToTop', align: { x: 0, z: SPOTS.climbFrontZ, yaw: Math.PI }, alignTime: 0.45, fade: 0.35, look: 0, face: 'effort', hands: 'grip' },
  ...sitDownTop(),
];

// round the outside of the row and up from behind (he comes over the top facing the visitor)
const climbBack = (side) => [
  walk(side * SPOTS.sideX, 0.8),
  walk(side * SPOTS.sideX, SPOTS.behindZ),
  walk(0, SPOTS.behindZ),
  { turn: 0 },
  { clip: 'climbingToTop', align: { x: 0, z: SPOTS.climbBackZ, yaw: 0 }, alignTime: 0.5, fade: 0.35, look: 0, face: 'effort', hands: 'grip' },
  ...sitDownTop(),
];

const danceStep = (name) => (CLIPS[name]
  ? react(name, { face: FACE.dance, look: 0.25, dance: true, fade: 0.5 })
  : { clip: name, face: FACE.dance, look: 0.25, dance: true, fade: 0.5 });

const EPISODES = {
  sitLaugh: () => [seated('sittingLaughing', ACTIONS.laugh)],
  sitClap: () => [seated('sittingClap', ACTIONS.clap)],
  sitThumbs: () => [seated('sittingThumbsUp', ACTIONS.wink)],
  sitCheer: () => [seated('cheeringWhileSitting', ACTIONS.cheer, { loop: true, hold: 4.2 })],
  sitDisbelief: () => [seated('sittingDisbelief', ACTIONS.doubleTake)],
  sitRubArm: () => [seated('sittingRubbingArm', ACTIONS.sleepyHead)],
  crossLegs: () => [
    { clip: 'sittingIdle2', loop: true, hold: rand(8, 11), fade: 1.4, align: { z: SPOTS.seat.z - 0.45 }, alignTime: 1.4, overlay: true, face: 'comfy', look: 1 },
    { clip: 'sittingIdle', loop: true, hold: 1.5, fade: 1.4, align: { z: SPOTS.seat.z }, alignTime: 1.4, legs: true },
  ],
  waveHello: () => [...getDown(), walk(SPOTS.wave.x, SPOTS.wave.z), { turn: 0 }, react('tiltWave', { look: 1 }), ...climbFront()],
  aroundBack: () => [...getDown(), ...climbBack(Math.random() < 0.5 ? -1 : 1)],
  searchLost: () => [...getDown(), walk(-1.15, 1.05), { turn: 0.5 }, react('suspicious'), walk(1.2, 1.1), { turn: -0.4 }, react('shrug', { look: 0.8 }), ...climbFront()],
  peekBehind: () => {
    const side = Math.random() < 0.5 ? -1 : 1;
    return [...getDown(), walk(side * SPOTS.sideX, 0.6), walk(side * SPOTS.sideX, -0.45), { turn: Math.PI }, react('doubleTake'),
      { turn: 0 }, react('shakeNo', { look: 0.8 }), walk(side * 0.9, 1.0), ...climbFront()];
  },
  watchStretch: () => [...getDown(), walk(0.65, 1.25), { turn: 0 }, react('checkWatch'), react('stretch'), ...climbFront()],
  cheerHop: () => [...getDown(), walk(-0.5, 1.5), { turn: 0 }, react('hop'), react('cheer'), react('cheer', { fade: 0.2 }), ...climbFront()],
  bowShow: () => [...getDown(), walk(0, 2.25), { turn: 0 }, react('bow', { look: 1 }), react('nodYes', { look: 1 }), ...climbFront()],
  dizzy: () => [...getDown(), walk(0.35, 1.4), react('dizzy'), ...climbFront()],
};
export const EPISODE_NAMES = Object.keys(EPISODES);

function bag(items) {
  let left = [];
  let last = null;
  return () => {
    if (!left.length) left = [...items].sort(() => Math.random() - 0.5);
    if (left[0] === last && left.length > 1) left.push(left.shift());
    last = left.shift();
    return last;
  };
}

export class Director {
  constructor() {
    this.queue = []; this.mode = 'seated'; this.nextAt = 0;
    this.nextEpisode = bag(EPISODE_NAMES); this.nextDance = bag(DANCES_404);
    this.since = 0; this.danceAt = Math.random() < 0.5 ? 2 : 3;
    this.pendingDance = false; this.forced = null;
    this.glasses = { reading: false, pinned: false, worn: false };
    this.poke = null;                       // { start, face } face-only reaction to a click
  }

  tick(m, now) {
    if (!m.step) { m.place(SPOTS.seat); m.start(sitBase()); this.mode = 'seated'; this.nextAt = now + rand(5, 7); }
    if (m.done) this.advance(m, now);
    // glasses on / off with his upper body whenever the step allows it (sitting, standing, walking)
    const g = this.glasses; const want = g.reading || g.pinned;
    // (only with time to finish it: cut short, the glasses would jump to his face or away)
    if (m.step?.overlay && !m.overlay && want !== g.worn && m.remaining() > 1.7) m.playOverlay(want ? 'glassesOn' : 'glassesOff');
    if (this.mode !== 'seated') return;
    if (!m.overlay && (this.pendingDance || this.forced || now > this.nextAt)) this.begin(m, now);
  }

  begin(m, now) {
    let steps;
    if (this.forced) { steps = this.forced === 'dance' ? this.danceEpisode() : EPISODES[this.forced](); this.forced = null; }
    else if (this.pendingDance || this.since >= this.danceAt) {
      steps = this.danceEpisode(); this.since = 0; this.danceAt = Math.random() < 0.5 ? 2 : 3;
    } else { steps = EPISODES[this.nextEpisode()](); this.since += 1; }
    this.pendingDance = false;
    this.queue = steps; this.mode = 'episode';
    this.advance(m, now);
  }

  danceSteps() { return [walk(SPOTS.dance.x, SPOTS.dance.z), { turn: 0 }, danceStep(this.nextDance())]; }
  danceEpisode() { return [...getDown(), ...this.danceSteps(), ...climbFront()]; }

  advance(m, now) {
    let next = this.queue.shift();
    // 3 clicks while he is down on the stage: dance first, then carry on (the rest of the episode climbs back)
    if (this.pendingDance && next?.dancePoint && m.G.y < 0.1) {
      this.queue.unshift(...this.danceSteps(), next); this.pendingDance = false;
      next = this.queue.shift();
    }
    while (next && next.turn !== undefined) {
      const steps = this.turnSteps(m, next.turn);
      this.queue.unshift(...steps);
      next = this.queue.shift();
    }
    if (next) { m.start(next); return; }
    m.start(sitBase()); this.mode = 'seated'; this.nextAt = now + rand(7, 10);
  }

  // turn on the spot to face `yaw` with the 90° turn clips (two for an about-turn); the last one lands exactly on it
  turnSteps(m, yaw) {
    const delta = wrapAngle(yaw - m.G.yaw);
    if (Math.abs(delta) < 0.35) return [];
    const clip = Math.sign(delta) === m.turnSign ? 'leftTurn90' : 'rightTurn90';
    const amount = m.lib[clip].root.yaw.at(-1);
    // align.yaw = the frame the clip turns from, so its own turn ends on the target
    const last = { clip, align: { yaw: yaw - amount }, alignTime: 0.8, fade: 0.25, look: 0.5 };
    return Math.abs(delta) > 2.2 ? [{ clip, fade: 0.25, look: 0.5 }, last] : [last];
  }

  // clicks: 'poke' (one, on him), 'dance' (3), 'glasses' (4)
  click(kind, m, now) {
    if (kind === 'dance') { this.pendingDance = true; return; }
    if (kind === 'glasses') { this.glasses.pinned = !this.glasses.pinned; return; }
    this.poke = { start: now, face: pickOne([ACTIONS.wink, ACTIONS.smile, ACTIONS.surprised].filter(Boolean)) };
    if (this.mode === 'seated' && !m.overlay && Math.random() < 0.6) {
      this.queue = [pickOne([seated('sittingThumbsUp', ACTIONS.wink), seated('cheeringWhileSitting', ACTIONS.cheer, { loop: true, hold: 2.4 })])];
      this.mode = 'episode'; this.advance(m, now);
    }
  }

  force(name) { this.forced = name; }
}
