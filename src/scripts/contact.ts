export {};
interface Turnstile { render(el: HTMLElement, options: Record<string, unknown>): string; reset(id: string): void }
declare global { interface Window { turnstile?: Turnstile; neonTurnstileReady?: () => void } }
const form = document.querySelector<HTMLFormElement>('#contact-form')!;
const status = document.querySelector<HTMLElement>('#form-status')!;
const button = form.querySelector<HTMLButtonElement>('button[type=submit]')!;
const widget = document.querySelector<HTMLElement>('#turnstile-widget')!;
let token = '';
let widgetId: string | undefined;
let busy = false;
window.neonTurnstileReady = () => {
  widgetId = window.turnstile?.render(widget, {
    sitekey: widget.dataset.sitekey, action: 'support', theme: 'dark', size: window.matchMedia('(max-width: 380px)').matches ? 'compact' : 'flexible',
    callback: (value: string) => { token = value; button.disabled = busy; if (!busy && ['Loading secure form…', 'Please complete the security verification above.'].includes(status.textContent || '')) status.textContent = ''; },
    'before-interactive-callback': () => { status.textContent = 'Please complete the security verification above.'; },
    'expired-callback': () => { token = ''; button.disabled = true; },
    'error-callback': () => { token = ''; button.disabled = true; status.textContent = 'Verification could not load. Refresh this page or use the email link.'; },
  });
};
const script = document.createElement('script');
script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=neonTurnstileReady&render=explicit';
script.async = true;
script.onerror = () => { status.textContent = 'Verification is unavailable. Please use the email link.'; };
document.head.append(script);
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (busy || !token || !form.reportValidity()) return;
  busy = true; button.disabled = true; form.setAttribute('aria-busy', 'true'); status.textContent = 'Sending your message…';
  const data = new FormData(form);
  const payload = { name: data.get('name'), email: data.get('email'), topic: data.get('topic'), message: data.get('message'), website: data.get('website'), consent: data.get('consent') === 'on', token };
  try {
    const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: AbortSignal.timeout(25000) });
    const result = await response.json();
    if (!response.ok || result.ok !== true) {
      status.textContent = response.status === 429 ? 'Too many attempts. Please wait a minute before trying again.' : 'Your message was not sent. Please retry or use the email link.';
    } else { form.reset(); status.textContent = 'Your message has been sent. Thank you for getting in touch.'; }
  } catch { status.textContent = 'Delivery could not be confirmed. Please retry or use the email link.'; }
  finally { busy = false; token = ''; button.disabled = true; form.removeAttribute('aria-busy'); if (widgetId !== undefined) window.turnstile?.reset(widgetId); }
});
