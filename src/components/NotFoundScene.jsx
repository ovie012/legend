/* eslint-disable react/no-unknown-property -- react-three-fiber JSX props (args, intensity, ...) */
import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { useCharacter } from './HomeAvatar';
import { emptyPose, sampleAction } from './avatarActions';
import { BLOCK, SPOTS } from './notFoundStage';
import { Director, EPISODE_NAMES, createMotion, faceOf } from './notFoundDirector';
import { reportTask } from '../loadProgress';

if (import.meta.hot) import.meta.hot.decline();   // the 3D scene reloads the page instead of hot-patching

reportTask('3d', 0.15);
THREE.DefaultLoadingManager.onProgress = (url, loaded, total) => reportTask('3d', 0.15 + 0.8 * (loaded / total));

const MODELS = { light: '/3d/legend_brown.glb', dark: '/3d/legend_white.glb' };
const ANIMS_404 = '/3d/legend_anims_404.glb';     // the 404's own clips (sit, climb, jump down, fall, walk, 2 dances)
const withMeshopt = (loader) => loader.setMeshoptDecoder(MeshoptDecoder);
const { damp, clamp } = THREE.MathUtils;
const now = () => performance.now() / 1000;
const GLOW = { head: 0.45, body: 0.2 };      // as on the homepage
// his right hand carries the glasses in glassesOn until they reach his face, and from glassesOff's grab (s), as on Home
const GLASSES_ON_RELEASE = 0.8;
const GLASSES_OFF_GRAB = 0.55;
// finger curl per finger [thumb, index, middle, ring, pinky] (radians, added to the relaxed hand), as on Home + thumbs-up
const HAND_POSES = {
  relaxed: [0, 0, 0, 0, 0], open: [-0.1, -0.15, -0.15, -0.12, -0.1], fist: [0.55, 1.25, 1.3, 1.35, 1.35],
  grip: [0.3, 0.55, 0.65, 0.75, 0.8], thumb: [-0.35, 1.25, 1.3, 1.35, 1.35],
};
const X = new THREE.Vector3(1, 0, 0);
// clicks on these belong to the page, not to him
const IGNORE = 'a, button, input, textarea, select, label, [role="button"], header, .footer, .light-dark-mode';
// reading: the pointer on the headline or the first paragraph puts his glasses on, as on the homepage
const READABLE = '.nf-copy h1, .nf-copy p:not(.nf-path)';
const READ_OFF = 0.6;
const MULTI_GAP = 0.45;      // quick clicks: 3 = dance, 4 = glasses (as on the homepage)
const MULTI_WAIT = 0.4;

/* ---------- the "404": rounded polygons extruded with a soft bevel ---------- */

// every corner of a closed polygon rounded (radius per corner, clipped to half the shorter edge)
function roundedOutline(path, pts, radii) {
  const n = pts.length;
  const at = (i) => pts[(i + n) % n];
  const corner = (i) => {
    const [x, y] = at(i); const [px, py] = at(i - 1); const [nx, ny] = at(i + 1);
    const l1 = Math.hypot(px - x, py - y); const l2 = Math.hypot(nx - x, ny - y);
    // (a little under half an edge: two corners meeting exactly leave a zero-length edge, which breaks the bevel)
    const r = Math.min(Array.isArray(radii) ? radii[(i + n) % n] : radii, l1 * 0.45, l2 * 0.45);
    return { x, y, a: [x + ((px - x) / l1) * r, y + ((py - y) / l1) * r], b: [x + ((nx - x) / l2) * r, y + ((ny - y) / l2) * r] };
  };
  const c0 = corner(0);
  path.moveTo(...c0.b);
  for (let i = 1; i <= n; i++) {
    const c = corner(i);
    path.lineTo(...c.a);
    path.quadraticCurveTo(c.x, c.y, ...c.b);
  }
  return path;
}

// outlines inset by the bevel, so the finished digit is exactly width x height
function digitShape(kind) {
  const { width, height, stroke: s, bevel: b, radius: R, four } = BLOCK;
  const W = width - 2 * b; const H = height - 2 * b;
  const shape = new THREE.Shape();
  if (kind === '0') {
    roundedOutline(shape, [[0, 0], [W, 0], [W, H], [0, H]], R.zeroOuter);
    const hole = roundedOutline(new THREE.Path(), [[s, s], [s, H - s], [W - s, H - s], [W - s, s]], R.zeroInner);
    shape.holes.push(hole);
  } else {
    // geometric open "4": right stem to the ground, crossbar, left stem up to a flat top
    const bar = four.bar - b;
    const pts = [[W - s, 0], [W, 0], [W, H], [W - s, H], [W - s, bar + s], [s, bar + s], [s, H], [0, H], [0, bar], [W - s, bar]];
    const r = [R.corner, R.corner, R.corner, R.corner, R.inner, R.inner, R.corner, R.corner, R.corner, R.inner];
    roundedOutline(shape, pts, r);
  }
  return shape;
}

function digitGeometry(kind) {
  const { depth, bevel: b, front, width } = BLOCK;
  const inner = depth - 2 * b;
  const g = new THREE.ExtrudeGeometry(digitShape(kind), {
    depth: inner, bevelEnabled: true, bevelThickness: b, bevelSize: b, bevelSegments: 5, curveSegments: 18,
  });
  // centre on x, bottom on the ground, front face on z = front
  g.translate(-(width - 2 * b) / 2, b, front - inner - b);
  g.computeVertexNormals();
  return g;
}

