// 1. INITIALIZE CANVAS & EMAILJS
const canvas = new fabric.Canvas('designCanvas', {
    preserveObjectStacking: true,
    selection: true,             // Enable the selection box
    selectionKey: 'ctrlKey',     // Enable Ctrl + Click
    multiSelectKey: 'shiftKey'   // Optional: Enable Shift + Click as well
});

// Mac support: Use Command key for selection if on a Mac
if (navigator.platform.toUpperCase().indexOf('MAC') >= 0) {
    canvas.selectionKey = 'metaKey';
}
canvas.on('mouse:down', function() {
    window.focus();
});

(function() {
    emailjs.init("1LZbCPvH49G_r0ypB"); 
})();

// 2. GITHUB GALLERY LOGIC
//const GITHUB_API_URL = "https://api.github.com/repos/diminfomacon-beep/new-design-studio/contents/mothers-day";

/*async function loadGitHubTemplates() {
    try {
        const response = await fetch(GITHUB_API_URL);
        const files = await response.json();
        const gallery = document.getElementById('gallery');
        if (!gallery) return;
        gallery.innerHTML = ''; 

        files.forEach(file => {
            if (file.name.match(/\.(png|jpg|jpeg|svg)$/i)) {
                const imgElement = document.createElement('img');
                // Path fix for raw images
                imgElement.src = `https://raw.githubusercontent.com/diminfomacon-beep/new-design-studio/main/mothers-day/${file.name}`;
                imgElement.alt = file.name;
                
                imgElement.onclick = function() {
                    fabric.Image.fromURL(imgElement.src, function(oImg) {
                        oImg.scale(0.2);
                        canvas.add(oImg);
                        canvas.setActiveObject(oImg);
                    }, { crossOrigin: 'anonymous' });
                };
                gallery.appendChild(imgElement);
            }
        });
    } catch (error) {
        console.error("Error loading templates:", error);
    }
}*/
const PIXABAY_KEY = '54841320-2fc493da46915b0eb0a6f740c'; // Replace with your actual key

