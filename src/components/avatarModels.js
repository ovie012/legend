// The avatar's outfit files (Step A item 3, lighter 3D): only the current theme's outfit loads with the page; the other
// one loads when the visitor reaches for the theme button (hover, keyboard focus, touch) or switches theme.
// Phones get versions with the normal map and the shirt pattern at 1K (the face and skin texture is unchanged):
// built from the live files by designs/avatar-work/scripts/phone_textures.mjs.
// The files live in src/assets/3d: the build names each one after its content (/assets/legend_brown-<hash>.glb), so
// browsers may keep them for a year (vercel.json) and a changed model always arrives under a new name.
import brown from '../assets/3d/legend_brown.glb?url';
import white from '../assets/3d/legend_white.glb?url';
import brownSmall from '../assets/3d/legend_brown_m.glb?url';
import whiteSmall from '../assets/3d/legend_white_m.glb?url';
import animsStart from '../assets/3d/legend_anims_start.glb?url';
import animsLater from '../assets/3d/legend_anims_later.glb?url';
import anims404 from '../assets/3d/legend_anims_404.glb?url';

const PHONE = typeof window !== 'undefined' && window.matchMedia('(max-width: 800px)').matches;

export const MODELS = PHONE ? { light: brownSmall, dark: whiteSmall } : { light: brown, dark: white };

// the small versions, for the mini companion on the other pages (always small on screen)
export const SMALL_MODELS = { light: brownSmall, dark: whiteSmall };

// his moves in two parts (avatarClipStore.js) + the 404 page's own
export const ANIMS = { start: animsStart, later: animsLater, notFound: anims404 };

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
