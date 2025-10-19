// script.js - Кастомный JavaScript для калькулятора и форм

document.addEventListener('DOMContentLoaded', function() {
    // Инициализация счетчика символов для биографии
    initCharCounter();
    
    // Инициализация валидации формы
    initFormValidation();
    
    // Инициализация калькулятора стоимости
    initCalculator();
});

/**
 * Инициализация счетчика символов для текстового поля биографии
 */
function initCharCounter() {
    const bioTextarea = document.getElementById('field-name-2');
    const bioCounter = document.getElementById('bio-counter');
    
    if (bioTextarea && bioCounter) {
        bioTextarea.addEventListener('input', function() {
            const currentLength = this.value.length;
            bioCounter.textContent = `${currentLength}/500 символов`;
            
            if (currentLength > 450) {
                bioCounter.style.color = 'var(--warning-color)';
            } else {
                bioCounter.style.color = 'var(--text-light)';
            }
        });
        
        // Инициализация при загрузке
        bioTextarea.dispatchEvent(new Event('input'));
    }
}

/**
 * Инициализация валидации формы регистрации
 */
function initFormValidation() {
    const form = document.getElementById('registration-form');
    const nameInput = document.getElementById('field-name-1');
    const phoneInput = document.getElementById('field-phone');
    const emailInput = document.getElementById('field-email');
    const agreementInput = document.getElementById('agreement');
    
    const nameError = document.getElementById('name-error');
    const phoneError = document.getElementById('phone-error');
    const emailError = document.getElementById('email-error');
    const agreementError = document.getElementById('agreement-error');
    
    // Регулярные выражения для валидации
    const nameRegex = /^[А-Яа-яЁё\s]{2,}$/;
    const phoneRegex = /^\+7\s?[\(]{0,1}9[0-9]{2}[\)]{0,1}\s?\d{3}[-]{0,1}\d{2}[-]{0,1}\d{2}$/;
    
    function validateName() {
        const isValid = nameRegex.test(nameInput.value.trim());
        nameError.style.display = isValid ? 'none' : 'block';
        nameInput.classList.toggle('is-invalid', !isValid);
        return isValid;
    }
    
    function validatePhone() {
        const isValid = phoneRegex.test(phoneInput.value.trim());
        phoneError.style.display = isValid ? 'none' : 'block';
        phoneInput.classList.toggle('is-invalid', !isValid);
        return isValid;
    }
    
    function validateEmail() {
        const isValid = emailInput.checkValidity();
        emailError.style.display = isValid ? 'none' : 'block';
        emailInput.classList.toggle('is-invalid', !isValid);
        return isValid;
    }
    
    function validateAgreement() {
        const isValid = agreementInput.checked;
        agreementError.style.display = isValid ? 'none' : 'block';
        agreementInput.classList.toggle('is-invalid', !isValid);
        return isValid;
    }
    
    // Добавляем обработчики событий
    if (nameInput) {
        nameInput.addEventListener('blur', validateName);
        nameInput.addEventListener('input', function() {
            if (nameInput.classList.contains('is-invalid')) {
                validateName();
            }
        });
    }
    
    if (phoneInput) {
        phoneInput.addEventListener('blur', validatePhone);
        phoneInput.addEventListener('input', function() {
            if (phoneInput.classList.contains('is-invalid')) {
                validatePhone();
            }
        });
    }
    
    if (emailInput) {
        emailInput.addEventListener('blur', validateEmail);
        emailInput.addEventListener('input', function() {
            if (emailInput.classList.contains('is-invalid')) {
                validateEmail();
            }
        });
    }
    
    if (agreementInput) {
        agreementInput.addEventListener('change', validateAgreement);
    }
    
    // Валидация при отправке формы
    if (form) {
        form.addEventListener('submit', function(e) {
            const isNameValid = validateName();
            const isPhoneValid = validatePhone();
            const isEmailValid = validateEmail();
            const isAgreementValid = validateAgreement();
            
            if (!isNameValid || !isPhoneValid || !isEmailValid || !isAgreementValid) {
                e.preventDefault();
                
                // Прокрутка к первой ошибке
                if (!isNameValid) {
                    nameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else if (!isPhoneValid) {
                    phoneInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else if (!isEmailValid) {
                    emailInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                } else if (!isAgreementValid) {
                    agreementInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });
    }
}

/**
 * Инициализация калькулятора стоимости заказа
 */
function initCalculator() {
    const calculateBtn = document.getElementById('calculate-btn');
    const quantityInput = document.getElementById('product-quantity');
    const productSelect = document.getElementById('product-select');
    const resultContainer = document.getElementById('result-container');
    const calculationResult = document.getElementById('calculation-result');
    const quantityError = document.getElementById('quantity-error');
    
    // Регулярное выражение для проверки количества (только цифры)
    const quantityRegex = /^\d+$/;
    
    /**
     * Валидация поля количества товара
     */
    function validateQuantity() {
        const value = quantityInput.value.trim();
        const isValid = quantityRegex.test(value) && parseInt(value) > 0;
        
        quantityError.style.display = isValid ? 'none' : 'block';
        quantityInput.classList.toggle('is-invalid', !isValid);
        
        return isValid;
    }
    
    /**
     * Расчет стоимости заказа
     */
    function calculateOrder() {
        // Валидация количества
        if (!validateQuantity()) {
            resultContainer.style.display = 'none';
            quantityInput.focus();
            return;
        }
        
        const quantity = parseInt(quantityInput.value);
        const selectedOptions = productSelect.selectedOptions;
        
        // Проверка выбора товаров
        if (selectedOptions.length === 0) {
            calculationResult.textContent = 'Пожалуйста, выберите хотя бы один товар.';
            resultContainer.style.display = 'block';
            productSelect.focus();
            return;
        }
        
        let totalCost = 0;
        let resultHTML = '';
        
        // Расчет стоимости для каждого выбранного товара
        Array.from(selectedOptions).forEach((option, index) => {
            const price = parseInt(option.value);
            const productName = option.text.split(' - ')[0];
            const productCost = price * quantity;
            
            totalCost += productCost;
            
            resultHTML += `
                <div class="calculation-item">
                    <strong>${index + 1}. ${productName}:</strong><br>
                    Количество: ${quantity} × Цена: ${price} руб. = <strong>${productCost} руб.</strong>
                </div>
            `;
        });
        
        // Добавление итоговой стоимости
        resultHTML += `
            <div class="mt-3 pt-3 border-top">
                <h6 class="text-success mb-2">Итого к оплате:</h6>
                <p class="fs-5 fw-bold text-success">${totalCost} руб.</p>
            </div>
        `;
        
        calculationResult.innerHTML = resultHTML;
        resultContainer.style.display = 'block';
        
        // Прокрутка к результату
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    // Обработчики событий
    if (calculateBtn && quantityInput && productSelect) {
        calculateBtn.addEventListener('click', calculateOrder);
        
        // Валидация при вводе
        quantityInput.addEventListener('input', function() {
            if (quantityInput.classList.contains('is-invalid')) {
                validateQuantity();
            }
        });
        
        quantityInput.addEventListener('blur', validateQuantity);
        
        // Обработка клавиши Enter в поле количества
        quantityInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                calculateOrder();
            }
        });
    }
}

/**
 * Вспомогательная функция для форматирования чисел
 */
function formatNumber(number) {
    return new Intl.NumberFormat('ru-RU').format(number);
}