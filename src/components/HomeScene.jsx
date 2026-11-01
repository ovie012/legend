/* eslint-disable react/no-unknown-property -- react-three-fiber JSX props (args, intensity, ...) */
import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import HomeAvatar from './HomeAvatar';
import { useAvatarDirector } from './useAvatarDirector';
import { reportTask } from '../loadProgress';
import { avatarStage } from './avatarStage';

if (import.meta.hot) import.meta.hot.decline();   // the 3D scene reloads the page instead of hot-patching

// three's loaders report through the default manager; forward that to the preloader
reportTask('3d', 0.15);
THREE.DefaultLoadingManager.onProgress = (url, loaded, total) => reportTask('3d', 0.15 + 0.8 * (loaded / total));
import { AVATAR_RIG as RIG } from './avatarRig';

// Where the avatar sits for each [data-stage] section: x/y in half-viewport units,
// s as a share of viewport height, ry as yaw (positive turns toward the right).
// On mobile an element can point somewhere else with data-stage-mobile ("none" skips it).
// Safe zones (owner 2026-11-01: he may stand beside text, never on it):
//   fit: he stands inside that element's box (bust bottom on its bottom edge, as big as the box allows);
//   follow: he scrolls up together with his section instead of staying put while its text passes under him;
//   arrive: he reaches this pose when the section's TOP is this far down the window (default: when its centre
//   reaches the middle; the tall Selected works section made him arrive long after its title had come up under him).
const STAGES = {
  desktop: {
    hero:   { x: 0.46, y: -0.16, s: 0.8, ry: -0.18 },
    about:  { x: -0.5, y: -0.1, s: 0.8, ry: 0.26 },
    // the end of the card row is kept free for him (.hm-works-stand): he presents the cards as they slide past
    works:  { fit: '.hm-works-stand', arrive: 0.2, x: 0.76, y: -0.05, s: 0.5, ry: -0.42 },
    skills: { x: 0.5, y: -0.12, s: 0.72, ry: -0.12 },
    journey: { arrive: 0.45, x: -0.52, y: -0.12, s: 0.74, ry: 0.22 },
    aibuilds: { x: 0.78, y: 0.5, s: 0.27, ry: -0.3 },
    exit:   { x: 0, y: -1.7, s: 0.6, ry: 0 },
  },
  // dock: where text would pass him he shrinks into the corner badge, like the companion on the other pages
  // (owner 2026-11-01), and grows back where there is room for him (hero, the empty Skills stage)
  mobile: {
    hero:   { x: 0, y: 0.3, s: 0.5, ry: 0, follow: true },
    // arrive 1.35: he sets off for the badge while the hero is still in view, before the About text reaches him
    about:  { dock: true, arrive: 1.35 },
    works:  { dock: true },
    skills: { x: 0, y: 0.14, s: 0.46, ry: 0 },
    exit:   { dock: true },
  },
};

// The phone badge: same sizes and corner as the companion (App.css .mc): docked = a circle showing his face, up (after
// a tap) = a small window with his bust. px; 'small' up to 600 px wide.
const BADGE = { small: { edge: 12, dock: 56, w: 128, h: 160 }, large: { edge: 16, dock: 64, w: 168, h: 210 } };
const BADGE_RADIUS = 28;      // corners of the 'up' window
const DOCK_FACE = 1.25;       // docked: px per group unit, per px of badge size (his head fills most of the circle)
const STAY_UP = 3.5;          // seconds he stays up after his last gesture
// The hop between his spot and the badge (owner 2026-11-01: following the scroll it looked sharp). The page only
// decides WHEN he goes; the move itself is timed: a quick dip as he glances where he is going (the jump clip, director
// hopDown / hopUp), then one curved leap (sideways leads, a small lift early on), shrinking early into the badge or
// growing out of it, with a soft bounce as he lands. If the visitor turns back mid-air he turns back from where he is.
// crouch / flight in s; lift in stage units; bounce = size overshoot at the landing; turn = body turn in the air (rad);
// above = how far into the hop (0 = his spot, 1 = the badge) he moves above the page's text (small by then)
const HOP = { crouch: 0.1, flight: 0.8, lift: 0.05, bounce: 0.07, turn: 0.45, above: 0.4 };
const easeOutBack = (x) => 1 + 2.70158 * (x - 1) ** 3 + 1.70158 * (x - 1) ** 2;
// the leap's timing, like a jump: quick off the ground, slowing into a soft landing
const leap = (u) => 1 - (1 - u) ** 2;
const TAP_GESTURES = ['tiltWave', 'laugh', 'wink', 'headTilt', 'nodYes', 'smile', 'shrug'];   // as MiniCompanion

