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
        left: 150,
        top: 150,
        width: 250,
        fontSize: parseInt(fontSize),
        fill: color,
        fontFamily: fontFamily,
        textAlign: 'left'
    });

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
