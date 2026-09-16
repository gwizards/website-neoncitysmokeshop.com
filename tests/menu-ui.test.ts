import { afterEach, expect, it, vi } from 'vitest';

async function mount() {
  vi.resetModules();
  const classes = new Set<string>();
  const header = {
    classList: {
      add: (name: string) => classes.add(name),
      toggle: (name: string, force: boolean) => force ? classes.add(name) : classes.delete(name),
    },
  };
  const attributes = new Map([['aria-expanded', 'false']]);
  const label = { textContent: 'Menu' };
  const toggleListeners: Record<string, () => void> = {};
  const toggle = {
    hidden: true,
    focus: vi.fn(),
    setAttribute: (name: string, value: string) => attributes.set(name, value),
    getAttribute: (name: string) => attributes.get(name),
    querySelector: () => label,
    addEventListener: (type: string, callback: () => void) => { toggleListeners[type] = callback; },
  };
  const nav = { addEventListener: vi.fn() };
  const documentListeners: Record<string, (event: { key: string }) => void> = {};
  const mediaListeners: Array<(event: { matches: boolean }) => void> = [];
  vi.stubGlobal('document', {
    querySelector: (selector: string) => ({ '.site-header': header, '.menu-toggle': toggle, '#primary-nav': nav })[selector],
    addEventListener: (type: string, callback: (event: { key: string }) => void) => { documentListeners[type] = callback; },
  });
  vi.stubGlobal('window', {
    matchMedia: () => ({ addEventListener: (_type: string, callback: (event: { matches: boolean }) => void) => mediaListeners.push(callback) }),
  });
  await import('../src/scripts/menu');
  return { classes, toggle, label, attributes, click: () => toggleListeners.click(), escape: () => documentListeners.keydown({ key: 'Escape' }), desktop: () => mediaListeners[0]({ matches: true }) };
}

afterEach(() => vi.unstubAllGlobals());

it('initializes the compact navigation and exposes its menu button', async () => {
  const page = await mount();
  expect(page.classes.has('nav-ready')).toBe(true);
  expect(page.toggle.hidden).toBe(false);
  expect(page.attributes.get('aria-expanded')).toBe('false');
});

it('opens, closes with Escape, and restores focus to the toggle', async () => {
  const page = await mount();
  page.click();
  expect(page.classes.has('menu-open')).toBe(true);
  expect(page.attributes.get('aria-expanded')).toBe('true');
  expect(page.label.textContent).toBe('Close');
  page.escape();
  expect(page.classes.has('menu-open')).toBe(false);
  expect(page.attributes.get('aria-expanded')).toBe('false');
  expect(page.toggle.focus).toHaveBeenCalledOnce();
});

it('closes an open mobile menu when the desktop breakpoint is crossed', async () => {
  const page = await mount();
  page.click();
  page.desktop();
  expect(page.classes.has('menu-open')).toBe(false);
});
