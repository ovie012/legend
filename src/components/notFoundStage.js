// The 404 stage, in avatar metres (model units; he is 1.905 tall). Ground = y 0, the digits' front faces at z = front,
// yaw 0 = facing +z (the camera). Sized to the Mixamo clips (designs/avatar-work/out/clips_404/measure.json):
// "Climbing To Top" pulls up onto a 1.46 m ledge and "Jumping Down" steps off 1.30 m, so the digits are 1.4 m tall
// (each clip's rise/drop is matched to it in notFoundMotion.js).
export const BLOCK = {
  height: 1.4,          // digit height: the climb's ledge
  width: 1.0,           // one digit
  stroke: 0.31,         // chunky strokes
  depth: 1.25,          // front to back: the climb ends ~0.7 m in from the edge, and he sits on the front edge
  gap: 0.3,             // between digits
  front: 0,             // z of the front faces
  bevel: 0.04,          // soft rounded edges
  radius: { zeroOuter: 0.2, zeroInner: 0.09, corner: 0.08, inner: 0.035 },
  four: { bar: 0.36 },  // height of the 4's crossbar (bottom edge)
};

const H = BLOCK.height;
const STEP = BLOCK.width + BLOCK.gap;
// chair-style sitting clips seat the hips 0.43 m above the feet: on the ledge the body is lowered by that much, so the
// thighs rest on the top and the shins hang down the front of the "0"
export const SEAT_DROP = 0.43;

// Where he stands / sits (group origin = the point under his hips; y = the floor he is on)
export const SPOTS = {
  seat: { x: 0, y: H - SEAT_DROP, z: BLOCK.front - 0.32, yaw: 0 },       // sitting on the front edge of the "0"
  jumpZ: BLOCK.front - 0.45,                                             // hips when he crouches at the edge to jump
  climbFrontZ: BLOCK.front + 0.55,                                       // hips at the wall when the climb starts
  climbBackZ: BLOCK.front - BLOCK.depth - 0.55,                          // the same, from behind (facing the camera)
  dance: { x: 0, z: 1.75 },
  wave: { x: 0.25, z: 2.7 },
  sideX: 1 * STEP + BLOCK.width / 2 + 0.45,                              // walking round the outside of the row
  behindZ: BLOCK.front - BLOCK.depth - 0.7,
};
