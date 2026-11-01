// Tiny store for real loading progress. Anything the first screen depends on registers a task
// and reports 0..1; the preloader shows the average. Kept outside React state so reporting
// from the 3D loader doesn't re-render the app on every chunk.
const tasks = new Map();
const listeners = new Set();

const emit = () => {
  const values = [...tasks.values()];
  const total = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 1;
  listeners.forEach((fn) => fn(total));
};

export function expectTask(name) {
  if (!tasks.has(name)) {
    tasks.set(name, 0);
    emit();
  }
}

export function reportTask(name, value) {
  tasks.set(name, Math.min(Math.max(value, tasks.get(name) ?? 0), 1));
  emit();
}

export function onProgress(fn) {
  listeners.add(fn);
  emit();
  return () => listeners.delete(fn);
}

// Page-level tasks every route needs: the document and the web fonts.
expectTask('page');
expectTask('fonts');
if (typeof window !== 'undefined') {
  if (document.readyState === 'complete') reportTask('page', 1);
  else window.addEventListener('load', () => reportTask('page', 1), { once: true });
  document.fonts?.ready.then(() => reportTask('fonts', 1));
}
