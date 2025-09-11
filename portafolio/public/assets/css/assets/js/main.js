/**************************************
 * utilidades globales
 **************************************/

// 1) Año del footer
document.addEventListener("DOMContentLoaded", () => {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
});

// 2) Smooth scroll (además del CSS scroll-behavior)
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener("click", e => {
    const id = a.getAttribute("href").slice(1);
    const el = document.getElementById(id);
    if (el) {
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
});


/**************************************
 * Carrusel con autoplay + dots + swipe
 * Soporta: click en dots, swipe, rueda, teclado
 **************************************/
(function () {
  const carousels = document.querySelectorAll(".carousel");
  if (!carousels.length) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  carousels.forEach(setupCarousel);

  function setupCarousel(root) {
    const track = root.querySelector(".carousel-track");
    const slides = Array.from(root.querySelectorAll(".carousel-slide"));
    const dots   = Array.from(root.querySelectorAll(".dot"));
    const card   = root.querySelector(".carousel-card");
    if (!track || !slides.length || !card) return;

    // Evita que las imágenes se arrastren
    root.querySelectorAll("img").forEach(img => {
      img.setAttribute("draggable", "false");
    });

    // Accesibilidad básica en dots
    const dotsWrap = root.querySelector(".carousel-dots");
    if (dotsWrap) {
      dotsWrap.setAttribute("role", "tablist");
      dots.forEach((d, i) => {
        d.setAttribute("role", "tab");
        d.setAttribute("aria-selected", i === 0 ? "true" : "false");
        d.setAttribute("tabindex", i === 0 ? "0" : "-1");
      });
    }

    let index = 0;
    let timer = null;
    const interval = Number(root.dataset.interval) || 3500;
    const max = slides.length;

    // --- helpers ---
    const setActiveDot = () => {
      dots.forEach((d, k) => {
        const active = k === index;
        d.classList.toggle("is-active", active);
        d.setAttribute("aria-selected", active ? "true" : "false");
        d.setAttribute("tabindex", active ? "0" : "-1");
      });
    };

    const goto = (i) => {
      index = (i + max) % max;
      const offset = -index * 100;
      track.style.transform = `translateX(${offset}%)`;
      setActiveDot();
    };

    const start = () => {
      if (prefersReduced) return; // respeta reduced motion
      stop();
      timer = setInterval(() => goto(index + 1), interval);
    };
    const stop = () => {
      if (timer) { clearInterval(timer); timer = null; }
    };

    // --- init ---
    goto(0);
    start();

    // --- dots click ---
    dots.forEach(d =>
      d.addEventListener("click", () => {
        const i = Number(d.dataset.index);
        if (!Number.isNaN(i)) goto(i);
      })
    );

    // --- pausa por hover / focus dentro del carrusel ---
    const pauseAreas = [root, card, dotsWrap].filter(Boolean);
    pauseAreas.forEach(el => {
      el.addEventListener("mouseenter", stop);
      el.addEventListener("mouseleave", start);
      el.addEventListener("focusin", stop);
      el.addEventListener("focusout", start);
    });

    // --- pausa si la pestaña se oculta ---
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop(); else start();
    });

    // --- Swipe / arrastre táctil o mouse ---
    let startX = 0, currentX = 0, isDown = false;

    const onStart = (clientX) => {
      isDown = true;
      startX = clientX;
      currentX = clientX;
      stop();
      // Captura el puntero para un drag suave
      try { card.setPointerCapture?.(event.pointerId); } catch {}
    };

    const onMove = (clientX) => {
      if (!isDown) return;
      currentX = clientX;
      const dx = currentX - startX;
      const percent = (dx / card.clientWidth) * 100;
      const base = -index * 100;
      track.style.transform = `translateX(${base + percent}%)`;
    };

    const onEnd = () => {
      if (!isDown) return;
      isDown = false;
      const dx = currentX - startX;
      // umbral ~18% del ancho
      if (Math.abs(dx) > card.clientWidth * 0.18) {
        goto(index + (dx < 0 ? 1 : -1));
      } else {
        goto(index); // vuelve a su sitio
      }
      start();
    };

    // Pointer (cubre mouse + táctil modernos)
    card.addEventListener("pointerdown", e => onStart(e.clientX));
    window.addEventListener("pointermove", e => onMove(e.clientX));
    window.addEventListener("pointerup", onEnd);
    window.addEventListener("pointercancel", onEnd);

    // Compat táctil (iOS antiguos)
    card.addEventListener("touchstart", e => onStart(e.touches[0].clientX), { passive: true });
    card.addEventListener("touchmove",  e => onMove(e.touches[0].clientX),  { passive: true });
    card.addEventListener("touchend", onEnd);

    // --- Scroll (ruedita) para cambiar de slide (con debounce simple) ---
    let wheelLock = false;
    const wheelNext = () => { goto(index + 1); };
    const wheelPrev = () => { goto(index - 1); };
    card.addEventListener("wheel", (e) => {
      // sólo reaccionar a desplazamiento horizontal o vertical significativo
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(delta) < 10 || wheelLock) return;
      e.preventDefault();
      stop();
      if (delta > 0) wheelNext(); else wheelPrev();
      wheelLock = true;
      setTimeout(() => { wheelLock = false; start(); }, 450);
    }, { passive: false });

    // --- Teclado: ← → ---
    root.setAttribute("tabindex", "0"); // para poder recibir teclado al enfocarse
    root.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); stop(); goto(index + 1); start(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); stop(); goto(index - 1); start(); }
    });
  }
})();

