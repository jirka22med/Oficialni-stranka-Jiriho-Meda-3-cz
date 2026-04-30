// --- OPRAVENÉ FUNKCE BEZ setupModalEventListeners ---
// Tyto funkce byly přesunuty do globálního scopu nebo upraveny pro novou strukturu
// a jejich event listenery jsou inicializovány níže.

// Funkce pro bezpečné připojení event listenerů
function attachEventListenerSafely(elementId, eventType, handler, description) {
    const element = document.getElementById(elementId);
    if (element) {
        element.onclick = null; // Odebereme inline onclick, pokud existuje
        element.removeEventListener(eventType, handler); // Odebereme předchozí listenery
        element.addEventListener(eventType, handler); // Připojíme nový
        return true;
    } else {
        console.warn(`Element s ID "${elementId}" pro ${description} nebyl nalezen.`);
        return false;
    }
}

// Funkce pro inicializaci všech event listenerů pro externí odkazy
function initializeAllEventListeners() {
    attachEventListenerSafely('add-link-btn', 'click', addLink, 'tlačítko Přidat odkaz');
    attachEventListenerSafely('save-edited-link-btn', 'click', saveEditedLink, 'tlačítko Uložit odkaz');
    attachEventListenerSafely('cancel-edit-link-btn', 'click', function() {
        hideModal(document.getElementById('edit-link-modal'));
    }, 'tlačítko Zrušit odkaz');

    // Portfolio listenery
    attachEventListenerSafely('save-edit-portfolio-btn', 'click', saveEditedPortfolioItem, 'tlačítko Uložit portfolio');
    attachEventListenerSafely('cancel-edit-portfolio-btn', 'click', function() {
        hideModal(document.getElementById('edit-portfolio-modal'));
        document.getElementById('youtube-preview-container').style.display = 'none';
        document.getElementById('youtube-preview').src = '';
        document.getElementById('edit-portfolio-youtube').value = '';
    }, 'tlačítko Zrušit portfolio');
    attachEventListenerSafely('add-portfolio-item-btn', 'click', addPortfolioItem, 'tlačítko Přidat položku portfolia');
    // Tlačítko smazat portfolio se připojuje dynamicky v renderPortfolioItems
}

// Zbytek funkcí zůstává stejný...
document.addEventListener('DOMContentLoaded', function() {
    initializeAllEventListeners();
});

// Další pojistka - pokud by se stránka načetla dříve než DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAllEventListeners);
} else {
    initializeAllEventListeners();
}

window.addEventListener('load', function() {
    setTimeout(() => {
        const addLinkBtn = document.getElementById('add-link-btn');
        const saveLinkBtn = document.getElementById('save-edited-link-btn');
        if ((addLinkBtn && !addLinkBtn.onclick && !addLinkBtn.hasEventListener) ||
            (saveLinkBtn && !saveLinkBtn.onclick && !saveLinkBtn.hasEventListener)) {
            initializeAllEventListeners();
        }
    }, 100);
});

// --- Ultra-optimalizovaný YouTube script pro slabší zařízení ---

// Jednoduchá regex cache pro lepší výkon
const videoIdCache = new Map();

function getYouTubeVideoId(url) {
    if (videoIdCache.has(url)) {
        return videoIdCache.get(url);
    }
    
    const regExp = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regExp);
    const videoId = (match && match[1].length === 11) ? match[1] : null;
    
    videoIdCache.set(url, videoId);
    return videoId;
}

// Minimální debounce bez closure overhead
let debounceTimer;
function debounce(func, delay) {
    return function(...args) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => func.apply(this, args), delay);
    };
}

// Detekce slabšího zařízení
function isLowEndDevice() {
    // Kontrola paměti (pokud je dostupná)
    if (navigator.deviceMemory && navigator.deviceMemory < 4) return true;
    
    // Kontrola CPU jader
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) return true;
    
    // Kontrola user agent pro starší zařízení
    const ua = navigator.userAgent.toLowerCase();
    if (ua.includes('android') && !ua.includes('chrome/')) return true;
    
    return false;
}

