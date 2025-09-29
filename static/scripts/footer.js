document.addEventListener('DOMContentLoaded', () => {
  const footerPopup = document.getElementById('footerPopup');
  const staticFooter = document.getElementById('staticFooter');
  const closeBtn = document.getElementById('closeFooter');

  const dismissedAt = parseInt(localStorage.getItem('footerDismissedAt'), 10);
  const now = Date.now();
  const oneHour =  60 * 60 * 1000;

  if (dismissedAt && now - dismissedAt < oneHour) {
    // Less than 1 hour has passed
    if (footerPopup) footerPopup.style.display = 'none';
    if (staticFooter) staticFooter.style.display = 'block';
  } else {
    // Show the popup again
    if (footerPopup) footerPopup.style.display = 'block';
    if (staticFooter) staticFooter.style.display = 'none';
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      if (footerPopup) footerPopup.style.display = 'none';
      if (staticFooter) staticFooter.style.display = 'block';
      localStorage.setItem('footerDismissedAt', Date.now().toString());
    });
  }
});