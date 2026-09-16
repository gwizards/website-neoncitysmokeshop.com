import { afterEach, expect, it, vi } from 'vitest';

async function mount({ reduced = false, saveData = false, blocked = false, ageConfirmed = true } = {}) {
  vi.resetModules();
  const listeners: Record<string, () => void> = {};
  let click = () => {};
  let intersect = (_entries: unknown[]) => {};
  const video = {
    src: '', dataset: { src: '/video/neon-final.mp4' }, paused: true,
    play: vi.fn(async () => { if (blocked) throw new Error('Autoplay blocked'); video.paused = false; listeners.play?.(); }),
    pause: vi.fn(() => { video.paused = true; listeners.pause?.(); }),
    addEventListener: (name: string, handler: () => void) => { listeners[name] = handler; },
    removeAttribute: (name: string) => { if (name === 'src') video.src = ''; },
    load: vi.fn(),
  };
  const toggle = { hidden: true, textContent: 'Play background video', addEventListener: (_name: string, handler: () => void) => { click = handler; } };
  const windowListeners: Record<string, () => void> = {};
  vi.stubGlobal('document', { hidden: false, body: { classList: { contains: () => ageConfirmed } }, querySelector: (id: string) => id === '#hero-video' ? video : toggle, addEventListener: vi.fn() });
  vi.stubGlobal('window', { matchMedia: () => ({ matches: reduced, addEventListener: vi.fn() }), addEventListener: (name: string, handler: () => void) => { windowListeners[name] = handler; } });
  vi.stubGlobal('navigator', { connection: { saveData } });
  vi.stubGlobal('IntersectionObserver', class {
    constructor(callback: typeof intersect) { intersect = callback; }
    observe() {}
  });
  await import('../src/scripts/hero-video');
  return { video, toggle, click: () => click(), intersect: (visible: boolean) => intersect([{ isIntersecting: visible }]), fail: () => listeners.error(), acceptAge: () => windowListeners['neon-age-accepted']() };
}

afterEach(() => vi.unstubAllGlobals());
it.each([{ reduced: true }, { saveData: true }])('does not load video automatically for %j', async settings => {
  const page = await mount(settings); page.intersect(true);
  expect(page.video.src).toBe(''); expect(page.video.play).not.toHaveBeenCalled();
  expect(page.toggle.hidden).toBe(false);
  page.click(); await Promise.resolve();
  expect(page.video.src).toBe('/video/neon-final.mp4');
});
it('does not fetch age-restricted hero footage until age is confirmed', async () => {
  const page = await mount({ ageConfirmed: false });
  page.intersect(true);
  expect(page.video.src).toBe('');
  page.acceptAge(); await Promise.resolve();
  expect(page.video.src).toBe('/video/neon-final.mp4');
  expect(page.video.play).toHaveBeenCalledOnce();
});
it('pauses outside the viewport and preserves an explicit user pause', async () => {
  const page = await mount(); page.intersect(true); await Promise.resolve();
  expect(page.toggle.textContent).toBe('Pause background video');
  page.intersect(false); expect(page.video.paused).toBe(true);
  page.intersect(true); await Promise.resolve();
  page.click(); expect(page.video.paused).toBe(true);
  page.intersect(false); page.intersect(true);
  expect(page.video.paused).toBe(true);
});
it('keeps a usable play control when autoplay is rejected', async () => {
  const page = await mount({ blocked: true }); page.intersect(true); await Promise.resolve();
  expect(page.video.paused).toBe(true); expect(page.toggle.textContent).toBe('Play background video');
  expect(page.toggle.hidden).toBe(false);
});
it('removes a failed video source and leaves the static poster', async () => {
  const page = await mount(); page.intersect(true); await Promise.resolve(); page.fail();
  expect(page.video.src).toBe(''); expect(page.toggle.hidden).toBe(true);
  page.intersect(true); expect(page.video.src).toBe('');
});
