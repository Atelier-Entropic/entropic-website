(function(){
  const gallery = document.querySelector('.horizontal-gallery');
  const track = document.querySelector('.gallery-track');
  if (!gallery || !track) return;

  // --- Drag scroll (mouse) ---
  let isDown = false, startX = 0, startScrollLeft = 0;
  gallery.addEventListener('mousedown', (e) => {
    isDown = true;
    gallery.classList.add('dragging');
    startX = e.pageX;
    startScrollLeft = gallery.scrollLeft;
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
    gallery.scrollLeft = startScrollLeft - dx; // natural drag direction
  });

  // --- Lightbox / Fullscreen for IMAGES only (click to open) ---
  const imgs = Array.from(track.querySelectorAll('.gallery-item img'));
  if (!imgs.length) return;

  const lb = document.getElementById('lb');
  const lbImg = lb.querySelector('.lb-media');
  const btnClose = lb.querySelector('.lb-close');
  const btnPrev  = lb.querySelector('.lb-prev');
  const btnNext  = lb.querySelector('.lb-next');

  // Build a list of {src, alt}
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
    // Optional: free memory for huge images
    // lbImg.src = '';
  }
  function prev(){ idx = (idx - 1 + items.length) % items.length; openLB(idx); }
  function next(){ idx = (idx + 1) % items.length; openLB(idx); }

  // Click to open on images
  imgs.forEach((img, i) => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', () => openLB(i));
  });

  // Controls
  btnClose.addEventListener('click', closeLB);
  btnPrev.addEventListener('click', (e) => { e.stopPropagation(); prev(); });
  btnNext.addEventListener('click', (e) => { e.stopPropagation(); next(); });

  // Click outside image closes
  lb.addEventListener('click', (e) => {
    if (e.target === lb) closeLB();
  });

  // Keyboard: Esc / ← / →
  document.addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    if (e.key === 'Escape') return closeLB();
    if (e.key === 'ArrowLeft') return prev();
    if (e.key === 'ArrowRight') return next();
  });

  // Optional: prevent background scroll on touch while lightbox open
  lb.addEventListener('touchmove', (e) => { if (!lb.hidden) e.preventDefault(); }, { passive: false });

})();

