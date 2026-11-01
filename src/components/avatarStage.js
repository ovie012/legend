// Live facts about the homepage avatar for page UI outside the 3D canvas (Step A item 5: hint bubble, Easter eggs).
// The scene writes them every frame; the page reads them. Nothing here touches React state.
export const avatarStage = {
  head: { x: 0, y: 0, on: false },   // his head on screen, px
  present: false,                    // on the page (not gone below the footer)
};

// The hidden interactions visitors can find. Found ones are remembered in this browser only (localStorage).
export const EGGS = [
  { id: 'dance', name: 'The dance', how: 'Click him 3 times quickly' },
  { id: 'glasses', name: 'Glasses on, glasses off', how: 'Click him 4 times quickly' },
  { id: 'spin', name: 'The spin', how: 'Grab him and flick sideways' },
  { id: 'reading', name: 'The reader', how: 'Rest the pointer on the intro text' },
  { id: 'shy', name: 'Shy guy', how: 'Click his face' },
];
const KEY = 'avatarEggs';

export function foundEggs() {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(v) ? v.filter((id) => EGGS.some((e) => e.id === id)) : [];
  } catch { return []; }
}

// records a find and tells the page (event 'legend:egg', detail = { id, found, isNew })
export function findEgg(id) {
  const found = foundEggs();
  const isNew = !found.includes(id);
  if (isNew) {
    found.push(id);
    try { localStorage.setItem(KEY, JSON.stringify(found)); } catch { /* private mode: count this visit only */ }
  }
  window.dispatchEvent(new CustomEvent('legend:egg', { detail: { id, found, isNew } }));
}
