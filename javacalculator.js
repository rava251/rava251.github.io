// javacalculator.js - Калькулятор стоимости услуги + попап обратной связи
// Полная реализация: History API, Back закрывает форму, fetch отправка на внешний backend,
// localStorage сохранение/восстановление, очистка после успешной отправки.
//
// ВАЖНО: замените FORMCARRY_ENDPOINT на ваш реальный endpoint formcarry.com или slapform.com
// Пример formcarry: https://formcarry.com/s/ВАШ_ИДЕНТИФИКАТОР
// Или slapform: https://api.slapform.com/ВАШ_ID

document.addEventListener('DOMContentLoaded', function () {
  initServiceCalculator();
  initFeedbackPopup();
  initGallerySlider();
});

/* ----------------------------- КАЛЬКУЛЯТОР ----------------------------- */
function initServiceCalculator() {
  const quantityInput = document.getElementById('service-quantity');
  const serviceTypeRadios = document.querySelectorAll('input[name="service-type"]');
  const optionsContainer = document.getElementById('options-container');
  const serviceOptions = document.getElementById('service-options');
  const propertyContainer = document.getElementById('property-container');
  const serviceProperty = document.getElementById('service-property');

  const totalCostElement = document.getElementById('total-cost');

  const basePrices = { basic: 1000, standard: 2500, premium: 5000 };
  const optionPrices = { none: 0, design: 500, analytics: 800, support: 1200 };
  const propertyPrice = 1500;

  let currentType = 'basic';
  let currentQuantity = 1;
  let currentOption = 'none';
  let currentProperty = false;

  function updateDynamicElements() {
    if (optionsContainer) optionsContainer.style.display = 'none';
    if (propertyContainer) propertyContainer.style.display = 'none';
    if (serviceOptions) {
      serviceOptions.value = 'none';
      currentOption = 'none';
    }
    if (serviceProperty) {
      serviceProperty.checked = false;
      currentProperty = false;
    }
    if (currentType === 'standard' && optionsContainer) optionsContainer.style.display = 'block';
    if (currentType === 'premium' && propertyContainer) propertyContainer.style.display = 'block';
    calculateTotalCost();
  }

  function calculateTotalCost() {
    const baseCost = basePrices[currentType] || 0;
    const optionCost = optionPrices[currentOption] || 0;
    const propertyCost = currentProperty ? propertyPrice : 0;
    const unitCost = baseCost + optionCost + propertyCost;
    const totalCost = unitCost * currentQuantity;
    updateDisplay(totalCost);
    return totalCost;
  }

  function updateDisplay(totalCost) {
    const formatPrice = (price) => new Intl.NumberFormat('ru-RU').format(price) + ' руб.';
    if (totalCostElement) totalCostElement.textContent = formatPrice(totalCost);
  }

  function validateQuantity(input) {
    if (!input) return 1;
    let value = parseInt(input.value, 10);
    if (isNaN(value) || value < 1) { value = 1; input.value = 1; }
    if (value > 1000) { value = 1000; input.value = 1000; }
    return value;
  }

  function handleQuantityChange() { currentQuantity = validateQuantity(quantityInput); calculateTotalCost(); }
  function handleServiceTypeChange(e) { currentType = e.target.value; updateDynamicElements(); }
  function handleOptionsChange() { if (serviceOptions) { currentOption = serviceOptions.value; calculateTotalCost(); } }
  function handlePropertyChange() { if (serviceProperty) { currentProperty = serviceProperty.checked; calculateTotalCost(); } }

  function initEvents() {
    if (quantityInput) { quantityInput.addEventListener('input', handleQuantityChange); quantityInput.addEventListener('change', handleQuantityChange); }
    if (serviceTypeRadios.length > 0) serviceTypeRadios.forEach(r => r.addEventListener('change', handleServiceTypeChange));
    if (serviceOptions) serviceOptions.addEventListener('change', handleOptionsChange);
    if (serviceProperty) serviceProperty.addEventListener('change', handlePropertyChange);
  }

  function init() {
    if (!quantityInput || serviceTypeRadios.length === 0) return;
    currentQuantity = validateQuantity(quantityInput);
    const checkedRadio = document.querySelector('input[name="service-type"]:checked');
    if (checkedRadio) currentType = checkedRadio.value;
    updateDynamicElements();
    initEvents();
    calculateTotalCost();
  }

  init();
}