function Digits({ colors }) {
  const geos = useMemo(() => ({ 4: digitGeometry('4'), 0: digitGeometry('0') }), []);
  const mats = useMemo(() => [
    new THREE.MeshStandardMaterial({ roughness: 0.42, metalness: 0.15 }),     // front + back faces
    new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0.1 }),      // sides + bevel
  ], []);
  useEffect(() => {
    mats[0].color.set(colors.front); mats[1].color.set(colors.side);
    mats[0].emissive.set(colors.front).multiplyScalar(colors.light ? 0.2 : 0.14);
    mats[1].emissive.set(colors.side).multiplyScalar(colors.light ? 0.1 : 0.08);
  }, [colors, mats]);
  useEffect(() => () => { Object.values(geos).forEach((g) => g.dispose()); mats.forEach((m) => m.dispose()); }, [geos, mats]);
  const step = BLOCK.width + BLOCK.gap;
  return (
    <group>
      {['4', '0', '4'].map((k, i) => (
        <mesh key={i} geometry={geos[k]} material={mats} position={[(i - 1) * step, 0, 0]} />
      ))}
    </group>
  );
}

/* ---------- ground, soft shadows, orbit ring, dust ---------- */

function canvasTexture(size, draw) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  draw(c.getContext('2d'), size);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

const radial = (stops) => canvasTexture(256, (g, n) => {
  const grad = g.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2);
  stops.forEach(([at, col]) => grad.addColorStop(at, col));
  g.fillStyle = grad; g.fillRect(0, 0, n, n);
});

function Ground({ colors }) {
  const floor = useMemo(() => radial([[0, 'rgba(255,255,255,1)'], [0.45, 'rgba(255,255,255,0.75)'], [1, 'rgba(255,255,255,0)']]), []);
  const blob = useMemo(() => radial([[0, 'rgba(0,0,0,0.85)'], [0.5, 'rgba(0,0,0,0.38)'], [1, 'rgba(0,0,0,0)']]), []);
  useEffect(() => () => { floor.dispose(); blob.dispose(); }, [floor, blob]);
  const step = BLOCK.width + BLOCK.gap;
  const zMid = BLOCK.front - BLOCK.depth / 2;
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.002, 0.8]} renderOrder={-2}>
        <circleGeometry args={[7.5, 64]} />
        <meshBasicMaterial map={floor} color={colors.ground} transparent opacity={colors.light ? 0.9 : 0.85} depthWrite={false} toneMapped={false} />
      </mesh>
      {/* contact shadows: one soft blob per digit, a wider one for the whole row */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.001, zMid + 0.05]} scale={[3 * step + 1.2, BLOCK.depth + 1.3, 1]} renderOrder={-1}>
        <planeGeometry />
        <meshBasicMaterial map={blob} transparent opacity={colors.light ? 0.12 : 0.42} depthWrite={false} toneMapped={false} />
      </mesh>
      {[-1, 0, 1].map((i) => (
        <mesh key={i} rotation-x={-Math.PI / 2} position={[i * step, 0.002, zMid + 0.04]} scale={[BLOCK.width + 0.4, BLOCK.depth + 0.4, 1]} renderOrder={-1}>
          <planeGeometry />
          <meshBasicMaterial map={blob} transparent opacity={colors.light ? 0.26 : 0.6} depthWrite={false} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

// the site's orbit motif lying on the ground round the 404, with the four-point star travelling along it
function OrbitRing({ colors }) {
  const star = useLoader(THREE.TextureLoader, '/icon-Star.svg');
  const starRef = useRef();
  const curve = useMemo(() => new THREE.EllipseCurve(0, 0, 3.0, 1.75), []);
  const line = useMemo(() => new THREE.BufferGeometry().setFromPoints(curve.getPoints(200).map((p) => new THREE.Vector3(p.x, 0, p.y))), [curve]);
  useEffect(() => () => line.dispose(), [line]);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const p = curve.getPoint((t * 0.035) % 1);
    starRef.current.position.set(p.x, 0.05, p.y);
    starRef.current.material.rotation = t * 0.8;
  });
  return (
    <group position={[0, 0.004, BLOCK.front - BLOCK.depth / 2 + 0.3]}>
      <line geometry={line}>
        <lineBasicMaterial color={colors.accent} transparent opacity={colors.light ? 0.5 : 0.42} depthWrite={false} toneMapped={false} />
      </line>
      <sprite ref={starRef} scale={0.26}>
        <spriteMaterial alphaMap={star} color={colors.accent} transparent depthWrite={false} toneMapped={false} />
      </sprite>
    </group>
  );
}

function Dust({ colors }) {
  const ref = useRef();
  const count = 320;
  const { positions, sprite } = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 13;
      p[i * 3 + 1] = Math.random() * 5.5;
      p[i * 3 + 2] = (Math.random() - 0.5) * 8 - 1;
    }
    return { positions: p, sprite: radial([[0, 'rgba(255,255,255,1)'], [0.35, 'rgba(255,255,255,0.5)'], [1, 'rgba(255,255,255,0)']]) };
  }, []);
  useEffect(() => () => sprite.dispose(), [sprite]);
  useFrame((state, dt) => {
    ref.current.rotation.y += dt * 0.01;
    ref.current.position.y = (ref.current.position.y + dt * 0.05) % 1.5;
  });
  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial map={sprite} color={colors.accent} size={0.06} sizeAttenuation transparent opacity={colors.light ? 0.45 : 0.6}
        depthWrite={false} blending={colors.light ? THREE.NormalBlending : THREE.AdditiveBlending} />
    </points>
  );
}

