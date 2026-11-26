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
// 2B. PRODUCT PICKER — Step 1: choose what the design goes on
// ==========================================================================
const PHOTO_BASE = 'https://diminfomacon-beep.github.io/Mothers_Day/catalog/photos/';

const PRODUCTS = [
    { id: 'skinny-ombre', name: '20oz Skinny Tumbler \u2013 Ombre', price: 'From $17', area: 'about 8 in \u00d7 3 in', photo: PHOTO_BASE + '20oz%20Skinny%20Tumbler%20-%20Ombre.png', print: { left: 295, top: 130, width: 210, height: 360 } },
    { id: 'traveler-40oz', name: '40oz Traveler Tumbler', price: 'From $32', area: 'about 9 in \u00d7 4 in', photo: PHOTO_BASE + '40oz%20Traveler%20Tumbler.png', print: { left: 278, top: 150, width: 244, height: 340 } },
    { id: 'glass-mug', name: 'Glass Mug', price: 'From $13', area: 'about 3 in \u00d7 3 in', photo: PHOTO_BASE + 'Glass%20Mug.png', print: { left: 240, top: 170, width: 260, height: 260 } },
    { id: 'tshirt-poly', name: 'T-Shirt (Polyester, White)', price: 'From $15', area: 'about 11 in \u00d7 12 in', photo: PHOTO_BASE + 'Adult%20Polyester%20Short%20Sleeve%20T-Shirt%20-%20White.png', print: { left: 315, top: 230, width: 170, height: 220 } },
    { id: 'tote-medium', name: 'Medium Tote Bag', price: 'From $10', area: 'about 10 in \u00d7 10 in', photo: PHOTO_BASE + 'Medium%20Tote%20Bag.png', print: { left: 265, top: 220, width: 270, height: 250 } },
    // Blank canvas: no outline and no print area — the whole 800x600 canvas
    // is the design area, and the product is confirmed by email instead.
    { id: 'blank', name: 'Blank Canvas', price: 'To be confirmed', area: 'Full canvas (800 x 600)', photo: null, print: { left: 0, top: 0, width: 800, height: 600 } }
];

let selectedProduct = null;

function renderProductGrid() {
    const grid = document.getElementById('productGrid');
    if (!grid) return;
    grid.innerHTML = PRODUCTS.map(function(p) {
        var thumb = p.photo
            ? '<img src="' + p.photo + '" alt="' + p.name + '">'
            : '<div class="product-blank-thumb"></div>';
        return '<div class="product-card" data-product-id="' + p.id + '" onclick="selectProduct(\'' + p.id + '\')">' +
            thumb +
            '<span class="product-name">' + p.name + '</span>' +
            (p.id === 'blank' ? '' : '<span class="product-price">' + (p.cardPrice || p.price) + '</span>') + '</div>';
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
        left: 400, top: 290, width: 440, fontSize: 22, fill: '#54665e',
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
        shapes.push(new fabric.Path('M270,180 Q315,90 360,180', { fill: 'transparent', stroke: '#0e4d42', strokeWidth: 10, selectable: false, evented: false, isProductGuide: true }));
        shapes.push(new fabric.Path('M440,180 Q485,90 530,180', { fill: 'transparent', stroke: '#0e4d42', strokeWidth: 10, selectable: false, evented: false, isProductGuide: true }));
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
    // The new outline is drawn after the design, so lift the design back on
    // top — otherwise the solid outline would cover it up.
    canvas.getObjects().filter(function(o) { return !o.isProductGuide; }).forEach(function(o) { canvas.bringToFront(o); });
    canvas.renderAll();

    document.querySelectorAll('.product-card').forEach(function(card) {
        card.classList.toggle('selected', card.dataset.productId === productId);
    });

    const info = document.getElementById('productInfo');
    info.style.display = 'block';
    // One slim line on purpose: a tall info box would push the canvas down
    // and shrink it every time a product is picked (the email + timing
    // details already live in the strip intro above).
    if (product.id === 'blank') {
        info.innerHTML = '<strong>Blank Canvas</strong> &middot; No product yet &mdash; design anywhere on the full canvas.';
    } else {
        info.innerHTML = '<strong>' + product.name + '</strong> &middot; ' + product.price +
            ' &middot; Print area: ' + product.area;
    }
    showStatus('Product selected: ' + product.name, 'green');
    fitCanvas();
}

// ==========================================================================
// 3. PIXABAY SEARCH LOGIC
// ==========================================================================
// Pixabay search goes through the D.I.M. Pixabay Relay (Google Apps Script)
// so the API key is never in this public code. The key lives in the relay's
// Script Properties. Paste the deployed relay /exec URL below (see
// ~/workspace/pixabay-relay/README.md). Graphic search will not work until set.
const PIXABAY_RELAY_URL = 'https://script.google.com/macros/s/AKfycbwGIOR2dzbtdJyux5d2nOCJRTH-UtR_6y9uJdbOf1DPYlUmT2LrvTG_hwHl9OmNFxjl7A/exec';

async function searchPixabay() {
    const query = document.getElementById('pixabaySearch').value;
    if (!query) return;

    showStatus("🔍 Searching Graphics...", "#555");
    const url = `${PIXABAY_RELAY_URL}?q=${encodeURIComponent(query)}&per_page=60`;

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
        showStatus("", "#555");
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
// GitHub backup: the Apps Script web app saves a copy of each submitted
// design into Dana's private design-submissions repo. Best effort only —
// it never blocks the email. Same no-cors fire-and-forget pattern as the
// gift-planning form's sendToAppsScript(). No token lives in this file;
// the token is stored in the Apps Script's Script Properties.
const GITHUB_BACKUP_URL = "https://script.google.com/macros/s/AKfycbznQYxccwM6f6MghqPOgh7eoza_5sOgckYT4sSrJAlKbyuqZ0k43pL20JLiylg-2ICEJw/exec";
function sendToGitHubBackup(base64Image, custName, productName, imageUrl) {
    fetch(GITHUB_BACKUP_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64Image, name: custName, product: productName, imageUrl: imageUrl })
    }).catch(function(err) { console.error("GitHub backup failed:", err); });
}

