(function(){
  const gallery = document.querySelector('.horizontal-gallery');
  const track = document.querySelector('.gallery-track');
  if (!gallery || !track) return;

  // --- Drag scroll with click suppression (works over gaps AND images) ---
  let isDown = false;
  let startX = 0;
  let startScrollLeft = 0;
  let hasDragged = false;
  const DRAG_THRESHOLD = 5; // px to count as drag

  gallery.addEventListener('mousedown', (e) => {
    isDown = true;
    hasDragged = false;
    startX = e.pageX;
    startScrollLeft = gallery.scrollLeft;
    gallery.classList.add('dragging');
  });

  window.addEventListener('mouseup', () => {
    isDown = false;
    gallery.classList.remove('dragging');
  });

  gallery.addEventListener('mouseleave', () => {
    isDown = false;
    gallery.classList.remove('dragging');
  });

  gallery.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    const dx = e.pageX - startX;
    if (Math.abs(dx) > DRAG_THRESHOLD) hasDragged = true;
    gallery.scrollLeft = startScrollLeft - dx; // natural drag direction
    e.preventDefault(); // prevent text/image selection while dragging
  }, { passive: false });

  // Swallow the click if a drag happened during this press
  gallery.addEventListener('click', (e) => {
    if (hasDragged) {
      e.stopPropagation();
      e.preventDefault();
      hasDragged = false; // reset for the next interaction
    }
  }, true); // capture to cancel before inner handlers

  // --- Lightbox / Fullscreen for IMAGES only (click to open) ---
  const imgs = Array.from(track.querySelectorAll('.gallery-item img'));
  if (!imgs.length) return;

  // Prevent native image drag ghost (extra safety beyond CSS)
  imgs.forEach(img => {
    img.addEventListener('dragstart', (e) => e.preventDefault());
  });

  const lb = document.getElementById('lb');
  const lbImg = lb.querySelector('.lb-media');
  const btnClose = lb.querySelector('.lb-close');
  const btnPrev  = lb.querySelector('.lb-prev');
  const btnNext  = lb.querySelector('.lb-next');

  const items = imgs.map(img => ({
    src: img.getAttribute('src'),
    alt: img.getAttribute('alt') || ''
  }));
  let idx = 0;

  function openLB(i){
    idx = i;
    const it = items[idx];
    lbImg.src = it.src;
    lbImg.alt = it.alt;
    lb.hidden = false;
    lb.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
  }
  function closeLB(){
    lb.hidden = true;
    lb.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
  }
  function prev(){ idx = (idx - 1 + items.length) % items.length; openLB(idx); }
  function next(){ idx = (idx + 1) % items.length; openLB(idx); }

  // IMPORTANT: remove the old zoom-in cursor line and only open on true click
  imgs.forEach((img, i) => {
    // no img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => {
      if (!hasDragged) openLB(i);
    });
  });

  // Controls
  btnClose.addEventListener('click', closeLB);
  btnPrev.addEventListener('click', (e) => { e.stopPropagation(); prev(); });
  btnNext.addEventListener('click', (e) => { e.stopPropagation(); next(); });

  // Click outside image closes
  lb.addEventListener('click', (e) => { if (e.target === lb) closeLB(); });

  // Keyboard: Esc / ← / →
  document.addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    if (e.key === 'Escape') return closeLB();
    if (e.key === 'ArrowLeft') return prev();
    if (e.key === 'ArrowRight') return next();
  });

  // Prevent background scroll on touch while lightbox open
  lb.addEventListener('touchmove', (e) => { if (!lb.hidden) e.preventDefault(); }, { passive: false });

})();