/* ---------- climbing: hands on the top of the "0" ---------- */

// The Mixamo climb's hands grip a hold higher than the block and ~25 cm in front of it, and his arms are short
// (0.48 m from the shoulder), so on their own they never touch the 404. While he grabs and pulls he leans his chest in
// toward the wall (spine) and both hands are placed palm-down on the top edge (two-bone IK), held there as his body
// rises; then, as he steps up, they move onto his front (left) knee and push on it until he stands, and the lean eases
// out. Times are seconds into the clip.
const CLIMB = {
  edgeAhead: 0.55,           // wall distance in front of his hips at the start (SPOTS.climbFrontZ / climbBackZ)
  onTop: 0.08,               // hands this far in from the edge
  spread: 0.24,              // each hand this far from his centre line
  wrist: 0.05,               // wrist joint above the surface (palm thickness)
  hands: [0.3, 0.55, 2.35, 2.85],  // hands placed: ease in, held, ease back to the clip
  toKnee: [1.4, 1.85],       // from the edge to the knee
  knee: { up: 0.09, spread: 0.07, ahead: 0.02 },   // hands on top of the left knee
  lean: [0.3, 0.65, 1.6, 2.2],     // chest lean toward the wall: ease in, full, ease out
  leanMax: 0.6,              // radians at full (spread Spine 40 % / Spine1 35 % / Spine2 25 %)
};
const _ik = { a: new THREE.Vector3(), b: new THREE.Vector3(), c: new THREE.Vector3(), d: new THREE.Vector3(), e: new THREE.Vector3(),
  f: new THREE.Vector3(), g: new THREE.Vector3(), q: new THREE.Quaternion(), qw: new THREE.Quaternion(), qp: new THREE.Quaternion(),
  m1: new THREE.Matrix4(), m2: new THREE.Matrix4() };
const window4 = (t, [a, b, c, d]) => THREE.MathUtils.smoothstep(t, a, b) * (1 - THREE.MathUtils.smoothstep(t, c, d));

// turn a bone by a world-space rotation (its children follow)
function rotateWorld(bone, delta) {
  bone.getWorldQuaternion(_ik.qw);
  bone.parent.getWorldQuaternion(_ik.qp);
  bone.quaternion.copy(_ik.qp.invert().multiply(_ik.qw.premultiply(delta)));
  bone.updateMatrixWorld(true);
}

// two-bone IK: upper/lower/end bones, end moved toward `target` by weight w; the elbow bends toward `pole` (direction)
function reach(upper, lower, end, target, w, pole) {
  const A = upper.getWorldPosition(_ik.a); const B = lower.getWorldPosition(_ik.b); const C = end.getWorldPosition(_ik.c);
  const T = _ik.d.copy(C).lerp(target, w);
  const la = A.distanceTo(B); const lb = B.distanceTo(C);
  const u = _ik.e.subVectors(T, A); const dist = THREE.MathUtils.clamp(u.length(), Math.abs(la - lb) + 1e-3, la + lb - 1e-3); u.normalize();
  const p = _ik.f.copy(pole).addScaledVector(u, -pole.dot(u)).normalize();
  const cosA = THREE.MathUtils.clamp((la * la + dist * dist - lb * lb) / (2 * la * dist), -1, 1);
  const elbow = _ik.g.copy(A).addScaledVector(u, la * cosA).addScaledVector(p, la * Math.sqrt(1 - cosA * cosA));
  rotateWorld(upper, _ik.q.setFromUnitVectors(B.sub(A).normalize(), elbow.sub(A).normalize()));
  const B2 = lower.getWorldPosition(_ik.b); const C2 = end.getWorldPosition(_ik.c);
  const T2 = _ik.g.copy(A).addScaledVector(u, dist);
  rotateWorld(lower, _ik.q.setFromUnitVectors(C2.sub(B2).normalize(), T2.sub(B2).normalize()));
}

// the hand palm-down, fingers pointing `fwd`, thumb side toward his centre (`inward`), by weight w
function palmDown(c, side, fwd, inward, w) {
  const hand = c.bone(`${side}Hand`); const mid = c.bone(`${side}HandMiddle1`); const idx = c.bone(`${side}HandIndex1`); const pky = c.bone(`${side}HandPinky1`);
  if (!mid || !idx || !pky) return;
  const H = hand.getWorldPosition(_ik.a);
  const f = mid.getWorldPosition(_ik.b).sub(H).normalize();
  const s = idx.getWorldPosition(_ik.c).sub(pky.getWorldPosition(_ik.d)); s.addScaledVector(f, -s.dot(f)).normalize();
  const f2 = _ik.e.copy(fwd).normalize(); const s2 = _ik.f.copy(inward); s2.addScaledVector(f2, -s2.dot(f2)).normalize();
  _ik.m1.makeBasis(f, s, _ik.g.crossVectors(f, s));
  const z2 = new THREE.Vector3().crossVectors(f2, s2);
  _ik.m2.makeBasis(f2, s2, z2);
  _ik.m2.multiply(_ik.m1.transpose());                          // current basis -> wanted basis
  _ik.q.setFromRotationMatrix(_ik.m2);
  rotateWorld(hand, _ik.qw.identity().slerp(_ik.q, w));
}

