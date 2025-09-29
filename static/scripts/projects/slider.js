// Slider + overlay logic for Django dynamic gallery
document.addEventListener("DOMContentLoaded", () => {
  // Find all project wrappers
  document.querySelectorAll(".image-wrapper").forEach(wrapper => {
    const mainImg = wrapper.querySelector("img");              // The visible image
    const linkEl = wrapper.querySelector(".image-link");       // Clickable link to project

    // Collect all image sources: first the main one, then all hidden slides
    const images = [
      mainImg.src,
      ...Array.from(wrapper.querySelectorAll(".hidden-slide")).map(img => img.src)
    ];

    // Only activate slider if we have more than 1 image
    if (images.length <= 1) return;

    let currentIndex = 0;

    // LEFT arrow
    const leftArrow = wrapper.querySelector(".arrow.left");
    if (leftArrow) {
      leftArrow.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
        currentIndex = (currentIndex - 1 + images.length) % images.length;
        mainImg.src = images[currentIndex];
      });
    }

    // RIGHT arrow
    const rightArrow = wrapper.querySelector(".arrow.right");
    if (rightArrow) {
      rightArrow.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
        currentIndex = (currentIndex + 1) % images.length;
        mainImg.src = images[currentIndex];
      });
    }

    // Clicking the main image still navigates to the project page
    if (linkEl) {
      linkEl.addEventListener("click", e => {
        // Default behavior: follow link
      });
    }
  });
});

