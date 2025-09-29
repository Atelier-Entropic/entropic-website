<script>
document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.querySelector('.research-sidebar');
  if (!sidebar) return;

  // 1) Create the fixed child and move current children inside
  let fixed = document.createElement('div');
  fixed.className = 'research-sidebar__fixed';
  while (sidebar.firstChild) fixed.appendChild(sidebar.firstChild);
  sidebar.appendChild(fixed);

  // 2) Function to sync fixed box to the sidebar slot
  const HDR_MOBILE  = 62, HDR_DESKTOP = 80;
  const mq = window.matchMedia('(max-width: 1000px)');
  const headerH = () => (mq.matches ? HDR_MOBILE : HDR_DESKTOP);

  function sync() {
    // If mobile overlay is active, let media query handle it
    const mobile = window.matchMedia('(max-width: 800px)').matches;
    if (mobile) return;

    // Compute left and width from the spacer column
    const rect = sidebar.getBoundingClientRect();
    const left = rect.left + window.scrollX;
    const width = rect.width;

    fixed.style.left = left + 'px';
    fixed.style.width = width + 'px';
    fixed.style.top = `var(--hdr, ${headerH()}px)`; // honors your CSS var if set
    fixed.style.height = `calc(100vh - var(--hdr, ${headerH()}px))`;
  }

  // Initial sync + listeners
  sync();
  window.addEventListener('resize', sync);
  window.addEventListener('scroll', () => {
    // only needed if the page can scroll horizontally
    if (document.documentElement.scrollWidth > window.innerWidth) sync();
  }, { passive: true });
});
</script>
