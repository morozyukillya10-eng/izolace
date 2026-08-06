/* TICHÝ DOMOV — interactivity v2 (GSAP 3 + Lenis) */

// ─── LOADER ───────────────────────────────────────────────────────────────────
(function () {
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
      '<span class="loader__logo">TICHÝ DOMOV</span>' +
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

// ─── UTILS ────────────────────────────────────────────────────────────────────
// Run callback once body has .loaded class (after loader exits)
function onLoaded(cb) {
  if (document.body.classList.contains('loaded')) { cb(); return; }
  const mo = new MutationObserver(() => {
    if (document.body.classList.contains('loaded')) { mo.disconnect(); cb(); }
  });
  mo.observe(document.body, { attributes: true, attributeFilter: ['class'] });
}

// ─── LIBRARY FEATURE FLAGS ────────────────────────────────────────────────────
const hasGSAP = typeof gsap !== 'undefined';
const hasST   = hasGSAP && typeof ScrollTrigger !== 'undefined';
if (hasST) gsap.registerPlugin(ScrollTrigger);

// ─── NAV SCROLL STATE ─────────────────────────────────────────────────────────
const nav = document.querySelector('.nav');
if (nav) {
  window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 40), { passive: true });
  nav.classList.toggle('scrolled', window.scrollY > 40);
}

// ─── MOBILE SIDEBAR MENU ──────────────────────────────────────────────────────
(function () {
  const navCta = document.querySelector('.nav__cta');
  const navLinks = document.querySelector('.nav__links');
  if (!navCta) return;

  // Hamburger button
  const btn = document.createElement('button');
  btn.className = 'nav__hamburger';
  btn.setAttribute('aria-label', 'Otevřít menu');
  btn.setAttribute('aria-expanded', 'false');
  btn.innerHTML = '<span></span><span></span><span></span>';
  navCta.appendChild(btn);

  // Build sidebar HTML — clone links from desktop nav
  const linkItems = navLinks ? Array.from(navLinks.querySelectorAll('a')).map((a) =>
    `<a href="${a.getAttribute('href')}"${a.classList.contains('active') ? ' class="active"' : ''}>${a.textContent}</a>`
  ).join('') : '';

  const menu = document.createElement('div');
  menu.className = 'mobile-menu';
  menu.setAttribute('aria-hidden', 'true');
  menu.innerHTML = `
    <div class="mobile-menu__backdrop"></div>
    <div class="mobile-menu__panel" role="dialog" aria-modal="true" aria-label="Navigace">
      <div class="mobile-menu__head">
        <a href="index.html" class="logo">TICHÝ DOMOV</a>
        <button class="mobile-menu__close" aria-label="Zavřít menu">✕</button>
      </div>
      <nav class="mobile-menu__nav">${linkItems}</nav>
      <div class="mobile-menu__footer">
        <a href="tel:+420777123456" class="mobile-menu__phone">+420 777 123 456</a>
        <a href="kontakt.html" class="btn btn--primary mobile-menu__cta">Nezávazná poptávka <span class="arrow">→</span></a>
      </div>
    </div>`;
  document.body.appendChild(menu);

  const open  = () => { menu.classList.add('open'); btn.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); menu.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; };
  const close = () => { menu.classList.remove('open'); btn.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; };

  btn.addEventListener('click', open);
  menu.querySelector('.mobile-menu__close').addEventListener('click', close);
  menu.querySelector('.mobile-menu__backdrop').addEventListener('click', close);
  menu.querySelectorAll('.mobile-menu__nav a').forEach((a) => a.addEventListener('click', close));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
})();

// ─── PAGE TRANSITIONS ─────────────────────────────────────────────────────────
if (hasGSAP) {
  // Fade in when arriving via a link click (not loader)
  if (sessionStorage.getItem('transitioning')) {
    sessionStorage.removeItem('transitioning');
    document.body.style.opacity = '0';
    gsap.to('body', { opacity: 1, duration: 0.5, ease: 'power2.out', delay: 0.06 });
  }
  // Fade out on internal link click
  document.querySelectorAll('a[href]').forEach((a) => {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') ||
        href.startsWith('mailto:') || href.startsWith('tel:') ||
        a.hasAttribute('download') || a.getAttribute('target') === '_blank') return;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      sessionStorage.setItem('transitioning', '1');
      gsap.to('body', {
        opacity: 0, duration: 0.28, ease: 'power2.in',
        onComplete: () => { window.location.href = href; },
      });
    });
  });
}

