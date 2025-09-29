
(() => {
  // target the gallery; bail if missing
  const gallery = document.querySelector('.projects-gallery');
  if (!gallery) return;

  // build the hint pill
  const hint = document.createElement('div');
  hint.className = 'scroll-hint';
  hint.setAttribute('aria-hidden', 'true');
  hint.innerHTML = `
    <span class="scroll-hint__desk">SCROLL ⇄</span>
    <span class="scroll-hint__mob">SCROLL ⇵</span>
  `;
  document.body.appendChild(hint);

  // fade-out + remove from DOM
  let hidden = false;
  const hideHint = () => {
    if (hidden) return;
    hidden = true;

    // start CSS transition
    hint.classList.add('scroll-hint--hidden');

    // remove after transition completes
    const cleanup = () => {
      if (hint && hint.parentNode) hint.parentNode.removeChild(hint);
    };
    hint.addEventListener('transitionend', cleanup, { once: true });

    // fallback in case transition event doesn't fire
    setTimeout(cleanup, 1600);
  };

  // hide on any likely interaction
  const onWheel = () => hideHint();
  const onTouchStart = () => hideHint();
  const onKey = (e) => {
    // keys that usually move content
    const movers = ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '];
    if (movers.includes(e.key)) hideHint();
  };
  const onGalleryScroll = () => hideHint();

  // bind listeners (passive where safe)
  window.addEventListener('wheel', onWheel, { passive: true });
  window.addEventListener('touchstart', onTouchStart, { passive: true });
  window.addEventListener('keydown', onKey, { passive: true });
  gallery.addEventListener('scroll', onGalleryScroll, { passive: true });

  // auto-hide after 10s if no interaction
  setTimeout(hideHint, 10000);
})();
