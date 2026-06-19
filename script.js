// 1. INITIALIZE CANVAS & EMAILJS
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

// 2. PIXABAY SEARCH LOGIC
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
// Define your custom templates data
const templates = {
    blank: {
        background: '#ffffff',
        objects: []
    },
    instagram: {
        background: '#f0f2f5',
        // Example text and shapes pre-configured for the canvas
        objects: [
            {
                type: 'rect',
                left: 100,
                top: 100,
                width: 600,
                height: 400,
                fill: '#ffffff',
                selectable: false,
                selectable: false,
                hoverCursor: 'default'
            },
            {
                type: 'textbox',
                text: 'YOUR HEADING HERE',
                left: 150,
                top: 150,
                width: 500,
                fontSize: 40,
                fontFamily: 'Montserrat',
                fontWeight: 'bold',
                fill: '#333333'
            },
            {
                type: 'textbox',
                text: 'Share your story with the world.',
                left: 150,
                top: 230,
                width: 500,
                fontSize: 20,
                fontFamily: 'Montserrat',
                fill: '#666666'
            }
        ]
    },
    businessCard: {
        background: '#1a1a1a',
        objects: [
            {
                type: 'textbox',
                text: 'JOHN DOE',
                left: 80,
                top: 200,
                fontSize: 36,
                fontFamily: 'Montserrat',
                fill: '#ffffff',
                fontWeight: 'bold'
            },
            {
                type: 'textbox',
                text: 'Creative Director',
                left: 80,
                top: 250,
                fontSize: 18,
                fontFamily: 'Montserrat',
                fill: '#00adb5'
            }
        ]
    }
};

/**
 * Safely loads a template onto the FabricJS canvas
 * @param {string} templateKey 
 */
function loadTemplate(templateKey) {
    // Assuming your fabric canvas instance is named 'canvas'
    if (!canvas) return;

    const template = templates[templateKey];
    if (!template) return;

    // Safety check so users don't accidentally wipe their current work
    if (canvas.getObjects().length > 0) {
        const confirmClear = confirm("Loading a template will clear your current design. Do you want to proceed?");
        if (!confirmClear) return;
    }

    // 1. Clear current canvas items
    canvas.clear();

    // 2. Set background color
    canvas.setBackgroundColor(template.background, canvas.renderAll.bind(canvas));

    // 3. Parse and add layout objects safely
    if (template.objects && template.objects.length > 0) {
        template.objects.forEach(objData => {
            let fabricObj;
            
            if (objData.type === 'rect') {
                fabricObj = new fabric.Rect(objData);
            } else if (objData.type === 'textbox') {
                fabricObj = new fabric.Textbox(objData.text, objData);
            }
            // Add more types (circles, triangles) here if needed

            if (fabricObj) {
                canvas.add(fabricObj);
            }
        });
    }

    // 4. Refresh canvas view
    canvas.renderAll();
}
// 3. TEXT HANDLING
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
        textAlign: 'left' // Default alignment
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

// 4. COLOR SWATCH SYSTEM
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

// 5. UPLOAD & LAYER UTILITIES
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
function setTextAlignment(alignValue) {
    const activeObject = canvas.getActiveObject();
    
    // Check if there is an active object and if it's a type of text
    if (activeObject && (activeObject.type === 'textbox' || activeObject.type === 'i-text')) {
        activeObject.set('textAlign', alignValue);
        canvas.renderAll();
    } else {
        showStatus("⚠️ Select a text box first!", "orange");
    }
}

// 6. FORM SUBMISSION & DOWNLOAD
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

// 7. INIT ON LOAD
window.onload = () => {
    initSwatches();
    searchPixabay(); // Initial load
    
    // Close palette on click-off
    window.addEventListener('click', function(e) {
        const palette = document.getElementById('swatchPalette');
        const toggleBtn = document.getElementById('paletteToggle');
        if (palette && !palette.contains(e.target) && e.target !== toggleBtn) {
            palette.classList.remove('show');
        }
    });
};
