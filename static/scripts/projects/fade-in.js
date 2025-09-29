document.addEventListener('DOMContentLoaded', () => {
  const groups = document.querySelectorAll('.project-info');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const children = entry.target.querySelectorAll('.fade-on-scroll');
        children.forEach((child, index) => {
          setTimeout(() => {
            child.classList.add('visible');
          }, index * 300); // 300ms stagger
        });

        // Optional: remove if you want repeated scroll-in
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.2
  });

  groups.forEach(group => observer.observe(group));
});
