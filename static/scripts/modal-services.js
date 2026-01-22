
  const modal = document.getElementById('serviceModal');
  const titleEl = modal.querySelector('.modal__title');
  const contentEl = modal.querySelector('.modal__content');
  const closeBtn = modal.querySelector('.modal__close');

  function openModal(title, html) {
    titleEl.textContent = title;
    contentEl.innerHTML = html;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('is-locked');
  }

  function closeModal() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('is-locked');
  }

  // Open
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.service .learn');
    if (!btn) return;

    const service = btn.closest('.service');
    const title = service.querySelector('h3')?.textContent || '';
    const full = service.dataset.full || service.querySelector('p')?.textContent || '';

    openModal(title, `<p>${full}</p>`);
  });

  // Close
  closeBtn.addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('is-open')) {
      closeModal();
    }
  });

