/* SILENTUM° — interactivity */

// --- Loader (only on first visit per session) ---
(function () {
  // If already shown this session, skip loader entirely
  if (sessionStorage.getItem('loaderShown')) {
    document.body.classList.add('loaded');
    return;
  }

  const loader = document.createElement('div');
  loader.id = 'loader';
  loader.className = 'loader';
  loader.setAttribute('aria-hidden', 'true');
  loader.innerHTML =
    '<div class="loader__content">' +
      '<span class="loader__logo">SILENTUM<span class="loader__dot">°</span></span>' +
      '<div class="loader__bars"><span></span><span></span><span></span><span></span><span></span>' +
        '<span></span><span></span><span></span><span></span><span></span></div>' +
      '<div class="loader__track"><div class="loader__fill"></div></div>' +
    '</div>';
  document.body.prepend(loader);

  const MIN_MS = 1500;
  const t0 = Date.now();

  const hide = () => {
    const wait = Math.max(0, MIN_MS - (Date.now() - t0));
    setTimeout(() => {
      loader.classList.add('out');
      loader.addEventListener('transitionend', () => loader.remove(), { once: true });
      document.body.classList.add('loaded');
      sessionStorage.setItem('loaderShown', '1');
    }, wait);
  };

  if (document.readyState === 'complete') hide();
  else window.addEventListener('load', hide);
})();

// --- Nav scroll state ---
const nav = document.querySelector('.nav');
if (nav) {
  const onScroll = () => {
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

// --- Scroll reveal ---
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  revealEls.forEach((el) => io.observe(el));
}

// --- Counter animation ---
const counters = document.querySelectorAll('[data-count]');
if (counters.length) {
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  const animateCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const duration = 1800;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const val = target * ease(t);
      el.textContent = val.toFixed(decimals);
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = target.toFixed(decimals);
    };
    requestAnimationFrame(tick);
  };
  const cio = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        animateCount(e.target);
        cio.unobserve(e.target);
      }
    });
  }, { threshold: 0.4 });
  counters.forEach((el) => cio.observe(el));
}

// --- Hero giant text scroll-scale ---
const heroWrap = document.getElementById('heroWrap');
const heroGiant = document.getElementById('heroGiant');
if (heroWrap && heroGiant) {
  const onHeroScroll = () => {
    const rect = heroWrap.getBoundingClientRect();
    const total = heroWrap.offsetHeight - window.innerHeight;
    const progress = Math.max(0, Math.min(1, -rect.top / total));
    const scale = 1 - progress * 0.55; // 1 -> 0.45
    const translateY = -progress * 80;
    const opacity = 1 - progress * 0.4;
    heroGiant.style.transform = `translateY(${translateY}px) scale(${scale})`;
    heroGiant.style.opacity = opacity;
  };
  window.addEventListener('scroll', onHeroScroll, { passive: true });
  onHeroScroll();
}

// --- Parallax (legacy) ---
const parallaxEls = document.querySelectorAll('[data-parallax]');
if (parallaxEls.length) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    parallaxEls.forEach((el) => {
      const speed = parseFloat(el.dataset.parallax || '0.2');
      el.style.transform = `translate3d(0, ${y * speed}px, 0)`;
    });
  }, { passive: true });
}

// --- Before/after compare slider ---
const compare = document.querySelector('.compare__slider');
if (compare) {
  const afterPanel = compare.querySelector('.compare__panel--after');
  const handle = compare.querySelector('.compare__handle');
  const readout = document.querySelector('[data-readout]');

  const setPos = (pct) => {
    pct = Math.max(0, Math.min(100, pct));
    afterPanel.style.clipPath = `inset(0 0 0 ${pct}%)`;
    handle.style.left = `${pct}%`;
    if (readout) {
      // dB goes from 85 (loud) to 35 (quiet) as pct moves 0 -> 100
      const dB = (85 - (pct / 100) * 50).toFixed(0);
      readout.textContent = dB;
    }
  };
  setPos(50);

  let dragging = false;
  const updateFromEvent = (e) => {
    const rect = compare.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    setPos((x / rect.width) * 100);
  };

  compare.addEventListener('mousedown', (e) => { dragging = true; updateFromEvent(e); });
  window.addEventListener('mousemove', (e) => { if (dragging) updateFromEvent(e); });
  window.addEventListener('mouseup', () => { dragging = false; });

  compare.addEventListener('touchstart', (e) => { dragging = true; updateFromEvent(e); }, { passive: true });
  window.addEventListener('touchmove', (e) => { if (dragging) updateFromEvent(e); }, { passive: true });
  window.addEventListener('touchend', () => { dragging = false; });

  // Auto demo on first view
  const demoIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        let pct = 50;
        let dir = -1;
        const auto = setInterval(() => {
          pct += dir * 2;
          if (pct <= 20 || pct >= 80) dir *= -1;
          setPos(pct);
        }, 60);
        setTimeout(() => { clearInterval(auto); setPos(50); }, 3000);
        demoIO.unobserve(e.target);
      }
    });
  }, { threshold: 0.4 });
  demoIO.observe(compare);
}

// --- FAQ ---
document.querySelectorAll('.faq__item').forEach((item) => {
  item.addEventListener('click', () => {
    item.classList.toggle('open');
  });
});

// --- Product detail thumbs ---
document.querySelectorAll('.pd__thumb').forEach((t) => {
  t.addEventListener('click', () => {
    document.querySelectorAll('.pd__thumb').forEach((x) => x.classList.remove('active'));
    t.classList.add('active');
  });
});

// --- Catalog filters ---
document.querySelectorAll('.filter').forEach((f) => {
  f.addEventListener('click', () => {
    document.querySelectorAll('.filter').forEach((x) => x.classList.remove('active'));
    f.classList.add('active');
    const cat = f.dataset.filter;
    document.querySelectorAll('[data-cat]').forEach((p) => {
      if (cat === 'all' || p.dataset.cat === cat) p.style.display = '';
      else p.style.display = 'none';
    });
  });
});