// Scroll suave al hacer click en "View Work"
document.querySelectorAll('a[href="/portafolio/upocket.html"]').forEach(link=>{
  link.addEventListener("click", e=>{
    // Si es el botón del hero, prevenir cambio de página
    if (link.closest(".hero-cta") || link.classList.contains("pill")) {
      e.preventDefault();
      const target = document.querySelector("#upocket");
      if(target){
        const y = target.getBoundingClientRect().top + window.scrollY - 60;
        window.scrollTo({ top:y, behavior:"smooth" });
      }
    }
  });
});

/**************************************
 * Slideshow del index (.intro-preview)
 * autoplay + dots + swipe
 **************************************/
/****************************************
 * Slideshow del index (.intro-preview)
 * autoplay + dots + swipe
 ****************************************/
(function () {
  const root = document.querySelector('.intro-preview');
  if (!root) return;

  const canvas = root.querySelector('.preview-canvas');
  const track  = root.querySelector('.preview-track');
  const dots   = Array.from(root.querySelectorAll('.preview-dots .dot'));
  if (!canvas || !track) return;

  const slides   = Array.from(track.children);
  const max      = slides.length;
  const interval = Number(canvas.dataset.interval || root.dataset.interval) || 3500;

  let index = 0;
  let timer = null;

  const setActiveDot = () =>
    dots.forEach((d,k) => d.classList.toggle('is-active', k === index));

  const go = (n, animate = true) => {
    index = (n + max) % max;
    track.style.transition = animate
      ? 'transform .55s cubic-bezier(.22,.61,.36,1)'
      : 'none';
    track.style.transform = `translateX(-${index * 100}%)`;
    setActiveDot();
  };

  const start = () => { stop(); timer = setInterval(() => go(index + 1), interval); };
  const stop  = () => { if (timer) clearInterval(timer); timer = null; };

  // Dots
  dots.forEach((d,k) => d.addEventListener('click', () => {
    stop(); go(k); start();
  }));

  // Swipe / drag
  let isDown = false, startX = 0, currentX = 0;

  const onStart = (x) => { isDown = true; startX = currentX = x; stop(); };
  const onMove  = (x) => {
    if (!isDown) return;
    currentX = x;
    const dx      = currentX - startX;
    const percent = (dx / canvas.clientWidth) * 100;
    const base    = -index * 100;
    track.style.transition = 'none';
    track.style.transform  = `translateX(${base + percent}%)`;
  };
  const onEnd   = () => {
    if (!isDown) return;
    isDown = false;
    const dx = currentX - startX;
    if (Math.abs(dx) > canvas.clientWidth * 0.15) {
      go(index + (dx < 0 ? 1 : -1));
    } else {
      go(index);
    }
    start();
  };

  // Pointer (desktop y móviles modernos)
  canvas.addEventListener('pointerdown',  e => onStart(e.clientX));
  window.addEventListener('pointermove',  e => onMove(e.clientX));
  window.addEventListener('pointerup',    onEnd);
  window.addEventListener('pointercancel',onEnd);

  // Touch (compat antiguo)
  canvas.addEventListener('touchstart', e => onStart(e.touches[0].clientX), {passive:true});
  window.addEventListener('touchmove',  e => onMove(e.touches[0].clientX),  {passive:true});
  window.addEventListener('touchend',   onEnd);
  window.addEventListener('touchcancel',onEnd);

  // Pausa al hover
  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);

  go(0);
  start();
})();


// ===== PROYECTOS: carrusel de la sección .project =====
(() => {
  const root = document.querySelector('.project-carousel');
  if (!root) return;

  const track = root.querySelector('.pc-track');
  const slides = Array.from(track.querySelectorAll('.pc-slide'));
  const dots   = Array.from(root.querySelectorAll('.pc-dots .dot'));
  const interval = Number(root.dataset.interval) || 5200;

  let index = 0, timer = null;

  const setDot = i => dots.forEach((d,k)=> d.classList.toggle('is-active', k===i));

  const goto = (i, animate = true) => {
    index = (i + slides.length) % slides.length;
    track.style.transition = animate ? 'transform .60s cubic-bezier(.22,.61,.36,1)' : 'none';
    track.style.transform  = `translateX(-${index*100}%)`;
    setDot(index);
  };

  const start = () => { stop(); timer = setInterval(()=> goto(index+1), interval); };
  const stop  = () => { if (timer) { clearInterval(timer); timer=null; } };

  // Dots click
  dots.forEach((d,i)=> d.addEventListener('click', ()=>{ stop(); goto(i); start(); }));

  // Swipe / drag
  let down=false, sx=0, cx=0;
  root.addEventListener('pointerdown', e=>{ down=true; sx=e.clientX; cx=e.clientX; stop(); });
  window.addEventListener('pointermove',  e=>{
    if(!down) return;
    cx = e.clientX;
    const dx = cx - sx;
    track.style.transition = 'none';
    track.style.transform  = `translateX(calc(${-index*100}% + ${dx}px))`;
  });
  const end = ()=>{
    if(!down) return;
    down=false;
    const dx = cx - sx;
    if(Math.abs(dx) > root.clientWidth * 0.18){
      goto(index + (dx < 0 ? 1 : -1));
    } else {
      goto(index);
    }
    start();
  };
  window.addEventListener('pointerup', end);
  window.addEventListener('pointercancel', end);

  // Init
  goto(0, false);
  start();

  // Pausa si la pestaña se oculta
  document.addEventListener('visibilitychange', ()=>{ if (document.hidden) stop(); else start(); });
})();

// Rellenar barras de Skills/Tools
document.querySelectorAll('.meter-row').forEach(row => {
  const bar   = row.querySelector('.meter-bar');
  const level = Number(row.dataset.level || 0);
  if (!bar) return;

  // animación: 0% -> N%
  bar.style.width = '0%';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      bar.style.width = `${Math.max(0, Math.min(level, 100))}%`;
    });
  });
});