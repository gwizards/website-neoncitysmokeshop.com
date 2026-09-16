export {};

const header = document.querySelector<HTMLElement>('.site-header');
const toggle = document.querySelector<HTMLButtonElement>('.menu-toggle');
const nav = document.querySelector<HTMLElement>('#primary-nav');

if (header && toggle && nav) {
  const setOpen = (open: boolean) => {
    header.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.querySelector<HTMLElement>('span:last-child')!.textContent = open ? 'Close' : 'Menu';
  };

  header.classList.add('nav-ready');
  toggle.hidden = false;
  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', event => {
    if ((event.target as Element).closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || toggle.getAttribute('aria-expanded') !== 'true') return;
    setOpen(false);
    toggle.focus();
  });
  window.matchMedia('(min-width: 901px)').addEventListener('change', event => {
    if (event.matches) setOpen(false);
  });
}
