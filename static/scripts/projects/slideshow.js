const slides = document.querySelectorAll('.fullscreen-slideshow img');
let current = 0;

// Set first slide visible on load
slides[current].classList.add('visible');

setInterval(() => {
  slides[current].classList.remove('visible');
  current = (current + 1) % slides.length;
  slides[current].classList.add('visible');
}, 3000);
