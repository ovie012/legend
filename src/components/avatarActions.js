// Reaction library for the homepage avatar.
// Each action is a short keyframed performance on top of the cursor-follow pose. On the rigged character the
// body moves with the animation clip in avatarClips.js (same name); for those, only the face channels below are
// used (gaze, blinks, squint, eyeOpen, follow) and the timing follows the clip. Reactions without a clip still use
// every channel.
//
// Channels (all optional, missing = 0):
//   headX/headY/headZ, chestX/chestY  rotations in radians (headY > 0 turns toward screen right)
//   gazeX/gazeY                         eye offset, -1..1 (gazeY > 0 looks down)
//   blinkL/blinkR, squint               0..1 eyelid closure from the top / bottom
//   eyeOpen                             extra eye opening, 0.2 = 20% wider
//   y, x, ry, s                         whole-body hop, side step, turn, scale (+0.05 = 5% bigger)
//   follow                              0..1 how much the cursor-follow is held back
//   jaw, grin, frown, pucker, press     mouth (rigged character, MOUTH below): jaw 0 closed .. 1 wide open
//   worry, scowl                        inner brows up / brows down

const k = (t, pose = {}) => [t, pose];

// Dances repeat a move on a beat: `move(i)` returns the pose for beat i, the last beat eases back to rest.
const dance = (duration, beats, move) => ({
  duration,
  keys: [k(0), ...Array.from({ length: beats }, (_, i) => k((i + 1) / (beats + 1), { follow: 1, ...move(i) })), k(1)],
});
const alt = (i, a, b) => (i % 2 ? b : a);
const hold = (pose) => ({ ...pose, follow: pose.follow ?? 1 });

