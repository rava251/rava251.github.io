// javacalculator.js - Улучшенный калькулятор стоимости заказа с поддержкой нескольких товаров

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
    const selectedPreview = document.getElementById('selected-preview');
    const selectedItemsList = document.getElementById('selected-items-list');
    const emptyState = document.getElementById('empty-state');
    const selectAllBtn = document.getElementById('select-all');
    const clearSelectionBtn = document.getElementById('clear-selection');

    // Регулярное выражение для проверки количества (только цифры)
    const quantityRegex = /^\d+$/;
    
    /**
     * Обновление предварительного просмотра выбранных товаров
     */
    function updateSelectedPreview() {
        const selectedOptions = productSelect.selectedOptions;
        
        if (selectedOptions.length === 0) {
            selectedPreview.style.display = 'none';
            emptyState.style.display = 'block';
        } else {
            selectedPreview.style.display = 'block';
            emptyState.style.display = 'none';
            
            let previewHTML = '';
            Array.from(selectedOptions).forEach(function(option) {
                const price = parseInt(option.value);
                const productText = option.text;
                const category = option.getAttribute('data-category');
                
                previewHTML += '<div class="selected-item">';
                previewHTML += '<div class="selected-item-name">' + productText + '</div>';
                previewHTML += '<div class="selected-item-price">' + formatPrice(price) + '</div>';
                previewHTML += '</div>';
            });
            
            selectedItemsList.innerHTML = previewHTML;
        }
    }
    
    /**
     * Форматирование цены
     */
    function formatPrice(price) {
        return new Intl.NumberFormat('ru-RU').format(price) + ' руб.';
    }
    
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
                calculationResult.innerHTML = '<div class="text-center text-muted"><i class="bi bi-cart-x me-2"></i>Пожалуйста, выберите хотя бы один товар.</div>';
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
        let itemsByCategory = {};
        
        // Группировка товаров по категориям
        Array.from(selectedOptions).forEach(function(option) {
            const price = parseInt(option.value);
            const productName = option.text.split(' - ')[0];
            const productCost = price * quantity;
            const category = option.getAttribute('data-category') || 'Разное';
            
            if (!itemsByCategory[category]) {
                itemsByCategory[category] = [];
            }
            
            itemsByCategory[category].push({
                name: productName,
                price: price,
                cost: productCost
            });
            
            totalCost += productCost;
        });
        
        // Формирование детализированного отчета по категориям
        Object.keys(itemsByCategory).forEach(function(category) {
            resultHTML += '<div class="cost-breakdown">';
            resultHTML += '<div class="d-flex justify-content-between align-items-center mb-2">';
            resultHTML += '<strong class="text-primary">' + category + '</strong>';
            resultHTML += '<span class="product-category">' + itemsByCategory[category].length + ' товар(ов)</span>';
            resultHTML += '</div>';
            
            itemsByCategory[category].forEach(function(item, index) {
                resultHTML += '<div class="calculation-item">';
                resultHTML += '<div class="d-flex justify-content-between align-items-center">';
                resultHTML += '<span>' + (index + 1) + '. ' + item.name + '</span>';
                resultHTML += '<span class="text-end">';
                resultHTML += quantity + ' × ' + formatPrice(item.price) + '<br>';
                resultHTML += '<strong class="text-success">' + formatPrice(item.cost) + '</strong>';
                resultHTML += '</span>';
                resultHTML += '</div>';
                resultHTML += '</div>';
            });
            
            // Сумма по категории
            const categoryTotal = itemsByCategory[category].reduce(function(sum, item) {
                return sum + item.cost;
            }, 0);
            
            resultHTML += '<div class="border-top mt-2 pt-2 text-end">';
            resultHTML += '<strong>Итого по категории: ' + formatPrice(categoryTotal) + '</strong>';
            resultHTML += '</div>';
            resultHTML += '</div>';
        });
        
        // Добавление итоговой стоимости
        resultHTML += '<div class="calculation-summary">';
        resultHTML += '<div class="text-center mb-2">';
        resultHTML += '<small class="text-muted">Общее количество товаров: ' + (selectedOptions.length * quantity) + '</small>';
        resultHTML += '</div>';
        resultHTML += '<div class="total-cost">';
        resultHTML += '<div class="fs-6 text-muted">Общая стоимость заказа:</div>';
        resultHTML += '<div>' + formatPrice(totalCost) + '</div>';
        resultHTML += '</div>';
        resultHTML += '</div>';
        
        // Дополнительная информация
        resultHTML += '<div class="text-center mt-3">';
        resultHTML += '<small class="text-muted">';
        resultHTML += '<i class="bi bi-info-circle me-1"></i>';
        resultHTML += 'Выбрано ' + selectedOptions.length + ' товар(ов) × ' + quantity + ' шт. каждого';
        resultHTML += '</small>';
        resultHTML += '</div>';
        
        calculationResult.innerHTML = resultHTML;
        resultContainer.style.display = 'block';
        
        // Прокрутка к результату
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    /**
     * Выбрать все товары
     */
    function selectAllProducts() {
        Array.from(productSelect.options).forEach(function(option) {
            option.selected = true;
        });
        updateSelectedPreview();
    }
    
    /**
     * Очистить выбор товаров
     */
    function clearSelection() {
        Array.from(productSelect.options).forEach(function(option) {
            option.selected = false;
        });
        updateSelectedPreview();
        resultContainer.style.display = 'none';
        emptyState.style.display = 'block';
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
        
        // Обновление предпросмотра при изменении выбора
        productSelect.addEventListener('change', updateSelectedPreview);
        
        // Обработка клавиши Enter в поле количества
        quantityInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                calculateOrder();
            }
        });
        
        // Кнопки быстрого выбора
        if (selectAllBtn) {
            selectAllBtn.addEventListener('click', selectAllProducts);
        }
        
        if (clearSelectionBtn) {
            clearSelectionBtn.addEventListener('click', clearSelection);
        }
        
        // Инициализация предпросмотра
        updateSelectedPreview();
    }
}