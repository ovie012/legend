import * as THREE from 'three';

// Motion engine for the 404 avatar: plays one "step" (a clip, a walk, a hold) after another with crossfades, and moves
// the character's group by the clips' own root motion, so jumps, climbs, falls and turns carry him across the stage
// and the next clip starts exactly where the last one left him.
//
// Root motion: at load every clip is rewritten so the hips stay over the group origin (their travel and, for turns,
// their change of heading move the group instead). Clips that change the floor he stands on (climb up, jump down,
// sitting down on the ledge) also hand their rise/drop to the group, matched to the block height.

const { clamp } = THREE.MathUtils;
const Y = new THREE.Vector3(0, 1, 0);
const smooth = (a, b, x) => { const t = clamp((x - a) / Math.max(b - a, 1e-6), 0, 1); return t * t * (3 - 2 * t); };
export const wrapAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a));
const LOWER = /(Hips|UpLeg|Leg|Foot|Toe)/;           // hips + legs; everything else is the upper body
export const WALK_SPEED = { walking: 1.58, happyWalk: 1.47 };   // m/s at timeScale 1 (planted-foot speed, measured)

// hips' parent space <-> the character root's space, and the hips' own forward / up axes (from a standing frame)
export function motionContext(c, standClip) {
  c.root.updateMatrixWorld(true);
  const M = new THREE.Matrix4().copy(c.root.matrixWorld).invert().multiply(c.hips.parent.matrixWorld);
  const qP = new THREE.Quaternion(); M.decompose(new THREE.Vector3(), qP, new THREE.Vector3());
  const ctx = { hips: c.hips.name, M, Minv: M.clone().invert(), qP, qPinv: qP.clone().invert() };
  const qt = standClip.tracks.find((t) => t.name === `${ctx.hips}.quaternion`);
  const q0 = new THREE.Quaternion().fromArray(qt.values, 0).premultiply(qP).invert();
  ctx.fwd = new THREE.Vector3(0, 0, 1).applyQuaternion(q0);
  ctx.up = new THREE.Vector3(0, 1, 0).applyQuaternion(q0);
  return ctx;
}

export function hipsHeight(clip, ctx, t = 0) {
  const pt = clip.tracks.find((tr) => tr.name === `${ctx.hips}.position`);
  const v = pt.createInterpolant().evaluate(t);
  return new THREE.Vector3(v[0], v[1], v[2]).applyMatrix4(ctx.M).y;
}

