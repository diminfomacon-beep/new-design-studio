let canvas;
const PIXABAY_KEY = '54841320-2fc493da46915b0eb0a6f740c';

// GitHub Repository Configurations
const RAW_BASE_URL = "https://raw.githubusercontent.com/diminfomacon-beep/new-design-studio/1d7347945ed4cdca65a3629a35948af74ad54222/DesignTemplates/";
const API_URL = "https://api.github.com/repos/diminfomacon-beep/new-design-studio/contents/DesignTemplates?ref=1d7347945ed4cdca65a3629a35948af74ad54222";

// Global cache for instant mobile searching without extra API requests
let cachedTemplateFiles = [];

// ==========================================================================
// 1. INITIALIZE STUDIO
// ==========================================================================
window.onload = () => {
    canvas = new fabric.Canvas('designCanvas');
    initSwatches();
    resizeCanvas();
    
    // Fire up both your background graphic engine and dynamic template folders together
    searchPixabay('background');
    initializeTemplates();
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
// 3. DYNAMIC GITHUB TEMPLATES LOGIC
// ==========================================================================
async function initializeTemplates() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error("Failed to scan GitHub directory");
        
        const files = await response.json();
        const imageExtensions = ['png', 'jpg', 'jpeg', 'webp'];
        
        cachedTemplateFiles = files.filter(file => {
            const ext = file.name.split('.').pop().toLowerCase();
            return file.type === "file" && imageExtensions.includes(ext);
        });

        renderTemplateGrid(cachedTemplateFiles);

    } catch (error) {
        console.error("Error reading templates dynamically:", error);
        const grid = document.querySelector('.template-grid');
        if (grid) grid.innerHTML = `<p style="color: red; font-size: 11px; text-align: center;">Could not load layouts.</p>`;
    }
}

function renderTemplateGrid(filesList) {
    const grid = document.querySelector('.template-grid');
    if (!grid) return;

    if (filesList.length === 0) {
        grid.innerHTML = `<p style="color: #71717a; font-size: 12px; grid-column: 1/-1; text-align: center;">No layouts found.</p>`;
        return;
    }

    grid.innerHTML = filesList.map(file => {
        const fullImageUrl = `${RAW_BASE_URL}${file.name}`;
        const cleanName = file.name.split('.')[0].replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

        return `
            <div class="template-card" onclick="applyGitHubTemplate('${file.name}')" title="${cleanName}">
                <img src="${fullImageUrl}" alt="${cleanName}" onerror="this.src='https://placehold.co/150x110?text=Error'">
            </div>
        `;
    }).join('');
}

function filterTemplates() {
    const searchInput = document.getElementById('templateSearch');
    if (!searchInput) return;

    const query = searchInput.value.toLowerCase().trim();
    const filteredFiles = cachedTemplateFiles.filter(file => file.name.toLowerCase().includes(query));
    renderTemplateGrid(filteredFiles);
}

function applyGitHubTemplate(fileName) {
    if (!canvas) return;

    if (canvas.getObjects().length > 0) {
        const confirmClear = confirm("Loading a template will clear your current layers. Continue?");
        if (!confirmClear) return;
    }

    const targetUrl = `${RAW_BASE_URL}${fileName}`;
    canvas.clear();
    canvas.setBackgroundColor('#ffffff', canvas.renderAll.bind(canvas));

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
        canvas.sendToBack(img); // Pushes template behind fonts and stickers
        canvas.setActiveObject(img);
        canvas.renderAll();
        showStatus("✨ Template added as layer!", "green");
    }, { crossOrigin: 'anonymous' });
}

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
                    canvas.centerObject(oImg);
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
        textAlign: 'left'
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.centerObject(text);
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
            canvas.centerObject(img);
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

    if (!name || !email) {
        showStatus("⚠️ Missing Name or Email", "orange");
        return;
    }

    btn.disabled = true;
    showStatus("📤 Preparing Design...", "blue");

    try {
        const dataURL = canvas.toDataURL({ format: 'png', quality: 1.0 });
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

function downloadDesign() {
    const link = document.createElement('a');
    link.download = 'design.png';
    link.href = canvas.toDataURL({ format: 'png' });
    link.click();
}

function showStatus(msg, color) {
    const status = document.getElementById('statusMessage');
    if (status) {
        status.innerText = msg;
        status.style.color = color;
    }
}
