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
let verificationMessage = true;
let formIsNearViewport = false;
let ageConfirmed = document.body.classList.contains('age-confirmed');
let turnstileRequested = false;
const showVerification = (message: string) => {
  if (!busy) { verificationMessage = true; status.textContent = message; }
};
window.neonTurnstileReady = () => {
  widgetId = window.turnstile?.render(widget, {
    sitekey: widget.dataset.sitekey, action: 'support', theme: 'dark', size: 'compact',
    callback: (value: string) => { token = value; button.disabled = busy; if (!busy && verificationMessage) { status.textContent = ''; verificationMessage = false; } },
    'before-interactive-callback': () => { if (verificationMessage) showVerification('Please complete the security verification above.'); },
    'expired-callback': () => { token = ''; button.disabled = true; showVerification('Verification expired. Please complete the security verification again.'); },
    'error-callback': () => { token = ''; button.disabled = true; showVerification('Verification could not load. Refresh this page or use the email link.'); },
  });
};
const loadTurnstile = () => {
  if (turnstileRequested || !ageConfirmed || !formIsNearViewport) return;
  turnstileRequested = true;
  status.textContent = 'Loading secure form…';
  const script = document.createElement('script');
  script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=neonTurnstileReady&render=explicit';
  script.async = true;
  script.onerror = () => { status.textContent = 'Verification is unavailable. Please use the email link.'; };
  document.head.append(script);
};

window.addEventListener('neon-age-accepted', () => {
  ageConfirmed = true;
  loadTurnstile();
});

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    formIsNearViewport = true;
    observer.disconnect();
    loadTurnstile();
  }, { rootMargin: '500px 0px' });
  observer.observe(form);
} else {
  formIsNearViewport = true;
  loadTurnstile();
}
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (busy || !token || !form.reportValidity()) return;
  busy = true; verificationMessage = false; button.disabled = true; form.setAttribute('aria-busy', 'true'); status.textContent = 'Sending your message…';
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
