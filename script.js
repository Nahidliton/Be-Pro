// Calculator State
let currentInput = '0';
let previousInput = '';
let operator = null;
let isScientificMode = false;
let memory = 0;
let calculationHistory = JSON.parse(localStorage.getItem('calcHistory')) || [];

// DOM Elements
const displayResult = document.getElementById('result');
const displayExpression = document.getElementById('expression');
const historyPanel = document.getElementById('historyPanel');
const historyList = document.getElementById('historyList');
const historyToggle = document.getElementById('historyToggle');
const closeHistory = document.getElementById('closeHistory');
const clearHistoryBtn = document.getElementById('clearHistory');
const calculator = document.querySelector('.calculator');

// Initialize Calculator
function initCalculator() {
    updateDisplay();
    updateHistoryDisplay();
    
    // Event Listeners for mode switching
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const mode = e.target.dataset.mode;
            setCalculatorMode(mode);
        });
    });
    
    // Event Listeners for buttons
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', handleButtonClick);
    });
    
    // Event Listeners for memory buttons
    document.querySelectorAll('.memory-btn').forEach(button => {
        button.addEventListener('click', handleMemoryOperation);
    });
    
    // History panel controls
    historyToggle.addEventListener('click', toggleHistoryPanel);
    closeHistory.addEventListener('click', toggleHistoryPanel);
    clearHistoryBtn.addEventListener('click', clearHistory);
    
    // Keyboard support
    document.addEventListener('keydown', handleKeyboardInput);
    
    // Prevent default browser zoom on double tap
    document.addEventListener('touchstart', (e) => {
        if (e.touches.length > 1) {
            e.preventDefault();
        }
    }, { passive: false });
}

// Update Display
function updateDisplay() {
    displayResult.textContent = formatNumber(currentInput);
    if (previousInput && operator) {
        displayExpression.textContent = `${previousInput} ${getOperatorSymbol(operator)}`;
    } else {
        displayExpression.textContent = '';
    }
}

// Format number for display
function formatNumber(num) {
    if (num === 'Error' || num === 'Infinity' || num === 'NaN') return num;
    
    // Handle scientific notation
    if (num.includes('e')) {
        return num;
    }
    
    const number = parseFloat(num);
    if (isNaN(number)) return num;
    
    // Format with commas for thousands
    const parts = number.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    // Limit decimal places
    if (parts[1] && parts[1].length > 8) {
        parts[1] = parts[1].substring(0, 8);
    }
    
    return parts.join('.');
}

// Get operator symbol for display
function getOperatorSymbol(op) {
    const symbols = {
        'add': '+',
        'subtract': '-',
        'multiply': '×',
        'divide': '÷',
        'power': '^'
    };
    return symbols[op] || op;
}

// Handle button clicks
function handleButtonClick(e) {
    const action = e.currentTarget.dataset.action;
    const number = e.currentTarget.dataset.number;
    
    // Add click animation
    e.currentTarget.classList.add('clicked');
    setTimeout(() => {
        e.currentTarget.classList.remove('clicked');
    }, 150);
    
    if (number !== undefined) {
        inputNumber(number);
    } else if (action) {
        handleAction(action);
    }
}

// Input number
function inputNumber(num) {
    if (currentInput === '0' || currentInput === 'Error') {
        currentInput = num;
    } else {
        currentInput += num;
    }
    updateDisplay();
}

