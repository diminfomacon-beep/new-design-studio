// ==========================================================================
// 1. INITIALIZE CANVAS & EMAILJS
// ==========================================================================
const canvas = new fabric.Canvas('designCanvas', {
    preserveObjectStacking: true,
    selection: true,
    selectionKey: 'ctrlKey',
    multiSelectKey: 'shiftKey'
});

// Mac support: Use Command key for selection
if (navigator.platform.toUpperCase().indexOf('MAC') >= 0) {
    canvas.selectionKey = 'metaKey';
}

canvas.on('mouse:down', function() {
    window.focus();
});

(function() {
    emailjs.init("1LZbCPvH49G_r0ypB"); 
})();

// ==========================================================================
// ==========================================================================
// 2. TEMPLATE CONFIGURATIONS & API (GITHUB DYNAMIC BACKENDS)
// ==========================================================================
const RAW_BASE_URL = "https://raw.githubusercontent.com/diminfomacon-beep/new-design-studio/1d7347945ed4cdca65a3629a35948af74ad54222/DesignTemplates/";
const API_URL = "https://api.github.com/repos/diminfomacon-beep/new-design-studio/contents/DesignTemplates?ref=1d7347945ed4cdca65a3629a35948af74ad54222";

// Global cache to keep track of GitHub files for instant searching
let cachedTemplateFiles = [];

// Static JSON Layout Templates Dataset (Preserved)
const templates = {
    blank: { background: '#ffffff', objects: [] },
    instagram: {
        background: '#f0f2f5',
        objects: [
            { type: 'rect', left: 100, top: 100, width: 600, height: 400, fill: '#ffffff', selectable: false, hoverCursor: 'default' },
            { type: 'textbox', text: 'YOUR HEADING HERE', left: 150, top: 150, width: 500, fontSize: 40, fontFamily: 'Montserrat', fontWeight: 'bold', fill: '#333333' },
            { type: 'textbox', text: 'Share your story with the world.', left: 150, top: 230, width: 500, fontSize: 20, fontFamily: 'Montserrat', fill: '#666666' }
        ]
    },
    businessCard: {
        background: '#1a1a1a',
        objects: [
            { type: 'textbox', text: 'JOHN DOE', left: 80, top: 200, fontSize: 36, fontFamily: 'Montserrat', fill: '#ffffff', fontWeight: 'bold' },
            { type: 'textbox', text: 'Creative Director', left: 80, top: 250, fontSize: 18, fontFamily: 'Montserrat', fill: '#00adb5' }
        ]
    }
};

/**
 * Automatically reads the GitHub folder and caches the list for searching
 */
async function initializeTemplates() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Failed to scan GitHub directory");
        
        const files = await response.json();
        const imageExtensions = ['png', 'jpg', 'jpeg', 'webp'];
        
        // Save matching images to our global cache variable
        cachedTemplateFiles = files.filter(file => {
            const ext = file.name.split('.').pop().toLowerCase();
            return file.type === "file" && imageExtensions.includes(ext);
        });

        // Initially render all templates
        renderTemplateGrid(cachedTemplateFiles);

    } catch (error) {
        console.error("Error reading templates dynamically:", error);
        const grid = document.querySelector('.template-grid');
        if (grid) grid.innerHTML = `<p style="color: red; font-size: 12px; grid-column: 1/-1;">Could not load dynamic templates.</p>`;
    }
}

/**
 * Helper function to physically paint the cards onto the UI grid
 */
/**
 * Helper function to physically paint the cards onto the UI grid (File Names Hidden)
 */
function renderTemplateGrid(filesList) {
    const grid = document.querySelector('.template-grid');
    if (!grid) return;

    if (filesList.length === 0) {
        grid.innerHTML = `<p style="color: #71717a; font-size: 12px; grid-column: 1/-1; text-align: center;">No matching templates found.</p>`;
        return;
    }

    grid.innerHTML = filesList.map(file => {
        const fullImageUrl = `${RAW_BASE_URL}${file.name}`;
        
        // Formats a clean name for fallback alt text and hover tooltips
        const cleanName = file.name
            .split('.')[0]
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, c => c.toUpperCase());

        // Removed the <span> line entirely so only the image card shows up
        return `
            <div class="template-card" onclick="applyGitHubTemplate('${file.name}')" title="${cleanName}">
                <img src="${fullImageUrl}" alt="${cleanName}" onerror="this.src='https://placehold.co/150x110?text=Error'">
            </div>
        `;
    }).join('');
}

/**
 * Filters the cached templates instantly as the user types
 */
