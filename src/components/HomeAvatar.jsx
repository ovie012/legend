/* eslint-disable react/no-unknown-property -- react-three-fiber JSX props (args, intensity, ...) */
import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { AVATAR_RIG as RIG } from './avatarRig';
import { BASE_IDLE, CLIPS, DANCES } from './avatarClips';
import { ANIMS, MODELS, onThemeIntent } from './avatarModels';
import { CLIP_OF, addClips, clipStore, loadLaterWhenIdle } from './avatarClipStore';

// a hot update would rebuild the character from the already posed, placed model (wrong size, eyes, moves): reload instead
if (import.meta.hot) import.meta.hot.decline();

// The rigged character (Blender + Mixamo, designs/avatar-work): brown senator in light mode, white in dark mode.
// Both share one skeleton and one set of moves (in two files: avatarClipStore.js). Body = animation clips (avatarClips.js), face = shape keys + eye
// nodes driven by the reaction keyframes (avatarActions.js), cursor-follow on the head/chest bones on top.
const withMeshopt = (loader) => loader.setMeshoptDecoder(MeshoptDecoder);

const { damp, clamp, lerp } = THREE.MathUtils;
const now = () => performance.now() / 1000;
const smooth = (x) => { const t = clamp(x, 0, 1); return t * t * (3 - 2 * t); };
const BLEND = 9;            // how fast clips blend in/out (~0.3 s)
const SWAP_AT = 0.6;        // seconds into the theme twirl when he faces away and the outfit changes
// his right hand carries the glasses in glassesOn until they reach his face, and from glassesOff's grab (seconds)
const GLASSES_ON_RELEASE = 0.8;
// soft glow on skin/cloth (head, body) and the fade below the bust (group units: -1 = bottom of the bust frame)
// (owner 2026-10-30: the clothes looked washed out: glow 0.45 everywhere + a long see-through fade over the page)
const GLOW = { head: 0.45, body: 0.2 };
const FADE = [-1.0, -0.82];
if (import.meta.env.DEV) window.__avatarTune = (o) => { Object.assign(GLOW, o.glow ?? {}); if (o.fade) FADE.splice(0, 2, ...o.fade); };
const GLASSES_OFF_GRAB = 0.55;
// Finger poses (the clips have no finger motion): curl in radians per finger [thumb, index, middle, ring, pinky],
// added to the modelled relaxed hand; each finger's 3 joints share it (1, 1.1, 0.8). Bones turn about their local X.
const FINGERS = ['Thumb', 'Index', 'Middle', 'Ring', 'Pinky'];
const HAND_POSES = {
  relaxed: [0, 0, 0, 0, 0],
  open: [-0.1, -0.15, -0.15, -0.12, -0.1],
  fist: [0.55, 1.25, 1.3, 1.35, 1.35],
  point: [0.5, -0.1, 1.3, 1.35, 1.35],
  grip: [0.3, 0.55, 0.65, 0.75, 0.8],
  thumbsUp: [-0.35, 1.25, 1.3, 1.35, 1.35],
};
// reactions that borrow another one's clip (the mini companion's thumbs-up = the cheer's arm pump, thumbs out)
export { CLIP_OF };
const HAND_POSE_OF = {
  tiltWave: 'open', winkBye: 'open', lookBackBye: 'open', shyBye: 'open', saluteBye: 'open', greet: 'open', clap: 'open',
  shy: 'open', dust: 'open', stretch: 'open', surprised: 'open', doubleTake: 'open', shrug: 'open', bow: 'relaxed',
  presentText: 'point', thumbsUp: 'thumbsUp', cheer: 'fist', happyBounce: 'fist', bounceBye: 'fist', glassesOn: 'grip', glassesOff: 'grip',
};
const JOINT_SHARE = [1, 1.1, 0.8];
const X = new THREE.Vector3(1, 0, 0);
const Y = new THREE.Vector3(0, 1, 0);
const Z = new THREE.Vector3(0, 0, 1);