// Handle actions
function handleAction(action) {
    switch(action) {
        case 'clear':
            clearCalculator();
            break;
        case 'backspace':
            backspace();
            break;
        case 'decimal':
            addDecimal();
            break;
        case 'add':
        case 'subtract':
        case 'multiply':
        case 'divide':
        case 'power':
            setOperator(action);
            break;
        case 'equals':
            calculate();
            break;
        case 'percent':
            calculatePercent();
            break;
        // Scientific functions
        case 'sin':
            scientificFunction(Math.sin, 'sin', true);
            break;
        case 'cos':
            scientificFunction(Math.cos, 'cos', true);
            break;
        case 'tan':
            scientificFunction(Math.tan, 'tan', true);
            break;
        case 'sqrt':
            scientificFunction(Math.sqrt, '√');
            break;
        case 'log':
            scientificFunction(Math.log10, 'log');
            break;
        case 'ln':
            scientificFunction(Math.log, 'ln');
            break;
        case 'pi':
            inputConstant(Math.PI.toString());
            break;
        case 'e':
            inputConstant(Math.E.toString());
            break;
        case 'factorial':
            calculateFactorial();
            break;
        case 'abs':
            scientificFunction(Math.abs, 'abs');
            break;
        case 'exp':
            scientificFunction(Math.exp, 'exp');
            break;
        case 'inv':
            calculateInverse();
            break;
        case 'square':
            scientificFunction((x) => x * x, 'x²');
            break;
        case 'cube':
            scientificFunction((x) => x * x * x, 'x³');
            break;
    }
}

// Clear calculator
function clearCalculator() {
    currentInput = '0';
    previousInput = '';
    operator = null;
    updateDisplay();
}

// Backspace
function backspace() {
    if (currentInput === 'Error') {
        currentInput = '0';
    } else if (currentInput.length > 1) {
        currentInput = currentInput.slice(0, -1);
    } else {
        currentInput = '0';
    }
    updateDisplay();
}

// Add decimal point
function addDecimal() {
    if (!currentInput.includes('.')) {
        currentInput += '.';
    }
    updateDisplay();
}

// Set operator
function setOperator(op) {
    if (currentInput === 'Error') return;
    
    if (previousInput && operator) {
        calculate();
    }
    
    operator = op;
    previousInput = currentInput;
    currentInput = '';
    updateDisplay();
}

// Calculate
function calculate() {
    if (!previousInput || !operator) return;
    
    const prev = parseFloat(previousInput);
    const current = parseFloat(currentInput);
    let result;
    
    try {
        switch(operator) {
            case 'add':
                result = prev + current;
                break;
            case 'subtract':
                result = prev - current;
                break;
            case 'multiply':
                result = prev * current;
                break;
            case 'divide':
                if (current === 0) throw new Error('Division by zero');
                result = prev / current;
                break;
            case 'power':
                result = Math.pow(prev, current);
                break;
        }
        
        // Add to history
        addToHistory(previousInput, currentInput, operator, result);
        
        currentInput = result.toString();
        previousInput = '';
        operator = null;
        updateDisplay();
        
    } catch (error) {
        currentInput = 'Error';
        updateDisplay();
    }
}

// Percentage calculation
function calculatePercent() {
    const current = parseFloat(currentInput);
    if (!isNaN(current)) {
        currentInput = (current / 100).toString();
        updateDisplay();
    }
}

// Scientific functions
function scientificFunction(func, name, convertToRadians = false) {
    const value = parseFloat(currentInput);
    if (isNaN(value)) return;
    
    try {
        let result;
        if (convertToRadians) {
            result = func(value * Math.PI / 180);
        } else {
            result = func(value);
        }
        
        if (isNaN(result) || !isFinite(result)) {
            throw new Error('Invalid operation');
        }
        
        addToHistory(`${name}(${currentInput})`, '', '', result);
        currentInput = result.toString();
        updateDisplay();
    } catch (error) {
        currentInput = 'Error';
        updateDisplay();
    }
}

// Factorial calculation
function calculateFactorial() {
    const value = parseInt(currentInput);
    if (value < 0 || !Number.isInteger(value)) {
        currentInput = 'Error';
        updateDisplay();
        return;
    }
    
    let result = 1;
    for (let i = 2; i <= value; i++) {
        result *= i;
    }
    
    addToHistory(`${currentInput}!`, '', '', result);
    currentInput = result.toString();
    updateDisplay();
}