// cfg: yaw (hand the heading change to the group), move:false (keep the group still: the feet travel instead),
// scale (shorten the travel),
// floor: [clip floor at start, at end] (removed from the hips), to: the group's rise (+) / drop (-) over the clip,
// ramp: [from, to] in 0..1 of the clip, when the floor change happens
function rootify(clip, ctx, cfg) {
  const hp = `${ctx.hips}.position`; const hq = `${ctx.hips}.quaternion`;
  const pt = clip.tracks.find((t) => t.name === hp); const qt = clip.tracks.find((t) => t.name === hq);
  const times = Float32Array.from(qt.times);
  const n = times.length; const dur = clip.duration;
  const pI = pt.createInterpolant(); const qI = qt.createInterpolant();
  const P = new Float32Array(n * 3); const Q = new Float32Array(n * 4);
  const root = { times, x: new Float32Array(n), z: new Float32Array(n), y: new Float32Array(n), yaw: new Float32Array(n), duration: dur };
  const [F0, F1] = cfg.floor ?? [0, 0]; const [r0, r1] = cfg.ramp ?? [0, 1]; const to = cfg.to ?? 0;
  const v = new THREE.Vector3(); const q = new THREE.Quaternion(); const qy = new THREE.Quaternion();
  const f = new THREE.Vector3(); const u = new THREE.Vector3();
  let p0x = 0; let p0z = 0; let h0 = 0; let prev = 0; let turns = 0;
  for (let i = 0; i < n; i++) {
    const t = times[i];
    const pv = pI.evaluate(t); v.set(pv[0], pv[1], pv[2]).applyMatrix4(ctx.M);
    const qv = qI.evaluate(t); q.set(qv[0], qv[1], qv[2], qv[3]).premultiply(ctx.qP).normalize();
    if (i === 0) { p0x = v.x; p0z = v.z; }
    let yaw = 0;
    if (cfg.yaw) {
      f.copy(ctx.fwd).applyQuaternion(q); u.copy(ctx.up).applyQuaternion(q);
      const h = Math.atan2(f.x + u.x * 0.5, f.z + u.z * 0.5);
      if (i === 0) { h0 = h; prev = h; }
      if (h - prev > Math.PI) turns -= 1; else if (prev - h > Math.PI) turns += 1;
      prev = h; yaw = h + turns * 2 * Math.PI - h0;
    }
    const s = smooth(r0, r1, t / dur);
    const sc = cfg.move === false ? 0 : cfg.scale ?? 1;          // scale < 1: a shorter fall (the feet slide a little)
    root.x[i] = (v.x - p0x) * sc;
    root.z[i] = (v.z - p0z) * sc;
    root.y[i] = to * s;
    root.yaw[i] = yaw;
    // the hips: straight above the group origin, the floor change and the heading change taken out
    v.set(0, v.y - (F0 + (F1 - F0) * s), 0).applyMatrix4(ctx.Minv);
    q.premultiply(qy.setFromAxisAngle(Y, -yaw)).premultiply(ctx.qPinv);
    P[i * 3] = v.x; P[i * 3 + 1] = v.y; P[i * 3 + 2] = v.z;
    Q[i * 4] = q.x; Q[i * 4 + 1] = q.y; Q[i * 4 + 2] = q.z; Q[i * 4 + 3] = q.w;
  }
  const tracks = clip.tracks.filter((t) => t !== pt && t !== qt).map((t) => t.clone());
  tracks.push(new THREE.VectorKeyframeTrack(hp, times, P), new THREE.QuaternionKeyframeTrack(hq, times, Q));
  return { clip: new THREE.AnimationClip(clip.name, dur, tracks), root };
}

const nodeOf = (track) => track.name.split('.')[0];
const part = (clip, lower) => new THREE.AnimationClip(`${clip.name}:${lower ? 'lo' : 'up'}`, clip.duration,
  clip.tracks.filter((t) => LOWER.test(nodeOf(t)) === lower));

// root transform of a clip at time t (linear between samples)
function rootAt(R, t, out) {
  const T = R.times; const n = T.length;
  let i = 0;
  if (t <= T[0]) i = 0; else if (t >= T[n - 1]) i = n - 2;
  else { let lo = 0; let hi = n - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (T[m] <= t) lo = m; else hi = m; } i = lo; }
  const k = n > 1 ? clamp((t - T[i]) / Math.max(T[i + 1] - T[i], 1e-6), 0, 1) : 0;
  const j = Math.min(i + 1, n - 1);
  out.x = R.x[i] + (R.x[j] - R.x[i]) * k; out.z = R.z[i] + (R.z[j] - R.z[i]) * k;
  out.y = R.y[i] + (R.y[j] - R.y[i]) * k; out.yaw = R.yaw[i] + (R.yaw[j] - R.yaw[i]) * k;
  return out;
}
// b relative to a, in a's frame
function relRoot(a, b, out) {
  const dx = b.x - a.x; const dz = b.z - a.z; const c = Math.cos(-a.yaw); const s = Math.sin(-a.yaw);
  out.x = dx * c + dz * s; out.z = -dx * s + dz * c; out.y = b.y - a.y; out.yaw = b.yaw - a.yaw;
  return out;
}
// frame S moved by r (r in S's frame)
function compose(S, r, out) {
  const c = Math.cos(S.yaw); const s = Math.sin(S.yaw);
  out.x = S.x + r.x * c + r.z * s; out.z = S.z - r.x * s + r.z * c; out.y = S.y + r.y; out.yaw = S.yaw + r.yaw;
  return out;
}

