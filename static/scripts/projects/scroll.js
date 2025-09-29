
(() => {
  const gallery = document.querySelector('.projects-gallery');
  if (!gallery) return;

  const isMobile = () => window.matchMedia('(max-width:480px)').matches;

  // Keep focusable for keyboard scrolling without editing HTML
  gallery.setAttribute('tabindex','0');

  // Keep touch behavior sane per layout
  const updateTouchAction = () => {
    gallery.style.touchAction = isMobile() ? 'pan-y' : 'auto';
  };

  // Wheel → scroll in the correct axis
  const onWheel = (e) => {
    const lineToPx = (e.deltaMode === 1) ? 16 : 1; // convert "lines" to px
    if (isMobile()) {
      // Vertical scroll inside fixed container, prevent body bleed
      if (gallery.scrollHeight > gallery.clientHeight) {
        const atTop = gallery.scrollTop === 0;
        const atBottom = Math.ceil(gallery.scrollTop + gallery.clientHeight) >= gallery.scrollHeight;
        const goingUp = e.deltaY < 0, goingDown = e.deltaY > 0;

        if (!(atTop && goingUp) && !(atBottom && goingDown)) {
          e.preventDefault();
          gallery.scrollTop += e.deltaY * lineToPx;
        }
      }
    } else {
      // Desktop: map vertical wheel to horizontal scroll
      if (gallery.scrollWidth > gallery.clientWidth) {
        e.preventDefault();
        gallery.scrollLeft += e.deltaY * lineToPx;
      }
    }
  };

  // Optional keyboard support (Left/Right on desktop, Up/Down on mobile)
  const onKey = (e) => {
    if (document.activeElement !== gallery) return;
    const bigStep = isMobile() ? gallery.clientHeight * 0.9 : gallery.clientWidth * 0.9;

    if (!isMobile()) {
      if (e.key === 'ArrowRight') { gallery.scrollLeft += 60; e.preventDefault(); }
      else if (e.key === 'ArrowLeft') { gallery.scrollLeft -= 60; e.preventDefault(); }
      else if (e.key === 'PageDown' || e.key === ' ') { gallery.scrollLeft += bigStep; e.preventDefault(); }
      else if (e.key === 'PageUp') { gallery.scrollLeft -= bigStep; e.preventDefault(); }
      else if (e.key === 'Home') { gallery.scrollLeft = 0; e.preventDefault(); }
      else if (e.key === 'End') { gallery.scrollLeft = gallery.scrollWidth; e.preventDefault(); }
    } else {
      if (e.key === 'ArrowDown') { gallery.scrollTop += 60; e.preventDefault(); }
      else if (e.key === 'ArrowUp') { gallery.scrollTop -= 60; e.preventDefault(); }
      else if (e.key === 'PageDown' || e.key === ' ') { gallery.scrollTop += bigStep; e.preventDefault(); }
      else if (e.key === 'PageUp') { gallery.scrollTop -= bigStep; e.preventDefault(); }
      else if (e.key === 'Home') { gallery.scrollTop = 0; e.preventDefault(); }
      else if (e.key === 'End') { gallery.scrollTop = gallery.scrollHeight; e.preventDefault(); }
    }
  };

  // Bind
  gallery.addEventListener('wheel', onWheel, { passive: false });
  gallery.addEventListener('keydown', onKey);
  updateTouchAction();
  addEventListener('resize', updateTouchAction, { passive: true });
})();
