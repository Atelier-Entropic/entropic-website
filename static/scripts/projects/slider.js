document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".image-wrapper").forEach(wrapper => {
    const linkEl   = wrapper.querySelector(".image-link");
    const overlay  = wrapper.querySelector(".overlay");
    const imgInLink = wrapper.querySelector("a.image-link img");

    // Slider setup (only if it's an image card)
    if (imgInLink) {
      const images = [
        imgInLink.src,
        ...Array.from(wrapper.querySelectorAll(".hidden-slide")).map(img => img.src)
      ];
      let currentIndex = 0;
      const leftArrow  = wrapper.querySelector(".arrow.left");
      const rightArrow = wrapper.querySelector(".arrow.right");

      const show = (i) => { imgInLink.src = images[i]; };

      if (leftArrow) {
        leftArrow.addEventListener("click", (e) => {
          e.preventDefault(); e.stopPropagation();
          if (images.length > 1) {
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            show(currentIndex);
          }
        });
      }

      if (rightArrow) {
        rightArrow.addEventListener("click", (e) => {
          e.preventDefault(); e.stopPropagation();
          if (images.length > 1) {
            currentIndex = (currentIndex + 1) % images.length;
            show(currentIndex);
          }
        });
      }
    }

    // Make the overlay itself navigate to the project page…
    if (overlay && linkEl) {
      overlay.addEventListener("click", (e) => {
        // …except when clicking on the arrows area
        if (e.target.closest(".overlay-arrows")) return;
        window.location.href = linkEl.href;
      });
      // accessibility: Enter/Space activates overlay
      overlay.setAttribute("tabindex", "0");
      overlay.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          window.location.href = linkEl.href;
        }
      });
    }
  });
});
