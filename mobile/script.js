let canvas;
const PIXABAY_KEY = '54841320-2fc493da46915b0eb0a6f740c';

// ==========================================================================
// PRODUCT PICKER — Step 1: choose a product before designing
// ==========================================================================
const PHOTO_BASE = 'https://diminfomacon-beep.github.io/Mothers_Day/catalog/photos/';
const PRODUCTS = [
    { id: 'skinny-ombre', name: '20oz Skinny Tumbler – Ombre', price: 17, area: 'about 8 in × 3 in', photo: '20oz Skinny Tumbler - Ombre.png', print: { left: 295, top: 130, width: 210, height: 360 } },
    { id: 'traveler-40oz', name: '40oz Traveler Tumbler', price: 32, area: 'about 9 in × 4 in', photo: '40oz Traveler Tumbler.png', print: { left: 278, top: 150, width: 244, height: 340 } },
    { id: 'glass-mug', name: 'Glass Mug', price: 13, area: 'about 3 in × 3 in', photo: 'Glass Mug.png', print: { left: 240, top: 170, width: 260, height: 260 } },
    { id: 'tshirt-poly', name: 'T-Shirt (Polyester, White)', price: 15, area: 'about 11 in × 12 in', photo: 'Adult Polyester Short Sleeve T-Shirt - White.png', print: { left: 315, top: 230, width: 170, height: 220 } },
    { id: 'tote-medium', name: 'Medium Tote Bag', price: 10, area: 'about 10 in × 10 in', photo: 'Medium Tote Bag.png', print: { left: 265, top: 220, width: 270, height: 250 } }
];
let selectedProduct = null;

function buildProductGrid() {
    const grid = document.getElementById('productGrid');
    if (!grid) return;
    grid.innerHTML = PRODUCTS.map(function(prod) {
        return '<div class="product-card" data-id="' + prod.id + '" onclick="selectProduct(\'' + prod.id + '\')">' +
            '<img src="' + PHOTO_BASE + encodeURIComponent(prod.photo) + '" alt="' + prod.name + '">' +
            '<div class="product-name">' + prod.name + '</div>' +
            '<div class="product-price">From $' + prod.price + '</div></div>';
    }).join('');
}

function selectProduct(productId) {
    const product = PRODUCTS.find(function(x) { return x.id === productId; });
    if (!product || !canvas) return;
    selectedProduct = product;
    // Swap the outline underneath and keep the customer's design in place,
    // so switching products never wipes their work (and never pops a dialog).
    canvas.getObjects().filter(function(o) { return o.isProductGuide; }).forEach(function(o) { canvas.remove(o); });
    drawProductOutline(product);
    // The new outline is drawn after the design, so lift the design back on
    // top — otherwise the solid outline would cover it up.
    canvas.getObjects().filter(function(o) { return !o.isProductGuide; }).forEach(function(o) { canvas.bringToFront(o); });
    canvas.renderAll();
    document.querySelectorAll('.product-card').forEach(function(card) {
        card.classList.toggle('selected', card.dataset.id === productId);
    });
    const info = document.getElementById('productInfo');
    if (info) {
        info.style.display = 'block';
        info.innerHTML = '<strong>' + product.name + '</strong> · From $' + product.price +
            '<br>Print area: ' + product.area +
            '<br>Custom orders take 5–14 business days. We\'ll email you within 24–48 business hours to confirm your order and total.';
    }
}