// Shared by every material of the character: fade below the bust (as the photo avatar did), a soft glow so the
// painted face reads like the 2D (it already carries its shading), and the outfit-change shimmer.
// Head skin (insideDark): the skin's back side is drawn as dark mouth tissue above the neck (a look into the mouth
// through the lip line or a corner otherwise went through the head to the page); below the neck it stays unseen.
const INSIDE_DARK = new Set(['clay', 'mouthSkin', 'mouthLip']);
function patchMaterial(m, uniforms, insideDark = false) {
  // a soft see-through fade (a dithered fade looked grainy); depth still written, so the body stays solid above it
  m.transparent = true;
  if (insideDark) m.side = THREE.DoubleSide;
  if (m.depthWrite === false) m.userData.keepNoDepth = true; else m.depthWrite = true;
  m.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniforms);
    // _skin (model attribute, 0..1): the neck and the underside of the jaw are painted skin like the face, so they get
    // the head's glow wherever they are (the height blend gave the neck the body's: it read darker and more orange)
    shader.vertexShader = 'attribute float _skin;\nvarying float vWorldY;\nvarying float vSkin;\n' + shader.vertexShader.replace('#include <project_vertex>', `
      #include <project_vertex>
      vWorldY = (modelMatrix * vec4(transformed, 1.0)).y;
      vSkin = _skin;
    `);
    shader.fragmentShader = 'uniform vec2 uFade;\nuniform vec2 uGlow;\nuniform vec2 uNeck;\nuniform vec3 uShimmer;\nvarying float vWorldY;\nvarying float vSkin;\n' + shader.fragmentShader
      .replace('#include <map_fragment>', `
        #include <map_fragment>
        diffuseColor.a *= smoothstep(uFade.x, uFade.y, vWorldY);
      `)
      .replace('#include <emissivemap_fragment>', `
        #include <emissivemap_fragment>
        // soft glow: full on the head (the painted face carries its own shading), less on the clothes below the neck
        totalEmissiveRadiance += diffuseColor.rgb * mix(uGlow.x, uGlow.y, max(smoothstep(uNeck.x - uNeck.y, uNeck.x + uNeck.y, vWorldY), vSkin));
        totalEmissiveRadiance += vec3(1.0, 0.86, 0.6) * uShimmer.z * (1.0 - smoothstep(0.0, uShimmer.y, abs(vWorldY - uShimmer.x)));
      `);
    if (insideDark) shader.fragmentShader = shader.fragmentShader.replace('#include <dithering_fragment>', `
        #include <dithering_fragment>
        if (!gl_FrontFacing) {
          if (vWorldY < uNeck.x) discard;
          gl_FragColor.rgb = vec3(0.1, 0.035, 0.03);
        }
      `);
  };
  m.customProgramCacheKey = () => (insideDark ? 'legend-avatar-inside' : 'legend-avatar');
  m.needsUpdate = true;
}