// Optimalizovaný preview pro slabší zařízení
function createOptimizedPreview(videoId) {
    const previewContainer = document.getElementById('youtube-preview-container');
    const previewIframe = document.getElementById('youtube-preview');
    
    // Odstraníme starý obsah
    const oldContent = previewContainer.querySelector('.yt-preview');
    if (oldContent) oldContent.remove();
    
    const isLowEnd = isLowEndDevice();
    
    // Pro slabší zařízení - jen text link
    if (isLowEnd) {
        const linkContainer = document.createElement('div');
        linkContainer.className = 'yt-preview';
        linkContainer.innerHTML = `
            <div style="
                padding: 20px;
                border: 2px dashed #ccc;
                border-radius: 8px;
                text-align: center;
                background: #f9f9f9;
                margin: 10px 0;
            ">
                <p style="margin: 0 0 10px 0; font-weight: bold;">📺 YouTube Video</p>
                <a href="https://www.youtube.com/watch?v=${videoId}" 
                   target="_blank" 
                   style="color: #1976d2; text-decoration: none;">
                    Otevřít video v YouTube
                </a>
            </div>
        `;
        
        previewContainer.insertBefore(linkContainer, previewIframe);
        previewIframe.style.display = 'none';
        previewContainer.style.display = 'block';
        return;
    }
    
    // Pro výkonnější zařízení - lightweight thumbnail
    const thumbnailContainer = document.createElement('div');
    thumbnailContainer.className = 'yt-preview';
    thumbnailContainer.style.cssText = `
        position: relative;
        width: 100%;
        max-width: 560px;
        height: 315px;
        background: #000;
        cursor: pointer;
        border-radius: 8px;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    // Lazy loading thumbnail s nízkou kvalitou pro rychlost
    const img = new Image();
    img.onload = function() {
        thumbnailContainer.style.backgroundImage = `url(${this.src})`;
        thumbnailContainer.style.backgroundSize = 'cover';
        thumbnailContainer.style.backgroundPosition = 'center';
    };
    
    // Používáme mqdefault (menší obrázek) místo hqdefault
    img.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    
    // Minimální play button
    const playButton = document.createElement('div');
    playButton.innerHTML = '▶';
    playButton.style.cssText = `
        font-size: 40px;
        color: white;
        background: rgba(0,0,0,0.7);
        border-radius: 50%;
        width: 80px;
        height: 80px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: opacity 0.2s ease;
    `;
    
    // Jednoduchý hover efekt
    thumbnailContainer.onmouseenter = () => playButton.style.opacity = '0.8';
    thumbnailContainer.onmouseleave = () => playButton.style.opacity = '1';
    
    // Click handler s minimálním overhead
    thumbnailContainer.onclick = function() {
        // Nahradíme thumbnail iframe pouze při kliknutí
        const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
        previewIframe.src = embedUrl;
        previewIframe.style.display = 'block';
        thumbnailContainer.style.display = 'none';
    };
    
    thumbnailContainer.appendChild(playButton);
    previewContainer.insertBefore(thumbnailContainer, previewIframe);
    previewIframe.style.display = 'none';
    previewContainer.style.display = 'block';
}

// Optimalizovaná update funkce
const updatePreview = debounce(function(url) {
    const previewContainer = document.getElementById('youtube-preview-container');
    
    if (!url || url.trim() === '') {
        previewContainer.style.display = 'none';
        return;
    }
    
    const videoId = getYouTubeVideoId(url);
    if (videoId) {
        // Použijeme requestAnimationFrame pro plynulejší animace
        requestAnimationFrame(() => {
            createOptimizedPreview(videoId);
        });
    } else {
        previewContainer.style.display = 'none';
    }
}, 800); // Delší debounce pro slabší zařízení

// Event listener s passive flag pro lepší scroll výkon
const inputElement = document.getElementById('edit-portfolio-youtube');
if (inputElement) {
    inputElement.addEventListener('input', function() {
        updatePreview(this.value);
    }, { passive: true });
}

// Cleanup při unload pro úsporu paměti
window.addEventListener('beforeunload', function() {
    videoIdCache.clear();
    clearTimeout(debounceTimer);
}, { passive: true });

// Volitelné: Preload pouze na rychlých připojeních
if (navigator.connection && navigator.connection.effectiveType === '4g') {
    // Povolíme preload jen na rychlých připojeních
    document.addEventListener('DOMContentLoaded', function() {
        const style = document.createElement('style');
        style.textContent = `
            .yt-preview img { 
                loading: lazy; 
                decoding: async; 
            }
        `;
        document.head.appendChild(style);
    });
}