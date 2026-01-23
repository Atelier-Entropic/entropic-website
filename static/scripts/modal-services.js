
  const modal = document.getElementById('serviceModal');
  const titleEl = modal.querySelector('.modal__title');
  const contentEl = modal.querySelector('.modal__content');
  const closeBtn = modal.querySelector('.modal__close');
  const galleryEl = document.getElementById('modalGallery');

  // ✅ put your real images here
  const SERVICE_GALLERY = {
    urban: [
      { src: "{% static 'images/about/services/urban-01.webp' %}", cap: "Masterplan frameworks" },
      { src: "{% static 'images/about/services/urban-02.webp' %}", cap: "Mobility + public space" },
      { src: "{% static 'images/about/services/urban-03.webp' %}", cap: "Phasing + regulations" },
      { src: "{% static 'images/about/services/urban-04.webp' %}", cap: "Green infrastructure" },
    ],
    architecture: [
      { src: "{% static 'images/about/services/arch-01.webp' %}", cap: "Concept to DD" },
      { src: "{% static 'images/about/services/arch-02.webp' %}", cap: "Residential + mixed-use" },
      { src: "{% static 'images/about/services/arch-03.webp' %}", cap: "Material strategy" },
      { src: "{% static 'images/about/services/arch-04.webp' %}", cap: "Buildable systems" },
    ],
    landscape: [
      { src: "{% static 'images/about/services/land-01.webp' %}", cap: "Parks + waterfronts" },
      { src: "{% static 'images/about/services/land-02.webp' %}", cap: "Planting strategy" },
      { src: "{% static 'images/about/services/land-03.webp' %}", cap: "Drainage + grading" },
      { src: "{% static 'images/about/services/land-04.webp' %}", cap: "Microclimate design" },
    ],
    infrastructure: [
      { src: "{% static 'images/about/services/infra-01.webp' %}", cap: "Mobility networks" },
      { src: "{% static 'images/about/services/infra-02.webp' %}", cap: "Bridges + connectors" },
      { src: "{% static 'images/about/services/infra-03.webp' %}", cap: "Wayfinding + flows" },
      { src: "{% static 'images/about/services/infra-04.webp' %}", cap: "Integrated systems" },
    ],
    interior: [
      { src: "{% static 'images/about/services/int-01.webp' %}", cap: "Space planning" },
      { src: "{% static 'images/about/services/int-02.webp' %}", cap: "Material palette" },
      { src: "{% static 'images/about/services/int-03.webp' %}", cap: "Lighting coordination" },
      { src: "{% static 'images/about/services/int-04.webp' %}", cap: "Custom details" },
    ],
  };

  function renderGallery(serviceKey) {
    const items = SERVICE_GALLERY[serviceKey] || [];
    galleryEl.innerHTML = items.slice(0, 4).map(item => `
      <figure class="modal__gallery-item">
        <img src="${item.src}" alt="${item.cap}">
        <figcaption>${item.cap}</figcaption>
      </figure>
    `).join('');
  }

  function openModal(title, html, serviceKey) {
    titleEl.textContent = title;
    contentEl.innerHTML = html;
    renderGallery(serviceKey);

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
  }

  // open
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.service .learn');
    if (!btn) return;

    const service = btn.closest('.service');
    const key = service.dataset.service; // 👈 urban / architecture / etc
    const title = service.querySelector('h3')?.textContent || '';
    const full = service.dataset.full || service.querySelector('p')?.textContent || '';

    openModal(title, `<p>${full}</p>`, key);
  });

  // close
  closeBtn.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) closeModal();
  });