export const ACTIONS = {
  // clicks on the avatar
  dust: { duration: 2.2, keys: [
    k(0), k(0.14, hold({ headX: 0.4, gazeY: 0.95, chestX: 0.1, s: -0.01 })),
    k(0.28, hold({ headX: 0.42, headY: -0.12, gazeY: 0.95, gazeX: -0.4, chestX: 0.1, chestY: -0.12, x: -0.015 })),
    k(0.42, hold({ headX: 0.42, headY: 0.12, gazeY: 0.95, gazeX: 0.4, chestX: 0.1, chestY: 0.12, x: 0.015 })),
    k(0.56, hold({ headX: 0.42, headY: -0.12, gazeY: 0.95, gazeX: -0.4, chestX: 0.1, chestY: -0.12, x: -0.015 })),
    k(0.7, hold({ headX: 0.4, gazeY: 0.95, chestX: 0.08 })),
    k(0.84, hold({ headX: -0.04, squint: 0.45, y: 0.025 })), k(1),
  ] },
  shy: { duration: 2.6, keys: [
    k(0), k(0.18, hold({ headY: -0.36, headX: 0.2, headZ: 0.14, chestY: -0.1, gazeX: -0.8, gazeY: 0.7, blinkL: 0.6, blinkR: 0.6, s: -0.03 })),
    k(0.62, hold({ headY: -0.38, headX: 0.22, headZ: 0.15, chestY: -0.1, gazeX: -0.8, gazeY: 0.7, blinkL: 0.65, blinkR: 0.65, s: -0.03 })),
    k(0.8, hold({ headY: -0.14, headX: 0.12, gazeX: 0.7, gazeY: 0.2, blinkL: 0.2, squint: 0.4 })), k(1),
  ] },

  // clicks on empty space
  lookAtClick: { duration: 1.4, keys: [k(0), k(0.15, { eyeOpen: 0.25, y: 0.03, headX: -0.05 }), k(0.6, { eyeOpen: 0.15 }), k(1)] },
  nodYes: { duration: 1.4, keys: [k(0), k(0.2, hold({ headX: 0.2, squint: 0.3 })), k(0.4, hold({ headX: -0.06 })), k(0.6, hold({ headX: 0.18, squint: 0.3 })), k(0.8, hold({ headX: -0.03 })), k(1)] },
  shakeNo: { duration: 1.6, keys: [
    k(0), k(0.15, hold({ headY: 0.24, headX: 0.04 })), k(0.32, hold({ headY: -0.24, headX: 0.04 })),
    k(0.5, hold({ headY: 0.2, headX: 0.04 })), k(0.68, hold({ headY: -0.16 })), k(0.85, hold({ headX: -0.05, eyeOpen: 0.15 })), k(1),
  ] },
  headTilt: { duration: 1.8, keys: [k(0), k(0.25, { headZ: 0.22, headY: 0.08, eyeOpen: 0.12, follow: 0.5 }), k(0.75, { headZ: 0.22, headY: 0.1, follow: 0.5 }), k(1)] },
  doubleTake: { duration: 1.7, keys: [
    k(0), k(0.2, hold({ headY: -0.3, gazeX: -0.7 })), k(0.38, hold({ headY: -0.3, gazeX: -0.7 })),
    k(0.5, hold({ headY: 0.04, eyeOpen: 0.35, y: 0.04, headX: -0.08 })), k(0.8, hold({ eyeOpen: 0.2 })), k(1),
  ] },
  eyeRoll: { duration: 1.6, keys: [
    k(0), k(0.2, hold({ gazeX: -0.7, gazeY: -0.4, headX: -0.06 })), k(0.4, hold({ gazeX: 0, gazeY: -0.45, headX: -0.1 })),
    k(0.6, hold({ gazeX: 0.7, gazeY: -0.4, headX: -0.06 })), k(0.8, hold({ headZ: -0.1, blinkL: 0.3, blinkR: 0.3 })), k(1),
  ] },
  wink: { duration: 1.2, keys: [k(0), k(0.25, { blinkR: 1, squint: 0.3, headZ: 0.08, follow: 0.4 }), k(0.55, { blinkR: 1, squint: 0.3, headZ: 0.08, follow: 0.4 }), k(1)] },
  hop: { duration: 1.1, keys: [k(0), k(0.18, { y: -0.02, s: 0.01 }), k(0.42, { y: 0.12, eyeOpen: 0.2 }), k(0.7, { y: -0.015 }), k(1)] },
  leanIn: { duration: 2.0, keys: [k(0), k(0.3, { s: 0.07, headX: 0.08, squint: 0.45, y: -0.03, follow: 0.3 }), k(0.75, { s: 0.07, headX: 0.08, squint: 0.45, y: -0.03, follow: 0.3 }), k(1)] },
  shrug: { duration: 1.6, keys: [k(0), k(0.3, hold({ chestX: -0.06, y: 0.04, headZ: 0.12, eyeOpen: 0.15, gazeY: -0.3 })), k(0.65, hold({ chestX: -0.06, y: 0.04, headZ: 0.12, gazeY: -0.3 })), k(1)] },
  laugh: { duration: 1.8, keys: [
    k(0), k(0.12, hold({ headX: -0.12, squint: 0.7, y: 0.03 })), k(0.26, hold({ headX: 0.02, squint: 0.7 })),
    k(0.4, hold({ headX: -0.12, squint: 0.7, y: 0.03 })), k(0.54, hold({ headX: 0.02, squint: 0.7 })),
    k(0.7, hold({ headX: -0.08, squint: 0.6, y: 0.02 })), k(1),
  ] },
  suspicious: { duration: 2.2, keys: [
    k(0), k(0.2, hold({ blinkL: 0.45, blinkR: 0.45, headX: 0.06, headY: -0.2, gazeX: 0.8 })),
    k(0.55, hold({ blinkL: 0.45, blinkR: 0.45, headX: 0.06, headY: 0.2, gazeX: -0.8 })), k(0.8, hold({ blinkL: 0.3, blinkR: 0.3 })), k(1),
  ] },
  eyeRollAlt: { duration: 3.2, keys: [k(0), k(0.2, hold({ gazeX: 0.6, gazeY: -0.4, blinkL: 0.3, blinkR: 0.3 })), k(0.5, hold({ gazeX: -0.6, gazeY: -0.4 })), k(0.8, hold({ squint: 0.3 })), k(1)] },

  // leaving at the footer
  bow: { duration: 2.0, keys: [k(0), k(0.3, hold({ headX: 0.32, chestX: 0.16, blinkL: 0.5, blinkR: 0.5 })), k(0.6, hold({ headX: 0.32, chestX: 0.16, blinkL: 0.5, blinkR: 0.5 })), k(1)] },
  doubleNod: { duration: 1.5, keys: [k(0), k(0.2, hold({ headX: 0.2, squint: 0.4 })), k(0.4, hold({ headX: 0 })), k(0.6, hold({ headX: 0.2, squint: 0.4 })), k(1)] },
  tiltWave: { duration: 2.0, keys: [k(0), k(0.2, hold({ headZ: 0.2, squint: 0.4 })), k(0.4, hold({ headZ: -0.2, squint: 0.4 })), k(0.6, hold({ headZ: 0.2, squint: 0.4 })), k(0.8, hold({ headZ: -0.12 })), k(1)] },
  winkBye: { duration: 1.6, keys: [k(0), k(0.3, hold({ blinkL: 1, squint: 0.5, headZ: -0.12, headX: 0.06 })), k(0.65, hold({ blinkL: 1, squint: 0.5, headZ: -0.12 })), k(1)] },
  hopBye: { duration: 1.4, keys: [k(0), k(0.25, { y: 0.1, s: 0.02, squint: 0.4, follow: 0.6 }), k(0.5, { y: 0, follow: 0.6 }), k(0.7, { y: 0.07, squint: 0.4, follow: 0.6 }), k(1)] },
  sideStepBye: { duration: 2.0, keys: [k(0), k(0.35, hold({ x: 0.25, ry: 0.3, headY: -0.35, gazeX: -0.8, squint: 0.4 })), k(0.7, hold({ x: 0.25, ry: 0.3, headY: -0.35, gazeX: -0.8, squint: 0.4 })), k(1)] },
  lookBackBye: { duration: 2.2, keys: [k(0), k(0.3, hold({ ry: 0.45, headY: 0.3 })), k(0.55, hold({ ry: 0.45, headY: -0.3, gazeX: -0.9, squint: 0.4 })), k(0.8, hold({ ry: 0.3, headY: -0.3, blinkR: 1 })), k(1)] },
  bounceBye: { duration: 1.8, keys: [k(0), k(0.15, { y: 0.05, follow: 0.5 }), k(0.3, { y: 0, follow: 0.5 }), k(0.45, { y: 0.05, follow: 0.5 }), k(0.6, { y: 0, follow: 0.5 }), k(0.75, { y: 0.05, squint: 0.4, follow: 0.5 }), k(1)] },
  saluteBye: { duration: 1.6, keys: [k(0), k(0.2, hold({ headX: -0.08, headZ: 0.1, eyeOpen: 0.1 })), k(0.35, hold({ headX: 0.14, headZ: 0.1 })), k(0.7, hold({ headX: 0, squint: 0.4 })), k(1)] },
  spinBye: { duration: 1.8, keys: [k(0), k(0.3, hold({ ry: 0.5, y: 0.04 })), k(0.55, hold({ ry: -0.3, y: 0.06, squint: 0.4 })), k(1)] },
  shyBye: { duration: 2.0, keys: [k(0), k(0.3, hold({ headY: -0.28, headX: 0.16, headZ: 0.1, blinkL: 0.5, blinkR: 0.5, squint: 0.5 })), k(0.7, hold({ headY: -0.1, gazeX: 0.7, squint: 0.5 })), k(1)] },
  nodSmileBye: { duration: 1.8, keys: [k(0), k(0.35, hold({ headX: 0.18, headZ: 0.06, squint: 0.6 })), k(0.7, hold({ headX: 0.1, squint: 0.6 })), k(1)] },

  // coming back from the footer
  thankBow: { duration: 2.0, keys: [k(0), k(0.3, hold({ headX: 0.26, chestX: 0.12, squint: 0.5 })), k(0.6, hold({ headX: 0.26, chestX: 0.12, squint: 0.5 })), k(1)] },
  happyBounce: { duration: 1.6, keys: [k(0), k(0.2, { y: 0.07, squint: 0.6, follow: 0.5 }), k(0.4, { y: 0, squint: 0.6, follow: 0.5 }), k(0.6, { y: 0.05, squint: 0.6, follow: 0.5 }), k(1)] },
  warmNod: { duration: 1.8, keys: [k(0), k(0.3, hold({ headX: 0.16, headZ: 0.1, squint: 0.65 })), k(0.65, hold({ headX: 0.12, headZ: 0.1, squint: 0.65 })), k(1)] },
  cheer: { duration: 1.9, keys: [k(0), k(0.2, hold({ squint: 0.7, eyeOpen: 0.1 })), k(0.8, hold({ squint: 0.7 })), k(1)] },
  clap: { duration: 3.5, keys: [k(0), k(0.15, hold({ squint: 0.65 })), k(0.85, hold({ squint: 0.6 })), k(1)] },

  // small reactions
  smile: { duration: 1.8, keys: [k(0), k(0.25, { squint: 0.55, headZ: 0.08, headX: -0.03, follow: 0.2 }), k(0.75, { squint: 0.55, headZ: 0.08, follow: 0.2 }), k(1)] },
  surprised: { duration: 1.6, keys: [k(0), k(0.12, hold({ eyeOpen: 0.4, headX: -0.18, y: 0.05, s: -0.02 })), k(0.55, hold({ eyeOpen: 0.3, headX: -0.12 })), k(1)] },
  lookAround: { duration: 3.6, keys: [k(0), k(0.2, hold({ headY: -0.32, gazeX: -0.8 })), k(0.45, hold({ headY: -0.32, gazeX: -0.8 })), k(0.65, hold({ headY: 0.32, gazeX: 0.8 })), k(0.85, hold({ headY: 0.32, gazeX: 0.8 })), k(1)] },
  checkWatch: { duration: 3.0, keys: [k(0), k(0.2, hold({ headX: 0.3, headY: 0.18, gazeX: 0.6, gazeY: 0.9, chestY: 0.06 })), k(0.65, hold({ headX: 0.3, headY: 0.18, gazeX: 0.6, gazeY: 0.9, chestY: 0.06 })), k(0.8, hold({ headX: -0.04, eyeOpen: 0.12 })), k(1)] },
  stretch: { duration: 3.0, keys: [k(0), k(0.3, hold({ headX: -0.24, chestX: -0.1, blinkL: 1, blinkR: 1, y: 0.04, s: 0.02 })), k(0.65, hold({ headX: -0.24, chestX: -0.1, blinkL: 1, blinkR: 1, y: 0.04, s: 0.02 })), k(0.85, hold({ headZ: 0.12, squint: 0.4 })), k(1)] },
  glassesOn: { duration: 1.6, keys: [k(0), k(0.3, { gazeY: 0.2, follow: 0.6 }), k(0.55, { blinkL: 0.6, blinkR: 0.6, follow: 0.6 }), k(0.75, { follow: 0.3 }), k(1)] },
  glassesOff: { duration: 1.5, keys: [k(0), k(0.35, { blinkL: 0.5, blinkR: 0.5, follow: 0.5 }), k(0.6, { follow: 0.4 }), k(1)] },
  themeSwap: { duration: 1.6, keys: [k(0), k(0.2, hold({ y: 0.06, ry: 0.35, blinkL: 1, blinkR: 1 })), k(0.5, hold({ y: 0.08, ry: -0.2, eyeOpen: 0.25 })), k(0.75, hold({ squint: 0.45 })), k(1)] },

  // funny faces after a fast drag-spin (he is dizzy, so these ignore the cursor)
  dizzy: { duration: 2.4, keys: [
    k(0), k(0.12, hold({ gazeX: 0.8, gazeY: -0.3, headZ: 0.18 })), k(0.26, hold({ gazeX: 0, gazeY: 0.6, headZ: -0.18 })),
    k(0.4, hold({ gazeX: -0.8, gazeY: -0.3, headZ: 0.16 })), k(0.54, hold({ gazeX: 0, gazeY: -0.6, headZ: -0.14 })),
    k(0.7, hold({ gazeX: 0.6, headZ: 0.1, blinkL: 0.4, blinkR: 0.4 })), k(1),
  ] },
  bugEyes: { duration: 1.8, keys: [k(0), k(0.1, hold({ eyeOpen: 0.6, headX: -0.2, y: 0.05, s: 0.03 })), k(0.7, hold({ eyeOpen: 0.55, headX: -0.16, s: 0.03 })), k(1)] },
  pirate: { duration: 2.0, keys: [k(0), k(0.15, hold({ blinkL: 1, squint: 0.7, headZ: -0.16, headX: 0.08, gazeX: 0.5 })), k(0.7, hold({ blinkL: 1, squint: 0.7, headZ: -0.16, gazeX: 0.5 })), k(1)] },
  sleepyHead: { duration: 2.6, keys: [
    k(0), k(0.2, hold({ blinkL: 0.75, blinkR: 0.75, headX: 0.22, headZ: 0.12 })), k(0.45, hold({ blinkL: 0.9, blinkR: 0.9, headX: 0.3, headZ: 0.16 })),
    k(0.55, hold({ eyeOpen: 0.45, headX: -0.08, y: 0.04 })), k(0.8, hold({ blinkL: 0.6, blinkR: 0.6, headX: 0.12 })), k(1),
  ] },
  sideEye: { duration: 2.0, keys: [k(0), k(0.15, hold({ gazeX: -0.95, headY: 0.22, squint: 0.55, headX: 0.06 })), k(0.75, hold({ gazeX: -0.95, headY: 0.22, squint: 0.55 })), k(1)] },
  shocked: { duration: 1.6, keys: [k(0), k(0.08, hold({ eyeOpen: 0.5, headX: -0.25, y: 0.07, s: -0.04 })), k(0.25, hold({ eyeOpen: 0.45, headY: 0.12 })), k(0.42, hold({ eyeOpen: 0.45, headY: -0.12 })), k(0.6, hold({ eyeOpen: 0.4 })), k(1)] },
  smug: { duration: 2.0, keys: [k(0), k(0.2, hold({ squint: 0.65, headX: -0.14, headZ: 0.16, gazeX: 0.6, gazeY: 0.3 })), k(0.75, hold({ squint: 0.65, headX: -0.14, headZ: 0.16, gazeX: 0.6, gazeY: 0.3 })), k(1)] },
  goofy: { duration: 2.0, keys: [
    k(0), k(0.12, hold({ blinkL: 0.9, eyeOpen: 0.35, headZ: 0.28, gazeY: -0.5 })), k(0.35, hold({ blinkR: 0.9, eyeOpen: 0.35, headZ: -0.28, gazeY: -0.5 })),
    k(0.58, hold({ blinkL: 0.9, eyeOpen: 0.35, headZ: 0.24 })), k(0.8, hold({ squint: 0.5 })), k(1),
  ] },
  stargazer: { duration: 2.2, keys: [k(0), k(0.2, hold({ gazeY: -0.6, headX: -0.3, eyeOpen: 0.3, headZ: 0.08 })), k(0.7, hold({ gazeY: -0.6, gazeX: 0.4, headX: -0.3, eyeOpen: 0.3 })), k(1)] },
  headShakeOff: { duration: 1.8, keys: [
    k(0), k(0.1, hold({ headY: 0.3, blinkL: 1, blinkR: 1 })), k(0.2, hold({ headY: -0.3, blinkL: 1, blinkR: 1 })), k(0.3, hold({ headY: 0.26, blinkL: 1, blinkR: 1 })),
    k(0.4, hold({ headY: -0.22, blinkL: 1, blinkR: 1 })), k(0.55, hold({ eyeOpen: 0.3, headX: -0.06 })), k(0.8, hold({ squint: 0.4 })), k(1),
  ] },
  slump: { duration: 4.0, keys: [k(0), k(0.2, hold({ blinkL: 0.55, blinkR: 0.55, gazeY: 0.6 })), k(0.75, hold({ blinkL: 0.5, blinkR: 0.5, gazeY: 0.5 })), k(0.9, hold({ squint: 0.3 })), k(1)] },

  // dances: he gets bored of being bored (see useAvatarDirector, idle streak)
  bounceGroove: dance(5.2, 16, (i) => ({ y: alt(i, 0.06, 0), headX: alt(i, 0.12, -0.04), squint: 0.4 })),
  sideSway: dance(5.6, 12, (i) => ({ x: alt(i, 0.07, -0.07), headZ: alt(i, -0.14, 0.14), ry: alt(i, 0.16, -0.16), squint: 0.35 })),
  headBanger: dance(4.6, 18, (i) => ({ headX: alt(i, 0.24, -0.08), y: alt(i, 0.02, 0), blinkL: 0.5, blinkR: 0.5 })),
  shoulderShimmy: dance(5.0, 20, (i) => ({ chestY: alt(i, 0.14, -0.14), headY: alt(i, -0.08, 0.08), squint: 0.5 })),
  twirl: { duration: 4.2, keys: [
    k(0), k(0.15, { y: 0.04, follow: 1 }), k(0.4, { ry: Math.PI, y: 0.08, follow: 1 }), k(0.65, { ry: Math.PI * 2, y: 0.04, follow: 1 }),
    k(0.8, { ry: Math.PI * 2, squint: 0.6, headZ: 0.12, follow: 1 }), k(1, { ry: Math.PI * 2 }),
  ] },
  robot: dance(5.4, 10, (i) => ({ headY: [0.3, 0.3, 0, 0, -0.3, -0.3, 0, 0, 0.3, 0][i], headX: [0, 0.12, 0.12, 0, 0, 0.12, 0.12, 0, 0, 0][i], eyeOpen: 0.25 })),
  disco: dance(5.6, 12, (i) => ({ ry: alt(i, 0.3, -0.1), headZ: alt(i, 0.18, -0.06), headX: alt(i, -0.16, 0.02), gazeY: alt(i, -0.6, 0), y: alt(i, 0.05, 0) })),
  moonwalk: { duration: 5.2, keys: [
    k(0), k(0.2, { ry: 0.5, x: 0.04, follow: 1 }), k(0.45, { ry: 0.5, x: -0.14, y: 0.01, follow: 1 }), k(0.7, { ry: 0.5, x: -0.22, follow: 1 }),
    k(0.82, { ry: 0, x: -0.18, y: 0.06, eyeOpen: 0.3, follow: 1 }), k(1),
  ] },
  azonto: dance(5.4, 16, (i) => ({ y: alt(i, 0.05, 0), chestY: [0.12, 0.12, -0.12, -0.12][i % 4], x: [0.03, 0.03, -0.03, -0.03][i % 4], headX: alt(i, 0.1, 0), squint: 0.55 })),
  shakuShaku: dance(5.6, 16, (i) => ({ y: alt(i, 0.03, -0.02), x: [0.05, 0, -0.05, 0][i % 4], headX: 0.18, headY: [0.12, 0, -0.12, 0][i % 4], chestX: 0.06, squint: 0.3 })),

  // section moments
  greet: { duration: 2.4, keys: [k(0), k(0.15, { y: 0.06, eyeOpen: 0.2, follow: 0.6 }), k(0.35, hold({ headX: 0.16, headZ: 0.08, squint: 0.5 })), k(0.55, hold({ headX: 0, blinkR: 1, squint: 0.4 })), k(0.75, hold({ squint: 0.3 })), k(1)] },
  presentText: { duration: 2.4, keys: [k(0), k(0.3, hold({ headY: 0.34, gazeX: 0.85, chestY: 0.1 })), k(0.6, hold({ headY: 0.34, headX: 0.12, gazeX: 0.85, chestY: 0.1 })), k(0.8, hold({ headY: 0.1, squint: 0.4 })), k(1)] },
  watchCards: { duration: 2.6, keys: [k(0), k(0.3, hold({ headY: -0.3, headX: 0.2, gazeX: -0.8, gazeY: 0.8 })), k(0.75, hold({ headY: -0.2, headX: 0.22, gazeX: -0.5, gazeY: 0.8 })), k(1)] },
  juggle: { duration: 2.4, keys: [
    k(0), k(0.15, { gazeY: -0.6, headX: -0.1, y: 0.03, follow: 0.7 }), k(0.3, { gazeY: -0.6, gazeX: 0.5, headX: -0.1, follow: 0.7 }),
    k(0.45, { gazeY: -0.6, gazeX: -0.5, headX: -0.1, y: 0.03, follow: 0.7 }), k(0.6, { gazeY: -0.6, gazeX: 0.5, headX: -0.1, follow: 0.7 }),
    k(0.8, { squint: 0.5, follow: 0.5 }), k(1),
  ] },
};

