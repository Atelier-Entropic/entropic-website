// static/scripts/home-scroll.js
(() => {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Orientation-specific fog values (keep this tiny)
  function cfg() {
    const portrait = window.matchMedia('(orientation: portrait)').matches;
    return portrait
      ? { HIDE_OFFSET: 100, FOG_RANGE: 200 } // portrait (vertical)
      : { HIDE_OFFSET: 100, FOG_RANGE: 180 }; // landscape (horizontal)
  }

  // Stage / stagger constants
  const FOG_BLUR  = 12;
  const FOG_DRIFT = 14;
  const SCALE_START = 0.40, SCALE_END = 0.90, BASE_SCALE = 0.95, MAX_SCALE = 1.0;
  const DEFAULT_RISE_VH = 20, STAGGER_STEP = 0.20, STAGGER_START = 0.50, STAGGER_END = 0.20, VISCOSITY_MS = 140;

  // Helpers
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const easeInOutSine = t => (t <= 0 ? 0 : t >= 1 ? 1 : 0.5 - 0.5 * Math.cos(Math.PI * t));
  const easeOutCubic  = t => (t <= 0 ? 0 : t >= 1 ? 1 : 1 - Math.pow(1 - t, 3));

  function risePxFor(stage, vh) {
    const raw = stage.dataset.rise;
    if (!raw) return (vh * DEFAULT_RISE_VH) / 100;
    const s = String(raw).trim().toLowerCase();
    if (s.endsWith('vh')) return vh * (parseFloat(s) / 100);
    const n = parseFloat(s);
    return Number.isFinite(n) ? n : (vh * DEFAULT_RISE_VH) / 100;
  }

  function orderIcons(stage) {
    const all = Array.from(stage.querySelectorAll('.icon'));
    const manual = Array.from({ length: 40 }, (_, i) => stage.querySelector(`.i${i + 1}`)).filter(Boolean);
    const rest = all.filter(el => !manual.includes(el));
    return manual.length ? [...manual, ...rest] : all;
  }

  // Text reveal on load
  window.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.story-copy').forEach((copy, i) => {
      setTimeout(() => copy.classList.add('is-in'), i * 80);
    });
  });

  // State
  const blocks = Array.from(document.querySelectorAll('.story-block'));
  const stages = Array.from(document.querySelectorAll('.story-block .icon-stage'));
  const iconState = new WeakMap(); // { s, t, risePx, tau }
  const tracked   = new Set();
  let ticking = false, rafId = null, lastTs = 0;

  function computeTargets() {
    const vh = window.innerHeight || document.documentElement.clientHeight;
    const { HIDE_OFFSET, FOG_RANGE } = cfg();

    // A) Fog from TOP — hard, inclusive trigger
    blocks.forEach(block => {
      const copy = block.querySelector('.story-copy');
      if (!copy) return;

      const topY  = copy.getBoundingClientRect().top;
      const dist  = Math.max(0, HIDE_OFFSET - topY);           // grows once topY <= HIDE_OFFSET
      const prog  = clamp(dist / FOG_RANGE, 0, 1);
      const eased = easeOutCubic(prog);

      copy.style.opacity   = String(1 - eased);
      copy.style.filter    = `blur(${(FOG_BLUR * eased).toFixed(2)}px)`;
      copy.style.transform = `translateY(${(FOG_DRIFT * eased).toFixed(2)}px)`;
    });

    if (prefersReduced) return;

    // B) Stage scale + stagger
    const sStartY = vh * SCALE_START, sEndY = vh * SCALE_END, sSpan = Math.max(1, sEndY - sStartY);

    stages.forEach(stage => {
      const rect = stage.getBoundingClientRect();

      // Scale
      let ps = (sStartY - rect.top) / sSpan;
      ps = clamp(ps, 0, 1);
      stage.style.transition = 'none';
      stage.style.transform  = `scale(${BASE_SCALE + (MAX_SCALE - BASE_SCALE) * easeInOutSine(ps)})`;

      // Stagger window (allows per-stage/block overrides if present)
      const block = stage.closest('.story-block');
      const s = parseFloat(stage.dataset.staggerStart ?? block?.dataset.staggerStart ?? STAGGER_START);
      const e = parseFloat(stage.dataset.staggerEnd   ?? block?.dataset.staggerEnd   ?? STAGGER_END);
      const start = Math.max(s, e), end = Math.min(s, e);

      const iStartY = vh * start, iEndY = vh * end;
      let p = 0;
      if (rect.top >= iStartY) p = 0;
      else if (rect.top <= iEndY) p = 1;
      else p = (iStartY - rect.top) / (iStartY - iEndY);

      const icons    = orderIcons(stage);
      const risePx   = risePxFor(stage, vh);
      const stepAttr = stage.dataset.staggerStep ?? block?.dataset.staggerStep;
      const baseStep = stepAttr ? clamp(parseFloat(stepAttr), 0, 0.6) : STAGGER_STEP;

      const maxDelay = 0.85;
      const count    = Math.max(1, icons.length - 1);
      const STEP     = Math.min(baseStep, maxDelay / count);

      const tau = parseFloat(stage.dataset.viscosity ?? block?.dataset.viscosity ?? VISCOSITY_MS);

      icons.forEach((icon, idx) => {
        const delay  = STEP * idx;
        const denom  = 1 - delay;
        const pi     = denom <= 0 ? 1 : (p - delay) / denom;
        const target = easeInOutSine(clamp(pi, 0, 1));

        let st = iconState.get(icon);
        if (!st) {
          st = { s: 0, t: target, risePx, tau };
          iconState.set(icon, st);
        } else {
          st.t      = target;
          st.risePx = risePx;
          st.tau    = tau;
        }
        tracked.add(icon);
      });
    });
  }

  function tick(ts) {
    if (!lastTs) lastTs = ts;
    const dt = ts - lastTs;
    lastTs = ts;

    let anyActive = false;

    tracked.forEach(icon => {
      const st = iconState.get(icon);
      if (!st) return;

      if (prefersReduced) {
        st.s = st.t;
      } else {
        const tau = Math.max(1, st.tau || VISCOSITY_MS);
        const alpha = 1 - Math.exp(-(dt / tau));
        st.s += (st.t - st.s) * alpha;
      }

      icon.style.transform = `translateY(${-st.risePx * st.s}px)`;
      if (Math.abs(st.t - st.s) > 0.001) anyActive = true;
    });

    if (anyActive) rafId = requestAnimationFrame(tick);
    else { rafId = null; tracked.clear(); }
  }

  function ensureTick() { if (!rafId) rafId = requestAnimationFrame(tick); }

  function onScrollOrResize() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      computeTargets();
      ticking = false;
      ensureTick();
    });
  }

  window.addEventListener('scroll', onScrollOrResize, { passive: true });
  window.addEventListener('resize', onScrollOrResize, { passive: true });
  window.addEventListener('orientationchange', onScrollOrResize, { passive: true });

  onScrollOrResize();
})();