// while crossing the page he rises and shrinks a little, so his body clears the text coming up from below
const ARC = { up: 0.4, shrink: 0.2 };
// bust box in group units (top of the hair .. fade line) and its width per unit of height, for 'fit'
const BUST = { top: 1.22, bottom: 0.9, aspect: 0.8 };

// dev only, for rendering stills of him from the live scene (designs/avatar-work/shot/still.mjs):
// window.__sceneBare(true) hides dust + halo; window.__stageOverride = { x, y, s, ry } places him (same units as STAGES)
const DEV = { bare: false };
if (import.meta.env.DEV) window.__sceneBare = (on) => { DEV.bare = !!on; };

const smoothstep = (e0, e1, x) => {
  const t = THREE.MathUtils.clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};

// his bust inside a box (px): s from the box height and width (whichever is tighter), standing on its bottom edge
function fitBox(r, vw, vh) {
  const s = Math.min(r.height / ((BUST.top + BUST.bottom) / 2 * vh), r.width / ((BUST.top + BUST.bottom) / 2 * BUST.aspect * vh));
  return { x: ((r.left + r.right) / 2 - vw / 2) / (vw / 2), y: (vh / 2 - (r.bottom - BUST.bottom * s * vh / 2)) / (vh / 2), s };
}

// a stage's numbers for this frame (fit / follow read the page; dock is placed by the Rig)
function resolve(stage, rect) {
  if (stage.dock) return { x: 0, y: 0, s: 0, ry: 0, dock: 1 };
  const vw = window.innerWidth; const vh = window.innerHeight;
  let { x, y, s } = stage;
  if (stage.fit) {
    const r = document.querySelector(stage.fit)?.getBoundingClientRect();
    if (r && r.width > 40 && r.height > 40) ({ x, y, s } = fitBox(r, vw, vh));
  }
  if (stage.follow && rect) y += Math.max(0, -rect.top) / (vh / 2);
  return { x, y, s, ry: stage.ry, dock: 0 };
}

// Blend between the two stages around the middle of the viewport, holding each pose inside its section.
function readStage(stages, mobile) {
  const nodes = document.querySelectorAll('[data-stage], [data-stage-mobile]');
  const vh = window.innerHeight; const mid = vh / 2;
  let prev = null;
  for (const node of nodes) {
    const name = mobile ? node.dataset.stageMobile ?? node.dataset.stage : node.dataset.stage;
    const r = node.getBoundingClientRect();
    const stage = stages[name];
    if (!stage || !r.height) continue;
    const center = stage.arrive !== undefined ? r.top + (0.5 - stage.arrive) * vh : r.top + r.height / 2;
    const anchor = { name, stage, rect: r, center };
    if (anchor.center >= mid) {
      if (!prev) return { from: resolve(stage, r), to: resolve(stage, r), fromName: name, toName: name, t: 0 };
      const t = smoothstep(0.2, 0.8, (mid - prev.center) / (anchor.center - prev.center));
      return { from: resolve(prev.stage, prev.rect), to: resolve(stage, r), fromName: prev.name, toName: name, t };
    }
    prev = anchor;
  }
  return prev ? { from: resolve(prev.stage, prev.rect), to: resolve(prev.stage, prev.rect), fromName: prev.name, toName: prev.name, t: 0 } : null;
}

