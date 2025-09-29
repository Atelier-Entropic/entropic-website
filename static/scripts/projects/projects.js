// scripts/projects/projects.js
document.addEventListener('DOMContentLoaded', () => {
  /* ===============================
     Elements
     =============================== */
  const filtersToggle  = document.getElementById('filtersToggle');   // "Filter +" button
  const filtersDrawer  = document.getElementById('filtersDrawer');   // <aside id="filtersDrawer">
  const filtersClose   = document.getElementById('filtersClose');    // "×" button

  const filterButtons  = document.querySelectorAll('.filter-btn');
  const locationMenu   = document.getElementById('locationMenu');
  const locationToggle = document.getElementById('locationToggle');
  const locationItems  = document.querySelectorAll('#locationMenu li');
  const projects       = document.querySelectorAll('.project');

  // NEW (for swap mode)
  const filtersPanel   = document.getElementById('filtersPanel');
  const categoryMenu   = filtersPanel ? filtersPanel.querySelector('.category-menu') : null;
  let inlineFilters    = filtersPanel ? filtersPanel.querySelector('.inline-filters') : null;

  /* ===============================
     State
     =============================== */
  let selectedCategory = 'all';
  let selectedLocation = null;
  const fadeDuration = 300; // keep in sync with CSS

  /* ===============================
     INIT: Location label to "Location +"
     =============================== */
  if (locationToggle) {
    locationToggle.setAttribute('aria-expanded', 'false'); // NEW
    locationToggle.textContent = 'Location +';              // NEW
  }

  /* ===============================
     Helpers: position dropdown under the button
     =============================== */
  function positionDrawer(){
    if (!filtersToggle || !filtersDrawer) return;
    const btn = filtersToggle.getBoundingClientRect();
    const top = btn.bottom + window.scrollY + 8; // 8px gap
    const right = document.documentElement.clientWidth - btn.right; // align to button's right edge
    filtersDrawer.style.position = 'absolute';
    filtersDrawer.style.top = `${top}px`;
    filtersDrawer.style.right = `${right}px`;
  }

  /* ===============================
     Drawer (dropdown) controls
     =============================== */
  function setFiltersOpenState(open) {
    if (!filtersToggle || !filtersDrawer) return;
    filtersToggle.setAttribute('aria-expanded', String(open));
    filtersToggle.textContent = open ? 'Filter –' : 'Filter +';
    filtersDrawer.classList.toggle('is-open', open);
    filtersDrawer.setAttribute('aria-hidden', open ? 'false' : 'true');

    if (open) {
      positionDrawer(); // make sure it's placed right under the button
    } else {
      // If closing, also collapse the location submenu and exit swap mode if active
      if (locationMenu) {
        locationMenu.classList.remove('show');
        locationMenu.classList.add('hidden');
      }
      if (locationToggle) {
        locationToggle.classList.remove('active');
        locationToggle.setAttribute('aria-expanded', 'false'); // NEW
        locationToggle.textContent = 'Location +';              // NEW
      }
      if (filtersPanel && filtersPanel.classList.contains('swap-mode')) {
        exitLocationSwap();
      }
    }
  }

  // Start closed
  setFiltersOpenState(false);

  // Toggle via button
  if (filtersToggle) {
    filtersToggle.addEventListener('click', () => {
      const open = filtersToggle.getAttribute('aria-expanded') !== 'true';
      setFiltersOpenState(open);
    });
  }

  // Keep aligned while open
  window.addEventListener('resize', () => {
    if (filtersDrawer && filtersDrawer.classList.contains('is-open')) positionDrawer();
  });
  window.addEventListener('scroll', () => {
    if (filtersDrawer && filtersDrawer.classList.contains('is-open')) positionDrawer();
  });

  // Close button (×)
  if (filtersClose) {
    filtersClose.addEventListener('click', () => setFiltersOpenState(false));
  }

  // ESC closes
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && filtersDrawer && filtersDrawer.classList.contains('is-open')) {
      setFiltersOpenState(false);
    }
  });

  // Click outside closes
  document.addEventListener('click', (e) => {
    if (!filtersDrawer || !filtersDrawer.classList.contains('is-open')) return;
    const inside = filtersDrawer.contains(e.target) || (filtersToggle && filtersToggle.contains(e.target));
    if (!inside) setFiltersOpenState(false);
  });

  /* ===============================
     Category Filter
     =============================== */
  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      // Active state
      filterButtons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      // Set category and clear location
      selectedCategory = btn.dataset.category || 'all';
      selectedLocation = null;

      // Close location submenu
      if (locationMenu) {
        locationMenu.classList.remove('show');
        locationMenu.classList.add('hidden');
      }
      if (locationToggle) {
        locationToggle.classList.remove('active');
        locationToggle.setAttribute('aria-expanded', 'false'); // NEW
        locationToggle.textContent = 'Location +';              // NEW
      }

      // If we were in swap mode, exit back to categories
      if (filtersPanel && filtersPanel.classList.contains('swap-mode')) {
        exitLocationSwap();
      }

      filterProjects();

      // Auto-close dropdown
      setFiltersOpenState(false);
    });
  });

  /* =====================================================
     LOCATION: Swap categories with inline location chips
     ===================================================== */

  // build inline container once
  if (filtersPanel && !inlineFilters) {
    inlineFilters = document.createElement('div');
    inlineFilters.className = 'inline-filters fade out';
    if (categoryMenu && categoryMenu.parentNode) {
      categoryMenu.parentNode.insertBefore(inlineFilters, categoryMenu.nextSibling);
    } else {
      filtersPanel.appendChild(inlineFilters);
    }
  }

  function buildInlineLocationChips() {
    if (!inlineFilters || !locationMenu) return;
    inlineFilters.innerHTML = '';
    const items = Array.from(locationMenu.querySelectorAll('li'));
    items.forEach(li => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chip';
      chip.textContent = li.textContent.trim();
      chip.dataset.location = li.dataset.location;

      chip.addEventListener('click', () => {
        selectedLocation = chip.dataset.location || null;
        selectedCategory = 'all';

        // update category buttons to "All"
        filterButtons.forEach(b => b.classList.remove('active'));
        const allBtn = document.querySelector('[data-category="all"]');
        if (allBtn) allBtn.classList.add('active');

        // show active state on chosen chip (briefly)
        inlineFilters.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');

        filterProjects();

        // auto-close the drawer
        setFiltersOpenState(false);

        // exit back to categories after a short delay
        setTimeout(exitLocationSwap, 120);
      });

      inlineFilters.appendChild(chip);
    });
  }

  function enterLocationSwap() {
    if (!filtersPanel || !categoryMenu || !inlineFilters) return;

    // ensure the old dropdown stays closed
    if (locationMenu) {
      locationMenu.classList.remove('show');
      locationMenu.classList.add('hidden');
    }

    if (locationToggle) {
      locationToggle.classList.add('active');
      locationToggle.setAttribute('aria-expanded', 'true'); // NEW
      locationToggle.textContent = 'Location –';             // NEW
    }

    buildInlineLocationChips();

    inlineFilters.classList.remove('in');
    inlineFilters.classList.add('out');
    filtersPanel.classList.add('swap-mode');

    categoryMenu.classList.add('fade', 'out');
    requestAnimationFrame(() => {
      inlineFilters.classList.remove('out');
      inlineFilters.classList.add('in');
    });
  }

  function exitLocationSwap() {
    if (!filtersPanel || !categoryMenu || !inlineFilters) return;

    inlineFilters.classList.remove('in');
    inlineFilters.classList.add('out');

    categoryMenu.classList.add('fade');
    categoryMenu.classList.remove('out');

    setTimeout(() => {
      filtersPanel.classList.remove('swap-mode');
      if (locationToggle) {
        locationToggle.classList.remove('active');
        locationToggle.setAttribute('aria-expanded', 'false'); // NEW
        locationToggle.textContent = 'Location +';              // NEW
      }
      inlineFilters.innerHTML = '';
    }, 180);
  }

  /* ===============================
     Location Toggle (now: swap mode)
     =============================== */
  if (locationToggle) {
    locationToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      // toggle swap mode instead of showing dropdown list
      if (filtersPanel && filtersPanel.classList.contains('swap-mode')) {
        exitLocationSwap();
      } else {
        enterLocationSwap();
      }
    });
  }

  /* ===============================
     (Optional) Legacy Location Dropdown Selection
     Keeps your existing <li> bindings, harmless if unused
     =============================== */
  locationItems.forEach((item) => {
    item.addEventListener('click', () => {
      selectedLocation = item.dataset.location || null;

      selectedCategory = 'all';
      filterButtons.forEach((b) => b.classList.remove('active'));
      const allBtn = document.querySelector('[data-category="all"]');
      if (allBtn) allBtn.classList.add('active');

      if (locationMenu) {
        locationMenu.classList.remove('show');
        locationMenu.classList.add('hidden');
      }
      if (locationToggle) {
        locationToggle.classList.remove('active');
        locationToggle.setAttribute('aria-expanded', 'false'); // NEW
        locationToggle.textContent = 'Location +';              // NEW
      }

      filterProjects();
      setFiltersOpenState(false);
    });
  });

  /* ===============================
     Core Filter Function
     =============================== */
  function filterProjects() {
    // Fade out visible
    projects.forEach((project) => {
      if (project.style.display !== 'none') {
        project.classList.add('fade-out');
      }
    });

    // After fade-out, apply filters then fade back in
    setTimeout(() => {
      projects.forEach((project) => {
        const isTextBlock = project.classList.contains('text-block');

        const matchesCategory =
          selectedCategory === 'all' || project.dataset.category === selectedCategory;

        const matchesLocation =
          !selectedLocation || project.dataset.location === selectedLocation;

        // Location filter overrides category when present
        const shouldShow = selectedLocation ? matchesLocation : matchesCategory;

        // Text blocks show only for All + no location
        const showTextBlock = isTextBlock && selectedCategory === 'all' && !selectedLocation;

        const visible = shouldShow || showTextBlock;

        project.style.display = visible ? 'inline-block' : 'none';

        if (visible) {
          project.classList.add('fade-out');
          requestAnimationFrame(() => {
            project.classList.remove('fade-out');
          });
        }
      });

      // If columns layout jumps, force a reflow:
      // const gallery = document.querySelector('.projects-gallery');
      // if (gallery) void gallery.offsetHeight;

    }, fadeDuration);
  }
});
