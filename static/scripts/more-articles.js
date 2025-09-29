
(() => {
  const sidebar  = document.getElementById('researchSidebar');
  const toggle   = document.getElementById('articlesToggle');
  const backdrop = document.getElementById('sidebarBackdrop');

  if (!sidebar || !toggle || !backdrop) return;

  const open = () => {
    sidebar.classList.add('is-open');
    toggle.setAttribute('aria-expanded','true');
    backdrop.hidden = false;
    // lock page scroll while open (mobile)
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  };
  const close = () => {
    sidebar.classList.remove('is-open');
    toggle.setAttribute('aria-expanded','false');
    backdrop.hidden = true;
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  };

  toggle.addEventListener('click', () => {
    sidebar.classList.contains('is-open') ? close() : open();
  });
  backdrop.addEventListener('click', close);
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  // close when selecting a link
  sidebar.addEventListener('click', (e) => { if (e.target.closest('a')) close(); });
})();

