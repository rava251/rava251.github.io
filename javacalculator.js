// javacalculator.js - Калькулятор стоимости услуги с динамическим изменением DOM
// Исправленная версия с полным соответствием требованиям задания

document.addEventListener('DOMContentLoaded', function() {
    // Инициализация калькулятора стоимости услуги
    initServiceCalculator();
});

/**
 * Инициализация калькулятора стоимости услуги
 */
function initServiceCalculator() {
    // Элементы формы
    const quantityInput = document.getElementById('service-quantity');
    const serviceTypeRadios = document.querySelectorAll('input[name="service-type"]');
    const optionsContainer = document.getElementById('options-container');
    const serviceOptions = document.getElementById('service-options');
    const propertyContainer = document.getElementById('property-container');
    const serviceProperty = document.getElementById('service-property');
    
    // Элементы для отображения результата
    const baseCostElement = document.getElementById('base-cost');
    const optionCostElement = document.getElementById('option-cost');
    const optionCostRow = document.getElementById('option-cost-row');
    const propertyCostElement = document.getElementById('property-cost');
    const propertyCostRow = document.getElementById('property-cost-row');
    const quantityDisplay = document.getElementById('quantity-display');
    const totalCostElement = document.getElementById('total-cost');
    const resultContainer = document.getElementById('result-container');
    
    // Базовая стоимость для каждого типа услуги
    const basePrices = {
        basic: 1000,
        standard: 2500,
        premium: 5000
    };
    
    // Стоимость дополнительных опций
    const optionPrices = {
        none: 0,
        design: 500,
        analytics: 800,
        support: 1200
    };
    
    // Стоимость свойства
    const propertyPrice = 1500;
    
    // Текущие значения
    let currentType = 'basic';
    let currentQuantity = 1;
    let currentOption = 'none';
    let currentProperty = false;
    
    /**
     * Обновление отображения дополнительных элементов в зависимости от типа услуги
     */
    function updateDynamicElements() {
        // Скрываем все дополнительные контейнеры
        if (optionsContainer) optionsContainer.style.display = 'none';
        if (propertyContainer) propertyContainer.style.display = 'none';
        if (optionCostRow) optionCostRow.style.display = 'none';
        if (propertyCostRow) propertyCostRow.style.display = 'none';
        
        // Сбрасываем значения
        if (serviceOptions) {
            serviceOptions.value = 'none';
            currentOption = 'none';
        }
        if (serviceProperty) {
            serviceProperty.checked = false;
            currentProperty = false;
        }
        
        // Показываем нужные элементы в зависимости от типа услуги
        switch (currentType) {
            case 'basic':
                // Для basic не показываем дополнительные опции и свойства
                break;
            case 'standard':
                // Для standard показываем только опции (селект)
                if (optionsContainer) {
                    optionsContainer.style.display = 'block';
                    optionsContainer.classList.add('dynamic-element');
                }
                break;
            case 'premium':
                // Для premium показываем только свойство (чекбокс)
                if (propertyContainer) {
                    propertyContainer.style.display = 'block';
                    propertyContainer.classList.add('dynamic-element');
                }
                break;
            default:
                console.warn('Неизвестный тип услуги:', currentType);
        }
        
        // Пересчитываем стоимость
        calculateTotalCost();
    }
    
    /**
     * Расчет общей стоимости
     */
    function calculateTotalCost() {
        // Базовая стоимость
        let baseCost = basePrices[currentType] || 0;
        
        // Стоимость опций
        let optionCost = optionPrices[currentOption] || 0;
        
        // Стоимость свойства
        let propertyCost = currentProperty ? propertyPrice : 0;
        
        // Общая стоимость за единицу
        let unitCost = baseCost + optionCost + propertyCost;
        
        // Итоговая стоимость
        let totalCost = unitCost * currentQuantity;
        
        // Обновление отображения
        updateDisplay(baseCost, optionCost, propertyCost, totalCost);
        
        return totalCost;
    }
    
    /**
     * Обновление отображения результатов расчета
     */
    function updateDisplay(baseCost, optionCost, propertyCost, totalCost) {
        // Форматирование чисел
        const formatPrice = (price) => new Intl.NumberFormat('ru-RU').format(price) + ' руб.';
        
        // Обновление базовой стоимости
        if (baseCostElement) {
            baseCostElement.textContent = formatPrice(baseCost);
        }
        
        // Обновление стоимости опций (если есть)
        if (optionCostElement && optionCostRow) {
            if (optionCost > 0 && currentType === 'standard') {
                optionCostElement.textContent = formatPrice(optionCost);
                optionCostRow.style.display = 'flex';
            } else {
                optionCostRow.style.display = 'none';
            }
        }
        
        // Обновление стоимости свойства (если есть)
        if (propertyCostElement && propertyCostRow) {
            if (propertyCost > 0 && currentType === 'premium') {
                propertyCostElement.textContent = formatPrice(propertyCost);
                propertyCostRow.style.display = 'flex';
            } else {
                propertyCostRow.style.display = 'none';
            }
        }
        
        // Обновление количества
        if (quantityDisplay) {
            quantityDisplay.textContent = currentQuantity;
        }
        
        // Обновление итоговой стоимости
        if (totalCostElement) {
            totalCostElement.textContent = formatPrice(totalCost);
        }
        
        // Показываем контейнер с результатами
        if (resultContainer) {
            resultContainer.style.display = 'block';
        }
    }
    
    /**
     * Валидация ввода количества
     */
    function validateQuantity(input) {
        let value = parseInt(input.value, 10);
        
        if (isNaN(value) || value < 1) {
            value = 1;
            input.value = 1;
        }
        
        if (value > 1000) {
            value = 1000;
            input.value = 1000;
        }
        
        return value;
    }
    
    /**
     * Обработчик изменения количества
     */
    function handleQuantityChange() {
        currentQuantity = validateQuantity(quantityInput);
        calculateTotalCost();
    }
    
    /**
     * Обработчик изменения типа услуги
     */
    function handleServiceTypeChange(event) {
        currentType = event.target.value;
        updateDynamicElements();
    }
    
    /**
     * Обработчик изменения опций
     */
    function handleOptionsChange() {
        if (serviceOptions) {
            currentOption = serviceOptions.value;
            calculateTotalCost();
        }
    }
    
    /**
     * Обработчик изменения свойства
     */
    function handlePropertyChange() {
        if (serviceProperty) {
            currentProperty = serviceProperty.checked;
            calculateTotalCost();
        }
    }
    
    // Инициализация событий
    function initEvents() {
        // Обработка изменения количества
        if (quantityInput) {
            quantityInput.addEventListener('input', handleQuantityChange);
            quantityInput.addEventListener('change', handleQuantityChange);
        }
        
        // Обработка изменения типа услуги
        if (serviceTypeRadios.length > 0) {
            serviceTypeRadios.forEach(radio => {
                radio.addEventListener('change', handleServiceTypeChange);
            });
        }
        
        // Обработка изменения опций
        if (serviceOptions) {
            serviceOptions.addEventListener('change', handleOptionsChange);
        }
        
        // Обработка изменения свойства
        if (serviceProperty) {
            serviceProperty.addEventListener('change', handlePropertyChange);
        }
    }
    
    // Инициализация калькулятора
    function initCalculator() {
        // Проверяем наличие необходимых элементов
        if (!quantityInput) {
            console.error('Элемент service-quantity не найден');
            return;
        }
        
        if (serviceTypeRadios.length === 0) {
            console.error('Радиокнопки service-type не найдены');
            return;
        }
        
        // Устанавливаем начальные значения
        currentQuantity = validateQuantity(quantityInput);
        
        const checkedRadio = document.querySelector('input[name="service-type"]:checked');
        if (checkedRadio) {
            currentType = checkedRadio.value;
        }
        
        // Инициализируем динамические элементы
        updateDynamicElements();
        
        // Инициализируем обработчики событий
        initEvents();
        
        // Первоначальный расчет
        calculateTotalCost();
        
        console.log('Калькулятор стоимости услуги инициализирован успешно');
    }
    
    // Запуск инициализации
    initCalculator();
}