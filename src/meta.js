import module from "https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js";
const mannequinCanvas = document.getElementById('mannequinCanvas');
const ctx = mannequinCanvas.getContext('2d');
const colorPicker = document.getElementById('color-picker');
let fillEnabled = false;
let totalPrice = 0;
let currentRotation = 0;
let isDragging = false;
let startX;

const image = new Image();
image.src = '/img/41255938_1920.png';
image.onload = () => {
    ctx.drawImage(image, 0, 0, mannequinCanvas.width, mannequinCanvas.height);
};

function openModal() {
    document.getElementById('modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

function openMaterialsModal() {
    document.getElementById('materialsModal').style.display = 'block';
}

function closeMaterialsModal() {
    document.getElementById('materialsModal').style.display = 'none';
}

function openStylesModal() {
    document.getElementById('stylesModal').style.display = 'block';
}

function closeStylesModal() {
    document.getElementById('stylesModal').style.display = 'none';
}

function openApronsModal() {
    document.getElementById('apronsModal').style.display = 'block';
}

function closeApronsModal() {
    document.getElementById('apronsModal').style.display = 'none';
}

function openTryOnModal() {
    document.getElementById('tryOnModal').style.display = 'block';
}

function closeTryOnModal() {
    document.getElementById('tryOnModal').style.display = 'none';
}

function openGalleryModal() {
    document.getElementById('galleryModal').style.display = 'block';
}

function closeGalleryModal() {
    document.getElementById('galleryModal').style.display = 'none';
}

function openTextModal() {
    document.getElementById('textModal').style.display = 'block';
}

function closeTextModal() {
    document.getElementById('textModal').style.display = 'none';
}

function openSaveModal() {
    document.getElementById('saveModal').style.display = 'block';
}

function closeSaveModal() {
    document.getElementById('saveModal').style.display = 'none';
}

function openOrderModal() {
    document.getElementById('orderModal').style.display = 'block';
}

function closeOrderModal() {
    document.getElementById('orderModal').style.display = 'none';
}

function enableFill() {
    fillEnabled = true;
    mannequinCanvas.style.cursor = 'crosshair';
    showTooltip('click-to-fill', 'Щелкните, чтобы залить цветом', 'top', mannequinCanvas);
}

function disableFill() {
    fillEnabled = false;
    mannequinCanvas.style.cursor = 'default';
}

function floodFill(x, y, fillColor) {
    const canvasWidth = mannequinCanvas.width;
    const canvasHeight = mannequinCanvas.height;
    const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
    const data = imageData.data;
    const targetColor = getColorAtPixel(data, x, y, canvasWidth);
    const fillStack = [[x, y]];

    while (fillStack.length) {
        const [currentX, currentY] = fillStack.pop();
        const pixelIndex = (currentY * canvasWidth + currentX) * 4;

        if (colorsMatch(data, pixelIndex, targetColor)) {
            setPixelColor(data, pixelIndex, fillColor);

            fillStack.push([currentX + 1, currentY]);
            fillStack.push([currentX - 1, currentY]);
            fillStack.push([currentX, currentY + 1]);
            fillStack.push([currentX, currentY - 1]);
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

function getColorAtPixel(data, x, y, width) {
    const pixelIndex = (y * width + x) * 4;
    return [data[pixelIndex], data[pixelIndex + 1], data[pixelIndex + 2], data[pixelIndex + 3]];
}

function setPixelColor(data, index, color) {
    data[index] = color[0];
    data[index + 1] = color[1];
    data[index + 2] = color[2];
    data[index + 3] = color[3];
}

function colorsMatch(data, index, color) {
    return data[index] === color[0] &&
           data[index + 1] === color[1] &&
           data[index + 2] === color[2] &&
           data[index + 3] === color[3];
}

function floodFillPocket(pocket, x, y, fillColor) {
    const canvas = document.createElement('canvas');
    canvas.width = pocket.clientWidth;
    canvas.height = pocket.clientHeight;
    const ctx = canvas.getContext('2d');

    const img = pocket.querySelector('img');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const targetColor = getColorAtPixel(data, x, y, canvas.width);
    const fillStack = [[x, y]];

    while (fillStack.length) {
        const [currentX, currentY] = fillStack.pop();
        const pixelIndex = (currentY * canvas.width + currentX) * 4;

        if (colorsMatch(data, pixelIndex, targetColor)) {
            setPixelColor(data, pixelIndex, fillColor);

            fillStack.push([currentX + 1, currentY]);
            fillStack.push([currentX - 1, currentY]);
            fillStack.push([currentX, currentY + 1]);
            fillStack.push([currentX, currentY - 1]);
        }
    }

    ctx.putImageData(imageData, 0, 0);
    img.src = canvas.toDataURL();
}

function addPocket(element) {
    const imgSrc = element.getAttribute('data-img-src');
    const pocketName = element.getAttribute('data-pocket-name');
    const price = parseInt(element.getAttribute('data-price'));

    const pocket = document.createElement('div');
    pocket.classList.add('pocket');
    pocket.style.width = `${document.getElementById('pocket-size').value}px`;
    pocket.style.height = `${document.getElementById('pocket-size').value}px`;

    const img = document.createElement('img');
    img.src = imgSrc;
    img.style.width = '100%';
    pocket.appendChild(img);

    const deleteButton = document.createElement('div');
    deleteButton.textContent = '×';
    deleteButton.classList.add('delete-pocket');
    deleteButton.onclick = function() {
        removePocket(pocket, pocketName, price);
    };
    pocket.appendChild(deleteButton);

    pocket.style.left = '50%';
    pocket.style.top = '50%';
    pocket.style.transform = 'translate(-50%, -50%)';
    pocket.onmousedown = startDrag;

    pocket.addEventListener('click', (event) => {
        if (fillEnabled) {
            event.stopPropagation();
            const rect = pocket.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const fillColor = hexToRgb(colorPicker.value);
            floodFillPocket(pocket, Math.floor(x), Math.floor(y), fillColor);
            disableFill();
        }
    });

    document.getElementById('mannequin').appendChild(pocket);

    totalPrice += price;
    updateReceipt(pocketName, price);
    updateTotalPrice();

    closeModal();
}

mannequinCanvas.addEventListener('click', (event) => {
    if (fillEnabled && event.target === mannequinCanvas) {
        const rect = mannequinCanvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const fillColor = hexToRgb(colorPicker.value);

        floodFill(Math.floor(x), Math.floor(y), fillColor);
        disableFill();
    }
});

function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return [r, g, b, 255];
}

function startDrag(event) {
    draggedPocket = event.target.closest('.pocket');
    offsetX = event.clientX - draggedPocket.getBoundingClientRect().left;
    offsetY = event.clientY - draggedPocket.getBoundingClientRect().top;
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
}

function onMouseMove(event) {
    if (draggedPocket) {
        const newLeft = event.clientX - offsetX;
        const newTop = event.clientY - offsetY;
        draggedPocket.style.left = `${newLeft}px`;
        draggedPocket.style.top = `${newTop}px`;
    }
}

function onMouseUp() {
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('mouseup', onMouseUp);
    draggedPocket = null;
}

function updatePocketSize(size) {
    const pockets = document.querySelectorAll('.pocket');
    pockets.forEach(pocket => {
        pocket.style.width = `${size}px`;
        pocket.style.height = `${size}px`;
    });
}

function updateReceipt(name, price) {
    const item = document.createElement('div');
    item.textContent = `${name}: ${price} сум`;
    item.setAttribute('data-pocket-name', name);
    item.setAttribute('data-price', price);
    document.getElementById('receipt').appendChild(item);
}

function updateTotalPrice() {
    document.getElementById('total-price').textContent = `Сумма: ${totalPrice} сум`;
}

function toggleMaterial(element, materialName, price) {
    if (element.checked) {
        totalPrice += price;
        const item = document.createElement('div');
        item.textContent = `${materialName}: ${price} сум`;
        item.setAttribute('data-material-name', materialName);
        item.setAttribute('data-price', price);
        document.getElementById('receipt').appendChild(item);
    } else {
        totalPrice -= price;
        const items = Array.from(document.getElementById('receipt').children);
        const item = items.find(i => i.getAttribute('data-material-name') === materialName);
        if (item) {
            item.remove();
        }
    }
    updateTotalPrice();
}

function changeStyle(styleSrc) {
    const image = new Image();
    image.src = styleSrc;
    image.onload = () => {
        ctx.clearRect(0, 0, mannequinCanvas.width, mannequinCanvas.height);
        ctx.drawImage(image, 0, 0, mannequinCanvas.width, mannequinCanvas.height);
    };
}

function changeApron(apronSrc) {
    const image = new Image();
    image.src = apronSrc;
    image.onload = () => {
        ctx.clearRect(0, 0, mannequinCanvas.width, mannequinCanvas.height);
        ctx.drawImage(image, 0, 0, mannequinCanvas.width, mannequinCanvas.height);
    };
}

function removePocket(pocket, pocketName, price) {
    pocket.remove();
    totalPrice -= price;

    const items = Array.from(document.getElementById('receipt').children);
    const item = items.find(i => i.getAttribute('data-pocket-name') === pocketName && parseInt(i.getAttribute('data-price')) === price);
    if (item) {
        item.remove();
    }

    updateTotalPrice();
}

function saveAsJPEG() {
    const link = document.createElement('a');
    link.href = mannequinCanvas.toDataURL('image/jpeg');
    link.download = 'project.jpeg';
    link.click();
}

function uploadLogo(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.src = e.target.result;
            img.onload = function() {
                const logo = document.createElement('div');
                logo.classList.add('pocket');
                logo.style.width = '100px';
                logo.style.height = '100px';

                const logoImg = document.createElement('img');
                logoImg.src = img.src;
                logoImg.style.width = '100%';
                logo.appendChild(logoImg);

                const deleteButton = document.createElement('div');
                deleteButton.textContent = '×';
                deleteButton.classList.add('delete-pocket');
                deleteButton.onclick = function() {
                    logo.remove();
                };
                logo.appendChild(deleteButton);

                logo.style.left = '50%';
                logo.style.top = '50%';
                logo.style.transform = 'translate(-50%, -50%)';
                logo.onmousedown = startDrag;

                document.getElementById('mannequin').appendChild(logo);
            }
        }
        reader.readAsDataURL(file);
    }
}

function openTextModal() {
    document.getElementById('textModal').style.display = 'block';
}

function closeTextModal() {
    document.getElementById('textModal').style.display = 'none';
}

function submitText(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const text = formData.get('text');
    const font = formData.get('font');
    const color = formData.get('color');
    const size = formData.get('size');
    const letterSpacing = formData.get('letterSpacing');
    const lineHeight = formData.get('lineHeight');
    const fontStyle = formData.get('fontStyle');

    if (text) {
        const textElement = document.createElement('div');
        textElement.classList.add('pocket');
        textElement.style.width = 'auto';
        textElement.style.height = 'auto';
        textElement.style.color = color;
        textElement.style.backgroundColor = 'transparent';
        textElement.style.fontSize = `${size}px`;
        textElement.style.fontFamily = font;
        textElement.style.letterSpacing = `${letterSpacing}px`;
        textElement.style.lineHeight = `${lineHeight}`;
        textElement.style.fontStyle = fontStyle.includes('italic') ? 'italic' : 'normal';
        textElement.style.fontWeight = fontStyle.includes('bold') ? 'bold' : 'normal';
        if (fontStyle.includes('underline')) {
            textElement.style.textDecoration = 'underline';
        }
        textElement.style.padding = '5px';
        textElement.textContent = text;

        const deleteButton = document.createElement('div');
        deleteButton.textContent = '×';
        deleteButton.classList.add('delete-pocket');
        deleteButton.onclick = function() {
            textElement.remove();
        };
        textElement.appendChild(deleteButton);

        textElement.style.left = '50%';
        textElement.style.top = '50%';
        textElement.style.transform = 'translate(-50%, -50%)';
        textElement.onmousedown = startDrag;

        document.getElementById('mannequin').appendChild(textElement);
    }

    closeTextModal();
}

let undoStack = [];
let redoStack = [];

function saveState() {
    const state = {
        pockets: Array.from(document.querySelectorAll('.pocket')).map(pocket => ({
            html: pocket.outerHTML,
            left: pocket.style.left,
            top: pocket.style.top
        })),
        totalPrice: totalPrice,
        receipt: document.getElementById('receipt').innerHTML
    };
    undoStack.push(state);
    redoStack = [];
}

function loadState(state) {
    resetDesign();
    document.getElementById('receipt').innerHTML = state.receipt;
    state.pockets.forEach(pocketData => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = pocketData.html;
        const pocket = tempDiv.firstChild;
        pocket.style.left = pocketData.left;
        pocket.style.top = pocketData.top;
        pocket.onmousedown = startDrag;
        document.getElementById('mannequin').appendChild(pocket);
    });
    totalPrice = state.totalPrice;
    updateTotalPrice();
}

function undo() {
    if (undoStack.length > 0) {
        const currentState = {
            pockets: Array.from(document.querySelectorAll('.pocket')).map(pocket => ({
                html: pocket.outerHTML,
                left: pocket.style.left,
                top: pocket.style.top
            })),
            totalPrice: totalPrice,
            receipt: document.getElementById('receipt').innerHTML
        };
        redoStack.push(currentState);
        const previousState = undoStack.pop();
        loadState(previousState);
    }
}

function redo() {
    if (redoStack.length > 0) {
        const currentState = {
            pockets: Array.from(document.querySelectorAll('.pocket')). map(pocket => ({
                html: pocket.outerHTML,
                left: pocket.style.left,
                top: pocket.style.top
            })),
            totalPrice: totalPrice,
            receipt: document.getElementById('receipt').innerHTML
        };
        undoStack.push(currentState);
        const nextState = redoStack.pop();
        loadState(nextState);
    }
}

function resetDesign() {
    ctx.clearRect(0, 0, mannequinCanvas.width, mannequinCanvas.height);
    ctx.drawImage(image, 0, 0, mannequinCanvas.width, mannequinCanvas.height);
    document.querySelectorAll('.pocket').forEach(pocket => pocket.remove());
    totalPrice = 0;
    updateTotalPrice();
    document.getElementById('receipt').innerHTML = '<h3>Чек:</h3>';
}

function placeOrder() {
    openOrderModal();
}

function submitOrder(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const name = formData.get('name');
    const size = formData.get('size');
    const quantity = formData.get('quantity');
    const notes = formData.get('notes');

    ctx.font = '20px Arial';
    ctx.fillStyle = 'black';
    ctx.fillText(`Имя: ${name}`, 10, 990);
    ctx.fillText(`Размер: ${size}`, 10, 1010);
    ctx.fillText(`Количество: ${quantity}`, 10, 1030);
    ctx.fillText(`Примечания: ${notes}`, 10, 1050);

    saveAsJPEG();

    ctx.clearRect(0, 990, 800, 60);

    closeOrderModal();
}

mannequinCanvas.addEventListener('mousedown', (event) => {
    if (event.target === mannequinCanvas) {
        isDragging = true;
        startX = event.clientX;
    }
});

document.addEventListener('mousemove', (event) => {
    if (isDragging) {
        const dx = event.clientX - startX;
        currentRotation = (currentRotation + dx / 5) % 360;
        mannequinCanvas.style.transform = `rotateY(${currentRotation}deg)`;
        startX = event.clientX;
    }
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});

function showTooltip(id, text, position, target) {
    let tooltip = document.getElementById(id);
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = id;
        tooltip.className = 'tooltip tooltip-' + position;
        tooltip.textContent = text;
        document.body.appendChild(tooltip);
    }

    const rect = target.getBoundingClientRect();
    tooltip.style.display = 'block';

    if (position === 'top') {
        tooltip.style.left = rect.left + window.scrollX + (rect.width - tooltip.offsetWidth) / 2 + 'px';
        tooltip.style.top = rect.top + window.scrollY - tooltip.offsetHeight - 10 + 'px';
    } else if (position === 'right') {
        tooltip.style.left = rect.right + window.scrollX + 10 + 'px';
        tooltip.style.top = rect.top + window.scrollY + (rect.height - tooltip.offsetHeight) / 2 + 'px';
    }
}

function hideTooltip(id) {
    const tooltip = document.getElementById(id);
    if (tooltip) {
        tooltip.style.display = 'none';
    }
}

showTooltip('add-pocket-tip', 'Нажмите, чтобы добавить карман', 'right', document.querySelector('.add-pocket-container'));
setTimeout(() => hideTooltip('add-pocket-tip'), 5000);