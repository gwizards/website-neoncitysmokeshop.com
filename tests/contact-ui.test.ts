import { afterEach, expect, it, vi } from 'vitest';

async function mount({ ageConfirmed = false } = {}) {
  vi.resetModules();
  let options: Record<string, any> = {};
  let intersectionCallback: (entries: Array<{ isIntersecting: boolean }>) => void = () => {};
  const listeners: Record<string, () => void> = {};
  const status = { textContent: 'Security verification loads when this form is ready to use.' };
  const button = { disabled: true };
  const form = { querySelector: () => button, addEventListener: vi.fn() };
  const widget = { dataset: { sitekey: 'test-sitekey' } };
  const append = vi.fn();
  const browser = {
    turnstile: { render: vi.fn((_el, config) => { options = config; return 'widget'; }) },
    neonTurnstileReady: undefined as undefined | (() => void),
    addEventListener: vi.fn((type: string, callback: () => void) => { listeners[type] = callback; }),
    IntersectionObserver: true,
  };
  class Observer {
    observe = vi.fn();
    disconnect = vi.fn();
    constructor(callback: typeof intersectionCallback) { intersectionCallback = callback; }
  }
  vi.stubGlobal('document', {
    body: { classList: { contains: () => ageConfirmed } },
    querySelector: (selector: string) => ({ '#contact-form': form, '#form-status': status, '#turnstile-widget': widget })[selector],
    createElement: () => ({}), head: { append },
  });
  vi.stubGlobal('window', browser);
  vi.stubGlobal('IntersectionObserver', Observer);
  await import('../src/scripts/contact');
  const enterViewport = () => intersectionCallback([{ isIntersecting: true }]);
  const acceptAge = () => listeners['neon-age-accepted']();
  const render = () => browser.neonTurnstileReady!();
  return { get options() { return options; }, status, button, append, enterViewport, acceptAge, render };
}
afterEach(() => vi.unstubAllGlobals());

it('does not request third-party verification before age acceptance and form proximity', async () => {
  const page = await mount();
  expect(page.append).not.toHaveBeenCalled();
  page.enterViewport();
  expect(page.append).not.toHaveBeenCalled();
  page.acceptAge();
  expect(page.append).toHaveBeenCalledOnce();
  page.acceptAge();
  expect(page.append).toHaveBeenCalledOnce();
});

it('loads after form proximity when age was already confirmed', async () => {
  const page = await mount({ ageConfirmed: true });
  page.enterViewport();
  expect(page.append).toHaveBeenCalledOnce();
});

it('uses a compact widget that also fits after resizing to a narrow form', async () => {
  const page = await mount({ ageConfirmed: true });
  page.enterViewport();
  page.render();
  expect(page.options.size).toBe('compact');
});

it('explains token expiry and clears the notice after successful verification', async () => {
  const page = await mount({ ageConfirmed: true });
  page.enterViewport();
  page.render();
  page.options.callback('token');
  expect(page.button.disabled).toBe(false);
  page.options['expired-callback']();
  expect(page.button.disabled).toBe(true);
  expect(page.status.textContent).toContain('expired');
  page.options.callback('new-token');
  expect(page.status.textContent).toBe('');
  expect(page.button.disabled).toBe(false);
});

it('clears a recovered verification error instead of leaving a stale failure notice', async () => {
  const page = await mount({ ageConfirmed: true });
  page.enterViewport();
  page.render();
  page.options['error-callback']();
  expect(page.status.textContent).toContain('could not load');
  page.options.callback('recovered-token');
  expect(page.status.textContent).toBe('');
  expect(page.button.disabled).toBe(false);
});