async function searchPixabay() {
    const query = document.getElementById('pixabaySearch').value;
    if (!query) return;

    showStatus("🔍 Searching Graphics...", "#555");
    
    // image_type=vector: Pulls clean graphics
    // safesearch=true: Essential for a business site
    const url = `https://pixabay.com/api/?key=${PIXABAY_KEY}&q=${encodeURIComponent(query)}&image_type=vector&safesearch=true&per_page=60`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        const gallery = document.getElementById('gallery');
        gallery.innerHTML = ''; 

        data.hits.forEach(img => {
            const imgElement = document.createElement('img');
            // Preview in sidebar
            imgElement.src = img.previewURL; 
            imgElement.alt = img.tags;
            imgElement.className = "gallery-item";

            imgElement.onclick = function() {
                // We use largeImageURL for the highest quality print capture
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
    // Fallback if hidden input is missing
    const colorInput = document.getElementById('activeColor');
    const color = colorInput ? colorInput.value : '#000000';

    const text = new fabric.Textbox(userInput, {
        left: 150,
        top: 150,
        width: 250,
        fontSize: parseInt(fontSize),
        fill: color,
        fontFamily: fontFamily,
    });

    canvas.add(text);
    canvas.setActiveObject(text);
    document.getElementById('textInput').value = "";
}

function updateLiveText() {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'textbox') {
        const colorInput = document.getElementById('activeColor');
        activeObject.set({
            fontFamily: document.getElementById('fontFamily').value,
            fontSize: parseInt(document.getElementById('fontSize').value),
            fill: colorInput ? colorInput.value : '#000000'
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
            document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
            swatch.classList.add('active');
            
            const colorInput = document.getElementById('activeColor');
            if(colorInput) colorInput.value = color;
            
            const activeObject = canvas.getActiveObject();
            if (activeObject) {
                activeObject.set('fill', color);
                canvas.renderAll();
            }
        };
        palette.appendChild(swatch);
    });
}

// 5. UPLOAD & UTILITIES
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

function filterGallery() {
    const searchTerm = document.getElementById('searchBar').value.toLowerCase();
    const images = document.getElementById('gallery').getElementsByTagName('img');
    for (let img of images) {
        img.style.display = img.alt.toLowerCase().includes(searchTerm) ? "" : "none";
    }
}

// 6. FORM SUBMISSION
document.getElementById('submitForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const submitBtn = event.target.querySelector('button[type="submit"]');
    
    submitBtn.disabled = true;
    showStatus("📤 Preparing your design...", "#555");

    const fullDataURL = canvas.toDataURL({ format: 'png', quality: 1.0 });
    const base64Image = fullDataURL.split(',')[1]; 

    showStatus("☁️ Uploading design...", "orange");
    
    const formData = new FormData();
    formData.append("image", base64Image);

    fetch("https://api.imgbb.com/1/upload?key=54309054fcb7bc0531b2f51c73e1802e", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            showStatus("📧 Sending to email...", "#007bff");
           // Ensure these keys match your {{tags}} EXACTLY
            const templateParams = {
                cust_name: document.getElementById('custName').value,
                cust_email: document.getElementById('custEmail').value,
                from_name: document.getElementById('custName').value,  // Added this as a backup
                from_email: document.getElementById('custEmail').value, // Added this as a backup
                design_image: result.data.url 
            };
            return emailjs.send('service_ezq1fuc', 'template_ut1r5xk', templateParams, '1LZbCPvH49G_r0ypB');
        } else {
            throw new Error("Upload failed");
        }
    })
    .then(() => {
        showStatus("✅ Success! Design sent to our team.", "green");
        submitBtn.disabled = false;
        document.getElementById('submitForm').reset();
    })
    .catch(error => {
        console.error(error);
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
        if (color === "green") {
            setTimeout(() => { msgArea.innerText = ""; }, 5000);
        }
    }
}
// 1. Toggle the palette visibility
function togglePalette(event) {
    event.stopPropagation(); // Prevents immediate closing
    const palette = document.getElementById('swatchPalette');
    palette.classList.toggle('show');
}

// 2. Updated initSwatches to close the menu after selection
function initSwatches() {
    const palette = document.getElementById('swatchPalette');
    if (!palette) return;
    
    colors.forEach(color => {
        const swatch = document.createElement('div');
        swatch.className = 'swatch';
        swatch.style.backgroundColor = color;
        
        swatch.onclick = function() {
            // Apply color
            document.getElementById('activeColor').value = color;
            const activeObject = canvas.getActiveObject();
            if (activeObject) {
                activeObject.set('fill', color);
                canvas.renderAll();
            }

            // HIDE the palette after picking a color
            palette.classList.remove('show');
        };
        palette.appendChild(swatch);
    });
}

// 3. CLOSE logic for clicking off (The "Click-off" feature)
window.addEventListener('click', function(e) {
    const palette = document.getElementById('swatchPalette');
    const toggleBtn = document.getElementById('paletteToggle');
    
    // If the click is NOT on the palette and NOT on the toggle button, hide it
    if (palette && !palette.contains(e.target) && e.target !== toggleBtn) {
        palette.classList.remove('show');
    }
});
// Listen for Keyboard Delete/Backspace
window.addEventListener('keydown', function(e) {
    // Check if the user is currently typing in an input or textarea
    // We don't want to delete objects while they are typing their name or text!
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") {
        return; 
    }

    // "Delete" is the standard del key, "Backspace" is common for Mac users
    if (e.key === "Delete" || e.key === "Backspace") {
        const activeObjects = canvas.getActiveObjects();
        
        if (activeObjects.length > 0) {
            // Confirm with user if you want, or just delete:
            activeObjects.forEach((obj) => {
                canvas.remove(obj);
            });
            
            // Clear selection and re-render
            canvas.discardActiveObject();
            canvas.requestRenderAll();
            
            // Prevent the browser from going "back" a page (default backspace behavior)
            e.preventDefault();
        }
    }
});
function updateLiveText() {
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type === 'textbox') {
        const size = document.getElementById('fontSize').value;
        
        activeObject.set({
            fontSize: parseInt(size) || 20, // Fallback to 20 if box is empty
            fontFamily: document.getElementById('fontFamily').value,
            fill: document.getElementById('activeColor').value
        });
        canvas.renderAll();
    }
}
function openTab(tabName) {
    // Hide all panels
    const panels = document.querySelectorAll('.tab-panel');
    panels.forEach(p => p.classList.remove('active'));

    // Show selected panel
    const activePanel = document.getElementById('tab-' + tabName);
    if (activePanel) {
        activePanel.classList.add('active');
    }
    
    // Slight vibration for feedback
    if (navigator.vibrate) navigator.vibrate(10);
}
function resizeCanvasForMobile() {
    const screenWidth = window.innerWidth;
    // Fabric.js creates this div automatically
    const container = document.querySelector('.canvas-container'); 
    const wrapper = document.querySelector('.canvas-wrapper');

    if (container && screenWidth < 900) {
        const padding = 20; 
        const scale = (screenWidth - padding) / 800; 

        // 1. Apply the scale
        container.style.transform = `scale(${scale})`;
        
        // 2. VERY IMPORTANT: Lock the origin to the top so it doesn't float away
        container.style.transformOrigin = 'top center';
        
        // 3. Fix the Height & Width of the wrapper
        // This stops the 'empty space' bug and the 'sidebar overlap' bug
        if (wrapper) {
            wrapper.style.height = (600 * scale) + "px"; 
            wrapper.style.width = "100%";
            wrapper.style.overflow = "visible";
        }
    } else if (container) {
        // Reset everything for Desktop
        container.style.transform = 'none';
        if (wrapper) {
            wrapper.style.height = '620px'; // Your canvas height + shadow
            wrapper.style.width = 'auto';
        }
    }
}
// 7. INIT ON LOAD
window.onload = () => {
    // 1. Initial Pixabay Search
    const searchInput = document.getElementById('pixabaySearch');
    if (searchInput) {
        searchInput.value = 'Background';
        searchPixabay(); 
    }
    
    initSwatches();
    
    // Give Fabric.js and the iFrame 100ms to settle before scaling
    setTimeout(() => {
        resizeCanvasForMobile();
    }, 100);

    window.addEventListener('resize', resizeCanvasForMobile);
};
