
(() => {
  const root = document.documentElement;
  const gal = document.querySelector('.projects-gallery');

  // --- Detect mobile-like device ---
  const isMobileish = () => {
    const ua = navigator.userAgent || "";
    const mobileUA = /Android|iPhone|iPad|iPod|Windows Phone/i.test(ua);
    const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const coarse = matchMedia("(pointer: coarse)").matches;
    return mobileUA || (touch && coarse);
  };

  const isLandscape = () =>
    matchMedia("(orientation: landscape)").matches || innerWidth > innerHeight;

  // --- Calculate and sync gutter + equalized tile height ---
  function updateVars() {
    const vh = window.visualViewport ? visualViewport.height : innerHeight;
    const rem = parseFloat(getComputedStyle(root).fontSize) || 16;

    // Snap gutter to integer px to avoid rounding mismatch
    const gutter = Math.max(4, Math.round(vh * 0.015));
    root.style.setProperty('--marg', `${gutter}px`);

    // If in mobile landscape mode, also compute a shared tile height
    if (root.classList.contains('mobile-rotated')) {
      const gh = vh - 2 * rem; // based on your --gh calc
      const tileH = Math.max(120, Math.round((2 * gh) / 3 - gutter));
      root.style.setProperty('--tileH', `${tileH}px`);
    } else {
      root.style.removeProperty('--tileH');
    }

    // Optional: make column-gap match the snapped gutter
    if (gal) {
      gal.style.columnGap = `${gutter}px`;
      gal.style.webkitColumnGap = `${gutter}px`;
    }
  }

  // --- Toggle mobile-rotated class ---
  const setFlags = () => {
    const on = isMobileish() && isLandscape();
    root.classList.toggle('mobile-rotated', on);

    // Update vars whenever the state changes
    updateVars();
  };

  // --- Event listeners ---
  addEventListener('resize', setFlags, { passive: true });
  addEventListener('orientationchange', setFlags, { passive: true });
  if ('visualViewport' in window) {
    visualViewport.addEventListener('resize', setFlags, { passive: true });
  }

  // Initial run
  setFlags();
})();
