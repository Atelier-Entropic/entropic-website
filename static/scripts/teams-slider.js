const slider = document.getElementById('teamSlider');
const cardCount = 3;
let scrollTimeout;

  // Drag support (same as before)
  let isDown = false;
  let startX, scrollLeft;

  slider.addEventListener('mousedown', (e) => {
    isDown = true;
    startX = e.pageX - slider.offsetLeft;
    scrollLeft = slider.scrollLeft;
  });

  slider.addEventListener('mouseup', () => isDown = false);
  slider.addEventListener('mouseleave', () => isDown = false);

  slider.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - slider.offsetLeft;
    const walk = (x - startX) * 2;
    slider.scrollLeft = scrollLeft - walk;
  });

  slider.addEventListener('touchstart', (e) => {
    startX = e.touches[0].pageX;
    scrollLeft = slider.scrollLeft;
  });

  slider.addEventListener('touchmove', (e) => {
    const x = e.touches[0].pageX;
    const walk = (x - startX) * 2;
    slider.scrollLeft = scrollLeft - walk;
  });

  // Dynamic hover scroll
slider.addEventListener('mousemove', (e) => {
  if (!window.matchMedia('(hover: hover)').matches) return;

  const bounds = slider.getBoundingClientRect();
  const x = e.clientX - bounds.left;
  const center = bounds.width / 2;
  const direction = x > center ? 1 : -1;

  // Prevent rapid scrolls
  if (scrollTimeout) return;

  const card = slider.querySelector('.team-member');
  if (!card) return;

  const scrollBy = card.offsetWidth * cardCount + 2 * 16; // include gaps (e.g. 2rem)
  slider.scrollBy({ left: scrollBy * direction, behavior: 'smooth' });

  // throttle scroll (adjust delay as needed)
  scrollTimeout = setTimeout(() => {
    scrollTimeout = null;
  }, 600); // wait before allowing another scroll
});

slider.addEventListener('mouseleave', () => {
  clearTimeout(scrollTimeout);
  scrollTimeout = null;
});