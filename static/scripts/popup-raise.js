const miniFooter = document.getElementById('miniFooter');

if (footerPopup && miniFooter) {
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        footerPopup.classList.add('raised');
      } else {
        footerPopup.classList.remove('raised');
      }
    },
    {
      root: null,
      threshold: 0.01
    }
  );

  observer.observe(miniFooter);
}