/* ----------------------------- ПОПАП ОБРАТНОЙ СВЯЗИ ----------------------------- */
function initFeedbackPopup() {
  const openBtn = document.getElementById('openFeedbackBtn');
  const modal = document.getElementById('feedbackModal');
  const backdrop = document.getElementById('feedbackBackdrop');
  const closeBtn = document.getElementById('closeFeedbackBtn');
  const cancelBtn = document.getElementById('feedbackCancel');
  const form = document.getElementById('feedbackForm');
  const messageBox = document.getElementById('feedbackMessage');
  const charCounter = document.getElementById('fb-char-counter');
  const submitBtn = document.getElementById('feedbackSubmit');

  // Замените этот URL на ваш реальный endpoint (formcarry/slapform)
  const FORMCARRY_ENDPOINT = 'https://formcarry.com/s/REPLACE_WITH_YOUR_ID';

  const STORAGE_KEY = 'feedbackFormData_v1';
  let pushedState = false;
  let previouslyFocused = null;

  function openModal(pushHistory = true) {
    if (!modal) return;
    previouslyFocused = document.activeElement;

    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');

    // восстановление из localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try { fillForm(JSON.parse(saved)); } catch (e) { console.warn('localStorage parse error', e); }
    } else {
      updateCharCounter();
    }

    // фокус на первый контрол
    const firstInput = modal.querySelector('input, textarea, button, [tabindex]:not([tabindex="-1"])');
    if (firstInput) firstInput.focus();

    // push history so Back closes modal
    if (pushHistory && window.history && !pushedState) {
      try {
        const url = new URL(window.location.href);
        url.searchParams.set('feedback', '1');
        window.history.pushState({ feedbackOpen: true }, '', url);
        pushedState = true;
      } catch (e) { console.warn('pushState failed', e); }
    }

    document.addEventListener('keydown', handleKeydown);
  }

  function closeModal(byPopstate = false) {
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');

    // восстановление фокуса
    try { if (previouslyFocused && typeof previouslyFocused.focus === 'function') previouslyFocused.focus(); } catch (e) {}

    // если закрытие не из popstate, вернуть историю назад (убрать параметр)
    if (!byPopstate && pushedState && window.history) {
      try { window.history.back(); } catch (e) { console.warn('history.back failed', e); }
    }
    pushedState = false;

    document.removeEventListener('keydown', handleKeydown);
  }

  function fillForm(data = {}) {
    if (!form) return;
    const set = (sel, val) => { const el = form.querySelector(sel); if (el) el.value = val || ''; };
    set('#fb-fio', data.fio);
    set('#fb-email', data.email);
    set('#fb-phone', data.phone);
    set('#fb-org', data.organization);
    set('#fb-message', data.message);
    const consentEl = form.querySelector('#fb-consent');
    if (consentEl) consentEl.checked = !!data.consent;
    updateCharCounter();
  }

  function collectFormData() {
    if (!form) return {};
    return {
      fio: (form.querySelector('#fb-fio') || { value: '' }).value.trim(),
      email: (form.querySelector('#fb-email') || { value: '' }).value.trim(),
      phone: (form.querySelector('#fb-phone') || { value: '' }).value.trim(),
      organization: (form.querySelector('#fb-org') || { value: '' }).value.trim(),
      message: (form.querySelector('#fb-message') || { value: '' }).value.trim(),
      consent: !!(form.querySelector('#fb-consent') && form.querySelector('#fb-consent').checked)
    };
  }

  function saveToLocalStorage() {
    const data = collectFormData();
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) { console.warn('localStorage set error', e); }
  }

  function clearLocalStorage() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { console.warn('localStorage remove error', e); }
  }

  function showMessage(text, type = 'success') {
    if (!messageBox) return;
    messageBox.textContent = text;
    messageBox.className = '';
    messageBox.style.display = 'block';
    messageBox.classList.add(type === 'success' ? 'success' : 'error');
  }

  function hideMessage() {
    if (!messageBox) return;
    messageBox.style.display = 'none';
    messageBox.textContent = '';
    messageBox.className = '';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    hideMessage();

    const data = collectFormData();
    // клиентская валидация
    if (!data.fio || !data.email || !data.phone || !data.message || !data.consent) {
      showMessage('Пожалуйста, заполните все обязательные поля и подтвердите согласие.', 'error');
      return;
    }

    // блокируем кнопку отправки
    if (submitBtn) submitBtn.disabled = true;

    try {
      const res = await fetch(FORMCARRY_ENDPOINT, {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => res.statusText);
        console.warn('Ошибка отправки формы:', res.status, txt);
        showMessage('Ошибка отправки формы. Попробуйте позже.', 'error');
        return;
      }

      showMessage('Спасибо! Ваше сообщение отправлено.', 'success');
      form.reset();
      clearLocalStorage();
      updateCharCounter();

      // закрываем модалку немного позже, чтобы пользователь увидел сообщение
      setTimeout(() => closeModal(true), 1000);
    } catch (err) {
      console.error('Fetch error:', err);
      showMessage('Ошибка соединения. Попробуйте еще раз позднее.', 'error');
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  }

  function handleKeydown(e) {
    // ESC close
    if (e.key === 'Escape') {
      if (modal && modal.getAttribute('aria-hidden') === 'false') {
        closeModal(false);
        e.preventDefault();
      }
      return;
    }

    // focus trap (simple)
    if (e.key === 'Tab') {
      const focusable = modal.querySelectorAll('a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])');
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { last.focus(); e.preventDefault(); }
      } else {
        if (document.activeElement === last) { first.focus(); e.preventDefault(); }
      }
    }
  }

  if (openBtn) openBtn.addEventListener('click', (ev) => { ev.preventDefault(); openModal(true); });
  if (closeBtn) closeBtn.addEventListener('click', () => closeModal(false));
  if (cancelBtn) cancelBtn.addEventListener('click', () => closeModal(false));
  if (backdrop) backdrop.addEventListener('click', (ev) => { if (ev.target && ev.target.dataset && ev.target.dataset.close) closeModal(false); });

  if (form) {
    form.addEventListener('input', () => { saveToLocalStorage(); updateCharCounter(); });
    form.addEventListener('submit', handleSubmit);
  }

  window.addEventListener('popstate', (event) => {
    if (event.state && event.state.feedbackOpen) {
      openModal(false);
    } else {
      if (modal && modal.getAttribute('aria-hidden') === 'false') closeModal(true);
    }
  });

  // если URL содержит ?feedback=1 — открыть попап при загрузке
  (function openIfRequested() {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('feedback') === '1') {
        // удаляем параметр и открываем через push, чтобы корректно работал Back
        const url = new URL(window.location.href);
        url.searchParams.delete('feedback');
        history.replaceState({}, '', url);
        openModal(true);
      }
    } catch (e) { console.warn('Не удалось прочитать URL параметры:', e); }
  })();

  function updateCharCounter() {
    if (!charCounter) return;
    const txt = (form && form.querySelector('#fb-message') && form.querySelector('#fb-message').value) || '';
    charCounter.textContent = `${txt.length} / 1000`;
  }
}

