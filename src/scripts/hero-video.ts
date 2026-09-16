export {};
const video = document.querySelector<HTMLVideoElement>('#hero-video')!;
const toggle = document.querySelector<HTMLButtonElement>('#video-toggle')!;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const connection = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
let userPaused = false;
let visible = false;
let playingBeforeHidden = false;
let failed = false;
let ageConfirmed = document.body.classList.contains('age-confirmed');
const label = () => { toggle.textContent = video.paused ? 'Play background video' : 'Pause background video'; };
const start = async () => {
  if (!video.src) video.src = video.dataset.src!;
  try { await video.play(); } catch { label(); }
};
toggle.hidden = false;
toggle.addEventListener('click', () => {
  if (video.paused) { userPaused = false; void start(); }
  else { userPaused = true; video.pause(); }
});
video.addEventListener('play', label);
video.addEventListener('pause', label);
video.addEventListener('error', () => { failed = true; video.pause(); video.removeAttribute('src'); video.load(); toggle.hidden = true; });
reducedMotion.addEventListener('change', () => { if (reducedMotion.matches) { userPaused = true; video.pause(); } });
const canAutoplay = () => ageConfirmed && !failed && !userPaused && !reducedMotion.matches && !connection?.saveData && !['slow-2g', '2g'].includes(connection?.effectiveType || '');
new IntersectionObserver(entries => {
  visible = entries[0].isIntersecting;
  if (!visible) video.pause();
  else if (!document.hidden && canAutoplay()) void start();
}, { threshold: 0.05 }).observe(video);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { playingBeforeHidden = !video.paused; video.pause(); }
  else if (playingBeforeHidden && visible && canAutoplay()) void start();
});
window.addEventListener('neon-age-accepted', () => {
  ageConfirmed = true;
  if (visible && !document.hidden && canAutoplay()) void start();
});
