(() => {
  const root = document.documentElement;

  const isMobileish = () => {
    const ua = navigator.userAgent || "";
    const mobileUA = /Android|iPhone|iPad|iPod|Windows Phone/i.test(ua);
    const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const coarse = matchMedia("(pointer: coarse)").matches;
    return mobileUA || (touch && coarse);
  };

  const isLandscape = () =>
    matchMedia("(orientation: landscape)").matches || innerWidth > innerHeight;

  const setFlags = () => {
    const on = isMobileish() && isLandscape();
    root.classList.toggle('mobile-rotated', on);

    // Keep CSS units honest to real viewport height (URL bar safe)
    const vh = (window.visualViewport ? visualViewport.height : innerHeight) * 0.01;
    root.style.setProperty('--vhpx', `${vh}px`); // optional if you want it
  };

  addEventListener('resize', setFlags, { passive: true });
  addEventListener('orientationchange', setFlags, { passive: true });
  if ('visualViewport' in window) {
    visualViewport.addEventListener('resize', setFlags, { passive: true });
  }
  setFlags();
})();