document.getElementById('submitForm').addEventListener('submit', function(event) {
    event.preventDefault();
    // Email must be a real email address before anything is sent.
    if (!event.target.checkValidity()) { event.target.reportValidity(); return; }
    if (!selectedProduct) {
        showStatus("Please choose a product first!", "orange");
        return;
    }
    const submitBtn = event.target.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    showStatus("📤 Preparing design...", "#555");

    let fullDataURL;
    try {
        fullDataURL = exportDesignDataURL();
    } catch (err) {
        showStatus("❌ Error: " + err.message, "red");
        submitBtn.disabled = false;
        return;
    }
    const base64Image = fullDataURL.split(',')[1]; 
    
    const formData = new FormData();
    formData.append("file", "data:image/png;base64," + base64Image);
    formData.append("upload_preset", "gift_planning");

    fetch("https://api.cloudinary.com/v1_1/dpsmcu07f/image/upload", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(result => {
        if (result.secure_url) {
            // EmailJS template "Contact Us" (template_ut1r5xk) expects these names:
            // from_name / from_email (body + subject), name / email (From Name +
            // Reply-To headers), order_details, grand_total (the template adds
            // the "$"), design_image. The old cust_* keys matched nothing, so
            // the emails arrived blank — only the image printed.
            var custNameVal = document.getElementById('custName').value;
            var custEmailVal = document.getElementById('custEmail').value;
            var grandTotalVal = String(selectedProduct.price).replace('From $', '');
            // Back up the design to GitHub (best effort — if it fails, the
            // email below still sends).
            sendToGitHubBackup(base64Image, custNameVal, selectedProduct.name, result.secure_url);
            const templateParams = {
                from_name: custNameVal,
                from_email: custEmailVal,
                name: custNameVal,
                email: custEmailVal,
                order_details: '\u2022 ' + selectedProduct.name + '\nDesign area: ' + selectedProduct.area,
                grand_total: grandTotalVal,
                design_image: result.secure_url,
                product_name: selectedProduct.name,
                product_price: selectedProduct.price,
                product_design_area: selectedProduct.area
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
        showStatus("✅ Download started! If nothing saved, use “Open design in a new tab” below — the store page can block downloads.", "green");
    } catch (error) {
        showStatus("❌ Download failed: " + error.message + ". Use “Open design in a new tab” below instead.", "red");
    }
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
        return;
    }
    const win = window.open('', '_blank');
    if (!win) {
        showStatus("❌ Pop-up blocked — allow pop-ups for this site, or open the full studio link below.", "red");
        return;
    }
    win.document.write('<!DOCTYPE html><html><head><title>Your design — D.I.M. Bright Ideas</title></head><body style="margin:0;background:#888;display:flex;align-items:center;justify-content:center;min-height:100vh"><img src="' + url + '" style="max-width:100vw;max-height:100vh"></body></html>');
    win.document.close();
    showStatus("✅ Your design opened in a new tab — save it from there.", "green");
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
// Keep the whole 800x600 canvas visible: shrink the wrapper to fit the
// space left between the top strip and the panels below the canvas, never
// growing past full size. Fabric corrects clicks for the CSS scale, so
// drawing and dragging keep working at any size. The canvas area is then
// sized to the scaled canvas exactly, so the canvas sits right under the
// strip with no empty space above it or between it and Manage Layers.
function fitCanvas() {
    const column = document.querySelector('.canvas-column');
    const area = document.querySelector('.canvas-area');
    const wrapper = document.querySelector('.canvas-wrapper');
    const below = document.querySelector('.below-canvas');
    if (!column || !area || !wrapper || !below) return;
    const availW = column.clientWidth - 16;
    const availH = column.clientHeight - below.offsetHeight - 16;
    if (availW <= 0 || availH <= 0) return;
    const scale = Math.min(availW / 800, availH / 600, 1);
    wrapper.style.transform = 'scale(' + scale + ')';
    wrapper.style.transformOrigin = 'top center';
    area.style.height = Math.round(600 * scale + 16) + 'px';
}
window.addEventListener('resize', fitCanvas);

window.onload = () => {
    initSwatches();
    renderProductGrid();
    drawHint();
    fitCanvas();
    searchPixabay();        // Initial load for images
    
    // Close palette on click-off
    window.addEventListener('click', function(e) {
        const palette = document.getElementById('swatchPalette');
        const toggleBtn = document.getElementById('paletteToggle');
        if (palette && !palette.contains(e.target) && e.target !== toggleBtn) {
            palette.classList.remove('show');
        }
    });
};