// Invisible capsules on the bones: cheap, pose-following targets for clicks and the grab cursor.
function addHitProxies(root, bone) {
  const mat = new THREE.MeshBasicMaterial({ visible: false });
  const head = new THREE.Vector3();
  const add = (from, to, radius, name, forward = 0) => {
    const a = bone(from); const b = bone(to);
    if (!a || !b) return;
    const s = a.getWorldScale(new THREE.Vector3()).x;
    const len = a.getWorldPosition(new THREE.Vector3()).distanceTo(b.getWorldPosition(new THREE.Vector3())) / s;
    const m = new THREE.Mesh(new THREE.CapsuleGeometry(radius / s, Math.max(len - (2 * radius) / s, 0.001), 4, 8), mat);
    m.position.y = len / 2; m.name = name;
    // pushed towards where he faces (rest pose: +Z): the face sits in front of the head bone's line
    if (forward) m.position.addScaledVector(Z.clone().applyQuaternion(a.getWorldQuaternion(new THREE.Quaternion()).invert()).normalize(), forward / s);
    a.add(m);
    return m;
  };
  const parts = [
    // (sizes checked with a click map: the head capsule from the neck, 15.5 cm, 6 cm forward, covers cheeks, chin and jaw)
    add('Neck', 'HeadTop_End', 0.155, 'head', 0.06),
    add('Spine', 'Neck', 0.21, 'body'), add('Hips', 'Spine', 0.21, 'body'),
    add('LeftArm', 'LeftForeArm', 0.08, 'body'), add('LeftForeArm', 'LeftHand', 0.07, 'body'),
    add('RightArm', 'RightForeArm', 0.08, 'body'), add('RightForeArm', 'RightHand', 0.07, 'body'),
    add('LeftUpLeg', 'LeftLeg', 0.09, 'body'), add('RightUpLeg', 'RightLeg', 0.09, 'body'),
  ].filter(Boolean);
  // raycast target for the director: a stand-in group listing the bone-attached capsules (never added to the scene)
  const target = new THREE.Group();
  target.children = parts;
  const headBone = bone('Head');
  // face = above the jaw: the head bone starts at the top of the neck
  target.userData.isFace = (point) => point.y > headBone.getWorldPosition(head).y;
  target.userData.anchor = bone('Spine2');
  return target;
}