function climbContact(c, motion) {
  const st = motion.step; const pair = motion.pairs[motion.pairs.length - 1];
  if (st?.clip !== 'climbingToTop' || !st.align || !pair) return;
  const t = pair.lower.time;
  const yaw = st.align.yaw ?? 0;
  const fwd = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
  const right = new THREE.Vector3(-Math.cos(yaw), 0, Math.sin(yaw));      // his right
  const up = new THREE.Vector3(0, 1, 0);

  // lean the chest in toward the wall
  const lean = CLIMB.leanMax * window4(t, CLIMB.lean);
  if (lean > 1e-3) {
    const axis = new THREE.Vector3().crossVectors(up, fwd).normalize();
    [['Spine', 0.4], ['Spine1', 0.35], ['Spine2', 0.25]].forEach(([n, k]) => rotateWorld(c.bone(n), _ik.q.setFromAxisAngle(axis, lean * k)));
  }

  // both hands onto the top edge, then onto his left knee as he steps up
  const w = window4(t, CLIMB.hands);
  if (w < 1e-3) return;
  const edge = new THREE.Vector3(st.align.x ?? 0, BLOCK.height + CLIMB.wrist, st.align.z ?? 0).addScaledVector(fwd, CLIMB.edgeAhead + CLIMB.onTop);
  const toKnee = THREE.MathUtils.smoothstep(t, ...CLIMB.toKnee);
  const knee = c.bone('LeftLeg').getWorldPosition(new THREE.Vector3()).addScaledVector(up, CLIMB.knee.up).addScaledVector(fwd, CLIMB.knee.ahead);
  for (const [side, s] of [['Left', -1], ['Right', 1]]) {
    const onEdge = edge.clone().addScaledVector(right, s * CLIMB.spread);
    const onKnee = knee.clone().addScaledVector(right, s * CLIMB.knee.spread);
    const target = onEdge.lerp(onKnee, toKnee);
    const pole = new THREE.Vector3().addScaledVector(right, s * 0.6).addScaledVector(fwd, -0.5).addScaledVector(up, -0.4);
    reach(c.bone(`${side}Arm`), c.bone(`${side}ForeArm`), c.bone(`${side}Hand`), target, w, pole);
    palmDown(c, side, fwd, right.clone().multiplyScalar(-s), w);
  }
}

// Seated feet: the chair-style sitting clips tucked the feet back under the seat (inside the "0"). That is fixed in the
// clips themselves (designs/avatar-work/scripts/clips404_ledge.py: only the knee opens, so the ankle stays 8 cm in front
// of the face; thighs untouched, so hands on the knees stay as animated). The idle leg swing only ever kicks forward.
// Which way a knee turns to open (move the ankle forward), measured on the model once.
function kneeOpenSign(c, side) {
  const knee = c.bone(`${side}Leg`); const foot = c.bone(`${side}Foot`);
  const q = knee.quaternion.clone();
  const before = foot.getWorldPosition(new THREE.Vector3()).z;
  knee.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), 0.1)); knee.updateMatrixWorld(true);
  const after = foot.getWorldPosition(new THREE.Vector3()).z;
  knee.quaternion.copy(q); knee.updateMatrixWorld(true);
  return after > before ? 1 : -1;
}

/* ---------- the avatar: motion engine + director (notFoundMotion.js / notFoundDirector.js) ---------- */

// on the top of the "0" (or on the ground): where his shadow falls
const onBlock = (G) => Math.abs(G.x) < BLOCK.width / 2 + 0.05 && G.z < BLOCK.front + 0.05 && G.z > BLOCK.front - BLOCK.depth - 0.05 && G.y > 0.6;