export const GROUPS = {
  // dust: the arms pass through his body on the rigged character; laugh until that is fixed (owner, 2026-10-30)
  avatarBody: ['laugh'],
  avatarFace: ['shy'],
  emptyClick: ['lookAtClick', 'nodYes', 'shakeNo', 'headTilt', 'doubleTake', 'eyeRoll', 'eyeRollAlt', 'wink', 'hop', 'leanIn', 'shrug', 'laugh', 'suspicious'],
  goodbye: ['bow', 'doubleNod', 'tiltWave', 'winkBye', 'hopBye', 'sideStepBye', 'lookBackBye', 'bounceBye', 'saluteBye', 'spinBye', 'shyBye', 'nodSmileBye'],
  welcomeBack: ['thankBow', 'happyBounce', 'warmNod', 'cheer', 'clap'],
  idle: ['lookAround', 'checkWatch', 'stretch'],
  // headBanger, azonto and shakuShaku were dropped with the rigged character (owner, 2026-10-30)
  dance: ['bounceGroove', 'sideSway', 'shoulderShimmy', 'twirl', 'robot', 'disco', 'moonwalk'],
  funnyFace: ['dizzy', 'bugEyes', 'pirate', 'sleepyHead', 'sideEye', 'shocked', 'smug', 'goofy', 'stargazer', 'headShakeOff', 'slump'],
};

