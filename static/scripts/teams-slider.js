const slider = document.getElementById('teamSlider');
const section = slider.closest('.team-slider-section');

const leftBtn  = section.querySelector('.team-arrow.left');
let   rightBtn = section.querySelector('.team-arrow.right');
if (!rightBtn) rightBtn = slider.querySelector('.team-arrow.right');

// --- Safety guard ---
if (!slider || !leftBtn || !rightBtn) {
  console.warn('Team slider: missing required elements.');
}

// --- Drag support (mouse & touch) ---
let isDown = false;
let startX, scrollLeft;

// Mouse drag
slider.addEventListener('mousedown', (e) => {
  isDown = true;
  startX = e.pageX - slider.offsetLeft;
  scrollLeft = slider.scrollLeft;
  slider.classList.add('dragging');
});

const endDrag = () => {
  isDown = false;
  slider.classList.remove('dragging');
};
slider.addEventListener('mouseup', endDrag);
slider.addEventListener('mouseleave', endDrag);
window.addEventListener('mouseup', endDrag);

slider.addEventListener('mousemove', (e) => {
  if (!isDown) return;
  e.preventDefault();
  const x = e.pageX - slider.offsetLeft;
  const walk = (x - startX);
  slider.scrollLeft = scrollLeft - walk;
});

// Touch drag
slider.addEventListener('touchstart', (e) => {
  startX = e.touches[0].pageX;
  scrollLeft = slider.scrollLeft;
}, { passive: true });

slider.addEventListener('touchmove', (e) => {
  const x = e.touches[0].pageX;
  const walk = (x - startX);
  slider.scrollLeft = scrollLeft - walk;
}, { passive: true });

// --- Wheel-to-scroll on hover (convert vertical wheel to horizontal) ---
slider.addEventListener('wheel', (e) => {
  const canScroll = slider.scrollWidth > slider.clientWidth;
  if (!canScroll) return;

  const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
  if (delta === 0) return;

  e.preventDefault(); 

  const speedFactor = 2.5;
  slider.scrollLeft += delta * speedFactor;

  updateArrows();
}, { passive: false });

// --- Arrow buttons ---
const SCROLL_STEP = 240;

leftBtn.addEventListener('click', () => {
  slider.scrollBy({ left: -SCROLL_STEP, behavior: 'smooth' });
  setTimeout(updateArrows, 220);
});

rightBtn.addEventListener('click', () => {
  slider.scrollBy({ left: SCROLL_STEP, behavior: 'smooth' });
  setTimeout(updateArrows, 220);
});

// --- Arrow enable/disable ---
function updateArrows() {
  const max = slider.scrollWidth - slider.clientWidth;
  if (max <= 0) {
    leftBtn.setAttribute('disabled', 'true');
    rightBtn.setAttribute('disabled', 'true');
    return;
  }
  const x = slider.scrollLeft;
  if (x <= 1) leftBtn.setAttribute('disabled', 'true'); else leftBtn.removeAttribute('disabled');
  if (x >= max - 1) rightBtn.setAttribute('disabled', 'true'); else rightBtn.removeAttribute('disabled');
}
slider.addEventListener('scroll', updateArrows, { passive: true });
window.addEventListener('resize', updateArrows);
document.addEventListener('DOMContentLoaded', updateArrows);
updateArrows();
