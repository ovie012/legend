/* eslint-disable react/no-unknown-property -- react-three-fiber JSX props (args, intensity, ...) */
import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { AVATAR_RIG as RIG } from './avatarRig';

const MODEL = '/3d/legend-avatar.glb';
const PHOTO = '/Legend-himself.webp';

const { damp, clamp } = THREE.MathUtils;
// eye colours were sampled from the photo in sRGB; the shader works in linear light
const linear = (rgb) => new THREE.Color().setRGB(...rgb, THREE.SRGBColorSpace);

const rotation = (x, y, z) =>
  new THREE.Matrix3().setFromMatrix4(new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(x, y, z, 'YXZ')));

// Head, chest and eyes are driven in the shader: the mesh has no skeleton, so the
// "bones" are smooth height bands around a neck and a chest pivot.
const vertexHead = /* glsl */ `
  attribute vec2 photoUv;
  attribute float photoW;
  uniform mat3 uChestRot;
  uniform mat3 uHeadRot;
  uniform vec3 uChestPivot;
  uniform vec3 uNeckPivot;
  uniform vec2 uChestBand;
  uniform vec2 uHeadBand;
  varying vec2 vPhotoUv;
  varying float vPhotoW;
  varying float vObjY;
  varying float vFront;

  vec3 rigApply(vec3 v, vec3 p, bool isPoint) {
    float wc = smoothstep(uChestBand.x, uChestBand.y, p.y);
    float wh = smoothstep(uHeadBand.x, uHeadBand.y, p.y);
    vec3 chest = isPoint ? uChestPivot + uChestRot * (v - uChestPivot) : uChestRot * v;
    vec3 neck = uChestPivot + uChestRot * (uNeckPivot - uChestPivot);
    vec3 head = isPoint ? neck + uHeadRot * (v - uNeckPivot) : uHeadRot * v;
    return mix(mix(v, chest, wc), head, wh);
  }
`;

const fragmentHead = /* glsl */ `
  uniform sampler2D uPhoto;
  uniform vec2 uPhotoSize;
  uniform vec4 uEyeA[2];      // center.xy, half size.xy (photo px)
  uniform vec4 uEyeB[2];      // cos, sin, iris radius, unused
  uniform vec3 uSclera[2];
  uniform vec3 uIris[2];
  uniform vec3 uLid[2];
  uniform vec2 uGaze;         // -1..1, photo space (y down)
  uniform vec2 uBlink;        // per eye: 0 open, 1 closed (upper lid)
  uniform float uSquint;      // 0..1 lower lids rise, for smiles
  uniform float uEyeOpen;     // 1 normal, >1 wider (surprise)
  uniform float uFadeY;
  uniform vec2 uHeadBand;
  uniform vec4 uHeadColor;    // saturation, gain.rgb
  uniform vec4 uBodyColor;
  varying vec2 vPhotoUv;
  varying float vPhotoW;
  varying float vObjY;
  varying float vFront;

  vec3 drawEye(int i, vec2 pp, vec3 base, inout float cover) {
    vec2 c = uEyeA[i].xy;
    vec2 hs = uEyeA[i].zw;
    vec2 d = pp - c;
    vec2 local = vec2(d.x * uEyeB[i].x + d.y * uEyeB[i].y, -d.x * uEyeB[i].y + d.y * uEyeB[i].x);
    vec2 n = local / (hs * vec2(0.94, 0.86 * uEyeOpen));
    float r = length(n);
    if (r > 1.15) return base;

    float open = 1.0 - smoothstep(0.7, 0.98, r);
    float lidLine = mix(-1.1, 1.1, uBlink[i]);
    float lowLine = mix(1.1, 0.1, uSquint);
    float lid = smoothstep(lidLine - 0.12, lidLine + 0.04, n.y) * (1.0 - smoothstep(lowLine - 0.04, lowLine + 0.12, n.y));

    // sclera, shaded into the corners and under the upper lid
    vec3 sclera = mix(uSclera[i], vec3(0.6, 0.52, 0.44), 0.3);
    sclera *= mix(0.45, 1.0, smoothstep(-1.0, 0.1, n.y));
    sclera *= mix(1.0, 0.6, smoothstep(0.35, 0.95, abs(n.x)));

    float ir = uEyeB[i].z;
    vec2 travel = vec2((hs.x - ir) * 0.62, hs.y * 0.35);
    vec2 ic = uGaze * travel;
    float k = length(local - ic) / (ir * 1.06);
    vec3 iris = mix(uIris[i] * 2.4 + vec3(0.03, 0.012, 0.0), uIris[i] * 0.7, smoothstep(0.35, 0.95, k));
    iris = mix(iris, vec3(0.012), 1.0 - smoothstep(0.34, 0.4, k));
    iris *= mix(0.55, 1.0, smoothstep(-1.0, -0.3, n.y));
    float glint = 1.0 - smoothstep(0.07, 0.14, length(local - ic - vec2(-0.3, -0.32) * ir) / ir);
    iris = mix(iris, vec3(0.95), glint * 0.7);
    vec3 eye = mix(sclera, iris, 1.0 - smoothstep(0.9, 1.0, k));

    // lash line along the upper lid edge, then the lid itself when blinking
    eye *= mix(0.35, 1.0, smoothstep(lidLine + 0.02, lidLine + 0.3, n.y));
    eye = mix(uLid[i] * mix(0.7, 1.0, smoothstep(-1.0, 0.5, n.y)), eye, lid);

    cover = max(cover, open);
    return mix(base, eye, open);
  }
`;

