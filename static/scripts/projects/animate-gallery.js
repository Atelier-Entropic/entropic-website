// --- Simple reveal-on-scroll for .project cards ---
const revealItems = document.querySelectorAll('.project');
revealItems.forEach(el => el.classList.add('anim'));

const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in');   // triggers CSS keyframes
      io.unobserve(entry.target);         // play once
    }
  });
}, {
  root: null,
  threshold: 0.12,                // when ~12% visible
  rootMargin: '0px 0px -8% 0px'   // start a bit before fully in view
});

revealItems.forEach(el => io.observe(el));
