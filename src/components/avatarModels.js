// The avatar's outfit files (Step A item 3, lighter 3D): only the current theme's outfit loads with the page; the other
// one loads when the visitor reaches for the theme button (hover, keyboard focus, touch) or switches theme.
// Phones get versions with the normal map and the shirt pattern at 1K (the face and skin texture is unchanged):
// built from the live files by designs/avatar-work/scripts/phone_textures.mjs.
const PHONE = typeof window !== 'undefined' && window.matchMedia('(max-width: 800px)').matches;

export const MODELS = PHONE
  ? { light: '/3d/legend_brown_m.glb', dark: '/3d/legend_white_m.glb' }
  : { light: '/3d/legend_brown.glb', dark: '/3d/legend_white.glb' };

// the small versions, for the mini companion on the other pages (always small on screen)
export const SMALL_MODELS = { light: '/3d/legend_brown_m.glb', dark: '/3d/legend_white_m.glb' };

const THEME_BUTTON = '.light-dark-mode';

// calls back (once) when the visitor is about to use the theme button; returns a clean-up function
export function onThemeIntent(callback) {
  const events = ['pointerover', 'focusin', 'touchstart'];
  const handler = (e) => {
    if (!e.target.closest?.(THEME_BUTTON)) return;
    done();
    callback();
  };
  const done = () => events.forEach((ev) => document.removeEventListener(ev, handler, true));
  events.forEach((ev) => document.addEventListener(ev, handler, { capture: true, passive: true }));
  return done;
}
