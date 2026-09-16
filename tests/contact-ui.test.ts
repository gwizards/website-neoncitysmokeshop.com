import { afterEach, expect, it, vi } from 'vitest';

async function mount() {
  vi.resetModules();
  let options: Record<string, any> = {};
  const status = { textContent: 'Loading secure form…' };
  const button = { disabled: true };
  const form = { querySelector: () => button, addEventListener: vi.fn() };
  const widget = { dataset: { sitekey: 'test-sitekey' } };
  const browser = { turnstile: { render: vi.fn((_el, config) => { options = config; return 'widget'; }) }, neonTurnstileReady: undefined as undefined | (() => void) };
  vi.stubGlobal('document', {
    querySelector: (selector: string) => ({ '#contact-form': form, '#form-status': status, '#turnstile-widget': widget })[selector],
    createElement: () => ({}), head: { append: vi.fn() },
  });
  vi.stubGlobal('window', browser);
  await import('../src/scripts/contact');
  browser.neonTurnstileReady!();
  return { options, status, button };
}
afterEach(() => vi.unstubAllGlobals());
it('uses a compact widget that also fits after resizing to a narrow form', async () => {
  const { options } = await mount();
  expect(options.size).toBe('compact');
});
it('explains token expiry and clears the notice after successful verification', async () => {
  const { options, status, button } = await mount();
  options.callback('token');
  expect(button.disabled).toBe(false);
  options['expired-callback']();
  expect(button.disabled).toBe(true);
  expect(status.textContent).toContain('expired');
  options.callback('new-token');
  expect(status.textContent).toBe('');
  expect(button.disabled).toBe(false);
});
it('clears a recovered verification error instead of leaving a stale failure notice', async () => {
  const { options, status, button } = await mount();
  options['error-callback']();
  expect(status.textContent).toContain('could not load');
  options.callback('recovered-token');
  expect(status.textContent).toBe('');
  expect(button.disabled).toBe(false);
});