function Avatar({ url, visible, pointer, brain, onReady }) {
  const c = useCharacter(url);
  const anims = useLoader(GLTFLoader, ANIMS_404, withMeshopt);
  const { camera } = useThree();
  const group = useRef();
  const tmp = useMemo(() => ({ q: new THREE.Quaternion(), v: new THREE.Vector3(), v2: new THREE.Vector3(), m: new THREE.Matrix4() }), []);
  const life = useRef({ nextBlink: 1.2, blinkStart: -1, gazeX: 0, gazeY: 0, headX: 0, headY: 0, chestY: 0, look: 1, legs: 0,
    curl: [0, 0, 0, 0, 0], idleTarget: new THREE.Vector2(), nextSaccade: 0, pose: emptyPose(), poke: emptyPose() });

  // the model, its mixer and face are shared with the homepage (cached): start from a clean state, then build the
  // 404's root-motion clips on it
  const motion = useMemo(() => {
    c.mixer.stopAllAction();
    c.fingers.forEach((f) => f.b.quaternion.copy(f.rest));
    c.morphMeshes.forEach((m) => m.morphTargetInfluences.fill(0));
    c.teeth.forEach((m) => { m.visible = false; });
    if (c.glasses) {
      const [p, q, s] = c.glassesRest;
      c.glasses.position.copy(p); c.glasses.quaternion.copy(q); c.glasses.scale.copy(s);
      c.glasses.visible = false;
    }
    c.uniforms.uFade.value.set(-1e4, -1e4);                 // whole body, no bust fade
    c.uniforms.uShimmer.value.z = 0;
    c.root.position.set(0, 0, 0); c.root.rotation.set(0, 0, 0); c.root.scale.setScalar(1);
    return createMotion(c, anims);
  }, [c, anims]);

  useEffect(() => {
    brain.motions.add(motion);
    onReady?.();
    return () => { brain.motions.delete(motion); if (brain.active === motion) brain.active = null; };
  }, [motion]);
  useEffect(() => { if (visible) brain.hit = c.hit; }, [visible, c]);

  useFrame((state, dt) => {
    if (!visible) return;
    dt = Math.min(dt, 0.05);
    const t = now();
    const l = life.current;
    const dir = brain.director;
    // the outfit swap (theme toggle): carry on exactly where the other character is
    if (brain.active !== motion) { if (brain.active?.step) motion.syncFrom(brain.active); brain.active = motion; }

    // bones we turn on top of the animation (knees, chest, neck, head): back to the pure animated pose first. three.js
    // only rewrites a bone when its animated value changes, so on a still clip (sitting) the turns would pile up.
    const layered = l.layered ??= [c.bone('LeftLeg'), c.bone('RightLeg'), c.turn.chest[0], c.turn.neck[0], c.turn.head[0],
      ...['Spine', 'Spine1', 'LeftArm', 'LeftForeArm', 'LeftHand', 'RightArm', 'RightForeArm', 'RightHand', 'LeftUpLeg', 'RightUpLeg'].map((n) => c.bone(n))]
      .map((bone) => ({ bone, base: bone.quaternion.clone() }));
    for (const x of layered) x.bone.quaternion.copy(x.base);
    dir.tick(motion, t);
    motion.update(dt);
    for (const x of layered) x.base.copy(x.bone.quaternion);
    const G = motion.G; const st = motion.step ?? {};
    group.current.position.set(G.x, G.y, G.z);
    group.current.rotation.y = G.yaw;
    group.current.updateMatrixWorld(true);
    brain.shadow.x = G.x; brain.shadow.z = G.z; brain.shadow.y = onBlock(G) ? BLOCK.height : 0;
    c.hips.getWorldPosition(tmp.v); brain.shadow.lift = Math.max(0, tmp.v.y - brain.shadow.y - 0.9);

    // ---- seated: his legs swing gently over the edge (knees, alternating), forward only so the feet never go back
    // into the "0" (sitting on the edge facing the camera: forward = +z)
    l.legs = damp(l.legs, st.legs ? 1 : 0, 2.5, dt);
    const amp = import.meta.env.DEV && window.__nfLegs !== undefined ? window.__nfLegs : 0.22;
    if (l.legs > 0.01 && amp) {
      l.kneeSign ??= { Left: kneeOpenSign(c, 'Left'), Right: kneeOpenSign(c, 'Right') };
      for (const [side, phase] of [['Left', 0], ['Right', Math.PI]]) {
        const kick = 0.5 - 0.5 * Math.cos(t * 2.1 + phase);           // 0 .. 1 .. 0
        c.bone(`${side}Leg`).quaternion.multiply(tmp.q.setFromAxisAngle(X, l.kneeSign[side] * kick * amp * l.legs));
      }
    }

    // ---- face: the step's expression (+ a click's), blinks; gaze and head follow the cursor as on the homepage
    const face = faceOf(st);
    const pose = l.pose;
    if (face && Number.isFinite(motion.stepDuration)) sampleAction(face, clamp(motion.t / motion.stepDuration, 0, 1), pose);
    else Object.keys(pose).forEach((key) => { pose[key] = 0; });
    if (dir.poke) {
      const u = (t - dir.poke.start) / (dir.poke.face.duration ?? 1.5);
      if (u >= 1) dir.poke = null; else sampleAction(dir.poke.face, u, l.poke);
    }
    const pk = dir.poke ? l.poke : null;
    const ch = (name) => Math.max(pose[name] ?? 0, pk?.[name] ?? 0);

    c.bone('Head').getWorldPosition(tmp.v).project(camera);
    const p = pointer.current;
    const reading = dir.glasses.reading;
    const idleEyes = !reading && t - p.time > 3;
    if (idleEyes && t > l.nextSaccade) { l.idleTarget.set((Math.random() - 0.5) * 0.9, (Math.random() - 0.5) * 0.5); l.nextSaccade = t + 1.2 + Math.random() * 2.2; }
    const tx = idleEyes ? l.idleTarget.x : clamp(p.x - tmp.v.x, -1.5, 1.5);
    const ty = idleEyes ? l.idleTarget.y : clamp(p.y - tmp.v.y, -1.5, 1.5);
    l.look = damp(l.look, (st.look ?? 0.6) * (1 - ch('follow')), 4, dt);
    l.gazeX = damp(l.gazeX, clamp(tx * 0.9, -0.85, 0.85) * Math.max(l.look, 0.35), 18, dt);
    l.gazeY = damp(l.gazeY, clamp(-ty * 1.1, -0.45, 0.8) * Math.max(l.look, 0.35), 18, dt);
    l.headY = damp(l.headY, clamp(tx * 0.4, -0.36, 0.36) * l.look, 5, dt);
    l.headX = damp(l.headX, clamp(-ty * 0.35, -0.14, 0.3) * l.look, 5, dt);
    l.chestY = damp(l.chestY, l.headY * 0.25, 2.2, dt);
    const bend = ([b, ax], x, y, z) => {
      if (x) b.quaternion.multiply(tmp.q.setFromAxisAngle(ax.x, x));
      if (y) b.quaternion.multiply(tmp.q.setFromAxisAngle(ax.y, y));
      if (z) b.quaternion.multiply(tmp.q.setFromAxisAngle(ax.z, z));
    };
    bend(c.turn.chest, 0, l.chestY, 0);
    bend(c.turn.neck, (l.headX + ch('headX')) * 0.35, (l.headY + ch('headY')) * 0.35, 0);
    bend(c.turn.head, (l.headX + ch('headX')) * 0.65, (l.headY + ch('headY')) * 0.65, -(l.headY * -0.08 + ch('headZ')));
    // climbing: chest leans in, hands on the top of the "0"
    climbContact(c, motion);

    const gx = clamp(l.gazeX + ch('gazeX'), -0.95, 0.95); const gy = clamp(l.gazeY + ch('gazeY'), -0.6, 0.95);
    for (const e of c.eyeRest) e.obj.quaternion.copy(e.rest).multiply(tmp.q.setFromAxisAngle(e.up, gx * 0.35)).multiply(tmp.q.setFromAxisAngle(e.side, gy * 0.25));

    // ---- fingers
    if (c.fingers.length) {
      const hp = HAND_POSES[st.hands] ?? HAND_POSES[motion.overlay ? 'grip' : 'relaxed'];
      for (let i = 0; i < 5; i++) l.curl[i] = damp(l.curl[i], hp[i], 8, dt);
      for (const f of c.fingers) f.b.quaternion.copy(f.rest).multiply(tmp.q.setFromAxisAngle(X, l.curl[f.fi] * f.share));
    }

    if (t > l.nextBlink && l.blinkStart < 0) l.blinkStart = t;
    let b = 0;
    if (l.blinkStart >= 0) {
      const kb = (t - l.blinkStart) / 0.16;
      b = kb < 1 ? Math.sin(Math.PI * kb) : 0;
      if (kb >= 1) { l.blinkStart = -1; l.nextBlink = t + (Math.random() < 0.2 ? 0.15 : 2.2 + Math.random() * 3.5); }
    }
    const bl = Math.max(b, ch('blinkL')); const br = Math.max(b, ch('blinkR'));
    const half = (v) => (v <= 0.5 ? 2 * v : 2 - 2 * v); const full = (v) => Math.max(0, 2 * v - 1);
    const sq = clamp(ch('squint'), 0, 1); const wide = clamp(ch('eyeOpen') * 1.8, 0, 1);
    const keys = { blinkHalf_L: half(bl), blink_L: full(bl), blinkHalf_R: half(br), blink_R: full(br),
      squint_L: sq * 0.7, squint_R: sq * 0.7, eyeWide: wide, browUp: Math.max(wide * 0.6, ch('worry') * 0.3),
      jawOpen: clamp(ch('jaw'), 0, 1), mouthSmile: clamp(Math.max(sq * 0.5, ch('grin')), 0, 1), mouthFrown: clamp(ch('frown'), 0, 1),
      mouthPucker: clamp(ch('pucker'), 0, 1), mouthPress: clamp(ch('press'), 0, 1), browInnerUp: clamp(ch('worry'), 0, 1), browDown: clamp(ch('scowl'), 0, 1) };
    for (const m of c.teeth) m.visible = keys.jawOpen > 0.04;
    for (const m of c.morphMeshes) {
      for (const [name, v] of Object.entries(keys)) {
        const i = m.morphTargetDictionary[name];
        if (i !== undefined) m.morphTargetInfluences[i] = v;
      }
    }

    // ---- glasses: on his face, in his right hand while it puts them on / takes them off, or away
    if (c.glasses) {
      const gs = dir.glasses; const ov = motion.overlay;
      let mode = gs.worn ? 'face' : 'away';
      if (ov) {
        const tr = t - ov.start;
        if (ov.name === 'glassesOn') { mode = tr < GLASSES_ON_RELEASE ? 'hand' : 'face'; if (mode === 'face') gs.worn = true; }
        else { mode = tr < GLASSES_OFF_GRAB ? 'face' : 'hand'; if (tr > ov.duration - 0.2) { mode = 'away'; gs.worn = false; } }
      }
      c.glasses.visible = mode !== 'away';
      if (mode === 'hand' && c.glassesInHand) {
        c.hand.updateWorldMatrix(true, false);
        tmp.m.copy(c.glasses.parent.matrixWorld).invert().multiply(c.hand.matrixWorld).multiply(c.glassesInHand);
        tmp.m.decompose(c.glasses.position, c.glasses.quaternion, c.glasses.scale);
      } else if (mode === 'face') {
        const [gp, gq, gsc] = c.glassesRest;
        c.glasses.position.copy(gp); c.glasses.quaternion.copy(gq); c.glasses.scale.copy(gsc);
      }
    }

    // glow split at the neck, as on the homepage
    c.bone('Head').getWorldPosition(tmp.v2); c.bone('Neck').getWorldPosition(tmp.v);
    c.uniforms.uNeck.value.set(tmp.v2.y - (tmp.v2.y - tmp.v.y) * 0.2, Math.abs(tmp.v2.y - tmp.v.y) * 0.35);
    c.uniforms.uGlow.value.set(GLOW.body, GLOW.head);
  });

  return (
    <group ref={group} visible={visible}>
      <primitive object={c.root} dispose={null} />
    </group>
  );
}