function drawProductOutline(product) {
    const shapes = [];
    const body = { fill: '#fffefb', stroke: '#0e4d42', strokeWidth: 3, selectable: false, evented: false, isProductGuide: true };
    const pr = product.print;
    if (product.id === 'skinny-ombre') {
        shapes.push(new fabric.Rect(Object.assign({}, body, { left: 275, top: 55, width: 250, height: 490, rx: 26, ry: 26 })));
        shapes.push(new fabric.Rect(Object.assign({}, body, { fill: '#d8d8d8', stroke: '#94a3b8', strokeWidth: 2, left: 300, top: 35, width: 200, height: 26, rx: 8, ry: 8 })));
    } else if (product.id === 'traveler-40oz') {
        shapes.push(new fabric.Rect(Object.assign({}, body, { left: 255, top: 65, width: 290, height: 470, rx: 30, ry: 30 })));
        shapes.push(new fabric.Rect(Object.assign({}, body, { fill: '#d8d8d8', stroke: '#94a3b8', strokeWidth: 2, left: 285, top: 45, width: 230, height: 26, rx: 8, ry: 8 })));
        shapes.push(new fabric.Path('M545,230 Q625,300 545,370', { fill: 'transparent', stroke: '#0e4d42', strokeWidth: 12, selectable: false, evented: false, isProductGuide: true }));
    } else if (product.id === 'glass-mug') {
        shapes.push(new fabric.Rect(Object.assign({}, body, { left: 215, top: 140, width: 310, height: 320, rx: 24, ry: 24 })));
        shapes.push(new fabric.Path('M525,240 Q610,300 525,360', { fill: 'transparent', stroke: '#0e4d42', strokeWidth: 12, selectable: false, evented: false, isProductGuide: true }));
    } else if (product.id === 'tshirt-poly') {
        shapes.push(new fabric.Path('M180,160 L270,115 Q400,175 530,115 L620,160 L565,235 L525,215 L525,510 L275,510 L275,215 L235,235 Z', Object.assign({}, body)));
    } else if (product.id === 'tote-medium') {
        shapes.push(new fabric.Rect(Object.assign({}, body, { left: 235, top: 180, width: 330, height: 330 })));
        shapes.push(new fabric.Path('M270,180 Q315,90 360,180', { fill: 'transparent', stroke: '#0e4d42', strokeWidth: 10, selectable: false, evented: false, isProductGuide: true }));
        shapes.push(new fabric.Path('M440,180 Q485,90 530,180', { fill: 'transparent', stroke: '#0e4d42', strokeWidth: 10, selectable: false, evented: false, isProductGuide: true }));
    }
    // Dashed print area + label (guides, never exported)
    shapes.push(new fabric.Rect({ left: pr.left, top: pr.top, width: pr.width, height: pr.height, fill: 'transparent', stroke: '#d97706', strokeWidth: 2, strokeDashArray: [8, 6], selectable: false, evented: false, isProductGuide: true, excludeFromExport: true }));
    shapes.push(new fabric.Text('PRINT AREA', { left: pr.left + pr.width / 2, top: pr.top + 12, originX: 'center', originY: 'center', fontSize: 13, fontFamily: 'Montserrat, sans-serif', fill: '#d97706', selectable: false, evented: false, isProductGuide: true, excludeFromExport: true }));
    shapes.forEach(function(s) { canvas.add(s); });
    canvas.renderAll();
}

// Centre a new object on the selected product's print area (or canvas centre).
function centerOnCanvas(obj) {
    let cx = canvas.width / 2, cy = canvas.height / 2;
    if (selectedProduct) {
        cx = selectedProduct.print.left + selectedProduct.print.width / 2;
        cy = selectedProduct.print.top + selectedProduct.print.height / 2;
    }
    obj.set({ originX: 'center', originY: 'center', left: cx, top: cy });
}


// ==========================================================================
// 1. INITIALIZE STUDIO
// ==========================================================================
window.onload = () => {
    canvas = new fabric.Canvas('designCanvas');
    initSwatches();
    resizeCanvas();
    buildProductGrid();
    // Hint until a product is picked (a guide — removed when a product is chosen)
    const hint = new fabric.Textbox('Choose a product above to start designing', {
        left: 400, top: 300, originX: 'center', originY: 'center', width: 500,
        fontSize: 26, fontFamily: 'Montserrat, sans-serif', fill: '#54665e',
        textAlign: 'center', selectable: false, evented: false,
        isProductGuide: true, excludeFromExport: true
    });
    canvas.add(hint);
    
    searchPixabay('background');
};

(function() {
    emailjs.init("1LZbCPvH49G_r0ypB"); 
})();

// ==========================================================================
// 2. RESPONSIVE SCALE CANVAS FOR SCREEN
// ==========================================================================
function resizeCanvas() {
    const viewport = document.querySelector('.canvas-viewport');
    const scaler = document.getElementById('canvasScaler');
    if (!viewport || !scaler) return;

    const vWidth = viewport.clientWidth - 40;
    const vHeight = viewport.clientHeight - 40;
    
    // Scale 800x600 layout safely down to fit tiny mobile device glass areas
    const scale = Math.min(vWidth / 800, vHeight / 600);
    scaler.style.transform = `scale(${scale})`;
    scaler.style.transformOrigin = 'center center';
}
window.addEventListener('resize', resizeCanvas);