export const STAGE_MOMENTS = { hero: 'greet', about: 'presentText', works: 'watchCards', skills: 'juggle', journey: 'presentText', aibuilds: 'watchCards' };

// Mouth + brows for the rigged character, keyed like the rest (progress 0..1 of the reaction). Reactions not listed
// keep a still mouth (the face already smiles).
const chatter = (t0, t1, n, open, extra = {}) => Array.from({ length: n * 2 + 1 }, (_, i) =>
  k(t0 + ((t1 - t0) * i) / (n * 2), { ...extra, jaw: i % 2 ? open : open * 0.3 }));
const holdMouth = (m, a = 0.15, b = 0.85) => [k(0), k(a, m), k(b, m), k(1)];
const oh = (peak, end, amt = 1) => [k(0), k(peak, { jaw: 0.5 * amt, pucker: 0.35 * amt, worry: 0.4 * amt }), k(end, { jaw: 0.3 * amt, pucker: 0.2 * amt }), k(1)];
const yawn = (a, b) => [k(0), k(a, { jaw: 0.85, pucker: 0.15 }), k(b, { jaw: 0.95 }), k(b + 0.12, { jaw: 0.05 }), k(1)];
const danceMouth = holdMouth({ grin: 0.85, jaw: 0.2 }, 0.1, 0.9);
const MOUTH = {
  laugh: [k(0), ...chatter(0.06, 0.86, 6, 0.7, { grin: 0.9 }), k(1)],
  surprised: oh(0.12, 0.55), shocked: oh(0.08, 0.6, 1.2), bugEyes: oh(0.1, 0.7), doubleTake: [k(0), k(0.45), k(0.55, { jaw: 0.45, pucker: 0.3, worry: 0.3 }), k(0.85, { jaw: 0.1 }), k(1)],
  lookAtClick: [k(0), k(0.15, { jaw: 0.25, pucker: 0.25 }), k(0.6, { jaw: 0.1 }), k(1)],
  cheer: holdMouth({ jaw: 0.7, grin: 1 }, 0.15, 0.8), happyBounce: holdMouth({ jaw: 0.45, grin: 0.9 }, 0.2, 0.7),
  bounceBye: holdMouth({ jaw: 0.3, grin: 0.8 }), clap: holdMouth({ jaw: 0.25, grin: 0.85 }),
  greet: [k(0), k(0.2, { jaw: 0.3, grin: 0.7 }), k(0.4, { jaw: 0.1, grin: 0.7 }), k(0.85, { grin: 0.5 }), k(1)],
  hop: [k(0), k(0.42, { jaw: 0.3, grin: 0.6 }), k(0.8, { grin: 0.4 }), k(1)], hopBye: holdMouth({ jaw: 0.25, grin: 0.7 }),
  stretch: yawn(0.3, 0.6), sleepyHead: yawn(0.2, 0.45),
  dizzy: holdMouth({ pucker: 0.5, frown: 0.3, jaw: 0.15 }), slump: holdMouth({ frown: 0.7, worry: 0.5 }, 0.2, 0.8),
  shrug: holdMouth({ frown: 0.5, press: 0.3, worry: 0.4 }, 0.3, 0.65), shakeNo: holdMouth({ press: 0.5 }, 0.2, 0.8),
  eyeRoll: holdMouth({ press: 0.4, frown: 0.25 }, 0.3, 0.8), eyeRollAlt: holdMouth({ press: 0.4, frown: 0.25 }, 0.25, 0.8),
  suspicious: holdMouth({ scowl: 0.6, pucker: 0.25 }, 0.2, 0.8), juggle: holdMouth({ pucker: 0.3, scowl: 0.3 }),
  leanIn: holdMouth({ grin: 0.4 }, 0.3, 0.75), smile: holdMouth({ grin: 0.8 }, 0.25, 0.75), wink: holdMouth({ grin: 0.6 }, 0.25, 0.55),
  smug: holdMouth({ grin: 0.5, press: 0.25 }, 0.2, 0.75), pirate: holdMouth({ jaw: 0.35, scowl: 0.4, frown: 0.2 }, 0.15, 0.7),
  goofy: [k(0), k(0.12, { jaw: 0.6, pucker: 0.1 }), k(0.35, { pucker: 0.7, jaw: 0.2 }), k(0.58, { jaw: 0.6 }), k(0.8, { grin: 0.6 }), k(1)],
  stargazer: holdMouth({ jaw: 0.3, pucker: 0.3 }, 0.2, 0.7), headShakeOff: [k(0), k(0.1, { press: 0.5 }), k(0.45, { press: 0.4 }), k(0.55, { jaw: 0.3 }), k(0.8, { grin: 0.4 }), k(1)],
  headTilt: holdMouth({ grin: 0.4, worry: 0.3 }, 0.25, 0.75), nodYes: holdMouth({ grin: 0.6 }), doubleNod: holdMouth({ grin: 0.6 }),
  warmNod: holdMouth({ grin: 0.8 }), nodSmileBye: holdMouth({ grin: 0.8 }), thankBow: holdMouth({ grin: 0.7 }),
  saluteBye: holdMouth({ grin: 0.6 }), tiltWave: holdMouth({ grin: 0.7, jaw: 0.15 }), winkBye: holdMouth({ grin: 0.7 }),
  shyBye: holdMouth({ grin: 0.6, worry: 0.3 }), lookBackBye: holdMouth({ grin: 0.7, jaw: 0.15 }), spinBye: holdMouth({ grin: 0.8, jaw: 0.25 }),
  sideStepBye: holdMouth({ grin: 0.7, jaw: 0.15 }), bow: holdMouth({ grin: 0.5 }, 0.3, 0.6),
  presentText: holdMouth({ grin: 0.5, jaw: 0.2 }, 0.3, 0.7), watchCards: holdMouth({ grin: 0.3 }, 0.3, 0.75),
  checkWatch: [k(0), k(0.25, { press: 0.35 }), k(0.65, { pucker: 0.3 }), k(0.85), k(1)], dust: holdMouth({ press: 0.3 }, 0.2, 0.8),
  shy: holdMouth({ grin: 0.6, worry: 0.3 }, 0.18, 0.8), themeSwap: [k(0), k(0.2, { jaw: 0.4, pucker: 0.3 }), k(0.6, { jaw: 0.25, grin: 0.8 }), k(1)],
  bounceGroove: danceMouth, sideSway: danceMouth, shoulderShimmy: danceMouth, twirl: danceMouth, disco: danceMouth,
  moonwalk: danceMouth, robot: holdMouth({ press: 0.35 }, 0.1, 0.9),
};
for (const [name, keys] of Object.entries(MOUTH)) if (ACTIONS[name]) ACTIONS[name].mouth = keys;