// both outfits, like the homepage: the theme's loads first, a toggle swaps once the other is ready
function Avatars({ lightMode, pointer, brain, onReady }) {
  const want = lightMode ? 'light' : 'dark';
  const [mounted, setMounted] = useState({ [want]: true });
  const [ready, setReady] = useState({});
  const [shown, setShown] = useState(want);
  useEffect(() => { setMounted((m) => ({ ...m, [want]: true })); }, [want]);
  useEffect(() => { if (ready[want]) setShown(want); }, [ready, want]);
  return ['light', 'dark'].map((k) => mounted[k] && (
    <Suspense key={k} fallback={null}>
      <Avatar url={MODELS[k]} visible={shown === k} pointer={pointer} brain={brain}
        onReady={() => { setReady((r) => ({ ...r, [k]: true })); if (k === want) onReady?.(); }} />
    </Suspense>
  ));
}

// a soft blob under him, on the ground or on the top of the "0"; smaller and lighter while he is in the air
function AvatarShadow({ colors, brain }) {
  const blob = useMemo(() => radial([[0, 'rgba(0,0,0,0.9)'], [0.55, 'rgba(0,0,0,0.35)'], [1, 'rgba(0,0,0,0)']]), []);
  const ref = useRef();
  useEffect(() => () => blob.dispose(), [blob]);
  useFrame(() => {
    const s = brain.shadow; const k = 1 / (1 + s.lift * 1.6);
    ref.current.position.set(s.x, s.y + 0.004, s.z);
    ref.current.scale.set(1.0 * k, 0.7 * k, 1);
    ref.current.material.opacity = (colors.light ? 0.3 : 0.6) * k;
  });
  return (
    <mesh ref={ref} rotation-x={-Math.PI / 2} renderOrder={-1}>
      <planeGeometry />
      <meshBasicMaterial map={blob} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

// clicks (on him: a face; 3 quick ones = dance; 4 = glasses) and reading the copy (glasses), at window level
// because the canvas lets the pointer through to the page
function Interactions({ brain }) {
  const { camera } = useThree();
  useEffect(() => {
    const ray = new THREE.Raycaster(); const ndc = new THREE.Vector2();
    const clicks = { count: 0, last: 0, timer: 0 };
    const stage = () => document.querySelector('.nf-stage');
    const inStage = (e) => { const r = stage()?.getBoundingClientRect(); return r && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom; };
    const hits = (e) => {
      if (!brain.hit) return false;
      ndc.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      return ray.intersectObject(brain.hit, true).length > 0;
    };
    const onClick = (e) => {
      if (e.target.closest?.(IGNORE) || !brain.active) return;
      const onHim = hits(e);
      if (!onHim && !inStage(e)) return;
      const t = now();
      clicks.count = t - clicks.last < MULTI_GAP ? clicks.count + 1 : 1; clicks.last = t;
      // a single click reacts only once no second click follows (so the first of 3 or 4 doesn't start a gesture)
      if (clicks.count === 1) {
        clearTimeout(clicks.timer);
        if (onHim) clicks.timer = setTimeout(() => { if (clicks.count === 1) brain.director.click('poke', brain.active, now()); }, MULTI_GAP * 1000);
        return;
      }
      if (clicks.count === 2) { clearTimeout(clicks.timer); return; }
      if (clicks.count === 3) {
        clearTimeout(clicks.timer);
        clicks.timer = setTimeout(() => { if (clicks.count === 3) brain.director.click('dance', brain.active, now()); }, MULTI_WAIT * 1000);
      } else if (clicks.count >= 4) {
        clearTimeout(clicks.timer); clicks.count = 0; clicks.last = 0;
        brain.director.click('glasses', brain.active, t);
      }
    };
    // rapid clicks on the stage would otherwise select page text (double/triple click)
    const onMouseDown = (e) => { if (e.detail > 1 && !e.target.closest?.(IGNORE) && inStage(e)) e.preventDefault(); };
    let hover = 0; let offTimer = 0;
    const onMove = (e) => {
      if (e.pointerType !== 'mouse' || performance.now() - hover < 100) return;
      hover = performance.now();
      document.body.style.cursor = !e.target.closest?.(IGNORE) && hits(e) ? 'pointer' : '';
    };
    const readable = (el) => !!el?.closest?.(READABLE);
    const onOver = (e) => { if (readable(e.target)) { clearTimeout(offTimer); brain.director.glasses.reading = true; } };
    const onOut = (e) => {
      if (!readable(e.target) || readable(e.relatedTarget)) return;
      offTimer = setTimeout(() => { brain.director.glasses.reading = false; }, READ_OFF * 1000);
    };
    window.addEventListener('click', onClick);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerover', onOver);
    document.addEventListener('pointerout', onOut);
    return () => {
      window.removeEventListener('click', onClick);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
      document.removeEventListener('pointerout', onOut);
      clearTimeout(clicks.timer); clearTimeout(offTimer);
      document.body.style.cursor = '';
    };
  }, [camera, brain]);

  // dev only: window.__nf.play('waveHello') / .dance() / .episodes
  useEffect(() => {
    if (!import.meta.env.DEV) return undefined;
    window.__nf = { brain, BLOCK, SPOTS, episodes: EPISODE_NAMES,
      play: (name) => brain.director.force(name), dance: () => brain.director.force('dance'),
      state: () => ({ mode: brain.director.mode, step: brain.active?.step?.clip, G: { ...brain.active?.G }, queue: brain.director.queue.length }) };
    return () => { delete window.__nf; };
  }, [brain]);
  return null;
}

/* ---------- camera: frames the stage, leaves room for the copy on wide screens ---------- */

const TARGET = { wide: new THREE.Vector3(0, 1.0, 0.55), stacked: new THREE.Vector3(0, 0.85, 0.9) };
const VIEW_DIR = new THREE.Vector3(0, 0.26, 1).normalize();

function CameraRig({ pointer, layout }) {
  const { camera, size } = useThree();
  const st = useRef({ az: 0, el: 0 });
  useFrame((state, dt) => {
    const w = size.width; const h = size.height;
    const aspect = w / h;
    const wide = layout === 'wide';
    // half extents to keep in view (world metres): the 404, him sitting on top, and room in front for his walks
    const halfW = wide ? 3.1 : 3.05;
    const halfH = wide ? 1.85 : 1.75;
    const share = wide ? 0.6 : 1;                     // wide: the stage gets the right ~55% of the canvas
    const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const dist = Math.max(halfH / tanV, halfW / (tanV * aspect * share));
    if (wide) camera.setViewOffset(w, h, -0.19 * w, 0, w, h); else camera.clearViewOffset();
    const s = st.current;
    s.az = damp(s.az, pointer.current.x * 0.07, 2, dt);
    s.el = damp(s.el, pointer.current.y * 0.035, 2, dt);
    const dir = VIEW_DIR.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), s.az);
    dir.y += s.el;
    const target = TARGET[wide ? 'wide' : 'stacked'];
    camera.position.copy(target).addScaledVector(dir.normalize(), dist);
    camera.lookAt(target);
    // dev: window.__nfCam = { pos: [x, y, z], at: [x, y, z] } to inspect contacts from any side
    if (import.meta.env.DEV && window.__nfCam) { camera.clearViewOffset(); camera.position.fromArray(window.__nfCam.pos); camera.lookAt(...window.__nfCam.at); }
  });
  return null;
}

