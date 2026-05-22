const canvas = document.getElementById('pixelCanvas');
const ctx = canvas.getContext('2d');
const container = document.getElementById('canvas-container');
const colorPicker = document.getElementById('colorPicker');
const coordsDisplay = document.getElementById('coords');
const clearBtn = document.getElementById('clearBtn');

// Зальем изначально холст белым цветом
ctx.fillStyle = '#ffffff';
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Переменные для зума и перемещения (камера)
let scale = 1;
let offsetX = 0;
let offsetY = 0;
let isDragging = false;
let startX, startY;

// Функция для обновления трансформации холста
function updateTransform() {
    canvas.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
}

// Первоначальное центрирование холста на экране
offsetX = (window.innerWidth - canvas.width) / 2;
offsetY = (window.innerHeight - canvas.height) / 2;
updateTransform();

// Логика перемещения холста мышкой
container.addEventListener('mousedown', (e) => {
    // Если кликнули колесиком или зажали пробел/Shift (или просто левой кнопкой мыши не на панели управления)
    if (e.target === container || e.target === canvas) {
        isDragging = true;
        startX = e.clientX - offsetX;
        startY = e.clientY - offsetY;
    }
});

window.addEventListener('mousemove', (e) => {
    if (!isDragging) {
        // Просто отслеживаем координаты пикселя под мышкой
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / scale);
        const y = Math.floor((e.clientY - rect.top) / scale);
        if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
            coordsDisplay.textContent = `X: ${x}, Y: ${y}`;
        }
        return;
    }
    offsetX = e.clientX - startX;
    offsetY = e.clientY - startY;
    updateTransform();
});

window.addEventListener('mouseup', () => {
    isDragging = false;
});

// Логика зума (колесиком мыши)
container.addEventListener('wheel', (e) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    
    // Координаты мыши относительно экрана
    const mouseX = e.clientX;
    const mouseY = e.clientY;

    // Рассчитываем точку на холсте, на которую указывает мышь
    const canvasMouseX = (mouseX - offsetX) / scale;
    const canvasMouseY = (mouseY - offsetY) / scale;

    if (e.deltaY < 0) {
        if (scale < 40) scale *= zoomFactor; // Максимальное приближение x40
    } else {
        if (scale > 0.1) scale /= zoomFactor; // Минимальное отдаление
    }

    // Корректируем смещение, чтобы зум шел в точку мыши
    offsetX = mouseX - canvasMouseX * scale;
    offsetY = mouseY - canvasMouseY * scale;

    updateTransform();
}, { passive: false });

// Клик по холсту — покраска пикселя
canvas.addEventListener('click', (e) => {
    // Если мы двигали экран, клик не должен срабатывать как покраска
    if (isDragging) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / scale);
    const y = Math.floor((e.clientY - rect.top) / scale);

    if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
        const color = colorPicker.value;
        
        // Красим пиксель локально
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);
        
        console.log(`Покрашен пиксель [${x}, ${y}] в цвет ${color}`);
        // ТОДО: Тут будет отправка запроса на сервер/бэкенд
    }
});

// Кнопка сброса позиции
clearBtn.addEventListener('click', () => {
    scale = 1;
    offsetX = (window.innerWidth - canvas.width) / 2;
    offsetY = (window.innerHeight - canvas.height) / 2;
    updateTransform();
});
