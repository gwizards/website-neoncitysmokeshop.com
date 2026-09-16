export {};

const gate = document.querySelector<HTMLElement>('#age-gate');
const confirm = document.querySelector<HTMLButtonElement>('#age-confirm');
const pageRegions = Array.from(document.querySelectorAll<HTMLElement>('header, main, footer, .preview, .skip'));

if (gate && confirm) {
  const closeGate = () => {
    gate.hidden = true;
    document.body.classList.remove('age-locked');
    document.body.classList.add('age-confirmed');
    pageRegions.forEach(region => region.removeAttribute('inert'));
    window.dispatchEvent(new Event('neon-age-accepted'));
  };

  if (sessionStorage.getItem('neon-age-confirmed') === 'yes') {
    closeGate();
  } else {
    document.body.classList.add('age-locked');
    pageRegions.forEach(region => region.setAttribute('inert', ''));
    confirm.focus();
    confirm.addEventListener('click', () => {
      sessionStorage.setItem('neon-age-confirmed', 'yes');
      closeGate();
      document.querySelector<HTMLElement>('#main')?.focus();
    });
    gate.addEventListener('keydown', event => {
      if (event.key !== 'Tab') return;
      const controls = Array.from(gate.querySelectorAll<HTMLElement>('button, a[href]'));
      if (!controls.length) return;
      const first = controls[0];
      const last = controls.at(-1)!;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
  }
}