function filterTemplates() {
    const searchInput = document.getElementById('templateSearch');
    if (!searchInput) return;

    const query = searchInput.value.toLowerCase().trim();

    // Filter list based on whether file name contains search string
    const filteredFiles = cachedTemplateFiles.filter(file => {
        return file.name.toLowerCase().includes(query);
    });

    renderTemplateGrid(filteredFiles);
}

/**
 * Applies a dynamic image template file from GitHub to the canvas background (Preserved)
 */
/**
 * Applies a dynamic image template file from GitHub as a draggable, resizable canvas object
 */
function applyGitHubTemplate(fileName) {
    if (!canvas) return;

    // REMOVED: canvas.clear(); <- This was wiping the canvas every time!

    const targetUrl = `${RAW_BASE_URL}${fileName}`;

    fabric.Image.fromURL(targetUrl, function(img) {
        const scaleX = canvas.width / img.width;
        const scaleY = canvas.height / img.height;
        const scaleFactor = Math.min(scaleX, scaleY, 1);

        img.set({
            left: (canvas.width - (img.width * scaleFactor)) / 2,
            top: (canvas.height - (img.height * scaleFactor)) / 2,
            scaleX: scaleFactor,
            scaleY: scaleFactor,
            cornerColor: '#00adb5',
            cornerStyle: 'circle',
            transparentCorners: false
        });

        canvas.add(img);
        
        // CHANGED: Instead of sending it completely to the back layer, 
        // we just set it as the active object so you can resize and move it immediately.
        canvas.setActiveObject(img);
        canvas.renderAll();
        showStatus("✨ Template added as layer!", "green");
    }, { crossOrigin: 'anonymous' });
}
/**
 * Safely loads a structural JSON object template onto the FabricJS canvas (Preserved)
 */
function loadTemplate(templateKey) {
    if (!canvas) return;

    const template = templates[templateKey];
    if (!template) return;

    if (canvas.getObjects().length > 0) {
        const confirmClear = confirm("Loading a template will clear your current design. Do you want to proceed?");
        if (!confirmClear) return;
    }

    canvas.clear();
    canvas.setBackgroundColor(template.background, canvas.renderAll.bind(canvas));

    if (template.objects && template.objects.length > 0) {
        template.objects.forEach(objData => {
            let fabricObj;
            if (objData.type === 'rect') {
                fabricObj = new fabric.Rect(objData);
            } else if (objData.type === 'textbox') {
                fabricObj = new fabric.Textbox(objData.text, objData);
            }

            if (fabricObj) {
                canvas.add(fabricObj);
            }
        });
    }
    canvas.renderAll();
}


// ==========================================================================
// 2B. PRODUCT PICKER — Step 1: choose what the design goes on
// ==========================================================================
const PHOTO_BASE = 'https://diminfomacon-beep.github.io/Mothers_Day/catalog/photos/';

const PRODUCTS = [
    { id: 'skinny-ombre', name: '20oz Skinny Tumbler \u2013 Ombre', price: 'From $17', area: 'about 8 in \u00d7 3 in', photo: PHOTO_BASE + '20oz%20Skinny%20Tumbler%20-%20Ombre.png', print: { left: 295, top: 130, width: 210, height: 360 } },
    { id: 'traveler-40oz', name: '40oz Traveler Tumbler', price: 'From $32', area: 'about 9 in \u00d7 4 in', photo: PHOTO_BASE + '40oz%20Traveler%20Tumbler.png', print: { left: 278, top: 150, width: 244, height: 340 } },
    { id: 'glass-mug', name: 'Glass Mug', price: 'From $13', area: 'about 3 in \u00d7 3 in', photo: PHOTO_BASE + 'Glass%20Mug.png', print: { left: 240, top: 170, width: 260, height: 260 } },
    { id: 'tshirt-poly', name: 'T-Shirt (Polyester, White)', price: 'From $15', area: 'about 11 in \u00d7 12 in', photo: PHOTO_BASE + 'Adult%20Polyester%20Short%20Sleeve%20T-Shirt%20-%20White.png', print: { left: 315, top: 230, width: 170, height: 220 } },
    { id: 'tote-medium', name: 'Medium Tote Bag', price: 'From $10', area: 'about 10 in \u00d7 10 in', photo: PHOTO_BASE + 'Medium%20Tote%20Bag.png', print: { left: 265, top: 220, width: 270, height: 250 } }
];

let selectedProduct = null;