function roundSprite() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.35, 'rgba(255,255,255,0.5)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

function Dust({ look, scroll, dock }) {
  const points = useRef();
  const mat = useRef();
  const count = 650;
  const { positions, sprite } = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 14;
      p[i * 3 + 1] = (Math.random() - 0.5) * 9;
      p[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1.5;
    }
    return { positions: p, sprite: roundSprite() };
  }, []);

  useFrame((state, dt) => {
    const pts = points.current;
    pts.visible = !DEV.bare && dock.fx > 0.01;          // fades out while he hops into the phone badge
    mat.current.opacity = 0.55 * dock.fx;
    pts.rotation.y += dt * 0.012;
    pts.position.y = (pts.position.y + dt * 0.04 - scroll.current.velocity * 0.00004) % 3;
    mat.current.color.copy(look.cur.accent);
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial
        ref={mat}
        map={sprite}
        size={0.05}
        sizeAttenuation
        transparent
        opacity={0.55}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Brand motif: the orbit ellipse with the four-point star travelling on it.
function Orbit({ accent }) {
  const star = useLoader(THREE.TextureLoader, '/icon-Star.svg');
  const starRef = useRef();
  const curve = useMemo(() => new THREE.EllipseCurve(0, 0, 1.15, 0.42), []);
  const line = useMemo(() => {
    const g = new THREE.BufferGeometry().setFromPoints(curve.getPoints(160));
    return g;
  }, [curve]);

  useFrame((state) => {
    const p = curve.getPoint((state.clock.elapsedTime * 0.06) % 1);
    starRef.current.position.set(p.x, p.y, 0);
    starRef.current.material.rotation = state.clock.elapsedTime * 0.8;
  });

  return (
    <group position={[RIG.neck.pivot[0] + 0.05, 0.62, 0]} rotation={[0.15, 0, -0.16]}>
      <line geometry={line}>
        <lineBasicMaterial color={accent} transparent opacity={0.55} />
      </line>
      <sprite ref={starRef} scale={0.16}>
        <spriteMaterial alphaMap={star} color={accent} transparent depthWrite={false} />
      </sprite>
    </group>
  );
}

function Halo({ look, dock }) {
  const uniforms = useMemo(() => ({ uColor: { value: new THREE.Color() }, uAlpha: { value: 1 } }), []);
  const mesh = useRef();
  useFrame(() => { uniforms.uColor.value.copy(look.cur.halo); uniforms.uAlpha.value = dock.fx; mesh.current.visible = !DEV.bare && dock.fx > 0.01; });
  return (
    <mesh ref={mesh} position={[0, 0.25, -0.9]} scale={[4.2, 4.2, 1]}>
      <planeGeometry />
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader="varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }"
        fragmentShader="uniform vec3 uColor; uniform float uAlpha; varying vec2 vUv; void main() { float d = length(vUv - 0.5) * 2.0; gl_FragColor = vec4(uColor, pow(1.0 - clamp(d, 0.0, 1.0), 2.6) * 0.18 * uAlpha); }"
      />
    </mesh>
  );
}

// Theme colours of the scene (lights, dust, halo), faded over THEME_FADE whenever the theme changes, in step with the
// page's crossfade (App.css THEME SWITCH): the 3D layer stays live during it, so instant colours would jump ahead.
const THEME_FADE = 0.4;
function lookOf(colors, lightMode) {
  const col = (v) => new THREE.Color(v);
  return { accent: col(colors.accent), halo: col(colors.halo), rim: col(colors.rim), fill: col(colors.fill),
    hemiGround: col(lightMode ? '#e3d3c3' : '#141a26'), hemiI: lightMode ? 1.5 : 1.15, keyI: lightMode ? 1.5 : 1.7, fillI: lightMode ? 2 : 1.4 };
}
const cloneLook = (l) => Object.fromEntries(Object.entries(l).map(([k, v]) => [k, v?.isColor ? v.clone() : v]));
function useLook(colors, lightMode) {
  const look = useMemo(() => { const l = lookOf(colors, lightMode); return { cur: l, from: cloneLook(l), to: cloneLook(l), t: 1 }; }, []);
  useEffect(() => { look.from = cloneLook(look.cur); look.to = lookOf(colors, lightMode); look.t = 0; }, [colors, lightMode, look]);
  useFrame((state, dt) => {
    if (look.t >= 1) return;
    look.t = Math.min(1, look.t + Math.min(dt, 0.05) / THEME_FADE);
    const k = look.t * look.t * (3 - 2 * look.t);
    for (const key of Object.keys(look.from)) {
      if (look.from[key].isColor) look.cur[key].copy(look.from[key]).lerp(look.to[key], k);
      else look.cur[key] = look.from[key] + (look.to[key] - look.from[key]) * k;
    }
  });
  return look;
}

function Rig({ colors, lightMode, pointer, scroll, onReady, badge }) {
  const group = useRef();
  const orbit = useRef();
  const avatar = useRef();
  const keyLight = useRef(); const hemi = useRef(); const rim = useRef(); const fill = useRef();
  const look = useLook(colors, lightMode);
  const { viewport, camera, size } = useThree();
  const state = useRef({ x: 0, y: 0, s: 1, ry: 0, init: false, held: null, up: 0, head: { x: 0, y: 0.65 },
    hop: { want: false, phase: 'rest', dir: 1, t: 0, u: 0, p: 0 } });
  // current: 0..1 how far he is into the phone badge (the character's look); fx: dust + halo strength
  const dock = useRef({ current: 0, fx: 1 }).current;
  const view = useRef({});              // last styles written to the page (only changes are written)
  const headPos = useMemo(() => new THREE.Vector3(), []);
  useEffect(() => () => { avatarStage.present = false; avatarStage.head.on = false; }, []);
  const director = useAvatarDirector({ meshRef: avatar, lightMode, scroll });

  // a tap on the phone badge: up from the corner with a wave (or another gesture when he is already up), then back
  // into the corner a while after the gesture, as the companion does on the other pages
  useEffect(() => {
    const ui = badge.current;
    const dockLater = () => {
      clearTimeout(ui.timer);
      ui.timer = setTimeout(() => { ui.up = false; }, (director.busyFor() + STAY_UP) * 1000);
    };
    ui.tap = () => {
      const wasUp = ui.up;
      ui.up = true;
      clearTimeout(ui.timer);
      const name = wasUp ? TAP_GESTURES[Math.floor(Math.random() * TAP_GESTURES.length)] : 'tiltWave';
      ui.timer = setTimeout(() => { director.play(name, 'click'); dockLater(); }, wasUp ? 0 : 400);
    };
    return () => { clearTimeout(ui.timer); ui.tap = null; };
  }, []);

  // dev only: window.__avatarBox() = his on-screen box in px (the visible bust: cut at the fade line), for safe-zone checks
  useEffect(() => {
    if (!import.meta.env.DEV) return undefined;
    const box = new THREE.Box3(); const part = new THREE.Box3(); const v = new THREE.Vector3();
    window.__avatarBox = () => {
      const hit = avatar.current; const g = group.current;
      if (!hit || !g) return null;
      box.makeEmpty();
      hit.children.forEach((m) => { m.updateWorldMatrix(true, false); box.union(part.setFromObject(m)); });
      box.min.y = Math.max(box.min.y, g.position.y - 0.9 * g.scale.y);
      if (box.isEmpty()) return null;
      const r = { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity };
      for (const x of [box.min.x, box.max.x]) for (const y of [box.min.y, box.max.y]) for (const z of [box.min.z, box.max.z]) {
        v.set(x, y, z).project(camera);
        const px = (v.x + 1) / 2 * window.innerWidth; const py = (1 - v.y) / 2 * window.innerHeight;
        r.left = Math.min(r.left, px); r.right = Math.max(r.right, px); r.top = Math.min(r.top, py); r.bottom = Math.max(r.bottom, py);
      }
      return r;
    };
    return () => { delete window.__avatarBox; };
  }, [camera]);

  useFrame((frame, dt) => {
    dt = Math.min(dt, 0.05);
    const sc = scroll.current;
    const y = window.scrollY;
    sc.velocity = THREE.MathUtils.damp(sc.velocity, (y - sc.y) / Math.max(dt, 1e-3), 6, dt);
    sc.y = y;

    const mobile = size.width < 800;
    const blend = readStage(mobile ? STAGES.mobile : STAGES.desktop, mobile);
    if (!blend) return;
    const st = state.current;
    const ui = badge.current;
    const k = 4;

    // ---- the phone badge: docked = his face (the head capsule) on the circle's centre; up = his bust in the window
    const vw = size.width; const vh = size.height;
    const b = vw <= 600 ? BADGE.small : BADGE.large;
    const hp = st.hop;
    const want = (blend.from.dock + (blend.to.dock - blend.from.dock) * blend.t) > (hp.want ? 0.45 : 0.55);
    if (!st.init) { hp.want = want; hp.p = want ? 1 : 0; }
    else if (want !== hp.want) {
      hp.want = want;
      // turn back mid-air: a fresh leap from where he is towards the other end, timed to the distance left
      if (hp.phase === 'flight') { hp.dir = want ? 1 : -1; hp.u = 0; hp.p0 = hp.p; }
      else if (hp.phase === 'crouch') hp.phase = 'rest';                           // changed his mind: stays
      else {
        hp.phase = 'crouch'; hp.t = 0; hp.dir = want ? 1 : -1;
        // he takes off from where he is (after a fast flick his spot may already have scrolled away)
        hp.from = { x: st.x / (viewport.width / 2), y: st.y / (viewport.height / 2), s: st.s / (viewport.height / 2), ry: st.ry };
        director.play(want ? 'hopDown' : 'hopUp', 'click');
        if (!want) { ui.ripple = performance.now(); ui.up = false; clearTimeout(ui.timer); }   // the badge glows, he springs out
      }
    }
    if (hp.phase === 'crouch' && (hp.t += dt) >= HOP.crouch) { hp.phase = 'flight'; hp.u = 0; hp.p0 = null; }
    if (hp.phase === 'flight') {
      const from = hp.p0 ?? (hp.dir > 0 ? 0 : 1);
      const to = hp.dir > 0 ? 1 : 0;
      hp.u = Math.min(1, hp.u + dt / (HOP.flight * Math.max(0.4, Math.abs(to - from))));
      hp.p = from + (to - from) * leap(hp.u);
      if (hp.u >= 1) { hp.phase = 'rest'; if (hp.dir > 0) ui.ripple = performance.now(); }
    }
    const p = hp.p;
    const resting = hp.phase === 'rest';
    if (import.meta.env.DEV) window.__hop = hp;          // dev: the hop's state, for designs/avatar-work/shot/hopfilm.mjs
    dock.current = p;
    dock.fx = THREE.MathUtils.damp(dock.fx, resting && p < 0.5 ? 1 : 0, 7, dt);
    if (p < 0.5 && ui.up) { ui.up = false; clearTimeout(ui.timer); }
    st.up = THREE.MathUtils.damp(st.up, ui.up ? 1 : 0, 5, dt);
    const up = smoothstep(0, 1, st.up);
    const unit = b.dock * DOCK_FACE;
    const cx = vw - b.edge - b.dock / 2; const cy = vh - b.edge - b.dock / 2;
    const docked = { x: (cx - st.head.x * unit - vw / 2) / (vw / 2), y: (vh / 2 - (cy + st.head.y * unit)) / (vh / 2), s: 2 * unit / vh, ry: 0 };
    const upPose = { ...fitBox({ left: vw - b.edge - b.w, right: vw - b.edge, top: vh - b.edge - b.h, bottom: vh - b.edge, width: b.w, height: b.h }, vw, vh), ry: -0.15 };
    const badgePose = Object.fromEntries(['x', 'y', 's', 'ry'].map((key) => [key, docked[key] + (upPose[key] - docked[key]) * up]));

    // where the page puts him: between two sections (desktop: with the arc and a small turn when he crosses sideways),
    // or the section's spot when the other side of the blend is the badge
    let stagePose;
    if (blend.from.dock && blend.to.dock) stagePose = badgePose;
    else if (blend.from.dock || blend.to.dock) stagePose = blend.from.dock ? blend.to : blend.from;
    else {
      const lerp = (key) => blend.from[key] + (blend.to[key] - blend.from[key]) * blend.t;
      const travel = Math.sin(Math.PI * blend.t);
      const arc = travel * THREE.MathUtils.clamp(Math.abs(blend.to.x - blend.from.x), 0, 1);
      stagePose = { x: lerp('x'), y: lerp('y') + arc * ARC.up, s: lerp('s') * (1 - arc * ARC.shrink),
        ry: lerp('ry') + travel * 0.22 * Math.sign(blend.to.x - blend.from.x || 1) };
    }
    let pose = stagePose;
    if (p > 0 || !resting) {
      // the hop between his spot (where he took off from, when going down) and the badge
      const spot = hp.dir > 0 && !resting && hp.from ? hp.from : stagePose;
      const ex = smoothstep(0, 0.7, p); const ey = smoothstep(0.15, 1, p); const es = smoothstep(0, 0.35, p);
      pose = {
        x: spot.x + (badgePose.x - spot.x) * ex,
        y: spot.y + (badgePose.y - spot.y) * ey + HOP.lift * Math.sin(Math.PI * smoothstep(0, 0.6, p)),
        s: spot.s * (badgePose.s / spot.s) ** es * (1 + HOP.bounce * Math.sin(Math.PI * smoothstep(0.8, 1, p))),
        ry: spot.ry + (badgePose.ry - spot.ry) * p + HOP.turn * Math.sin(Math.PI * p),
      };
    }
    let target = { x: pose.x * viewport.width / 2, y: pose.y * viewport.height / 2, s: pose.s * viewport.height / 2, ry: pose.ry };

    if (import.meta.env.DEV && window.__stageOverride) {
      const o = window.__stageOverride;
      target = { x: o.x * viewport.width / 2, y: o.y * viewport.height / 2, s: o.s * viewport.height / 2, ry: o.ry };
    }

    // phones: no goodbye at the bottom of the page (he waits in the badge instead)
    const exitness = mobile ? 0 : blend.toName === 'exit' ? blend.t : blend.fromName === 'exit' ? 1 : 0;
    const stageName = blend.t < 0.5 ? blend.fromName : blend.toName;
    const { hold } = director.update(stageName, exitness, p > 0.5);
    // while he says goodbye he stays put; the exit continues once it's done
    if (hold) target = st.held ?? (st.held = { x: st.x, y: st.y, s: st.s, ry: st.ry });
    else st.held = null;

    // the hop is already smooth: only a light damping then, so its curve keeps its shape
    const kk = !st.init ? 1000 : resting ? k : 14;
    st.init = true;
    for (const key of ['x', 'y', 's', 'ry']) st[key] = THREE.MathUtils.damp(st[key], target[key], kk, dt);

    const r = director.pose.current;
    const g = group.current;
    g.position.set(st.x + r.x * st.s, st.y + (Math.sin(frame.clock.elapsedTime * 0.9) * 0.02 + r.y) * st.s, 0);
    g.scale.setScalar(st.s * (1 + r.s));
    g.rotation.y = st.ry + r.ry + director.spin.current.angle;
    // docked: his face exactly on the circle's centre every frame, as he moves (the companion does the same)
    const pin = smoothstep(0.85, 1, p) * (1 - smoothstep(0, 1, st.up));
    const headNow = avatar.current?.children.find((m) => m.name === 'head');
    if (pin > 0 && headNow) {
      g.updateMatrixWorld(true);
      headNow.getWorldPosition(headPos).project(camera);
      const bx = size.width <= 600 ? BADGE.small : BADGE.large;
      const ex = (size.width - bx.edge - bx.dock / 2) - (headPos.x + 1) / 2 * size.width;
      const ey = (size.height - bx.edge - bx.dock / 2) - (1 - headPos.y) / 2 * size.height;
      g.position.x += ex * pin * viewport.width / size.width;
      g.position.y -= ey * pin * viewport.height / size.height;
    }

    // the orbit stays where the hero pose puts it and scrolls away with the page
    if (orbit.current) {
      const hero = STAGES.desktop.hero;
      const hs = hero.s * viewport.height / 2;
      orbit.current.position.set(
        hero.x * viewport.width / 2,
        hero.y * viewport.height / 2 + y * viewport.height / window.innerHeight,
        0
      );
      orbit.current.scale.setScalar(hs);
    }

    // his head on screen, for the page's hint bubble (avatarStage), and where it sits in his group (for the badge)
    const headProxy = avatar.current?.children.find((m) => m.name === 'head');
    if (headProxy) {
      headProxy.getWorldPosition(headPos);
      st.head.x = THREE.MathUtils.damp(st.head.x, (headPos.x - g.position.x) / g.scale.x, 3, dt);
      st.head.y = THREE.MathUtils.damp(st.head.y, (headPos.y - g.position.y) / g.scale.y, 3, dt);
      headPos.project(camera);
      const hs = avatarStage.head;
      hs.x = (headPos.x + 1) / 2 * size.width; hs.y = (1 - headPos.y) / 2 * size.height;
      hs.on = p < 0.1 && Math.abs(headPos.x) < 0.95 && headPos.y < 0.95 && headPos.y > -0.6;
    }

    // the badge opens at the corner like a portal before he lands in it (a ripple when he does) and the scene closes
    // onto it as he arrives; it opens again as he springs out. While he hops he is above the page (the dust and halo
    // have faded by then), so he never slips behind text mid-air.
    const e = smoothstep(0.7, 1, p);
    const open = smoothstep(0.3, 0.75, p);
    const R = { l: vw - b.edge - (b.dock + (b.w - b.dock) * up), t: vh - b.edge - (b.dock + (b.h - b.dock) * up),
      r: b.dock / 2 + (BADGE_RADIUS - b.dock / 2) * up };
    R.w = vw - b.edge - R.l; R.h = vh - b.edge - R.t;
    const C = { l: R.l * e, t: R.t * e, w: vw + (R.w - vw) * e, h: vh + (R.h - vh) * e, r: R.r * e };
    const px = (n) => `${n.toFixed(1)}px`;
    const css = {
      clip: e > 0.001 ? `inset(${px(C.t)} ${px(vw - C.l - C.w)} ${px(vh - C.t - C.h)} ${px(C.l)} round ${px(C.r)})` : '',
      z: mobile && p > HOP.above ? '51' : '',
      box: `${px(R.l)} ${px(R.t)} ${px(R.w)} ${px(R.h)} ${px(R.r)}`,
      bg: (open * (1 - up)).toFixed(3),
      scale: (0.3 + 0.7 * easeOutBack(open)).toFixed(3),
      on: p > 0.95,
      ripple: performance.now() - (ui.ripple ?? -1e4) < 800,
    };
    const v = view.current;
    if (ui.scene && css.clip !== v.clip) ui.scene.style.clipPath = v.clip = css.clip;
    if (ui.scene && css.z !== v.z) { ui.scene.style.zIndex = v.z = css.z; ui.scene.classList.toggle('is-badge', !!css.z); }
    if (ui.el) {
      const bs = ui.el.style;
      if (css.box !== v.box) { v.box = css.box; Object.assign(bs, { left: px(R.l), top: px(R.t), width: px(R.w), height: px(R.h), borderRadius: px(R.r) }); }
      if (css.bg !== v.bg) bs.opacity = v.bg = css.bg;
      if (css.scale !== v.scale) bs.scale = v.scale = css.scale;
      if (css.ripple !== v.ripple) { v.ripple = css.ripple; ui.el.classList.toggle('is-ripple', css.ripple); }
      if (css.on !== v.on) { v.on = css.on; ui.el.classList.toggle('is-on', css.on); ui.el.tabIndex = css.on ? 0 : -1; }
    }

    // the camera's small sway with the pointer: none inside the badge (it would push his face off the circle)
    const sway = 1 - p;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, pointer.current.x * 0.25 * sway, 2, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, pointer.current.y * 0.15 * sway, 2, dt);
    camera.lookAt(0, 0, 0);

    const l = look.cur;
    hemi.current.groundColor.copy(l.hemiGround); hemi.current.intensity = l.hemiI;
    keyLight.current.intensity = l.keyI;
    rim.current.color.copy(l.rim);
    fill.current.color.copy(l.fill); fill.current.intensity = l.fillI;
  });

  return (
    <>
      <hemisphereLight ref={hemi} args={['#ffffff', '#141a26', 1.15]} />
      <directionalLight ref={keyLight} position={[-2, 3, 5]} color="#fff6ec" />
      <directionalLight ref={rim} position={[3.5, 1.8, -3]} intensity={2.6} />
      <directionalLight ref={fill} position={[-3.5, 0.8, -2.5]} />
      <Dust look={look} scroll={scroll} dock={dock} />
      <group ref={group}>
        <Halo look={look} dock={dock} />
        <HomeAvatar lightMode={lightMode} pointer={pointer} scroll={scroll} reaction={director.pose} playing={director.playing} glasses={director.glasses} attention={director.attention} meshRef={avatar} onReady={onReady} dock={dock} />
      </group>
      {/* {size.width >= 800 && (
        <group ref={orbit}>
          <Orbit accent={colors.accent} />
        </group>
      )} */}
    </>
  );
}

function HomeScene({ colors, lightMode }) {
  const pointer = useRef({ x: 0, y: 0, time: -10 });
  const scroll = useRef({ y: 0, velocity: 0 });
  const [ready, setReady] = useState(false);
  // the phone badge (Rig sets tap and moves el; scene = the canvas layer it clips)
  const badge = useRef({ el: null, scene: null, up: false, timer: 0, tap: null });

  useEffect(() => {
    scroll.current.y = window.scrollY;
    const onMove = (e) => {
      pointer.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1,
        time: performance.now() / 1000,
      };
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  return (
    <>
      <div className={`hm-scene ${ready ? 'ready' : ''}`} aria-hidden="true" ref={(el) => { badge.current.scene = el; }}>
        <Canvas
          camera={{ fov: 30, position: [0, 0, 6.5] }}
          dpr={[1, 1.75]}
          gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        >
          <Suspense fallback={null}>
            <Rig colors={colors} lightMode={lightMode} pointer={pointer} scroll={scroll} badge={badge} onReady={() => { setReady(true); reportTask('3d', 1); }} />
          </Suspense>
        </Canvas>
      </div>
      <button
        type="button"
        className="hm-badge"
        tabIndex={-1}
        aria-label="Say hi to Legend's 3D avatar"
        ref={(el) => { badge.current.el = el; }}
        onClick={() => badge.current.tap?.()}
      ></button>
    </>
  );
}

export default HomeScene;