// Inverse calculation
function calculateInverse() {
    const value = parseFloat(currentInput);
    if (value === 0) {
        currentInput = 'Error';
        updateDisplay();
        return;
    }
    
    const result = 1 / value;
    addToHistory(`1/(${currentInput})`, '', '', result);
    currentInput = result.toString();
    updateDisplay();
}

// Input constant
function inputConstant(constant) {
    currentInput = constant;
    updateDisplay();
}

// Add calculation to history
function addToHistory(a, b, op, result) {
    const expression = op 
        ? `${formatNumber(a)} ${getOperatorSymbol(op)} ${formatNumber(b)}`
        : a;
    
    calculationHistory.unshift({
        expression,
        result: formatNumber(result.toString()),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    
    // Keep only last 10 calculations
    calculationHistory = calculationHistory.slice(0, 10);
    
    updateHistoryDisplay();
    saveHistory();
}

// Update history display
function updateHistoryDisplay() {
    historyList.innerHTML = '';
    
    calculationHistory.forEach((item, index) => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div class="history-expression">${item.expression}</div>
            <div class="history-result">${item.result}</div>
        `;
        
        // Click to use result
        historyItem.addEventListener('click', () => {
            currentInput = item.result.replace(/,/g, '');
            updateDisplay();
        });
        
        historyList.appendChild(historyItem);
    });
}

// Save history to localStorage
function saveHistory() {
    localStorage.setItem('calcHistory', JSON.stringify(calculationHistory));
}

// Clear history
function clearHistory() {
    calculationHistory = [];
    updateHistoryDisplay();
    saveHistory();
}

// Handle memory operations
function handleMemoryOperation(e) {
    const operation = e.target.dataset.memory;
    const value = parseFloat(currentInput);
    
    if (isNaN(value)) return;
    
    switch(operation) {
        case 'clear':
            memory = 0;
            break;
        case 'recall':
            currentInput = memory.toString();
            updateDisplay();
            break;
        case 'store':
            memory = value;
            break;
        case 'add':
            memory += value;
            break;
        case 'subtract':
            memory -= value;
            break;
    }
}

// Set calculator mode (Basic/Scientific)
function setCalculatorMode(mode) {
    // Update active button
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Set mode
    isScientificMode = mode === 'scientific';
    
    if (isScientificMode) {
        calculator.classList.add('scientific-mode');
    } else {
        calculator.classList.remove('scientific-mode');
    }
}

// Toggle history panel
function toggleHistoryPanel() {
    historyPanel.classList.toggle('active');
}

// Handle keyboard input
function handleKeyboardInput(e) {
    // Prevent default for calculator keys
    if (/[\d\+\-\*\/\.=EnterBackspaceEscape]/.test(e.key)) {
        e.preventDefault();
    }
    
    // Number keys
    if (e.key >= '0' && e.key <= '9') {
        inputNumber(e.key);
    }
    
    // Operators
    switch(e.key) {
        case '+':
            setOperator('add');
            break;
        case '-':
            setOperator('subtract');
            break;
        case '*':
            setOperator('multiply');
            break;
        case '/':
            setOperator('divide');
            break;
        case '.':
            addDecimal();
            break;
        case 'Enter':
        case '=':
            calculate();
            break;
        case 'Escape':
            clearCalculator();
            break;
        case 'Backspace':
            backspace();
            break;
        case '%':
            calculatePercent();
            break;
    }
    
    // History toggle with 'h' key
    if (e.key.toLowerCase() === 'h') {
        toggleHistoryPanel();
    }
    
    // Mode toggle with 'm' key
    if (e.key.toLowerCase() === 'm') {
        const currentMode = isScientificMode ? 'basic' : 'scientific';
        setCalculatorMode(currentMode);
        document.querySelector(`[data-mode="${currentMode}"]`).click();
    }
}

// Initialize calculator when page loads
window.addEventListener('DOMContentLoaded', initCalculator);