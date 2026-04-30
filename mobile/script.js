let canvas;
const PIXABAY_KEY = '54841320-2fc493da46915b0eb0a6f740c';

// 1. INITIALIZE
window.onload = () => {
    canvas = new fabric.Canvas('designCanvas');
    initSwatches();
    resizeCanvas();
    
    // Initial Load
    searchPixabay('background');
};

// 2. SCALE CANVAS FOR SCREEN
function resizeCanvas() {
    const viewport = document.querySelector('.canvas-viewport');
    const scaler = document.getElementById('canvasScaler');
    if (!viewport || !scaler) return;

    const vWidth = viewport.clientWidth - 40;
    const vHeight = viewport.clientHeight - 40;
    
    // Scale 800x600 canvas
    const scale = Math.min(vWidth / 800, vHeight / 600);
    scaler.style.transform = `scale(${scale})`;
    scaler.style.transformOrigin = 'center center';
}
window.addEventListener('resize', resizeCanvas);

// 3. PIXABAY SEARCH
async function searchPixabay(query) {
    const q = query || document.getElementById('pixabaySearch').value;
    if (!q) return;

    const url = `https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${encodeURIComponent(q)}&image_type=vector&safesearch=true&per_page=42`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        const gallery = document.getElementById('gallery');
        gallery.innerHTML = '';

        // Ensure your JS keeps it simple so the CSS can do the heavy lifting
data.hits.forEach(img => {
    const el = document.createElement('img');
    el.src = img.previewURL; // Use the small preview for the gallery
    el.loading = "lazy";    // Good for mobile performance
    el.onclick = () => { /* ... your canvas logic ... */ };
    gallery.appendChild(el);
});
        
    } catch (e) { console.error("Pixabay Error", e); }
}


// 5. UTILS
function deleteObject() {
    const active = canvas.getActiveObjects();
    if (active.length) {
        active.forEach(obj => canvas.remove(obj));
        canvas.discardActiveObject().renderAll();
    }
}

function downloadDesign() {
    const link = document.createElement('a');
    link.download = 'design.png';
    link.href = canvas.toDataURL({ format: 'png' });
    link.click();
}

function initSwatches() {
    const p = document.getElementById('swatchPalette');
    const colors = [ '#FFFFFF', '#BFBFBF', '#808080', '#000000',
        '#FF0000', '#FF8000', '#FFFF00', '#994C00',
        '#00FF00', '#009900', '#00FFFF', '#0000FF',
        '#000099', '#8000FF', '#FF00FF', '#FF99FF' ];
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
    const isVisible = p.style.display === 'grid';
    
    // Toggle visibility
    p.style.display = isVisible ? 'none' : 'grid';
    
    // Position it centrally above the button for mobile
    if (!isVisible) {
        p.style.left = '50%';
        p.style.transform = 'translateX(-50%)';
        p.style.bottom = '80px'; // Sits above the tray content
        p.style.top = 'auto';    // Clear the desktop top setting
    }
}
// --- 1. INITIALIZE EMAILJS ---
(function() {
    emailjs.init("1LZbCPvH49G_r0ypB"); 
})();

// --- 2. UPDATED TEXT LOGIC ---
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
        textAlign: 'left' // Sets initial alignment to left
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    document.getElementById('textInput').value = '';
}
function updateLiveText() {
    const active = canvas.getActiveObject();
    if (active && active.type === 'textbox') {
        active.set({
            fontFamily: document.getElementById('fontFamily').value,
            fontSize: parseInt(document.getElementById('fontSize').value),
            fill: document.getElementById('activeColor').value
        });
        canvas.renderAll();
    }
}
// --- 3. FULL SUBMISSION LOGIC ---
async function submitToEmail() {
    const name = document.getElementById('custName').value;
    const email = document.getElementById('custEmail').value;
    const btn = document.getElementById('submitBtn');

    if (!name || !email) {
        showStatus("⚠️ Missing Name or Email", "orange");
        return;
    }

    btn.disabled = true;
    showStatus("📤 Preparing Design...", "blue");

    try {
        // 1. Convert Canvas to Image
        const dataURL = canvas.toDataURL({ format: 'png', quality: 1.0 });
        const base64 = dataURL.split(',')[1];

        // 2. Upload to ImgBB
        showStatus("☁️ Uploading Image...", "orange");
        const formData = new FormData();
        formData.append("image", base64);

        const imgResponse = await fetch("https://api.imgbb.com/1/upload?key=54309054fcb7bc0531b2f51c73e1802e", {
            method: "POST",
            body: formData
        });
        const imgResult = await imgResponse.json();

        if (imgResult.success) {
            // 3. Send Email via EmailJS
            showStatus("📧 Sending Email...", "#007bff");
            const templateParams = {
                cust_name: name,
                cust_email: email,
                design_image: imgResult.data.url 
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


function showStatus(msg, color) {
    const status = document.getElementById('statusMessage');
    status.innerText = msg;
    status.style.color = color;
}


// Image Upload Logic
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(f) {
        fabric.Image.fromURL(f.target.result, (img) => {
            img.scaleToWidth(300);
            canvas.add(img);
            canvas.centerObject(img);
            canvas.setActiveObject(img);
            // Switch back to image/edit view
            switchTab('image');
        });
    };
    reader.readAsDataURL(file);
}
// Layering: Move objects up
function bringForward() {
    const active = canvas.getActiveObject();
    if (active) {
        canvas.bringForward(active);
        canvas.renderAll();
    }
}

// Layering: Move objects down
function sendBackward() {
    const active = canvas.getActiveObject();
    if (active) {
        canvas.sendBackwards(active);
        canvas.renderAll();
    }
}

// Delete: Remove selected items
function deleteObject() {
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length > 0) {
        activeObjects.forEach((obj) => {
            canvas.remove(obj);
        });
        canvas.discardActiveObject();
        canvas.requestRenderAll();
        showStatus("🗑️ Item deleted", "gray");
    }
}
function switchTab(tabId) {
    // 1. Hide all panels
    const panels = document.querySelectorAll('.tab-panel');
    panels.forEach(p => p.classList.remove('active'));

    // 2. Show the selected panel
    document.getElementById('tab-' + tabId).classList.add('active');

    // 3. Handle Nav Button Colors
    const navBtns = document.querySelectorAll('.bottom-nav button');
    navBtns.forEach(btn => {
        btn.classList.remove('active');
        // Check if the button's onclick contains the tabId
        if (btn.getAttribute('onclick').includes(tabId)) {
            btn.classList.add('active');
        }
    });

    // Close palette if open
    const palette = document.getElementById('swatchPalette');
    if (palette) palette.style.display = 'none';
}
function setTextAlignment(alignValue) {
    const activeObject = canvas.getActiveObject();
    // We check for 'textbox' because that's what you are using in placeTextOnCanvas
    if (activeObject && activeObject.type === 'textbox') {
        activeObject.set('textAlign', alignValue);
        canvas.renderAll();
        
        // Optional: vibration feedback for mobile feel
        if (navigator.vibrate) {
            navigator.vibrate(20);
        }
    } else {
        showStatus("⚠️ Select text first", "orange");
    }
}
// Ensure the first search runs inside its tab
window.onload = () => {
    canvas = new fabric.Canvas('designCanvas');
    initSwatches();
    resizeCanvas();
    searchPixabay('background');
};
