// javacalculator.js - Кастомный JavaScript для калькулятора стоимости заказа

document.addEventListener('DOMContentLoaded', function() {
    // Инициализация калькулятора стоимости
    initCalculator();
});

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
        
        if (quantityError) {
            quantityError.style.display = isValid ? 'none' : 'block';
        }
        if (quantityInput) {
            quantityInput.classList.toggle('is-invalid', !isValid);
        }
        
        return isValid;
    }
    
    /**
     * Расчет стоимости заказа
     */
    function calculateOrder() {
        // Валидация количества
        if (!validateQuantity()) {
            if (resultContainer) {
                resultContainer.style.display = 'none';
            }
            if (quantityInput) {
                quantityInput.focus();
            }
            return;
        }
        
        const quantity = parseInt(quantityInput.value);
        const selectedOptions = productSelect.selectedOptions;
        
        // Проверка выбора товаров
        if (selectedOptions.length === 0) {
            if (calculationResult) {
                calculationResult.textContent = 'Пожалуйста, выберите хотя бы один товар.';
            }
            if (resultContainer) {
                resultContainer.style.display = 'block';
            }
            if (productSelect) {
                productSelect.focus();
            }
            return;
        }
        
        let totalCost = 0;
        let resultHTML = '';
        
        // Расчет стоимости для каждого выбранного товара
        Array.from(selectedOptions).forEach(function(option, index) {
            const price = parseInt(option.value);
            const productName = option.text.split(' - ')[0];
            const productCost = price * quantity;
            
            totalCost += productCost;
            
            resultHTML += '<div class="calculation-item">';
            resultHTML += '<strong>' + (index + 1) + '. ' + productName + ':</strong><br>';
            resultHTML += 'Количество: ' + quantity + ' × Цена: ' + price + ' руб. = <strong>' + productCost + ' руб.</strong>';
            resultHTML += '</div>';
        });
        
        // Добавление итоговой стоимости
        resultHTML += '<div class="mt-3 pt-3 border-top">';
       