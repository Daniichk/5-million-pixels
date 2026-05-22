const canvas = document.getElementById('pixelCanvas');
const ctx = canvas.getContext('2d');
const container = document.getElementById('canvas-container');
const colorPicker = document.getElementById('colorPicker');
const coordsDisplay = document.getElementById('coords');
const pixelCountDisplay = document.getElementById('pixelCount');
const clearBtn = document.getElementById('clearBtn');
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');

// Зальем изначально холст белым цветом
ctx.fillStyle = '#ffffff';
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Проверяем лимит пользователя в localStorage (максимум 10 пикселей)
let pixelsLeft = localStorage.getItem('pixelsLeft');
if (pixelsLeft === null) {
    pixelsLeft = 10;
    localStorage.setItem('pixelsLeft', pixelsLeft);
} else {
    pixelsLeft = parseInt(pixelsLeft);
}
pixelCountDisplay.textContent = `Осталось пикселей: ${pixelsLeft}`;

// Настройки зума и камеры
let scale = 1;
let offsetX = 0;
let offsetY = 0;
let isDragging = false;
let startX, startY;

function updateTransform() {
    canvas.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
}

// Центрируем холст при старте
offsetX = (window.innerWidth - canvas.width) / 2;
offsetY = (window.innerHeight - canvas.height) / 2;
updateTransform();

// Таскание холста мышкой
container.addEventListener('mousedown', (e) => {
    if (e.target === container || e.target === canvas) {
        isDragging = true;
        startX = e.clientX - offsetX;
        startY = e.clientY - offsetY;
    }
});

window.addEventListener('mousemove', (e) => {
    if (!isDragging) {
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

// Функция для изменения зума в определенную точку (экранные координаты)
function zoom(amount, focusX, focusY) {
    const zoomFactor = 1.1;
    const canvasMouseX = (focusX - offsetX) / scale;
    const canvasMouseY = (focusY - offsetY) / scale;

    if (amount > 0) {
        if (scale < 50) scale *= zoomFactor;
    } else {
        if (scale > 0.1) scale /= zoomFactor;
    }

    offsetX = focusX - canvasMouseX * scale;
    offsetY = focusY - canvasMouseY * scale;
    updateTransform();
}

// Зум колесиком мыши
container.addEventListener('wheel', (e) => {
    e.preventDefault();
    zoom(-e.deltaY, e.clientX, e.clientY);
}, { passive: false });

// Зум кнопками + и - (зумирует в центр экрана)
zoomInBtn.addEventListener('click', () => {
    zoom(1, window.innerWidth / 2, window.innerHeight / 2);
});

zoomOutBtn.addEventListener('click', () => {
    zoom(-1, window.innerWidth / 2, window.innerHeight / 2);
});

// Клик по холсту — покраска
canvas.addEventListener('click', (e) => {
    if (isDragging) return;

    if (pixelsLeft <= 0) {
        alert('Вы исчерпали свой лимит в 10 пикселей!');
        return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / scale);
    const y = Math.floor((e.clientY - rect.top) / scale);

    if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
        const color = colorPicker.value;
        
        // Красим локально
        ctx.fillStyle = color;
        ctx.fillRect(x, y, 1, 1);
        
        // Снижаем лимит
        pixelsLeft--;
        localStorage.setItem('pixelsLeft', pixelsLeft);
        pixelCountDisplay.textContent = `Осталось пикселей: ${pixelsLeft}`;

        console.log(`Покрашен пиксель [${x}, ${y}]. Осталось: ${pixelsLeft}`);
        
        // СЮДА мы подключим сохранение в базу данных, чтобы другие тоже видели изменения
    }
});

clearBtn.addEventListener('click', () => {
    scale = 1;
    offsetX = (window.innerWidth - canvas.width) / 2;
    offsetY = (window.innerHeight - canvas.height) / 2;
    updateTransform();
});