function useAvatarMaterial(baseMap, photo) {
  const uniforms = useMemo(() => ({
    uChestRot: { value: new THREE.Matrix3() },
    uHeadRot: { value: new THREE.Matrix3() },
    uChestPivot: { value: new THREE.Vector3(...RIG.chest.pivot) },
    uNeckPivot: { value: new THREE.Vector3(...RIG.neck.pivot) },
    uChestBand: { value: new THREE.Vector2(...RIG.chest.band) },
    uHeadBand: { value: new THREE.Vector2(...RIG.neck.band) },
    uPhoto: { value: photo },
    uPhotoSize: { value: new THREE.Vector2(...RIG.photoSize) },
    uEyeA: { value: RIG.eyes.map((e) => new THREE.Vector4(...e.center, ...e.half)) },
    uEyeB: {
      value: RIG.eyes.map((e) => {
        const a = THREE.MathUtils.degToRad(e.angle);
        return new THREE.Vector4(Math.cos(a), Math.sin(a), e.irisRadius, 0);
      }),
    },
    uSclera: { value: RIG.eyes.map((e) => linear(e.sclera)) },
    uIris: { value: RIG.eyes.map((e) => linear(e.iris)) },
    uLid: { value: RIG.eyes.map((e) => linear(e.lid)) },
    uGaze: { value: new THREE.Vector2() },
    uBlink: { value: new THREE.Vector2() },
    uSquint: { value: 0 },
    uEyeOpen: { value: 1 },
    uFadeY: { value: RIG.bounds.min[1] },
    uHeadColor: { value: new THREE.Vector4(RIG.color.head.saturation, ...RIG.color.head.gain) },
    uBodyColor: { value: new THREE.Vector4(RIG.color.body.saturation, ...RIG.color.body.gain) },
  }), [photo]);

  const material = useMemo(() => {
    const m = new THREE.MeshStandardMaterial({ map: baseMap, roughness: 0.86, metalness: 0, alphaHash: true });
    m.onBeforeCompile = (shader) => {
      Object.assign(shader.uniforms, uniforms);
      shader.vertexShader = vertexHead + shader.vertexShader
        .replace('#include <beginnormal_vertex>', 'vec3 objectNormal = normalize(rigApply(vec3(normal), position, false));')
        .replace('#include <begin_vertex>', `
          vec3 transformed = rigApply(vec3(position), position, true);
          vPhotoUv = photoUv;
          vPhotoW = photoW;
          vObjY = position.y;
          vFront = normal.z;
        `);
      shader.fragmentShader = fragmentHead + shader.fragmentShader
        .replace('#include <map_fragment>', `
          #include <map_fragment>
          float lum = dot(diffuseColor.rgb, vec3(0.2126, 0.7152, 0.0722));
          vec3 aiHead = (lum + (diffuseColor.rgb - lum) * uHeadColor.x) * uHeadColor.yzw;
          vec3 aiBody = (lum + (diffuseColor.rgb - lum) * uBodyColor.x) * uBodyColor.yzw;
          diffuseColor.rgb = mix(aiBody, aiHead, smoothstep(uHeadBand.x, uHeadBand.y, vObjY));
          vec2 pp = vec2(vPhotoUv.x, 1.0 - vPhotoUv.y) * uPhotoSize;
          vec3 photoCol = texture2D(uPhoto, vPhotoUv).rgb;
          float eyeCover = 0.0;
          photoCol = drawEye(0, pp, photoCol, eyeCover);
          photoCol = drawEye(1, pp, photoCol, eyeCover);
          // fade the photo out where the surface turns away from the camera it was taken from
          float photoW = vPhotoW * smoothstep(0.04, 0.42, vFront);
          // the photo already carries real lighting: keep a third of the 3D shading on it
          vec3 photoGlow = photoCol * photoW * 0.62;
          diffuseColor.rgb = mix(diffuseColor.rgb, photoCol, photoW) * (1.0 - photoW * 0.66);
          diffuseColor.a *= smoothstep(uFadeY, uFadeY + 0.35, vObjY);
        `)
        .replace('#include <emissivemap_fragment>', `
          #include <emissivemap_fragment>
          totalEmissiveRadiance += photoGlow;
        `);
    };
    return m;
  }, [baseMap, uniforms]);

  useEffect(() => () => material.dispose(), [material]);

  return { material, uniforms };
}

