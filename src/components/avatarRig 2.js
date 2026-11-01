// Generated from the Blender alignment pass (photo -> mesh fit + face landmarks).
// Positions are in the avatar's object space; eye values are in photo pixels.
export const AVATAR_RIG = {
  photoSize: [2561, 2502],
  bounds: { min: [-0.9302, -1.0003, -0.5127], max: [0.919, 0.9938, 0.5114] },
  neck: { pivot: [-0.1412, 0.2057, 0.0608], band: [0.1357, 0.2857] },
  chest: { pivot: [0.0, -0.8503, -0.0579], band: [-0.9003, 0.1057] },
  // colour transfer for the AI-painted texture so it matches the photo (linear space)
  color: {
    head: { saturation: 0.4, gain: [2.551, 2.188, 1.977] },
    body: { saturation: 1.1, gain: [1.321, 1.357, 1.399] },
  },
  eyeY: 0.651,
  eyes: [
  {
    center: [1031.9, 475.4],
    half: [53.8, 16.5],
    angle: 2.84,
    irisRadius: 23.66,
    sclera: [0.541, 0.406, 0.278],
    iris: [0.165, 0.133, 0.153],
    lid: [0.256, 0.188, 0.181],
  },
  {
    center: [1295.7, 479.8],
    half: [56.2, 14.2],
    angle: 0.06,
    irisRadius: 23.35,
    sclera: [0.482, 0.404, 0.306],
    iris: [0.18, 0.157, 0.176],
    lid: [0.362, 0.288, 0.276],
  },
  ],
};
