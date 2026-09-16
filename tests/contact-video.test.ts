import { afterEach, expect, it, vi } from 'vitest';

async function mount({ ageConfirmed = false, reduced = false, saveData = false } = {}) {
  vi.resetModules();
  const listeners: Record<string, () => void> = {};
  const documentListeners: Record<string, () => void> = {};
  const windowListeners: Record<string, () => void> = {};
  let intersect = (_entries: Array<{ isIntersecting: boolean }>) => {};
  const video = {
    src: '', dataset: { src: '/video/original-colored-smoke.mp4' }, paused: true,
    play: vi.fn(async () => { video.paused = false; listeners.play?.(); }),
    pause: vi.fn(() => { video.paused = true; listeners.pause?.(); }),
    addEventListener: (name: string, handler: () => void) => { listeners[name] = handler; },
    removeAttribute: vi.fn(), load: vi.fn(),
  };
  const toggle = { hidden: true, textContent: '', addEventListener: vi.fn() };
  vi.stubGlobal('document', {
    hidden: false,
    body: { classList: { contains: () => ageConfirmed } },
    querySelector: (selector: string) => selector === '#contact-video' ? video : toggle,
    addEventListener: (name: string, handler: () => void) => { documentListeners[name] = handler; },
  });
  vi.stubGlobal('window', {
    matchMedia: () => ({ matches: reduced, addEventListener: vi.fn() }),
    addEventListener: (name: string, handler: () => void) => { windowListeners[name] = handler; },
  });
  vi.stubGlobal('navigator', { connection: { saveData } });
  vi.stubGlobal('IntersectionObserver', class {
    constructor(callback: typeof intersect) { intersect = callback; }
    observe() {}
  });
  await import('../src/scripts/contact-video');
  return {
    video,
    toggle,
    intersect: (visible: boolean) => intersect([{ isIntersecting: visible }]),
    acceptAge: () => windowListeners['neon-age-accepted'](),
  };
}

afterEach(() => vi.unstubAllGlobals());

it('loads the source contact video only when visible after age confirmation', async () => {
  const page = await mount();
  page.intersect(true);
  expect(page.video.src).toBe('');
  page.acceptAge();
  await Promise.resolve();
  expect(page.video.src).toBe('/video/original-colored-smoke.mp4');
  expect(page.video.play).toHaveBeenCalledOnce();
});

it.each([{ reduced: true }, { saveData: true }])('keeps the contact poster for %j', async settings => {
  const page = await mount({ ageConfirmed: true, ...settings });
  page.intersect(true);
  await Promise.resolve();
  expect(page.video.src).toBe('');
  expect(page.video.play).not.toHaveBeenCalled();
});