// Eyes lead, head follows, chest lags: each part chases the same target at its own speed.
function HomeAvatar({ pointer, scroll, reaction, meshRef, onReady }) {
  const gltf = useLoader(GLTFLoader, MODEL, (loader) => loader.setMeshoptDecoder(MeshoptDecoder));
  const photo = useLoader(THREE.TextureLoader, PHOTO);
  const { camera } = useThree();

  const { geometry, baseMap } = useMemo(() => {
    const mesh = gltf.scene.getObjectByProperty('type', 'Mesh');
    const g = mesh.geometry;
    g.setAttribute('photoUv', g.getAttribute('_photo_uv'));
    g.setAttribute('photoW', g.getAttribute('_photo_w'));
    return { geometry: g, baseMap: mesh.material.map };
  }, [gltf]);

  useMemo(() => {
    photo.colorSpace = THREE.SRGBColorSpace;
    photo.anisotropy = 8;
  }, [photo]);

  const { material, uniforms } = useAvatarMaterial(baseMap, photo);
  const mesh = meshRef;
  const pose = useRef({ headX: 0, headY: 0, chestX: 0, chestY: 0, gazeX: 0, gazeY: 0 });
  const life = useRef({ nextBlink: 1.5, blinkStart: -1, blink: 0, idleTarget: new THREE.Vector2(), nextSaccade: 0 });
  const headWorld = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => { onReady?.(); }, []);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    const p = pose.current;
    const l = life.current;
    dt = Math.min(dt, 0.05);

    // where is the cursor relative to the head on screen?
    mesh.current.localToWorld(headWorld.set(RIG.neck.pivot[0], RIG.eyeY, 0.3)).project(camera);
    const idle = performance.now() / 1000 - pointer.current.time > 3;
    if (idle && t > l.nextSaccade) {
      l.idleTarget.set((Math.random() - 0.5) * 0.9, (Math.random() - 0.5) * 0.5);
      l.nextSaccade = t + 1.2 + Math.random() * 2.2;
    }
    const tx = idle ? l.idleTarget.x : clamp(pointer.current.x - headWorld.x, -1.5, 1.5);
    const ty = idle ? l.idleTarget.y : clamp(pointer.current.y - headWorld.y, -1.5, 1.5);
    const lean = clamp(scroll.current.velocity * 0.00035, -0.14, 0.14);
    // a reaction can hold back the cursor-follow and adds its own pose on top
    const r = reaction.current;
    const follow = 1 - r.follow;

    p.gazeX = damp(p.gazeX, clamp(tx * 0.9, -0.85, 0.85) * follow, 18, dt);
    p.gazeY = damp(p.gazeY, clamp(-ty * 1.1, -0.45, 0.8) * follow, 18, dt);
    p.headY = damp(p.headY, clamp(tx * 0.4, -0.36, 0.36) * follow, 5, dt);
    p.headX = damp(p.headX, (clamp(-ty * 0.35, -0.14, 0.3) - lean * 0.6) * follow, 5, dt);
    p.chestY = damp(p.chestY, p.headY * 0.25 + Math.sin(t * 0.4) * 0.025, 2.2, dt);
    p.chestX = damp(p.chestX, lean + Math.sin(t * 1.3) * 0.008, 2.2, dt);

    const chestX = p.chestX + r.chestX;
    const chestY = p.chestY + r.chestY;
    uniforms.uChestRot.value.copy(rotation(chestX, chestY, Math.sin(t * 0.5) * 0.01));
    uniforms.uHeadRot.value.copy(rotation(p.headX + r.headX + chestX, p.headY + r.headY + chestY, p.headY * -0.08 + r.headZ));
    uniforms.uGaze.value.set(clamp(p.gazeX + r.gazeX, -0.95, 0.95), clamp(p.gazeY + r.gazeY, -0.6, 0.95));
    uniforms.uSquint.value = r.squint;
    uniforms.uEyeOpen.value = 1 + r.eyeOpen;

    // blink every few seconds, sometimes twice
    if (t > l.nextBlink && l.blinkStart < 0) l.blinkStart = t;
    if (l.blinkStart >= 0) {
      const k = (t - l.blinkStart) / 0.16;
      l.blink = k < 1 ? Math.sin(Math.PI * k) : 0;
      if (k >= 1) {
        l.blinkStart = -1;
        l.nextBlink = t + (Math.random() < 0.2 ? 0.15 : 2.2 + Math.random() * 3.5);
      }
    }
    uniforms.uBlink.value.set(Math.max(l.blink, r.blinkL), Math.max(l.blink, r.blinkR));
  });

  return <mesh ref={mesh} geometry={geometry} material={material} />;
}

export default HomeAvatar;