/* ----------------------------- ПРОСТОЙ ГАЛЕРЕЙНЫЙ СЛАЙДЕР ----------------------------- */
function initGallerySlider() {
  const images = [
    { url: 'https://avatars.mds.yandex.net/i?id=7d59c265d37c81aca35c2faa8bc5a1d0_l-3518654-images-thumbs&n=13', title: 'Главный корпус КубГУ' },
    { url: 'https://kubnews.ru/upload/resize_cache/iblock/af5/1200_630_2/af59aadd2bf8711ee26c17473794ddd3.jpg', title: 'Студенты КубГУ' },
    { url: 'https://img0.liveinternet.ru/images/attach/c/9/126/184/126184088__00_1.jpg', title: 'Библиотека КубГУ' }
  ];

  const sliderWrapper = document.getElementById('sliderWrapper');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const currentPageEl = document.getElementById('currentPage');
  const totalPagesEl = document.getElementById('totalPages');
  const pagerDots = document.getElementById('pagerDots');

  if (!sliderWrapper) return;

  let currentSlide = 0;
  let slidesPerView = window.innerWidth <= 768 ? 1 : 3;
  let totalSlides = images.length;

  function renderSlides() {
    sliderWrapper.innerHTML = '';
    images.forEach(img => {
      const slide = document.createElement('div');
      slide.className = 'slide';
      const image = document.createElement('img');
      image.src = img.url;
      image.alt = img.title;
      image.className = 'slide-image';
      slide.appendChild(image);
      sliderWrapper.appendChild(slide);
    });
    updateSlider();
    renderPager();
  }

  function calculateTotalPages() { return Math.ceil(totalSlides / slidesPerView); }

  function updateSlider() {
    slidesPerView = window.innerWidth <= 768 ? 1 : 3;
    const slideWidth = 100 / slidesPerView;
    const translateX = -currentSlide * slideWidth;
    sliderWrapper.style.transform = `translateX(${translateX}%)`;
    if (currentPageEl) currentPageEl.textContent = currentSlide + 1;
    if (totalPagesEl) totalPagesEl.textContent = calculateTotalPages();
    updatePagerDots();
    updateNavButtons();
  }

  function renderPager() {
    if (!pagerDots) return;
    pagerDots.innerHTML = '';
    const pages = calculateTotalPages();
    for (let i = 0; i < pages; i++) {
      const dot = document.createElement('div');
      dot.className = 'pager-dot' + (i === currentSlide ? ' active' : '');
      dot.addEventListener('click', () => { goToSlide(i); });
      pagerDots.appendChild(dot);
    }
  }

  function updatePagerDots() {
    if (!pagerDots) return;
    const dots = pagerDots.querySelectorAll('.pager-dot');
    dots.forEach((d, i) => d.classList.toggle('active', i === currentSlide));
  }

  function updateNavButtons() {
    const pages = calculateTotalPages();
    if (prevBtn) prevBtn.disabled = currentSlide === 0;
    if (nextBtn) nextBtn.disabled = currentSlide >= pages - 1;
  }

  function goToSlide(i) {
    const pages = calculateTotalPages();
    if (i >= 0 && i < pages) {
      currentSlide = i;
      updateSlider();
    }
  }

  function next() {
    const pages = calculateTotalPages();
    if (currentSlide < pages - 1) { currentSlide++; updateSlider(); }
  }

  function prev() {
    if (currentSlide > 0) { currentSlide--; updateSlider(); }
  }

  if (prevBtn) prevBtn.addEventListener('click', prev);
  if (nextBtn) nextBtn.addEventListener('click', next);
  window.addEventListener('resize', () => { slidesPerView = window.innerWidth <= 768 ? 1 : 3; updateSlider(); });

  renderSlides();
}