// ─── HERO SCROLL SCALE ────────────────────────────────────────────────────────
const heroWrap  = document.getElementById('heroWrap');
const heroGiant = document.getElementById('heroGiant');
if (heroWrap && heroGiant) {
  if (hasST) {
    // Subtle parallax — text drifts up as hero scrolls out of view
    gsap.to(heroGiant, {
      y: -80, opacity: 0.5, ease: 'none',
      scrollTrigger: {
        trigger: heroWrap,
        start: 'top top',
        end: 'bottom top',
        scrub: 1.5,
      },
    });
  } else {
    const onHeroScroll = () => {
      const rect     = heroWrap.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, -rect.top / heroWrap.offsetHeight));
      heroGiant.style.transform = `translateY(${-progress * 80}px)`;
      heroGiant.style.opacity   = 1 - progress * 0.5;
    };
    window.addEventListener('scroll', onHeroScroll, { passive: true });
    onHeroScroll();
  }
}

// ─── PAGE HEADER ENTRANCE ─────────────────────────────────────────────────────
if (hasGSAP) {
  const ph = document.querySelector('.page-header');
  if (ph) {
    const crumb = ph.querySelector('.page-header__crumb');
    const h1    = ph.querySelector('h1');
    const lead  = ph.querySelector('.lead');
    onLoaded(() => {
      const tl = gsap.timeline({ delay: 0.1 });
      if (crumb) tl.fromTo(crumb, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
      if (h1)    tl.fromTo(h1,    { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out' }, '-=0.25');
      if (lead)  tl.fromTo(lead,  { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.6,  ease: 'power3.out' }, '-=0.4');
    });
  }
}

// ─── SCROLL REVEALS ───────────────────────────────────────────────────────────
const revealEls = document.querySelectorAll('.reveal');
if (revealEls.length) {
  if (hasST) {
    revealEls.forEach((el) => {
      gsap.fromTo(el,
        { opacity: 0, y: 28 },
        {
          opacity: 1, y: 0,
          duration: 0.85,
          delay: parseFloat(el.dataset.delay || 0) * 0.1,
          ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 90%' },
        }
      );
    });
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach((el) => io.observe(el));
  }
}

// ─── COUNTER ANIMATION ────────────────────────────────────────────────────────
const counters = document.querySelectorAll('[data-count]');
if (counters.length) {
  if (hasST) {
    counters.forEach((el) => {
      const target   = parseFloat(el.dataset.count);
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      const obj      = { val: 0 };
      gsap.to(obj, {
        val: target, duration: 2.2, ease: 'power2.out',
        onUpdate:  () => { el.textContent = obj.val.toFixed(decimals); },
        onComplete: () => { el.textContent = target.toFixed(decimals); },
        scrollTrigger: { trigger: el, start: 'top 82%' },
      });
    });
  } else {
    const ease3 = (t) => 1 - Math.pow(1 - t, 3);
    const animateCount = (el) => {
      const target   = parseFloat(el.dataset.count);
      const decimals = parseInt(el.dataset.decimals || '0', 10);
      const t0       = performance.now();
      (function tick(now) {
        const p = Math.min((now - t0) / 1800, 1);
        el.textContent = (target * ease3(p)).toFixed(decimals);
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = target.toFixed(decimals);
      })(t0);
    };
    const cio = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { animateCount(e.target); cio.unobserve(e.target); } });
    }, { threshold: 0.4 });
    counters.forEach((el) => cio.observe(el));
  }
}