// also used by the 404 scene (NotFoundScene.jsx): same cached model, mixer and face rig
export function useCharacter(url) {
  const gltf = useLoader(GLTFLoader, url, withMeshopt);
  const anims = useLoader(GLTFLoader, ANIMS.start, withMeshopt);
  return useMemo(() => {
    if (gltf.userData.legend) return gltf.userData.legend;
    const root = gltf.scene;
    const bone = (n) => root.getObjectByName('mixamorig' + n);
    // uGlow: (body, head); uNeck: (world height of the neck, blend half-width) set every frame
    const uniforms = { uFade: { value: new THREE.Vector2(-1e4, -1e4) }, uGlow: { value: new THREE.Vector2(GLOW.body, GLOW.head) },
      uNeck: { value: new THREE.Vector2(0, 0.01) }, uShimmer: { value: new THREE.Vector3(0, 0.25, 0) } };
    const propUniforms = { ...uniforms, uGlow: { value: new THREE.Vector2(0, 0) } };   // eyes, glasses, watch keep their own shading
    const morphMeshes = []; const teeth = [];
    root.traverse((o) => {
      if (!o.isMesh) return;
      o.frustumCulled = false;                          // the bounds are the rest pose; arms and dances leave them
      const isBody = o.name.startsWith('low') || o.parent?.name === 'low';
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach((m) => {
        if (!m.userData.patched) { patchMaterial(m, isBody ? uniforms : propUniforms, isBody && INSIDE_DARK.has(m.name)); m.userData.patched = true; }
        if (['teeth', 'gums', 'tongue'].includes(m.name)) teeth.push(m);
        // the mouth bag faces inward (seen only from inside the mouth): front side only
        if (m.name === 'mouthInside') m.emissive.setRGB(0.08, 0.018, 0.015);
      });
      if (o.morphTargetDictionary) morphMeshes.push(o);
      // the eyeballs' faces point inward: seen from the front side only, the iris moved the wrong way
      if (o.parent?.name?.startsWith('eye_') || o.name.startsWith('eye_')) mats.forEach((m) => { m.side = THREE.DoubleSide; });
    });
    root.updateMatrixWorld(true);                       // first use: not yet in the scene, rest pose
    const eyes = ['eye_L', 'eye_R'].map((n) => root.getObjectByName(n)).filter(Boolean);
    const eyeRest = eyes.map((e) => {
      const q = e.getWorldQuaternion(new THREE.Quaternion()).invert();
      return { obj: e, rest: e.quaternion.clone(), up: Y.clone().applyQuaternion(q).normalize(), side: X.clone().applyQuaternion(q).normalize() };
    });
    const eyeY = eyes.reduce((y, e) => y + e.getWorldPosition(new THREE.Vector3()).y, 0) / Math.max(eyes.length, 1);
    const body = new THREE.Box3().setFromObject(root.getObjectByName('low') ?? root);
    // bone-local axes for the cursor-follow turns (world X = his left/screen right, Y = up)
    const localAxes = (b) => {
      const q = b.getWorldQuaternion(new THREE.Quaternion()).invert();
      return { x: X.clone().applyQuaternion(q), y: Y.clone().applyQuaternion(q), z: Z.clone().applyQuaternion(q) };
    };
    const head = bone('Head'); const neck = bone('Neck'); const chest = bone('Spine2');
    const turn = { head: [head, localAxes(head)], neck: [neck, localAxes(neck)], chest: [chest, localAxes(chest)] };
    const hit = addHitProxies(root, bone);
    const mixer = new THREE.AnimationMixer(root);
    addClips(anims);
    const clips = clipStore;           // the later moves join it when they arrive
    const glasses = root.getObjectByName('glasses');
    const hand = bone('RightHand');
    // where the glasses sit in his right hand: pose the glassesOn clip at the moment they touch his face (measured
    // last: it moves the bones; the idle sets them again on the first frame)
    let glassesInHand = null;
    if (glasses && clips.glassesOn) {
      const probe = new THREE.AnimationMixer(root);
      probe.clipAction(clips.glassesOn).play(); probe.setTime(GLASSES_ON_RELEASE); root.updateMatrixWorld(true);
      glassesInHand = hand.matrixWorld.clone().invert().multiply(glasses.matrixWorld);
      probe.stopAllAction(); probe.uncacheRoot(root);
    }
    if (import.meta.env.DEV) {           // dev: window.__avatarMat('armFill', '#ff00ff') to see where a material is
      (window.__avatarMats ??= []).push(root);
      window.__avatarMat = (name, hex) => window.__avatarMats.forEach((r) => r.traverse((o) => {
        if (!o.isMesh) return;
        (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => { if (m.name === name) { m.emissive.set(hex); m.emissiveIntensity = 1; } });
      }));
    }
    // finger bones (15 per hand) and their rest turns; models without them simply have none
    const fingers = [];
    for (const side of ['Left', 'Right']) FINGERS.forEach((f, fi) => [1, 2, 3].forEach((j) => {
      const b = bone(`${side}Hand${f}${j}`);
      if (b) fingers.push({ b, fi, share: JOINT_SHARE[j - 1], rest: b.quaternion.clone() });
    }));
    if (import.meta.env.DEV) window.__avatarHands = (pose) => { window.__avatarHandPose = pose; };   // dev: force a hand pose
    gltf.userData.legend = { root, bone, uniforms, morphMeshes, teeth, eyeRest, eyeY, top: body.max.y, turn, hit, mixer, clips,
      glasses, glassesRest: glasses && [glasses.position.clone(), glasses.quaternion.clone(), glasses.scale.clone()],
      glassesInHand, hand, hips: bone('Hips'), fingers };
    return gltf.userData.legend;
  }, [gltf, anims]);
}

