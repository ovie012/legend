/* eslint-disable react/no-unknown-property -- react-three-fiber JSX props (args, intensity, ...) */
import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import HomeAvatar from './HomeAvatar';
import { useAvatarDirector } from './useAvatarDirector';
import { reportTask } from '../loadProgress';

if (import.meta.hot) import.meta.hot.decline();   // the 3D scene reloads the page instead of hot-patching

// three's loaders report through the default manager; forward that to the preloader
reportTask('3d', 0.15);
THREE.DefaultLoadingManager.onProgress = (url, loaded, total) => reportTask('3d', 0.15 + 0.8 * (loaded / total));
import { AVATAR_RIG as RIG } from './avatarRig';

// Where the avatar sits for each [data-stage] section: x/y in half-viewport units,
// s as a share of viewport height, ry as yaw (positive turns toward the right).
// On mobile an element can point somewhere else with data-stage-mobile ("none" skips it).
const STAGES = {
  desktop: {
    hero:   { x: 0.46, y: -0.16, s: 0.8, ry: -0.18 },
    about:  { x: -0.5, y: -0.1, s: 0.8, ry: 0.26 },
    works:  { x: 0.78, y: 0.5, s: 0.27, ry: -0.3 },
    skills: { x: 0.5, y: -0.12, s: 0.72, ry: -0.12 },
    journey: { x: -0.52, y: -0.12, s: 0.74, ry: 0.22 },
    aibuilds: { x: 0.78, y: 0.5, s: 0.27, ry: -0.3 },
    exit:   { x: 0, y: -1.7, s: 0.6, ry: 0 },
  },
  mobile: {
    hero:   { x: 0, y: 0.3, s: 0.5, ry: 0 },
    about:  { x: 0.5, y: 1.9, s: 0.3, ry: -0.3 },
    works:  { x: 0.5, y: 1.9, s: 0.3, ry: -0.3 },
    skills: { x: 0, y: 0.14, s: 0.46, ry: 0 },
    exit:   { x: 0, y: -1.7, s: 0.4, ry: 0 },
  },
};

const smoothstep = (e0, e1, x) => {
  const t = THREE.MathUtils.clamp((x - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};

// Blend between the two stages around the middle of the viewport, holding each pose inside its section.
function readStage(stages, mobile) {
  const nodes = document.querySelectorAll('[data-stage], [data-stage-mobile]');
  const mid = window.innerHeight / 2;
  let prev = null;
  for (const node of nodes) {
    const name = mobile ? node.dataset.stageMobile ?? node.dataset.stage : node.dataset.stage;
    const r = node.getBoundingClientRect();
    const anchor = { name, stage: stages[name], center: r.top + r.height / 2 };
    if (!anchor.stage || !r.height) continue;
    if (anchor.center >= mid) {
      if (!prev) return { from: anchor.stage, to: anchor.stage, fromName: name, toName: name, t: 0 };
      const t = smoothstep(0.2, 0.8, (mid - prev.center) / (anchor.center - prev.center));
      return { from: prev.stage, to: anchor.stage, fromName: prev.name, toName: name, t };
    }
    prev = anchor;
  }
  return prev ? { from: prev.stage, to: prev.stage, fromName: prev.name, toName: prev.name, t: 0 } : null;
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

function Dust({ look, scroll }) {
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

function Halo({ look }) {
  const uniforms = useMemo(() => ({ uColor: { value: new THREE.Color() } }), []);
  useFrame(() => { uniforms.uColor.value.copy(look.cur.halo); });
  return (
    <mesh position={[0, 0.25, -0.9]} scale={[4.2, 4.2, 1]}>
      <planeGeometry />
      <shaderMaterial
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms}
        vertexShader="varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }"
        fragmentShader="uniform vec3 uColor; varying vec2 vUv; void main() { float d = length(vUv - 0.5) * 2.0; gl_FragColor = vec4(uColor, pow(1.0 - clamp(d, 0.0, 1.0), 2.6) * 0.18); }"
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

function Rig({ colors, lightMode, pointer, scroll, onReady }) {
  const group = useRef();
  const orbit = useRef();
  const avatar = useRef();
  const keyLight = useRef(); const hemi = useRef(); const rim = useRef(); const fill = useRef();
  const look = useLook(colors, lightMode);
  const { viewport, camera, size } = useThree();
  const state = useRef({ x: 0, y: 0, s: 1, ry: 0, init: false, held: null });
  const director = useAvatarDirector({ meshRef: avatar, lightMode, scroll });

  useFrame((frame, dt) => {
    dt = Math.min(dt, 0.05);
    const sc = scroll.current;
    const y = window.scrollY;
    sc.velocity = THREE.MathUtils.damp(sc.velocity, (y - sc.y) / Math.max(dt, 1e-3), 6, dt);
    sc.y = y;

    const mobile = size.width < 800;
    const blend = readStage(mobile ? STAGES.mobile : STAGES.desktop, mobile);
    if (!blend) return;
    const lerp = (k) => blend.from[k] + (blend.to[k] - blend.from[k]) * blend.t;
    const travel = Math.sin(Math.PI * blend.t);
    let target = {
      x: lerp('x') * viewport.width / 2,
      y: lerp('y') * viewport.height / 2,
      s: lerp('s') * viewport.height / 2,
      // a small turn while it travels between sections
      ry: lerp('ry') + travel * 0.22 * Math.sign(blend.to.x - blend.from.x || 1),
    };

    const exitness = blend.toName === 'exit' ? blend.t : blend.fromName === 'exit' ? 1 : 0;
    const stageName = blend.t < 0.5 ? blend.fromName : blend.toName;
    const { hold } = director.update(stageName, exitness);
    const st = state.current;
    // while he says goodbye he stays put; the exit continues once it's done
    if (hold) target = st.held ?? (st.held = { x: st.x, y: st.y, s: st.s, ry: st.ry });
    else st.held = null;

    const k = st.init ? 4 : 1000;
    st.init = true;
    for (const key of ['x', 'y', 's', 'ry']) st[key] = THREE.MathUtils.damp(st[key], target[key], k, dt);

    const r = director.pose.current;
    const g = group.current;
    g.position.set(st.x + r.x * st.s, st.y + (Math.sin(frame.clock.elapsedTime * 0.9) * 0.02 + r.y) * st.s, 0);
    g.scale.setScalar(st.s * (1 + r.s));
    g.rotation.y = st.ry + r.ry + director.spin.current.angle;

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

    camera.position.x = THREE.MathUtils.damp(camera.position.x, pointer.current.x * 0.25, 2, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, pointer.current.y * 0.15, 2, dt);
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
      <Dust look={look} scroll={scroll} />
      <group ref={group}>
        <Halo look={look} />
        <HomeAvatar lightMode={lightMode} pointer={pointer} scroll={scroll} reaction={director.pose} playing={director.playing} glasses={director.glasses} meshRef={avatar} onReady={onReady} />
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
    <div className={`hm-scene ${ready ? 'ready' : ''}`} aria-hidden="true">
      <Canvas
        camera={{ fov: 30, position: [0, 0, 6.5] }}
        dpr={[1, 1.75]}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <Rig colors={colors} lightMode={lightMode} pointer={pointer} scroll={scroll} onReady={() => { setReady(true); reportTask('3d', 1); }} />
        </Suspense>
      </Canvas>
    </div>
  );
}

export default HomeScene;
