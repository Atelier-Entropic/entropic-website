
document.addEventListener('DOMContentLoaded', () => {
  const vids = document.querySelectorAll('video.hover-controls');

  vids.forEach(v => {
    // start hidden (no controls attr)
    v.controls = false;

    const show = () => { v.controls = true; };
    const hide = () => { v.controls = false; };

    // Desktop: hover & keyboard focus
    v.addEventListener('mouseenter', show);
    v.addEventListener('mouseleave', hide);
    v.addEventListener('focus', show);
    v.addEventListener('blur', hide);

    // Mobile: show on tap for 3s
    let hideTimer;
    const showBriefly = () => {
      show();
      clearTimeout(hideTimer);
      hideTimer = setTimeout(hide, 3000);
    };
    v.addEventListener('touchstart', showBriefly, { passive: true });

    // Optional: dblclick toggles fullscreen
    v.addEventListener('dblclick', () => {
      if (!document.fullscreenElement && v.requestFullscreen) v.requestFullscreen();
      else if (document.exitFullscreen) document.exitFullscreen();
    });
  });
});