// ==========================================================================
// 4. PIXABAY SEARCH GRAPHICS LOGIC
// ==========================================================================
async function searchPixabay(query) {
    const q = query || document.getElementById('pixabaySearch').value;
    if (!q) return;

    const url = `https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${encodeURIComponent(q)}&image_type=vector&safesearch=true&per_page=42`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        const gallery = document.getElementById('gallery');
        if (!gallery) return;
        gallery.innerHTML = '';

        data.hits.forEach(img => {
            const el = document.createElement('img');
            el.src = img.previewURL; 
            el.loading = "lazy";    
            el.className = "gallery-item";
            el.onclick = () => {
                fabric.Image.fromURL(img.largeImageURL, function(oImg) {
                    oImg.scaleToWidth(250);
                    canvas.add(oImg);
                    centerOnCanvas(oImg);
                    canvas.setActiveObject(oImg);
                    canvas.renderAll();
                    showStatus("✨ Graphic added!", "green");
                }, { crossOrigin: 'anonymous' });
            };
            gallery.appendChild(el);
        });
        
    } catch (e) { console.error("Pixabay Error", e); }
}

// ==========================================================================
// 5. TEXT HANDLING LOGIC
// ==========================================================================
function placeTextOnCanvas() {
    const val = document.getElementById('textInput').value;
    if (!val) {
        showStatus("⚠️ Type something first", "orange");
        return;
    }

    const text = new fabric.Textbox(val, {
        left: 100,
        top: 100,
        width: 250,
        fontSize: parseInt(document.getElementById('fontSize').value) || 40,
        fontFamily: document.getElementById('fontFamily').value,
        fill: document.getElementById('activeColor').value,
        textAlign: 'center'
    });

    canvas.add(text);
    centerOnCanvas(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    document.getElementById('textInput').value = '';
}

function updateLiveText() {
    const active = canvas.getActiveObject();
    if (active && active.type === 'textbox') {
        active.set({
            fontFamily: document.getElementById('fontFamily').value,
            fontSize: parseInt(document.getElementById('fontSize').value) || 20,
            fill: document.getElementById('activeColor').value
        });
        canvas.renderAll();
    }
}

function setTextAlignment(alignValue) {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'textbox') {
        activeObject.set('textAlign', alignValue);
        canvas.renderAll();
        
        if (navigator.vibrate) {
            navigator.vibrate(20);
        }
    } else {
        showStatus("⚠️ Select text first", "orange");
    }
}

// ==========================================================================
// 6. COLOR SWATCH SYSTEM
// ==========================================================================
function initSwatches() {
    const p = document.getElementById('swatchPalette');
    if (!p) return;
    const colors = [ '#FFFFFF', '#BFBFBF', '#808080', '#000000',
        '#FF0000', '#FF8000', '#FFFF00', '#994C00',
        '#00FF00', '#009900', '#00FFFF', '#0000FF',
        '#000099', '#8000FF', '#FF00FF', '#FF99FF' ];
    p.innerHTML = ''; // Keep clean on reload
    colors.forEach(c => {
        const s = document.createElement('div');
        s.className = 'swatch';
        s.style.background = c;
        s.onclick = () => {
            document.getElementById('activeColor').value = c;
            const active = canvas.getActiveObject();
            if (active) { active.set('fill', c); canvas.renderAll(); }
            p.style.display = 'none';
        };
        p.appendChild(s);
    });
}

function togglePalette(e) {
    const p = document.getElementById('swatchPalette');
    if (!p) return;
    const isVisible = p.style.display === 'grid';
    
    p.style.display = isVisible ? 'none' : 'grid';
    
    if (!isVisible) {
        p.style.left = '50%';
        p.style.transform = 'translateX(-50%)';
        p.style.bottom = '80px'; 
        p.style.top = 'auto';    
    }
}

// ==========================================================================
// 7. FILE UPLOADS & CORED LAYERING UTILITIES
// ==========================================================================
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(f) {
        fabric.Image.fromURL(f.target.result, (img) => {
            img.scaleToWidth(300);
            canvas.add(img);
            centerOnCanvas(img);
            canvas.setActiveObject(img);
            canvas.renderAll();
            switchTab('image'); // Returns user to editing panel view
        });
    };
    reader.readAsDataURL(file);
}

function bringForward() {
    const active = canvas.getActiveObject();
    if (active) { canvas.bringForward(active); canvas.renderAll(); }
}

function sendBackward() {
    const active = canvas.getActiveObject();
    if (active) { canvas.sendBackwards(active); canvas.renderAll(); }
}

function deleteObject() {
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length > 0) {
        activeObjects.forEach((obj) => canvas.remove(obj));
        canvas.discardActiveObject();
        canvas.requestRenderAll();
        showStatus("🗑️ Item deleted", "gray");
    }
}

