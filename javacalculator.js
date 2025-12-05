// javacalculator.js - Калькулятор стоимости услуги + попап обратной связи
// Инициализируются калькулятор и попап (fetch + History API + localStorage)

document.addEventListener('DOMContentLoaded', function() {
    initServiceCalculator();
    initFeedbackPopup();
});

/* ----------------------------- КАЛЬКУЛЯТОР ----------------------------- */
function initServiceCalculator() {
    const quantityInput = document.getElementById('service-quantity');
    const serviceTypeRadios = document.querySelectorAll('input[name="service-type"]');
    const optionsContainer = document.getElementById('options-container');
    const serviceOptions = document.getElementById('service-options');
    const propertyContainer = document.getElementById('property-container');
    const serviceProperty = document.getElementById('service-property');
    
    const baseCostElement = document.getElementById('base-cost');
    const optionCostElement = document.getElementById('option-cost');
    const optionCostRow = document.getElementById('option-cost-row');
    const propertyCostElement = document.getElementById('property-cost');
    const propertyCostRow = document.getElementById('property-cost-row');
    const quantityDisplay = document.getElementById('quantity-display');
    const totalCostElement = document.getElementById('total-cost');
    const resultContainer = document.getElementById('result-container');
    
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
        if (optionCostRow) optionCostRow.style.display = 'none';
        if (propertyCostRow) propertyCostRow.style.display = 'none';
        
        if (serviceOptions) {
            serviceOptions.value = 'none';
            currentOption = 'none';
        }
        if (serviceProperty) {
            serviceProperty.checked = false;
            currentProperty = false;
        }
        
        switch (currentType) {
            case 'basic':
                break;
            case 'standard':
                if (optionsContainer) {
                    optionsContainer.style.display = 'block';
                    optionsContainer.classList.add('dynamic-element');
                }
                break;
            case 'premium':
                if (propertyContainer) {
                    propertyContainer.style.display = 'block';
                    propertyContainer.classList.add('dynamic-element');
                }
                break;
            default:
                console.warn('Неизвестный тип услуги:', currentType);
        }
        
        calculateTotalCost();
    }
    
    function calculateTotalCost() {
        const baseCost = basePrices[currentType] || 0;
        const optionCost = optionPrices[currentOption] || 0;
        const propertyCost = currentProperty ? propertyPrice : 0;
        const unitCost = baseCost + optionCost + propertyCost;
        const totalCost = unitCost * currentQuantity;
        updateDisplay(baseCost, optionCost, propertyCost, totalCost);
        return totalCost;
    }
    
    function updateDisplay(baseCost, optionCost, propertyCost, totalCost) {
        const formatPrice = (price) => new Intl.NumberFormat('ru-RU').format(price) + ' руб.';
        if (baseCostElement) baseCostElement.textContent = formatPrice(baseCost);
        if (optionCostElement && optionCostRow) {
            if (optionCost > 0 && currentType === 'standard') {
                optionCostElement.textContent = formatPrice(optionCost);
                optionCostRow.style.display = 'flex';
            } else {
                optionCostRow.style.display = 'none';
            }
        }
        if (propertyCostElement && propertyCostRow) {
            if (propertyCost > 0 && currentType === 'premium') {
                propertyCostElement.textContent = formatPrice(propertyCost);
                propertyCostRow.style.display = 'flex';
            } else {
                propertyCostRow.style.display = 'none';
            }
        }
        if (quantityDisplay) quantityDisplay.textContent = currentQuantity;
        if (totalCostElement) totalCostElement.textContent = formatPrice(totalCost);
        if (resultContainer) resultContainer.style.display = 'block';
    }
    
    function validateQuantity(input) {
        let value = parseInt(input.value, 10);
        if (isNaN(value) || value < 1) { value = 1; input.value = 1; }
        if (value > 1000) { value = 1000; input.value = 1000; }
        return value;
    }
    
    function handleQuantityChange() { currentQuantity = validateQuantity(quantityInput); calculateTotalCost(); }
    function handleServiceTypeChange(event) { currentType = event.target.value; updateDynamicElements(); }
    function handleOptionsChange() { if (serviceOptions) { currentOption = serviceOptions.value; calculateTotalCost(); } }
    function handlePropertyChange() { if (serviceProperty) { currentProperty = serviceProperty.checked; calculateTotalCost(); } }
    
    function initEvents() {
        if (quantityInput) { quantityInput.addEventListener('input', handleQuantityChange); quantityInput.addEventListener('change', handleQuantityChange); }
        if (serviceTypeRadios.length > 0) serviceTypeRadios.forEach(radio => radio.addEventListener('change', handleServiceTypeChange));
        if (serviceOptions) serviceOptions.addEventListener('change', handleOptionsChange);
        if (serviceProperty) serviceProperty.addEventListener('change', handlePropertyChange);
    }
    
    function initCalculator() {
        if (!quantityInput) { console.error('Элемент service-quantity не найден'); return; }
        if (serviceTypeRadios.length === 0) { console.error('Радиокнопки service-type не найдены'); return; }
        currentQuantity = validateQuantity(quantityInput);
        const checkedRadio = document.querySelector('input[name="service-type"]:checked');
        if (checkedRadio) currentType = checkedRadio.value;
        updateDynamicElements();
        initEvents();
        calculateTotalCost();
        console.log('Калькулятор инициализирован');
    }
    
    initCalculator();
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

    // Замените FORMCARRY_ENDPOINT на реальный endpoint formcarry/slapform
    const FORMCARRY_ENDPOINT = 'https://formcarry.com/s/your_form_id'; // <-- Поменяйте на ваш URL

    const STORAGE_KEY = 'feedbackFormData_v1';
    let pushedState = false;

    function openModal(pushHistory = true) {
        if (!modal) return;
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');

        // Восстановление значений из localStorage
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const data = JSON.parse(saved);
                fillForm(data);
            } catch (e) {
                console.warn('Не удалось распарсить сохранённые данные формы:', e);
            }
        }

        if (pushHistory && window.history && !pushedState) {
            try {
                const url = new URL(window.location.href);
                url.searchParams.set('feedback', '1');
                window.history.pushState({ feedbackOpen: true }, '', url);
                pushedState = true;
            } catch (e) {
                console.warn('History pushState error', e);
            }
        }
    }

    function closeModal(byHistory = false) {
        if (!modal) return;
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');

        if (!byHistory && pushedState && window.history) {
            try {
                window.history.back();
            } catch (e) {}
            return;
        }
        pushedState = false;
    }

    function fillForm(data = {}) {
        if (!form) return;
        const set = (selector, value) => {
            const el = form.querySelector(selector);
            if (el) el.value = value || '';
        };
        set('#fb-fio', data.fio);
        set('#fb-email', data.email);
        set('#fb-phone', data.phone);
        set('#fb-org', data.organization);
        set('#fb-message', data.message);
        const consentEl = form.querySelector('#fb-consent');
        if (consentEl) consentEl.checked = !!data.consent;
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
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn('Не удалось сохранить форму в localStorage', e);
        }
    }

    function clearLocalStorage() {
        try { localStorage.removeItem(STORAGE_KEY); } catch (e) { console.warn('Ошибка удаления localStorage', e); }
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

    async function handleSubmit(event) {
        event.preventDefault();
        hideMessage();
        const data = collectFormData();

        // Простая клиентская валидация
        if (!data.fio || !data.email || !data.phone || !data.message || !data.consent) {
            showMessage('Пожалуйста, заполните все обязательные поля и подтвердите согласие.', 'error');
            return;
        }

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
            if (form) form.reset();
            clearLocalStorage();

            setTimeout(() => closeModal(true), 1200);
        } catch (err) {
            console.error('Fetch error:', err);
            showMessage('Ошибка соединения. Попробуйте еще раз позднее.', 'error');
        }
    }

    if (openBtn) openBtn.addEventListener('click', (e) => { e.preventDefault(); openModal(true); });
    if (closeBtn) closeBtn.addEventListener('click', () => closeModal(false));
    if (cancelBtn) cancelBtn.addEventListener('click', () => closeModal(false));
    if (backdrop) backdrop.addEventListener('click', (e) => { if (e.target && e.target.dataset && e.target.dataset.close) closeModal(false); });

    if (form) {
        form.addEventListener('input', () => saveToLocalStorage());
        form.addEventListener('submit', handleSubmit);
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.getAttribute('aria-hidden') === 'false') closeModal(false);
    });

    window.addEventListener('popstate', (event) => {
        if (event.state && event.state.feedbackOpen) {
            openModal(false);
        } else {
            if (modal && modal.getAttribute('aria-hidden') === 'false') closeModal(true);
        }
    });

    // Если URL содержит ?feedback=1 — открываем попап
    (function openIfRequested() {
        try {
            const params = new URLSearchParams(window.location.search);
            if (params.get('feedback') === '1') {
                window.history.replaceState({}, '', window.location.href);
                openModal(false);
                if (window.history) {
                    const url = new URL(window.location.href);
                    url.searchParams.set('feedback', '1');
                    window.history.pushState({ feedbackOpen: true }, '', url);
                    pushedState = true;
                }
            }
        } catch (e) { console.warn('Не удалось прочитать URL параметры:', e); }
    })();
}
<svg xmlns="http://www.w3.org/2000/svg" width="320" height="160" viewBox="0 0 320 160" role="img" aria-label="Карта ссылок: КубГУ и GitHub">
  <rect width="320" height="160" fill="#dddddd"/>
  <rect x="20" y="20" width="120" height="60" fill="#777777"/>
  <circle cx="230" cy="80" r="36" fill="#999999"/>
</svg>