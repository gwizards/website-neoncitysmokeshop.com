export {};

const video = document.querySelector<HTMLVideoElement>('#contact-video')!;
const toggle = document.querySelector<HTMLButtonElement>('#contact-video-toggle')!;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
let ageConfirmed = document.body.classList.contains('age-confirmed');
let visible = false;
let userPaused = false;
let failed = false;

const updateLabel = () => {
  toggle.textContent = video.paused ? 'Play contact background video' : 'Pause contact background video';
};

const canAutoplay = () => ageConfirmed
  && visible
  && !document.hidden
  && !userPaused
  && !failed
  && !reducedMotion.matches
  && !connection?.saveData
  && !['slow-2g', '2g'].includes(connection?.effectiveType || '');

const start = async () => {
  if (!video.src) video.src = video.dataset.src!;
  try { await video.play(); } catch { updateLabel(); }
};

toggle.hidden = false;
toggle.addEventListener('click', () => {
  if (video.paused) {
    userPaused = false;
    void start();
  } else {
    userPaused = true;
    video.pause();
  }
});
video.addEventListener('play', updateLabel);
video.addEventListener('pause', updateLabel);
video.addEventListener('error', () => {
  failed = true;
  video.pause();
  video.removeAttribute('src');
  video.load();
  toggle.hidden = true;
});

new IntersectionObserver(entries => {
  visible = entries[0].isIntersecting;
  if (!visible) video.pause();
  else if (canAutoplay()) void start();
}, { threshold: 0.05 }).observe(video);

document.addEventListener('visibilitychange', () => {
  if (document.hidden) video.pause();
  else if (canAutoplay()) void start();
});
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) video.pause();
  else if (canAutoplay()) void start();
});
window.addEventListener('neon-age-accepted', () => {
  ageConfirmed = true;
  if (canAutoplay()) void start();
});
