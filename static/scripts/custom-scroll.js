//TODO: Make wheel events responsive to touch
document.addEventListener('DOMContentLoaded', () => {
  const frame      = document.querySelector('.research-page');
  const footerWrap = document.querySelector('.footer-wrapper');
  if (!frame || !footerWrap) return;

  const HDR_MOBILE  = 62;
  const HDR_DESKTOP = 80;
  const mq = window.matchMedia('(max-width: 1000px)');
  const headerH = () => (mq.matches ? HDR_MOBILE : HDR_DESKTOP);

  const BORDER_FIX   = 2;
  const ENTER_MARGIN = 2;   // start shrinking just before contact

  let lastPx = -1;
  let ticking = false;

  function baseHeight() {
    return Math.max(0, window.innerHeight - headerH());
  }

  function computeTarget() {
    const base = baseHeight();
    const fTop = footerWrap.getBoundingClientRect().top;

    // footer far away -> use base height (no toggle/clear)
    if (fTop >= window.innerHeight - ENTER_MARGIN) return base;

    // footer entering -> fit gap
    const gap = Math.max(0, fTop - headerH() - BORDER_FIX);
    return Math.min(base, gap);
  }

  function apply() {
    const target = Math.round(computeTarget());
    if (target !== lastPx) {
      frame.style.height = target + 'px';
      lastPx = target;
    }
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { apply(); ticking = false; });
  }

  // init + listeners
  apply();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', apply);
  mq.addEventListener?.('change', apply);
});