function renderProductGrid() {
    const grid = document.getElementById('productGrid');
    if (!grid) return;
    grid.innerHTML = PRODUCTS.map(function(p) {
        return '<div class="product-card" data-product-id="' + p.id + '" onclick="selectProduct(\'' + p.id + '\')">' +
            '<img src="' + p.photo + '" alt="' + p.name + '">' +
            '<span class="product-name">' + p.name + '</span>' +
            '<span class="product-price">' + p.price + '</span></div>';
    }).join('');
}


// Puts a new text/graphic in the middle of the chosen product's print area,
// or the middle of the canvas when no product is picked yet.
function centerOnCanvas(obj) {
    const cx = selectedProduct ? selectedProduct.print.left + selectedProduct.print.width / 2 : canvas.width / 2;
    const cy = selectedProduct ? selectedProduct.print.top + selectedProduct.print.height / 2 : canvas.height / 2;
    obj.set({ originX: 'center', originY: 'center', left: cx, top: cy });
}

function drawHint() {
    const hint = new fabric.Textbox('Choose a product above to start designing', {
        left: 400, top: 290, width: 440, fontSize: 22, fill: '#6b7280',
        fontFamily: 'Montserrat, sans-serif', textAlign: 'center',
        originX: 'center', originY: 'center',
        selectable: false, evented: false, isProductGuide: true, excludeFromExport: true
    });
    canvas.add(hint);
    canvas.renderAll();
}

function printAreaRect(left, top, width, height) {
    return new fabric.Rect({
        left: left, top: top, width: width, height: height,
        fill: 'rgba(180,83,9,0.06)', stroke: '#b45309', strokeWidth: 2,
        strokeDashArray: [8, 6], selectable: false, evented: false,
        isProductGuide: true, excludeFromExport: true
    });
}

function printAreaLabel(left, top) {
    return new fabric.Text('PRINT AREA', {
        left: left, top: top, fontSize: 12, fill: '#b45309',
        fontFamily: 'Montserrat, sans-serif', selectable: false, evented: false,
        isProductGuide: true, excludeFromExport: true
    });
}

function productBody(props) {
    const base = { fill: '#fffefb', stroke: '#0e4d42', strokeWidth: 3, selectable: false, evented: false, isProductGuide: true };
    return new fabric.Rect(Object.assign({}, base, props));
}

function drawProductOutline(product) {
    const shapes = [];
    if (product.id === 'skinny-ombre') {
        shapes.push(productBody({ left: 275, top: 55, width: 250, height: 490, rx: 26, ry: 26 }));
        shapes.push(new fabric.Rect({ left: 275, top: 55, width: 250, height: 30, rx: 10, ry: 10, fill: '#e5e7eb', stroke: '#0e4d42', strokeWidth: 2, selectable: false, evented: false, isProductGuide: true }));
        shapes.push(printAreaRect(295, 130, 210, 360));
        shapes.push(printAreaLabel(295, 108));
    } else if (product.id === 'traveler-40oz') {
        shapes.push(productBody({ left: 255, top: 65, width: 290, height: 470, rx: 30, ry: 30 }));
        shapes.push(new fabric.Path('M545,230 Q625,300 545,370', { fill: 'transparent', stroke: '#0e4d42', strokeWidth: 12, selectable: false, evented: false, isProductGuide: true }));
        shapes.push(printAreaRect(278, 150, 244, 340));
        shapes.push(printAreaLabel(278, 128));
    } else if (product.id === 'glass-mug') {
        shapes.push(productBody({ left: 215, top: 140, width: 310, height: 320, rx: 14, ry: 14 }));
        shapes.push(new fabric.Path('M525,240 Q610,300 525,360', { fill: 'transparent', stroke: '#0e4d42', strokeWidth: 12, selectable: false, evented: false, isProductGuide: true }));
        shapes.push(printAreaRect(240, 170, 260, 260));
        shapes.push(printAreaLabel(240, 148));
    } else if (product.id === 'tshirt-poly') {
        shapes.push(new fabric.Path('M180,160 L270,115 Q400,175 530,115 L620,160 L565,235 L525,215 L525,510 L275,510 L275,215 L235,235 Z', { fill: '#fffefb', stroke: '#0e4d42', strokeWidth: 3, selectable: false, evented: false, isProductGuide: true }));
        shapes.push(printAreaRect(315, 230, 170, 220));
        shapes.push(printAreaLabel(315, 208));
    } else if (product.id === 'tote-medium') {
        shapes.push(productBody({ left: 235, top: 180, width: 330, height: 330, rx: 10, ry: 10 }));
        shapes.push(new fabric.Path('M300,180 Q365,80 430,180', { fill: 'transparent', stroke: '#0e4d42', strokeWidth: 10, selectable: false, evented: false, isProductGuide: true }));
        shapes.push(new fabric.Path('M370,180 Q435,80 500,180', { fill: 'transparent', stroke: '#0e4d42', strokeWidth: 10, selectable: false, evented: false, isProductGuide: true }));
        shapes.push(printAreaRect(265, 220, 270, 250));
        shapes.push(printAreaLabel(265, 198));
    }
    shapes.forEach(function(s) { canvas.add(s); });
    canvas.renderAll();
}