export class Motion {
  constructor(c, ctx) {
    this.c = c; this.ctx = ctx; this.mixer = c.mixer;
    this.lib = {};
    this.G = { x: 0, y: 0, z: 0, yaw: 0 };         // where the group is now
    this.S = { x: 0, y: 0, z: 0, yaw: 0 };         // where the current step started (+ alignment)
    this.pairs = [];                                // { lower, upper, w, rate, fading }
    this.step = null; this.t = 0; this.done = false;
    this.overlay = null;                            // { action, start, duration, name, w }
    this._a = {}; this._b = {}; this._r = {};
  }

  // clip -> two copies (back-to-back repeats of a clip each get their own action), split into legs and upper body
  add(key, clip, cfg = {}) {
    if (this.lib[key]) return this.lib[key];
    const { clip: c2, root } = rootify(clip, this.ctx, cfg);
    const copy = () => ({ lower: part(c2, true), upper: part(c2, false) });
    this.lib[key] = { copies: [copy(), copy()], root, duration: clip.duration, next: 0, cfg };
    return this.lib[key];
  }

  addOverlay(key, clip) {     // upper body only (glasses on/off while he sits or stands)
    this.lib[key] = { overlay: part(clip, false), duration: clip.duration };
  }

  place(spot) { Object.assign(this.G, { x: spot.x, y: spot.y, z: spot.z, yaw: spot.yaw ?? 0 }); }

  start(step) {
    const e = this.lib[step.clip];
    if (!e) throw new Error(`404 avatar: no clip ${step.clip}`);
    const copy = e.copies[e.next]; e.next = 1 - e.next;
    const lower = this.mixer.clipAction(copy.lower); const upper = this.mixer.clipAction(copy.upper);
    const from = step.from ?? 0;
    const loop = !!(step.loop || step.walk);
    for (const a of [lower, upper]) {
      a.reset(); a.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, loop ? Infinity : 1);
      a.clampWhenFinished = true; a.timeScale = step.speed ?? 1; a.time = from; a.paused = false;
      a.setEffectiveWeight(0); a.play();
    }
    // the outgoing clips freeze where they are and fade out
    for (const p of this.pairs) { p.fading = true; p.rate = 1 / Math.max(step.fade ?? 0.3, 0.05); p.lower.paused = true; p.upper.paused = true; }
    this.pairs.push({ lower, upper, w: 0, rate: 1 / Math.max(step.fade ?? 0.3, 0.05), fading: false });