function Stage({ colors, lightMode, pointer, layout, onReady }) {
  const brain = useMemo(() => ({ director: new Director(), motions: new Set(), active: null, hit: null, shadow: { x: SPOTS.seat.x, y: BLOCK.height, z: SPOTS.seat.z, lift: 0 } }), []);
  return (
    <>
      <hemisphereLight args={['#ffffff', lightMode ? '#e3d3c3' : '#141a26', lightMode ? 1.5 : 1.15]} />
      <directionalLight position={[-3, 5, 6]} intensity={lightMode ? 1.5 : 1.7} color="#fff6ec" />
      <directionalLight position={[4, 3, -4]} intensity={2.4} color={colors.rim} />
      <directionalLight position={[-4, 1.5, -3]} intensity={lightMode ? 1.8 : 1.3} color={colors.fill} />
      <CameraRig pointer={pointer} layout={layout} />
      <Interactions brain={brain} />
      <Ground colors={colors} />
      <Suspense fallback={null}><OrbitRing colors={colors} /></Suspense>
      <Digits colors={colors} />
      <AvatarShadow colors={colors} brain={brain} />
      <Avatars lightMode={lightMode} pointer={pointer} brain={brain} onReady={onReady} />
      <Dust colors={colors} />
    </>
  );
}

function NotFoundScene({ colors, lightMode, layout }) {
  const pointer = useRef({ x: 0, y: 0, time: -10 });
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const onMove = (e) => {
      pointer.current = { x: (e.clientX / window.innerWidth) * 2 - 1, y: -(e.clientY / window.innerHeight) * 2 + 1, time: now() };
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);
  return (
    <div className={`nf-scene ${ready ? 'ready' : ''}`} aria-hidden="true">
      <Canvas camera={{ fov: 30, near: 0.1, far: 100 }} dpr={[1, 1.75]} gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}>
        <Suspense fallback={null}>
          <Stage colors={colors} lightMode={lightMode} pointer={pointer} layout={layout}
            onReady={() => { setReady(true); reportTask('3d', 1); }} />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default NotFoundScene;