function selectProduct(productId) {
    const product = PRODUCTS.find(function(p) { return p.id === productId; });
    if (!product) return;
    if (selectedProduct && selectedProduct.id === productId) return;

    selectedProduct = product;
    // Swap the outline underneath and keep the customer's design in place,
    // so switching products never wipes their work (and never pops a dialog).
    canvas.getObjects().filter(function(o) { return o.isProductGuide; }).forEach(function(o) { canvas.remove(o); });
    drawProductOutline(product);

    document.querySelectorAll('.product-card').forEach(function(card) {
        card.classList.toggle('selected', card.dataset.productId === productId);
    });

    const info = document.getElementById('productInfo');
    info.style.display = 'block';
    info.innerHTML = '<strong>' + product.name + '</strong> &middot; ' + product.price +
        '<br>Print area: ' + product.area +
        '<br>Custom orders take 5&ndash;14 business days. After you submit, we&rsquo;ll email you within 24&ndash;48 business hours to confirm your order and total.';
    showStatus('Product selected: ' + product.name, 'green');
}

// ==========================================================================
// 3. PIXABAY SEARCH LOGIC
// ==========================================================================
const PIXABAY_KEY = '54841320-2fc493da46915b0eb0a6f740c'; 

async function searchPixabay() {
    const query = document.getElementById('pixabaySearch').value;
    if (!query) return;

    showStatus("🔍 Searching Graphics...", "#555");
    const url = `https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${encodeURIComponent(query)}&image_type=vector&safesearch=true&per_page=60`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        const gallery = document.getElementById('gallery');
        gallery.innerHTML = ''; 

        data.hits.forEach(img => {
            const imgElement = document.createElement('img');
            imgElement.src = img.previewURL; 
            imgElement.alt = img.tags;
            imgElement.className = "gallery-item";

            imgElement.onclick = function() {
                fabric.Image.fromURL(img.largeImageURL, function(oImg) {
                    oImg.scaleToWidth(250);
                    centerOnCanvas(oImg);
                    canvas.add(oImg);
                    canvas.setActiveObject(oImg);
                    showStatus("✨ Graphic added!", "green");
                }, { crossOrigin: 'anonymous' });
            };
            gallery.appendChild(imgElement);
        });
    } catch (error) {
        showStatus("❌ Search failed", "red");
    }
}

// ==========================================================================
// 4. TEXT HANDLING
// ==========================================================================
function placeTextOnCanvas() {
    const userInput = document.getElementById('textInput').value;
    if (userInput.trim() === "") {
        showStatus("⚠️ Please type something first!", "orange");
        return;
    }

    const fontSize = document.getElementById('fontSize').value || 30;
    const fontFamily = document.getElementById('fontFamily').value || 'Arial';
    const color = document.getElementById('activeColor').value || '#000000';

    const text = new fabric.Textbox(userInput, {
        width: 250,
        fontSize: parseInt(fontSize),
        fill: color,
        fontFamily: fontFamily,
        textAlign: 'center'
    });
    centerOnCanvas(text);

    canvas.add(text);
    canvas.setActiveObject(text);
    document.getElementById('textInput').value = "";
}

function updateLiveText() {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'textbox') {
        activeObject.set({
            fontFamily: document.getElementById('fontFamily').value,
            fontSize: parseInt(document.getElementById('fontSize').value) || 20,
            fill: document.getElementById('activeColor').value
        });
        canvas.renderAll();
    }
}

function setTextAlignment(alignValue) {
    const activeObject = canvas.getActiveObject();
    if (activeObject && (activeObject.type === 'textbox' || activeObject.type === 'i-text')) {
        activeObject.set('textAlign', alignValue);
        canvas.renderAll();
    } else {
        showStatus("⚠️ Select a text box first!", "orange");
    }
}

// ==========================================================================
// 5. COLOR SWATCH SYSTEM
// ==========================================================================
const colors = [
    '#FFFFFF', '#BFBFBF', '#808080', '#000000',
    '#FF0000', '#FF8000', '#FFFF00', '#994C00',
    '#00FF00', '#009900', '#00FFFF', '#0000FF',
    '#000099', '#8000FF', '#FF00FF', '#FF99FF'
];

