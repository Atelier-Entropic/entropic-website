document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".image-wrapper").forEach(wrapper => {
    const linkEl   = wrapper.querySelector(".image-link");
    const overlay  = wrapper.querySelector(".overlay");
    const imgInLink = wrapper.querySelector("a.image-link img");

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
