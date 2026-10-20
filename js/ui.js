(() => {
  const config = window.SAKURA_CONFIG;
  const dialog = document.querySelector('#photo-dialog');
  const grid = document.querySelector('#photo-grid');
  grid.style.gridTemplateColumns = 'minmax(0, 1fr)';
  const previousFocus = { element: null };
  const photosPath = 'assets/photos/';

  document.title = config.title;
  document.querySelector('.brand strong').textContent = config.title;
  document.querySelector('.brand small').textContent = config.subtitle;

  function closeDialog() {
    dialog.classList.remove('is-open');
    dialog.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('dialog-open');
    if (previousFocus.element?.isConnected) previousFocus.element.focus();
  }

  function makePhotoCard(source, index) {
    const card = document.createElement('figure');
    card.className = 'photo-card';
    const image = document.createElement('img');
    image.alt = `Ảnh kỷ niệm ${index + 1}`;
    image.loading = 'lazy';
    const placeholder = document.createElement('div');
    placeholder.className = 'photo-placeholder';
    placeholder.setAttribute('role', 'img');
    placeholder.setAttribute('aria-label', `Ô ảnh kỷ niệm ${index + 1}`);
    placeholder.innerHTML = `<span class="placeholder-flower" aria-hidden="true">✿</span><span class="placeholder-text">Ô ảnh kỷ niệm ${index + 1}</span>`;
    const showPlaceholder = () => {
      image.remove();
      placeholder.classList.add('is-visible');
      if (!placeholder.querySelector('.placeholder-filename')) {
        const note = document.createElement('span');
        note.className = 'placeholder-filename';
        note.textContent = 'Dán link vào imageUrl trong js/config.js';
        placeholder.append(note);
      }
    };
    if (source) {
      image.src = /^https?:\/\//i.test(source) || source.startsWith('data:') || source.includes('/')
        ? source
        : `${photosPath}${encodeURIComponent(source)}`;
    } else {
      showPlaceholder();
    }
    image.addEventListener('error', showPlaceholder, { once: true });
    if (source) card.append(image, placeholder);
    else card.append(placeholder);
    return card;
  }

  function openGift(id, trigger) {
    const gift = config.gifts.find(item => item.id === id);
    if (!gift) return;
    previousFocus.element = trigger || document.activeElement;
    grid.replaceChildren(makePhotoCard(gift.imageUrl || '', 0));
    dialog.classList.add('is-open');
    dialog.setAttribute('aria-hidden', 'false');
    document.body.classList.add('dialog-open');
    document.querySelector('.dialog-close').focus();
    document.querySelector('#gift-live').textContent = `Đã mở ${gift.label}: ${gift.title}`;
  }

  function makeGiftButton(gift, className) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.dataset.giftId = gift.id;
    button.setAttribute('aria-label', `Mở ${gift.label}: ${gift.title}`);
    button.innerHTML = '<span aria-hidden="true">✧</span>';
    button.addEventListener('click', () => openGift(gift.id, button));
    return button;
  }

  config.gifts.forEach(gift => {
    const accessibleButton = makeGiftButton(gift, 'gift-access-button');
    accessibleButton.innerHTML = `<span aria-hidden="true">✧</span><span>${gift.label}</span>`;
    document.querySelector('#gift-access').append(accessibleButton);
    const fallbackButton = makeGiftButton(gift, 'fallback-gift-button');
    fallbackButton.innerHTML = `<span aria-hidden="true">🎁</span><span>${gift.label}</span>`;
    document.querySelector('#fallback-gifts').append(fallbackButton);
  });

  dialog.addEventListener('click', event => {
    if (event.target.closest('[data-close-dialog]')) closeDialog();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && dialog.classList.contains('is-open')) closeDialog();
    if (event.key === 'Tab' && dialog.classList.contains('is-open')) {
      const focusable = [...dialog.querySelectorAll('button, a, [tabindex]:not([tabindex="-1"])')].filter(el => !el.disabled);
      if (!focusable.length) return;
      const first = focusable[0], last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });

  window.openSakuraGift = openGift;
  window.activateSakuraScene = () => {
    window.sakuraSceneReady = true;
    document.querySelector('#reset-camera').hidden = false;
    document.querySelector('#fallback-scene').classList.remove('is-visible');
    document.querySelector('#fallback-gifts').classList.remove('is-visible');
    document.querySelector('#scene-hint').classList.add('is-visible');
    document.querySelector('#gift-access').classList.add('is-visible');
    document.querySelector('#loading-note').classList.add('is-hidden');
  };
  window.showSakuraFallback = () => {
    document.querySelector('#reset-camera').hidden = true;
    document.querySelector('#fallback-scene').classList.add('is-visible');
    document.querySelector('#fallback-gifts').classList.add('is-visible');
    document.querySelector('#loading-note').classList.add('is-hidden');
  };
})();