function initSwatches() {
    const palette = document.getElementById('swatchPalette');
    if (!palette) return;
    
    colors.forEach(color => {
        const swatch = document.createElement('div');
        swatch.className = 'swatch';
        swatch.style.backgroundColor = color;
        
        swatch.onclick = function() {
            document.getElementById('activeColor').value = color;
            const activeObject = canvas.getActiveObject();
            if (activeObject) {
                activeObject.set('fill', color);
                canvas.renderAll();
            }
            palette.classList.remove('show');
        };
        palette.appendChild(swatch);
    });
}

function togglePalette(event) {
    event.stopPropagation();
    const palette = document.getElementById('swatchPalette');
    palette.classList.toggle('show');
}

// ==========================================================================
// 6. UPLOAD & LAYER UTILITIES
// ==========================================================================
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(f) {
        fabric.Image.fromURL(f.target.result, function(img) {
            img.scaleToWidth(300);
            centerOnCanvas(img);
            canvas.add(img);
            canvas.setActiveObject(img);
        }, { crossOrigin: 'anonymous' });
    };
    reader.readAsDataURL(file);
    event.target.value = '';
}

function deleteObject() {
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length) {
        activeObjects.forEach(obj => canvas.remove(obj));
        canvas.discardActiveObject().requestRenderAll();
    }
}

function bringForward() {
    const active = canvas.getActiveObject();
    if (active) { canvas.bringForward(active); canvas.renderAll(); }
}

function sendBackward() {
    const active = canvas.getActiveObject();
    if (active) { canvas.sendBackwards(active); canvas.renderAll(); }
}

// ==========================================================================
// 7. FORM SUBMISSION & DOWNLOAD
// ==========================================================================
document.getElementById('submitForm').addEventListener('submit', function(event) {
    event.preventDefault();
    if (!selectedProduct) {
        showStatus("Please choose a product first!", "orange");
        return;
    }
    const submitBtn = event.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    showStatus("📤 Preparing design...", "#555");

    const fullDataURL = canvas.toDataURL({ format: 'png', quality: 1.0 });
    const base64Image = fullDataURL.split(',')[1]; 
    
    const formData = new FormData();
    formData.append("image", base64Image);

    fetch("https://api.imgbb.com/1/upload?key=54309054fcb7bc0531b2f51c73e1802e", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            const templateParams = {
                cust_name: document.getElementById('custName').value,
                cust_email: document.getElementById('custEmail').value,
                product_name: selectedProduct.name,
                product_price: selectedProduct.price,
                product_design_area: selectedProduct.area,
                design_image: result.data.url 
            };
            return emailjs.send('service_ezq1fuc', 'template_ut1r5xk', templateParams, '1LZbCPvH49G_r0ypB');
        } else {
            throw new Error("Upload failed");
        }
    })
    .then(() => {
        showStatus("✅ Success! Design sent.", "green");
        submitBtn.disabled = false;
        document.getElementById('submitForm').reset();
    })
    .catch(error => {
        showStatus("❌ Error: " + error.message, "red");
        submitBtn.disabled = false;
    });
});

function downloadDesign() {
    const link = document.createElement('a');
    link.download = 'my-design.png';
    link.href = canvas.toDataURL({ format: 'png', quality: 1.0 });
    link.click();
}

function showStatus(text, color) {
    const msgArea = document.getElementById('statusMessage');
    if (msgArea) {
        msgArea.innerText = text;
        msgArea.style.color = color;
    }
}

// Keyboard shortcuts for Desktop
window.addEventListener('keydown', function(e) {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return; 

    if (e.key === "Delete" || e.key === "Backspace") {
        const activeObjects = canvas.getActiveObjects();
        if (activeObjects.length > 0) {
            activeObjects.forEach((obj) => canvas.remove(obj));
            canvas.discardActiveObject().requestRenderAll();
            e.preventDefault();
        }
    }
});

// ==========================================================================
// 8. INIT ON LOAD
// ==========================================================================
window.onload = () => {
    initSwatches();
    renderProductGrid();
    drawHint();
    searchPixabay();        // Initial load for images
    initializeTemplates();  // Dynamic initial scan of your GitHub repo folder
    
    // Close palette on click-off
    window.addEventListener('click', function(e) {
        const palette = document.getElementById('swatchPalette');
        const toggleBtn = document.getElementById('paletteToggle');
        if (palette && !palette.contains(e.target) && e.target !== toggleBtn) {
            palette.classList.remove('show');
        }
    });
};