// ==========================================================================
// 8. NAVIGATION AND TABS SWITCHER
// ==========================================================================
function switchTab(tabId) {
    const panels = document.querySelectorAll('.tab-panel');
    panels.forEach(p => p.classList.remove('active'));

    const targetPanel = document.getElementById('tab-' + tabId);
    if (targetPanel) targetPanel.classList.add('active');

    const navBtns = document.querySelectorAll('.bottom-nav button');
    navBtns.forEach(btn => {
        btn.classList.remove('active');
        const clickAttr = btn.getAttribute('onclick') || '';
        if (clickAttr.includes(tabId)) {
            btn.classList.add('active');
        }
    });

    const palette = document.getElementById('swatchPalette');
    if (palette) palette.style.display = 'none';
}

// ==========================================================================
// 9. EMAILJS SUBMISSION & LOCAL DOWNLOADS
// ==========================================================================
async function submitToEmail() {
    const name = document.getElementById('custName').value;
    const email = document.getElementById('custEmail').value;
    const btn = document.getElementById('submitBtn');

    if (!selectedProduct) {
        showStatus("⚠️ Please choose a product first!", "orange");
        return;
    }

    if (!name || !email) {
        showStatus("⚠️ Missing Name or Email", "orange");
        return;
    }

    btn.disabled = true;
    showStatus("📤 Preparing Design...", "blue");

    try {
        const dataURL = exportDesignDataURL();
        const base64 = dataURL.split(',')[1];

        showStatus("☁️ Uploading Image...", "orange");
        const formData = new FormData();
        formData.append("image", base64);

        const imgResponse = await fetch("https://api.imgbb.com/1/upload?key=54309054fcb7bc0531b2f51c73e1802e", {
            method: "POST",
            body: formData
        });
        const imgResult = await imgResponse.json();

        if (imgResult.success) {
            showStatus("📧 Sending Email...", "#007bff");
            const templateParams = {
                cust_name: name,
                cust_email: email,
                design_image: imgResult.data.url,
                product_name: selectedProduct.name,
                product_price: 'From $' + selectedProduct.price,
                product_design_area: selectedProduct.area
            };

            await emailjs.send('service_ezq1fuc', 'template_ut1r5xk', templateParams);
            showStatus("✅ Design Sent Successfully!", "green");
            document.getElementById('custName').value = '';
            document.getElementById('custEmail').value = '';
        } else {
            throw new Error("Upload failed");
        }
    } catch (error) {
        console.error(error);
        showStatus("❌ Error: " + error.message, "red");
    } finally {
        btn.disabled = false;
    }
}

// Export a clean PNG: hide the guide objects (dashed print area, PRINT AREA
// label, "choose a product" hint) while exporting. Fabric's excludeFromExport
// flag only affects toObject/toJSON/toSVG — the bitmap export draws EVERY
// object, so the guides must be hidden for real. The product outline itself
// is NOT a guide, so it stays in the image.
function exportDesignDataURL() {
    const hidden = canvas.getObjects().filter(function(o) { return o.excludeFromExport && o.visible; });
    hidden.forEach(function(o) { o.visible = false; });
    try {
        return canvas.toDataURL({ format: 'png', quality: 1.0 });
    } finally {
        hidden.forEach(function(o) { o.visible = true; });
        canvas.renderAll();
    }
}

function downloadDesign() {
    try {
        const url = exportDesignDataURL();
        const link = document.createElement('a');
        link.download = 'my-design.png';
        link.href = url;
        document.body.appendChild(link);
        link.click();
        link.remove();
        showStatus("✅ Download started! If nothing saved, use “Open design in a new tab” — the store page can block downloads.", "green");
    } catch (error) {
        showStatus("❌ Download failed: " + error.message + ". Use “Open design in a new tab” instead.", "red");
    }
    switchTab('submit');
}

// Fallback for the embedded store page, where the browser blocks downloads
// from inside the frame: open the clean design image in a new tab so the
// customer can save it from there (right-click / long-press → Save image).
function openDesignInNewTab() {
    let url;
    try {
        url = exportDesignDataURL();
    } catch (error) {
        showStatus("❌ Could not open your design: " + error.message, "red");
        switchTab('submit');
        return;
    }
    const win = window.open('', '_blank');
    if (!win) {
        showStatus("❌ Pop-up blocked — allow pop-ups for this site, or open the full studio link below.", "red");
        switchTab('submit');
        return;
    }
    win.document.write('<!DOCTYPE html><html><head><title>Your design — D.I.M. Bright Ideas</title></head><body style="margin:0;background:#888;display:flex;align-items:center;justify-content:center;min-height:100vh"><img src="' + url + '" style="max-width:100vw;max-height:100vh"></body></html>');
    win.document.close();
    showStatus("✅ Your design opened in a new tab — save it from there.", "green");
    switchTab('submit');
}

function showStatus(msg, color) {
    const status = document.getElementById('statusMessage');
    if (status) {
        status.innerText = msg;
        status.style.color = color;
    }
}