// ─── MAGNETIC BUTTONS ─────────────────────────────────────────────────────────
// Only on devices with precise pointer (no touch-only)
if (hasGSAP && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.querySelectorAll('.btn--primary').forEach((btn) => {
    btn.addEventListener('mousemove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = (e.clientX - r.left  - r.width  / 2) * 0.38;
      const y = (e.clientY - r.top   - r.height / 2) * 0.38;
      gsap.to(btn, { x, y, duration: 0.35, ease: 'power2.out', overwrite: true });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.45)', overwrite: true });
    });
  });
}

// ─── STAGGER GRID ITEMS (service cards, team, story blocks) ──────────────────
// Find grids and animate children with a natural stagger when parent enters view
if (hasST) {
  document.querySelectorAll('.services-grid, .team-grid, .about-story, .contact-blocks').forEach((grid) => {
    const children = Array.from(grid.children).filter((c) => !c.classList.contains('reveal'));
    if (!children.length) return;
    gsap.fromTo(children,
      { opacity: 0, y: 32 },
      {
        opacity: 1, y: 0,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.09,
        scrollTrigger: { trigger: grid, start: 'top 88%' },
      }
    );
  });
}

// ─── PRICING ROWS STAGGER ─────────────────────────────────────────────────────
if (hasST) {
  document.querySelectorAll('.pricing-grid').forEach((grid) => {
    const rows = grid.querySelectorAll('.pricing-row');
    if (!rows.length) return;
    gsap.fromTo(rows,
      { opacity: 0, x: -16 },
      {
        opacity: 1, x: 0,
        duration: 0.55,
        ease: 'power2.out',
        stagger: 0.07,
        scrollTrigger: { trigger: grid, start: 'top 88%' },
      }
    );
  });
}

// ─── BEFORE / AFTER COMPARE SLIDER ───────────────────────────────────────────
const compare = document.querySelector('.compare__slider');
if (compare) {
  const afterPanel = compare.querySelector('.compare__panel--after');
  const handle     = compare.querySelector('.compare__handle');
  const readout    = document.querySelector('[data-readout]');

  const setPos = (pct) => {
    pct = Math.max(0, Math.min(100, pct));
    afterPanel.style.clipPath = `inset(0 0 0 ${pct}%)`;
    handle.style.left = `${pct}%`;
    if (readout) readout.textContent = (85 - (pct / 100) * 50).toFixed(0);
  };
  setPos(50);

  let dragging = false;
  const updateFromEvent = (e) => {
    const rect = compare.getBoundingClientRect();
    setPos(((e.touches ? e.touches[0].clientX : e.clientX) - rect.left) / rect.width * 100);
  };
  compare.addEventListener('mousedown',  (e) => { dragging = true; updateFromEvent(e); });
  window.addEventListener('mousemove',   (e) => { if (dragging) updateFromEvent(e); });
  window.addEventListener('mouseup',     ()  => { dragging = false; });
  compare.addEventListener('touchstart', (e) => { dragging = true; updateFromEvent(e); }, { passive: true });
  window.addEventListener('touchmove',   (e) => { if (dragging) updateFromEvent(e); }, { passive: true });
  window.addEventListener('touchend',    ()  => { dragging = false; });

  const demoIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        let pct = 50, dir = -1;
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

// ─── FAQ — accordion (close others on open) ───────────────────────────────────
document.querySelectorAll('.faq__item').forEach((item) => {
  item.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq__item.open').forEach((x) => x.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
});

// ─── PRODUCT DETAIL THUMBS ────────────────────────────────────────────────────
document.querySelectorAll('.pd__thumb').forEach((t) => {
  t.addEventListener('click', () => {
    document.querySelectorAll('.pd__thumb').forEach((x) => x.classList.remove('active'));
    t.classList.add('active');
  });
});

// ─── CATALOG FILTERS ──────────────────────────────────────────────────────────
document.querySelectorAll('.filter').forEach((f) => {
  f.addEventListener('click', () => {
    document.querySelectorAll('.filter').forEach((x) => x.classList.remove('active'));
    f.classList.add('active');
    const cat = f.dataset.filter;
    document.querySelectorAll('[data-cat]').forEach((p) => {
      p.style.display = (cat === 'all' || p.dataset.cat === cat) ? '' : 'none';
    });
  });
});
