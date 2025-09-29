/* static/scripts/home-hover.js */
(() => {
  const ready = (fn) =>
    (document.readyState === 'loading') ? document.addEventListener('DOMContentLoaded', fn) : fn();

  ready(() => {
    const stages = document.querySelectorAll('.icon-stage');
    const card   = document.getElementById('iconInfo');
    if (!stages.length || !card) return;

    const titleEl = card.querySelector('.info-title');
    const textEl  = card.querySelector('.info-text');

    let hot = null;            // currently “active” icon (hover/focus)
    let hotStage = null;

    // ---- helpers -----------------------------------------------------------

    const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

    function moveCard(x, y) {
      // keep card visible within viewport
      const pad = 20;
      const cx = clamp(x + 28, pad, window.innerWidth  - pad);
      const cy = clamp(y + 24, pad, window.innerHeight - pad);
      card.style.left = cx + 'px';
      card.style.top  = cy + 'px';
    }

    function showCardFor(icon) {
      const t = icon.dataset.title || '';
      const d = icon.dataset.text  || '';
      if (!t && !d) { hideCard(); return; }
      titleEl.textContent = t;
      textEl.textContent  = d;
      card.classList.add('is-visible');
      card.setAttribute('aria-hidden', 'false');
    }

    function hideCard() {
      card.classList.remove('is-visible');
      card.setAttribute('aria-hidden', 'true');
    }

    function setHot(icon, stage) {
      if (hot && hot !== icon) hot.classList.remove('is-hot');
      hot = icon;
      hotStage = stage;
      if (hot) hot.classList.add('is-hot');
      if (stage) stage.classList.add('is-hovering');
    }

    function clearHot(stage) {
      if (hot) hot.classList.remove('is-hot');
      hot = null;
      if (stage) stage.classList.remove('is-hovering');
      hideCard();
    }

    function go(icon) {
      const href = icon?.dataset?.link;
      if (href) window.location.href = href;
    }

    // Make linkable icons keyboard-focusable & labeled for a11y
    document.querySelectorAll('.icon[data-link]').forEach(icon => {
      if (!icon.hasAttribute('tabindex')) icon.setAttribute('tabindex', '0');
      icon.setAttribute('role', 'link');
      if (!icon.getAttribute('aria-label')) {
        const t = icon.dataset.title || icon.querySelector('img')?.alt || 'Open';
        icon.setAttribute('aria-label', t);
      }
    });

    // ---- per-stage event delegation ---------------------------------------

    stages.forEach(stage => {
      // Hover enter
      stage.addEventListener('mouseover', (e) => {
        const icon = e.target.closest('.icon');
        if (!icon || !stage.contains(icon)) return;
        setHot(icon, stage);
        showCardFor(icon);
      });

      // Hover move – card follows cursor (and never captures clicks)
      stage.addEventListener('mousemove', (e) => {
        if (!hot) return;
        moveCard(e.clientX, e.clientY);
      });

      // Hover leave
      stage.addEventListener('mouseleave', () => clearHot(stage));

      // Click to navigate (only if icon has data-link)
      stage.addEventListener('click', (e) => {
        const icon = e.target.closest('.icon');
        if (!icon || !stage.contains(icon)) return;
        if (icon.dataset.link) go(icon);
      });

      // Focus handling (keyboard)
      stage.addEventListener('focusin', (e) => {
        const icon = e.target.closest('.icon');
        if (!icon || !stage.contains(icon)) return;
        setHot(icon, stage);
        showCardFor(icon);

        // place card near focused icon
        const r = icon.getBoundingClientRect();
        moveCard(r.right, r.bottom);
      });

      stage.addEventListener('focusout', (e) => {
        // When stage loses focus entirely, clear
        if (!stage.contains(e.relatedTarget)) clearHot(stage);
      });

      // Activate with Enter / Space
      stage.addEventListener('keydown', (e) => {
        if (!hot) return;
        const isEnter = e.key === 'Enter';
        const isSpace = e.key === ' ';
        if ((isEnter || isSpace) && hot.dataset.link) {
          e.preventDefault();
          go(hot);
        }
      });
    });

    // Keep card on-screen during resize/scroll (if an icon is active)
    window.addEventListener('resize', () => {
      if (!hot) return;
      const r = hot.getBoundingClientRect();
      moveCard(r.right, r.bottom);
    });
    window.addEventListener('scroll', () => {
      if (!hot) return;
      const r = hot.getBoundingClientRect();
      moveCard(r.right, r.bottom);
    });
  });
})();
