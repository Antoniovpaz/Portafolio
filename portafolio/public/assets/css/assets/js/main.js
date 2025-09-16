// --------------------------------------------------------
// main.js — Antonio Valdivia
// Header sticky + Sliders (intro & projects) + Meters
// --------------------------------------------------------

(function () {
  // Utilidad
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // =========================
  // Header glass on scroll
  // =========================
  document.addEventListener('DOMContentLoaded', () => {
    const header = $('.site-header');
    if (!header) return;
    const onScroll = () => {
      if (window.scrollY > 6) header.classList.add('is-scrolled');
      else header.classList.remove('is-scrolled');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  });

  // =========================
  // Smooth scroll in-page
  // =========================
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // =========================
  // Slider: INTRO (fotos)
  // =========================
  (function initIntroSlider() {
    const root   = $('.intro-preview');
    if (!root) return;
    const canvas = $('.preview-canvas', root);
    const track  = $('.preview-track', root);
    const dots   = $$('.preview-dots .dot', root);
    if (!canvas || !track) return;

    const slides   = Array.from(track.children);
    const max      = slides.length;
    const interval = Number(canvas.dataset.interval || root.dataset.interval) || 3500;

    let index = 0;
    let timer = null;

    const setActiveDot = () => dots.forEach((d, k) => d.classList.toggle('is-active', k === index));

    const go = (n, animate = true) => {
      index = (n + max) % max;
      track.style.transition = animate ? 'transform .55s cubic-bezier(.22,.61,.36,1)' : 'none';
      track.style.transform  = `translateX(-${index * 100}%)`;
      setActiveDot();
    };

    const start = () => { stop(); timer = setInterval(() => go(index + 1), interval); };
    const stop  = () => { if (timer) { clearInterval(timer); timer = null; } };

    // Dots
    dots.forEach((d, k) => d.addEventListener('click', () => { stop(); go(k); start(); }));

    // Swipe / drag
    let down = false, sx = 0, cx = 0;
    const onStart = (x) => { down = true; sx = x; cx = x; stop(); };
    const onMove  = (x) => {
      if (!down) return;
      cx = x;
      const dx      = cx - sx;
      const percent = (dx / canvas.clientWidth) * 100;
      const base    = -index * 100;
      track.style.transition = 'none';
      track.style.transform  = `translateX(${base + percent}%)`;
    };
    const onEnd   = () => {
      if (!down) return;
      down = false;
      const dx = cx - sx;
      if (Math.abs(dx) > canvas.clientWidth * 0.15) go(index + (dx < 0 ? 1 : -1));
      else go(index);
      start();
    };

    canvas.addEventListener('pointerdown', (e) => onStart(e.clientX));
    window.addEventListener('pointermove', (e) => onMove(e.clientX));
    window.addEventListener('pointerup', onEnd);
    window.addEventListener('pointercancel', onEnd);

    canvas.addEventListener('touchstart', (e) => onStart(e.touches[0].clientX), { passive: true });
    window.addEventListener('touchmove',  (e) => onMove(e.touches[0].clientX),  { passive: true });
    window.addEventListener('touchend', onEnd);
    window.addEventListener('touchcancel', onEnd);

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);

    go(0, false);
    start();
  })();

  // =========================
  // Slider: PROJECTS
  // =========================
  (function initProjectsSlider() {
    const root = $('.project-carousel');
    if (!root) return;
    const track = $('.pc-track', root);
    const dots  = $$('.pc-dots .dot', root);
    if (!track) return;

    const slides   = $$('.pc-slide', track);
    const max      = slides.length;
    const interval = Number(root.dataset.interval) || 5200;

    let index = 0, timer = null;

    const setDot = () => dots.forEach((d, k) => d.classList.toggle('is-active', k === index));

    const goto = (i, animate = true) => {
      index = (i + max) % max;
      track.style.transition = animate ? 'transform .60s cubic-bezier(.22,.61,.36,1)' : 'none';
      track.style.transform  = `translateX(-${index * 100}%)`;
      setDot();
    };

    const start = () => { stop(); timer = setInterval(() => goto(index + 1), interval); };
    const stop  = () => { if (timer) { clearInterval(timer); timer = null; } };

    dots.forEach((d, k) => d.addEventListener('click', () => { stop(); goto(k); start(); }));

    // Swipe
    let down = false, sx = 0, cx = 0;
    root.addEventListener('pointerdown', (e) => { down = true; sx = e.clientX; cx = e.clientX; stop(); });
    window.addEventListener('pointermove', (e) => {
      if (!down) return;
      cx = e.clientX;
      const dx = cx - sx;
      track.style.transition = 'none';
      track.style.transform = `translateX(calc(${-index * 100}% + ${dx}px))`;
    });
    const end = () => {
      if (!down) return;
      down = false;
      const dx = cx - sx;
      if (Math.abs(dx) > root.clientWidth * 0.18) goto(index + (dx < 0 ? 1 : -1));
      else goto(index);
      start();
    };
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);

    // Init
    goto(0, false);
    start();

    // Pausa si la pestaña se oculta
    document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); else start(); });
  })();

  // =========================
  // Meters (Skills)
  // =========================
  document.addEventListener('DOMContentLoaded', () => {
    $$('.meter-row').forEach(row => {
      const bar   = $('.meter-bar', row);
      const level = Number(row.dataset.level || 0);
      if (!bar) return;
      bar.style.width = '0%';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          bar.style.width = `${Math.max(0, Math.min(level, 100))}%`;
        });
      });
    });
  });

  // Debug opcional
  console.log('[main.js] loaded ✅');
})();