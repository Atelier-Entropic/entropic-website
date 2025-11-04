
  document.addEventListener("DOMContentLoaded", () => {
    const lazyImages = document.querySelectorAll('img.lazyload');

    // Ensures images in overflow load when scrolled
    const lazyLoad = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const image = entry.target;
          image.src = image.dataset.src; // Load lazy image
          image.classList.remove('lazyload'); // Remove lazyload class to prevent reloading
          observer.unobserve(image); // Stop observing image
        }
      });
    };

    const observer = new IntersectionObserver(lazyLoad, {
      rootMargin: '200px', // Start loading before it's in view
      threshold: 0.1, // Trigger when just a small part is visible
    });

    // Observe each lazy-loaded image
    lazyImages.forEach(image => {
      observer.observe(image);
    });

    // Force load for images that should load immediately (first images in view)
    const forceLoadFirstImages = () => {
      const firstImages = document.querySelectorAll('.image-wrapper img');
      firstImages.forEach(img => {
        if (img.dataset.src && !img.src) { // Ensure it's not already loaded
          img.src = img.dataset.src;
        }
      });
    };

    // Force load first images
    forceLoadFirstImages();
  });
