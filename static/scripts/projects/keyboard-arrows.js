document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") {
    const a = document.querySelector(".project-nav__prev");
    if (a) window.location.href = a.href;
  }
  if (e.key === "ArrowRight") {
    const a = document.querySelector(".project-nav__next");
    if (a) window.location.href = a.href;
  }
});