// frame: the element the canvas fills (the mini companion's small window); the cursor and the looked-at card are
// measured against it (default: the whole window, as on the homepage). dock: 0..1, how far he is into the phone's
// corner badge (HomeScene): touches turn his head less there, so his face stays inside the circle
export function Character({ url, visible, pointer, scroll, reaction, playing, glassesState, attention, meshRef, shared, onReady, frame, dock }) {
  const c = useCharacter(url);
  const inner = useRef();
  const st = useRef({ lastId: -1, active: null, weights: new Map(), cache: {}, zoom: 0, hipsX: 0,
    pose: { headX: 0, headY: 0, chestX: 0, chestY: 0, gazeX: 0, gazeY: 0 },
    life: { nextBlink: 1.5, blinkStart: -1, blink: 0, idleTarget: new THREE.Vector2(), nextSaccade: 0 } });
  const tmp = useMemo(() => ({ q: new THREE.Quaternion(), v: new THREE.Vector3(), v2: new THREE.Vector3(), m: new THREE.Matrix4() }), []);

  // the base idle always runs underneath; reactions blend over it. The model (and its mixer) is cached, so a remount
  // (back to Home) first stops whatever the last visit left playing.
  const idle = useMemo(() => {
    c.mixer.stopAllAction();
    const a = c.mixer.clipAction(c.clips[CLIPS[BASE_IDLE].clip]);
    a.reset().setEffectiveWeight(1).play(); return a;
  }, [c]);

  const actionFor = (info) => {
    const key = info.clip + (info.window ? `@${info.window}` : '');
    const cache = st.current.cache;
    if (!cache[key]) {
      let clip = c.clips[info.clip];
      if (!clip) return null;          // still on its way (the directors play a stand-in meanwhile)
      if (info.window) clip = THREE.AnimationUtils.subclip(clip, key, Math.round(info.window[0] * 30), Math.round(info.window[1] * 30), 30);
      cache[key] = c.mixer.clipAction(clip);
    }
    return cache[key];
  };

  useEffect(() => {
    if (visible) meshRef.current = c.hit;
  }, [visible, c, meshRef]);
  useEffect(() => { onReady?.(); }, []);

  useFrame((state, dt) => {
    dt = Math.min(dt, 0.05);
    const s = st.current;
    const t = state.clock.elapsedTime;
    const pl = playing.current;
    const r = reaction.current;

    // ---- body: start / end the reaction's clip, blend weights
    if (pl.id !== s.lastId) {
      s.lastId = pl.id;
      const info = CLIP_OF(pl.name);
      const a = info && actionFor(info);
      if (a) {
        a.reset();
        a.setLoop(info.repeat > 1 ? THREE.LoopRepeat : THREE.LoopOnce, info.repeat ?? 1);
        a.clampWhenFinished = true;
        a.setEffectiveWeight(s.weights.get(a) ?? 0).play();
        s.active = a; s.activeName = pl.name;
      } else s.active = null;
    }
    if (s.active && now() > pl.start + pl.duration - 1 / BLEND) s.active = null;
    const actions = new Set([idle, ...s.weights.keys()]);
    if (s.active) actions.add(s.active);
    for (const a of actions) {
      const target = a === s.active ? 1 : a === idle ? (s.active ? 0 : 1) : 0;
      const w = damp(s.weights.get(a) ?? (a === idle ? 1 : 0), target, BLEND, dt);
      s.weights.set(a, w); a.setEffectiveWeight(w);
      if (a !== idle && target === 0 && w < 0.002) { a.stop(); s.weights.delete(a); }
    }
    c.mixer.update(dt);

    // ---- dances: zoom out from the bust to the whole body, and follow his hips while he moves
    const dancing = !!(s.active && DANCES.includes(s.activeName));
    s.zoom = damp(s.zoom, dancing ? 1 : 0, 3, dt);
    c.hips.getWorldPosition(tmp.v); c.root.worldToLocal(tmp.v);
    s.hipsX = damp(s.hipsX, dancing ? tmp.v.x : 0, 4, dt);
    const bustK = (0.99 - RIG.eyeY) / Math.max(c.top - c.eyeY, 1e-3);
    const fullK = 1.99 / c.top;
    const k = lerp(bustK, fullK, smooth(s.zoom));
    const g = inner.current;
    g.scale.setScalar(k);
    g.position.set(RIG.neck.pivot[0] - s.hipsX * k, lerp(RIG.eyeY - c.eyeY * bustK, -1.0, smooth(s.zoom)), 0);

    // ---- fade below the bust (none while dancing), soft face, shimmer when the outfit changes
    const parent = g.parent;
    parent.localToWorld(tmp.v.set(0, FADE[0], 0)); const f0 = tmp.v.y;
    parent.localToWorld(tmp.v.set(0, FADE[1], 0)); const f1 = tmp.v.y;
    c.bone('Head').getWorldPosition(tmp.v2); c.bone('Neck').getWorldPosition(tmp.v);
    c.uniforms.uNeck.value.set(tmp.v2.y - (tmp.v2.y - tmp.v.y) * 0.2, Math.abs(tmp.v2.y - tmp.v.y) * 0.35);
    c.uniforms.uGlow.value.set(GLOW.body, GLOW.head);
    const drop = smooth(s.zoom) * 50;
    c.uniforms.uFade.value.set(f0 - drop, f1 - drop);
    const sh = now() - shared.current.shimmerAt;
    parent.localToWorld(tmp.v.set(0, -1.1 + sh * 2.6, 0)); const shY = tmp.v.y;
    parent.localToWorld(tmp.v2.set(0, 0, 0)); parent.localToWorld(tmp.v.set(0, 0.25, 0));
    c.uniforms.uShimmer.value.set(shY, Math.abs(tmp.v.y - tmp.v2.y), sh >= 0 && sh < 1 ? 0.9 * Math.sin(Math.PI * sh) : 0);

    // ---- cursor-follow (eyes lead, head follows, chest lags), as the photo avatar did
    const p = s.pose; const l = s.life;
    c.bone('Head').getWorldPosition(tmp.v).project(state.camera);
    // a hovered project card (director: attention) takes the place of the cursor: he turns to its centre and keeps
    // looking while the mouse rests on it, with a bigger turn of head and chest
    const card = attention?.current.el?.isConnected ? attention.current.el.getBoundingClientRect() : null;
    const vp = frame?.current?.getBoundingClientRect() ?? { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
    const look = card ? tmp.v2.set((card.left + card.right) / 2 - vp.left, (card.top + card.bottom) / 2 - vp.top, 0)
      .set((tmp.v2.x / vp.width) * 2 - 1, 1 - (tmp.v2.y / vp.height) * 2, 0) : pointer.current;
    const idleEyes = !card && !glassesState.current.reading && now() - pointer.current.time > 3;
    if (idleEyes && t > l.nextSaccade) {
      l.idleTarget.set((Math.random() - 0.5) * 0.9, (Math.random() - 0.5) * 0.5);
      l.nextSaccade = t + 1.2 + Math.random() * 2.2;
    }
    const lookK = 1 - 0.85 * (dock?.current ?? 0);
    const tx = idleEyes ? l.idleTarget.x : clamp(look.x - tmp.v.x, -1.5, 1.5) * lookK;
    const ty = idleEyes ? l.idleTarget.y : clamp(look.y - tmp.v.y, -1.5, 1.5) * lookK;
    const turnMax = card ? 0.55 : 0.36;
    const lean = clamp(scroll.current.velocity * 0.00035, -0.14, 0.14);
    const follow = (1 - r.follow) * (1 - smooth(s.zoom));
    p.gazeX = damp(p.gazeX, clamp(tx * 0.9, -0.85, 0.85) * (1 - r.follow), 18, dt);
    p.gazeY = damp(p.gazeY, clamp(-ty * 1.1, -0.45, 0.8) * (1 - r.follow), 18, dt);
    p.headY = damp(p.headY, clamp(tx * 0.4, -turnMax, turnMax) * follow, 5, dt);
    p.headX = damp(p.headX, (clamp(-ty * 0.35, -0.14, 0.3) - lean * 0.6) * follow, 5, dt);
    p.chestY = damp(p.chestY, p.headY * (card ? 0.5 : 0.25), 2.2, dt);
    p.chestX = damp(p.chestX, lean, 2.2, dt);
    const bendBone = ([b, ax], x, y, z) => {
      if (x) b.quaternion.multiply(tmp.q.setFromAxisAngle(ax.x, x));
      if (y) b.quaternion.multiply(tmp.q.setFromAxisAngle(ax.y, y));
      if (z) b.quaternion.multiply(tmp.q.setFromAxisAngle(ax.z, z));
    };
    // ---- fingers: the reaction's hand pose (relaxed otherwise), eased in and out
    if (c.fingers.length) {
      const pose = HAND_POSES[(import.meta.env.DEV && window.__avatarHandPose) || (s.active && HAND_POSE_OF[s.activeName]) || 'relaxed'];
      s.curl ??= [0, 0, 0, 0, 0];
      for (let i = 0; i < 5; i++) s.curl[i] = damp(s.curl[i], pose[i], 8, dt);
      for (const f of c.fingers) f.b.quaternion.copy(f.rest).multiply(tmp.q.setFromAxisAngle(X, s.curl[f.fi] * f.share));
    }
    bendBone(c.turn.chest, p.chestX + r.chestX, p.chestY + r.chestY, 0);
    bendBone(c.turn.neck, (p.headX + r.headX) * 0.35, (p.headY + r.headY) * 0.35, 0);
    bendBone(c.turn.head, (p.headX + r.headX) * 0.65, (p.headY + r.headY) * 0.65, -(p.headY * -0.08 + r.headZ));

    // ---- eyes: gaze turns the eyeballs, blinks / squint / wide eyes are shape keys
    const gx = clamp(p.gazeX + r.gazeX, -0.95, 0.95); const gy = clamp(p.gazeY + r.gazeY, -0.6, 0.95);
    for (const e of c.eyeRest) {
      e.obj.quaternion.copy(e.rest)
        .multiply(tmp.q.setFromAxisAngle(e.up, gx * 0.35))
        .multiply(tmp.q.setFromAxisAngle(e.side, gy * 0.25));
    }
    if (t > l.nextBlink && l.blinkStart < 0 && !(import.meta.env.DEV && window.__avatarNoBlink)) l.blinkStart = t;
    if (l.blinkStart >= 0) {
      const kb = (t - l.blinkStart) / 0.16;
      l.blink = kb < 1 ? Math.sin(Math.PI * kb) : 0;
      if (kb >= 1) { l.blinkStart = -1; l.nextBlink = t + (Math.random() < 0.2 ? 0.15 : 2.2 + Math.random() * 3.5); }
    }
    const bl = Math.max(l.blink, r.blinkL); const br = Math.max(l.blink, r.blinkR);
    const half = (b) => (b <= 0.5 ? 2 * b : 2 - 2 * b); const full = (b) => Math.max(0, 2 * b - 1);
    const sq = clamp(r.squint, 0, 1); const wide = clamp(r.eyeOpen * 1.8, 0, 1);
    // mouth + brows from the reaction's mouth keys (avatarActions.js MOUTH): laugh, 'oh', yawn, grin, frown ...
    const keys = { blinkHalf_L: half(bl), blink_L: full(bl), blinkHalf_R: half(br), blink_R: full(br),
      squint_L: sq * 0.7, squint_R: sq * 0.7, eyeWide: wide, browUp: Math.max(wide * 0.6, r.worry * 0.3),
      jawOpen: clamp(r.jaw, 0, 1), mouthSmile: clamp(Math.max(sq * 0.5, r.grin), 0, 1), mouthFrown: clamp(r.frown, 0, 1),
      mouthPucker: clamp(r.pucker, 0, 1), mouthPress: clamp(r.press, 0, 1), browInnerUp: clamp(r.worry, 0, 1), browDown: clamp(r.scowl, 0, 1) };
    // teeth, gums, tongue only once the mouth opens: closed, the lips meet on a dark line (the teeth showed through the slit)
    for (const m of c.teeth) m.visible = keys.jawOpen > 0.04;
    for (const m of c.morphMeshes) {
      for (const [name, v] of Object.entries(keys)) {
        const i = m.morphTargetDictionary[name];
        if (i !== undefined) m.morphTargetInfluences[i] = v;
      }
    }

    // ---- glasses (the director plays glassesOn / glassesOff while the visitor reads): on his face, in his right
    // hand while it puts them on or takes them off, or away. An interrupted move leaves them where it got to.
    if (c.glasses) {
      const gs = glassesState.current;
      const tr = now() - pl.start;
      const live = tr < pl.duration;
      let mode = gs.worn ? 'face' : 'away';
      if (live && pl.name === 'glassesOn') { mode = tr < GLASSES_ON_RELEASE ? 'hand' : 'face'; if (mode === 'face') gs.worn = true; }
      else if (live && pl.name === 'glassesOff') { mode = tr < GLASSES_OFF_GRAB ? 'face' : 'hand'; if (mode === 'hand') gs.worn = false; }
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
  });

  return (
    <group ref={inner} visible={visible}>
      <primitive object={c.root} />
    </group>
  );
}

// Holds the outfits: only the current theme's loads with the page; the other loads when the visitor reaches for the
// theme button (avatarModels.onThemeIntent) or switches. A theme toggle plays the twirl (director: themeSwap) and swaps
// the outfit while he faces away, with a shimmer up the body; if the outfit is still loading then, it changes inside a
// shimmer of its own as soon as it is ready.
const LATE_SWAP = 0.35;     // seconds into that late shimmer when the outfit changes
function HomeAvatar({ lightMode, pointer, scroll, reaction, playing, glasses, attention, meshRef, onReady, dock }) {
  const want = lightMode ? 'light' : 'dark';
  const [shown, setShown] = useState(want);
  const [mounted, setMounted] = useState({ [want]: true });
  const [ready, setReady] = useState({});
  const readyNow = useRef({});          // read by timers (state in their closures would be stale)
  const shared = useRef({ shimmerAt: -10, swapDue: 0 });
  const first = useRef(true);

  useEffect(() => onThemeIntent(() => setMounted({ light: true, dark: true })), []);
  // the later moves: once he is on screen and the page is quiet, or on the first click / key / scroll
  const shownReady = !!ready[shown];
  useEffect(() => (shownReady ? loadLaterWhenIdle(4) : undefined), [shownReady]);
  useEffect(() => {
    if (first.current) { first.current = false; return undefined; }
    setMounted((m) => ({ ...m, [want]: true }));
    if (readyNow.current[want]) shared.current.shimmerAt = now() + SWAP_AT - 0.35;
    shared.current.swapDue = now() + SWAP_AT;
    const id = setTimeout(() => setShown((cur) => (readyNow.current[want] ? want : cur)), SWAP_AT * 1000);
    return () => clearTimeout(id);
  }, [want]);
  // the outfit was still loading at the swap moment: its own shimmer, the change inside it
  useEffect(() => {
    if (!ready[want] || shown === want || now() < shared.current.swapDue) return undefined;
    shared.current.shimmerAt = now();
    const id = setTimeout(() => setShown(want), LATE_SWAP * 1000);
    return () => clearTimeout(id);
  }, [ready, want, shown]);

  return ['light', 'dark'].map((k) => mounted[k] && (
    <Suspense key={k} fallback={null}>
      <Character
        url={MODELS[k]} visible={shown === k} pointer={pointer} scroll={scroll} reaction={reaction} playing={playing}
        glassesState={glasses} attention={attention} meshRef={meshRef} shared={shared} dock={dock}
        onReady={() => { readyNow.current[k] = true; setReady((r) => ({ ...r, [k]: true })); if (k === shown) onReady?.(); }}
      />
    </Suspense>
  ));
}

export default HomeAvatar;
