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