const FACE_CHANNELS = ['headX', 'headY', 'headZ', 'chestX', 'chestY', 'gazeX', 'gazeY', 'blinkL', 'blinkR', 'squint', 'eyeOpen', 'y', 'x', 'ry', 's', 'follow'];
const MOUTH_CHANNELS = ['jaw', 'grin', 'frown', 'pucker', 'press', 'worry', 'scowl'];
const CHANNELS = [...FACE_CHANNELS, ...MOUTH_CHANNELS];

export const emptyPose = () => Object.fromEntries(CHANNELS.map((c) => [c, 0]));

const ease = (u) => u * u * (3 - 2 * u);

const sampleKeys = (keys, u, channels, out) => {
  let i = 1;
  while (i < keys.length - 1 && keys[i][0] < u) i++;
  const [t0, a] = keys[i - 1];
  const [t1, b] = keys[i];
  const w = ease(Math.min(Math.max((u - t0) / Math.max(t1 - t0, 1e-6), 0), 1));
  for (const c of channels) out[c] = (a[c] ?? 0) + ((b[c] ?? 0) - (a[c] ?? 0)) * w;
};

// Writes the action's pose at progress u (0..1) into out (face/body keys, then its mouth keys if it has any).
export function sampleAction(action, u, out) {
  sampleKeys(action.keys, u, FACE_CHANNELS, out);
  if (action.mouth) sampleKeys(action.mouth, u, MOUTH_CHANNELS, out);
  else MOUTH_CHANNELS.forEach((c) => { out[c] = 0; });
  return out;
}

// Random pick that never repeats until the whole group has played (shuffle bag).
export function createPicker() {
  const bags = {};
  let last = null;
  return (group) => {
    if (!bags[group]?.length) {
      bags[group] = [...GROUPS[group]].sort(() => Math.random() - 0.5);
      if (bags[group].length > 1 && bags[group][0] === last) bags[group].push(bags[group].shift());
    }
    last = bags[group].shift();
    return last;
  };
}
