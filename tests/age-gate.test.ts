import { afterEach, expect, it, vi } from 'vitest';

async function mount(saved = false) {
  vi.resetModules();
  let click = () => {};
  const gate = { hidden: false, addEventListener: vi.fn(), querySelectorAll: () => [] };
  const confirm = { focus: vi.fn(), addEventListener: (_name: string, handler: () => void) => { click = handler; } };
  const main = { focus: vi.fn() };
  const regions = [{ setAttribute: vi.fn(), removeAttribute: vi.fn() }, { setAttribute: vi.fn(), removeAttribute: vi.fn() }];
  const classes = new Set<string>();
  const store = new Map<string,string>(saved ? [['neon-age-confirmed','yes']] : []);
  const dispatch = vi.fn();
  vi.stubGlobal('document', {
    activeElement: confirm,
    body: { classList: { add: (v: string) => classes.add(v), remove: (v: string) => classes.delete(v) } },
    querySelector: (selector: string) => selector === '#age-gate' ? gate : selector === '#age-confirm' ? confirm : main,
    querySelectorAll: () => regions,
  });
  vi.stubGlobal('sessionStorage', { getItem: (k: string) => store.get(k) || null, setItem: (k: string,v: string) => store.set(k,v) });
  vi.stubGlobal('window', { dispatchEvent: dispatch });
  vi.stubGlobal('Event', class { constructor(public type: string) {} });
  await import('../src/scripts/age-gate');
  return { gate, confirm, main, regions, classes, store, dispatch, click: () => click() };
}

afterEach(() => vi.unstubAllGlobals());

it('locks page regions and focuses confirmation on a new session', async () => {
  const page = await mount();
  expect(page.classes.has('age-locked')).toBe(true);
  expect(page.regions.every(region => region.setAttribute.mock.calls[0]?.[0] === 'inert')).toBe(true);
  expect(page.confirm.focus).toHaveBeenCalledOnce();
});

it('stores session confirmation, unlocks the page, and announces acceptance', async () => {
  const page = await mount();
  page.click();
  expect(page.gate.hidden).toBe(true);
  expect(page.store.get('neon-age-confirmed')).toBe('yes');
  expect(page.classes.has('age-confirmed')).toBe(true);
  expect(page.regions.every(region => region.removeAttribute.mock.calls[0]?.[0] === 'inert')).toBe(true);
  expect(page.main.focus).toHaveBeenCalledWith({ preventScroll: true });
  expect(page.dispatch).toHaveBeenCalledOnce();
});

it('reuses confirmation only for the current browser session', async () => {
  const page = await mount(true);
  expect(page.gate.hidden).toBe(true);
  expect(page.classes.has('age-confirmed')).toBe(true);
  expect(page.confirm.focus).not.toHaveBeenCalled();
});