    Object.assign(this.S, this.G);
    this.align = null;
    if (step.align) {
      const a = step.align;
      this.align = { x: (a.x ?? this.G.x) - this.G.x, z: (a.z ?? this.G.z) - this.G.z, y: (a.y ?? this.G.y) - this.G.y,
        yaw: a.yaw === undefined ? 0 : wrapAngle(a.yaw - this.G.yaw), time: step.alignTime ?? step.fade ?? 0.3 };
    }
    this.e = e; this.step = step; this.t = 0; this.done = false; this.prevTime = from; this.walkV = 0;
    rootAt(e.root, from, this._r); this.rFrom = { ...this._r };
    this.stepDuration = step.walk ? Infinity
      : step.hold ?? ((step.until ?? e.duration) - from) / (step.speed ?? 1);
  }

  playOverlay(key) {
    const e = this.lib[key];
    const a = this.mixer.clipAction(e.overlay);
    a.reset(); a.setLoop(THREE.LoopOnce, 1); a.clampWhenFinished = true; a.setEffectiveWeight(0); a.play();
    if (this.overlay && this.overlay.action !== a) this.overlay.action.stop();
    this.overlay = { action: a, start: performance.now() / 1000, duration: e.duration, name: key, w: 0 };
  }

  update(dt) {
    const st = this.step; if (!st) return;
    this.mixer.update(dt);
    this.t += dt;
    const cur = this.pairs[this.pairs.length - 1];
    const time = cur.lower.time;

    if (st.walk) this.walk(dt);
    else {
      // a looping clip that travels: carry its root on from loop to loop
      if (st.loop && time < this.prevTime - 1e-4) {
        rootAt(this.e.root, this.e.duration, this._a); relRoot(this.rFrom, this._a, this._b);
        compose(this.S, this._b, this.S);
        rootAt(this.e.root, 0, this._r); this.rFrom = { ...this._r };
      }
      rootAt(this.e.root, time, this._a); relRoot(this.rFrom, this._a, this._b);
      const S = this.S; const al = this.align;
      if (al) {
        const k = smooth(0, 1, this.t / Math.max(al.time, 1e-3));
        const base = { x: S.x + al.x * k, y: S.y + al.y * k, z: S.z + al.z * k, yaw: S.yaw + al.yaw * k };
        compose(base, this._b, this.G);
      } else compose(S, this._b, this.G);
    }
    this.prevTime = time;
    if (!st.walk && this.t >= this.stepDuration - 1e-3) this.done = true;

    // crossfade weights (eased); the upper body yields to a glasses overlay where the step allows it
    const ov = this.overlay;
    let o = 0;
    if (ov) {
      const age = performance.now() / 1000 - ov.start;
      const want = st.overlay && age < ov.duration - 0.25 ? 1 : 0;
      ov.w = clamp(ov.w + (want ? dt / 0.25 : -dt / 0.3), 0, 1);
      o = smooth(0, 1, ov.w);
      ov.action.setEffectiveWeight(o);
      if (age > ov.duration && ov.w === 0) { ov.action.stop(); this.overlay = null; }
    }
    for (let i = this.pairs.length - 1; i >= 0; i--) {
      const p = this.pairs[i];
      p.w = clamp(p.w + (p.fading ? -dt : dt) * p.rate, 0, 1);
      const w = smooth(0, 1, p.w);
      p.lower.setEffectiveWeight(w); p.upper.setEffectiveWeight(w * (1 - o));
      if (p.fading && p.w === 0) { p.lower.stop(); p.upper.stop(); this.pairs.splice(i, 1); }
    }
  }

  // seconds left in the current step (a walk: distance over its speed)
  remaining() {
    const st = this.step; if (!st) return 0;
    if (st.walk) return Math.hypot(st.walk.x - this.G.x, st.walk.z - this.G.z) / ((WALK_SPEED[st.clip] ?? 1.5) * (st.speed ?? 1));
    return this.stepDuration - this.t;
  }

  // walk to (x, z): turn toward it while walking (slower in sharp turns), stop on the spot
  walk(dt) {
    const st = this.step; const G = this.G;
    const dx = st.walk.x - G.x; const dz = st.walk.z - G.z; const dist = Math.hypot(dx, dz);
    const want = Math.atan2(dx, dz); const turn = wrapAngle(want - G.yaw);
    const rate = st.turnRate ?? 3.2;
    G.yaw += clamp(turn, -rate * dt, rate * dt);
    const full = (WALK_SPEED[st.clip] ?? 1.5) * (st.speed ?? 1);
    const target = full * (Math.abs(turn) > 1.3 ? 0.25 : 1) * smooth(0, 0.35, this.t);
    this.walkV += (target - this.walkV) * Math.min(1, dt * 8);
    const stepLen = Math.min(this.walkV * dt, dist);
    if (Math.abs(turn) < 1.3 || dist > 0.25) { G.x += Math.sin(G.yaw) * stepLen; G.z += Math.cos(G.yaw) * stepLen; }
    if (dist < 0.03 || (dist < 0.12 && Math.abs(turn) > 1.6)) this.done = true;
  }

  // hand-off when the theme swaps the outfit: continue exactly where the other character is
  syncFrom(o) {
    Object.assign(this.G, o.G);
    if (!o.step) return;
    this.start({ ...o.step, fade: 0.01 });
    Object.assign(this.S, o.S); this.align = o.align && { ...o.align }; this.t = o.t; this.walkV = o.walkV;
    this.rFrom = { ...o.rFrom }; this.prevTime = o.prevTime; this.stepDuration = o.stepDuration;
    const src = o.pairs[o.pairs.length - 1]; const dst = this.pairs[this.pairs.length - 1];
    dst.lower.time = src.lower.time; dst.upper.time = src.upper.time; dst.w = 1;
    this.pairs.filter((p) => p !== dst).forEach((p) => { p.lower.stop(); p.upper.stop(); });
    this.pairs = [dst];
  }
}
