// --- Optimalizovaný Device Detector s lepším výkonem ---

// Globální proměnné pro optimalizaci
let currentDeviceType = null;
let resizeTimeout = null;
let isInitialized = false;

// --- Funkce pro detekci typu zařízení ---
// Tato funkce vrací 'mobile', 'tablet' nebo 'desktop' na základě šířky okna.
function detectDeviceType() {
    const width = window.innerWidth;
    
    // Používáme rychlejší porovnání čísel místo matchMedia
    if (width >= 1025) {
        return 'desktop';
    } else if (width >= 768) {
        return 'tablet';
    } else {
        return 'mobile';
    }
}

// --- Optimalizovaná funkce pro aplikaci stylů ---
function applyStylesBasedOnDevice() {
    const newDeviceType = detectDeviceType();
    
    // Kontrolujeme, zda se typ zařízení skutečně změnil
    if (currentDeviceType === newDeviceType && isInitialized) {
        return; // Žádná změna - neaplikujeme styly znovu
    }
    
    const portfolioContainer = document.getElementById('jirka-portfolio');
    
    if (!portfolioContainer) {
        console.error("Kontejner pro portfolio položky (#jirka-portfolio) nebyl nalezen!");
        return;
    }

    // Ukládáme aktuální typ zařízení
    const previousDeviceType = currentDeviceType;
    currentDeviceType = newDeviceType;

    // Logování pouze při skutečné změně
    if (previousDeviceType !== currentDeviceType) {
        console.log(`Jirko, změna zařízení z "${previousDeviceType}" na "${currentDeviceType}"`);
    }

    // Aplikujeme styly pomocí CSS tříd místo přímého nastavování stylů
    // Odstraníme předchozí třídy
    portfolioContainer.classList.remove('device-desktop', 'device-tablet', 'device-mobile');
    
    if (currentDeviceType === 'desktop') {
        portfolioContainer.classList.add('device-desktop');
        
        // Pouze nejnutnější inline styly
        Object.assign(portfolioContainer.style, {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
            gap: '20px',
            padding: '20px',
            maxWidth: '1200px',
            margin: '0 auto'
        });

        // Optimalizované nastavení pro portfolio items
        const portfolioItems = portfolioContainer.querySelectorAll('.portfolio-item');
        portfolioItems.forEach(item => {
            item.style.maxWidth = '500px';
            item.style.padding = '1rem';
        });

    } else if (currentDeviceType === 'tablet') {
        portfolioContainer.classList.add('device-tablet');
        
        Object.assign(portfolioContainer.style, {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '15px',
            padding: '15px',
            maxWidth: '900px',
            margin: '0 auto'
        });

        const portfolioItems = portfolioContainer.querySelectorAll('.portfolio-item');
        portfolioItems.forEach(item => {
            item.style.maxWidth = '100%';
            item.style.padding = '0.8rem';
        });

    } else if (currentDeviceType === 'mobile') {
        portfolioContainer.classList.add('device-mobile');
        
        Object.assign(portfolioContainer.style, {
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '10px',
            padding: '10px',
            maxWidth: '100%',
            margin: '0'
        });

        const portfolioItems = portfolioContainer.querySelectorAll('.portfolio-item');
        portfolioItems.forEach(item => {
            item.style.maxWidth = '100%';
            item.style.padding = '0.5rem';
        });
    }
    
    isInitialized = true;
}

// --- Debounced resize handler pro lepší výkon ---
function handleResize() {
    // Zrušíme předchozí timeout
    if (resizeTimeout) {
        clearTimeout(resizeTimeout);
    }
    
    // Nastavíme nový timeout s krátším zpožděním
    resizeTimeout = setTimeout(() => {
        applyStylesBasedOnDevice();
        resizeTimeout = null;
    }, 100); // Zpoždění 100ms je dostatečné a responzivní
}

// --- Throttled resize handler (alternativní řešení) ---
let isResizing = false;

function throttledResize() {
    if (!isResizing) {
        isResizing = true;
        requestAnimationFrame(() => {
            applyStylesBasedOnDevice();
            isResizing = false;
        });
    }
}

// --- Přidání CSS stylů pro lepší výkon ---
function addOptimizedStyles() {
    // Zkontrolujeme, zda styly již neexistují
    if (document.getElementById('device-detector-styles')) {
        return;
    }

    const style = document.createElement('style');
    style.id = 'device-detector-styles';
    style.textContent = `
        /* Základní styly pro všechna zařízení */
        #jirka-portfolio {
            transition: all 0.3s ease;
            will-change: grid-template-columns, gap, padding;
        }
        
        /* Styly pro desktop */
        #jirka-portfolio.device-desktop {
            /* Dodatečné styly pro desktop */
        }
        
        /* Styly pro tablet */
        #jirka-portfolio.device-tablet {
            /* Dodatečné styly pro tablet */
        }
        
        /* Styly pro mobil */
        #jirka-portfolio.device-mobile {
            /* Dodatečné styly pro mobil */
        }
        
        /* Optimalizace pro portfolio items */
        .portfolio-item {
            transition: padding 0.2s ease;
            will-change: padding, max-width;
        }
    `;
    
    document.head.appendChild(style);
}

// --- Inicializace při načtení stránky ---
document.addEventListener('DOMContentLoaded', () => {
    // Přidáme optimalizované styly
    addOptimizedStyles();
    
    // Nastavíme počáteční stav
    applyStylesBasedOnDevice();
    
    // Spustíme render portfolio items
    renderPortfolioItems();
    
    console.log('Optimalizovaný device detector inicializován');
});

// --- Optimalizované sledování změn velikosti okna ---
// Použijeme throttled verzi pro lepší výkon
window.addEventListener('resize', throttledResize, { passive: true });

// --- Sledování změn orientace pro mobilní zařízení ---
window.addEventListener('orientationchange', () => {
    // Malé zpoždění pro orientationchange
    setTimeout(() => {
        applyStylesBasedOnDevice();
    }, 150);
}, { passive: true });

// --- Funkce pro manuální refresh (pokud je potřeba) ---
function refreshDeviceDetection() {
    currentDeviceType = null; // Resetujeme cache
    applyStylesBasedOnDevice();
}

// --- Upravená renderPortfolioItems funkce ---
function renderPortfolioItems() {
    const portfolioContainer = document.getElementById('jirka-portfolio');
    if (!portfolioContainer) {
        console.error("Kontejner pro portfolio položky (#jirka-portfolio) nebyl nalezen!");
        return;
    }

    // Vyčistíme kontejner
    portfolioContainer.innerHTML = '';

    if (portfolioItemsData.length === 0) {
        portfolioContainer.innerHTML = '<p>Žádné položky portfolia nejsou k dispozici.</p>';
        return;
    }

    // Vytvoříme fragment pro lepší výkon
    const fragment = document.createDocumentFragment();

    portfolioItemsData.forEach(item => {
        const videoId = getYouTubeVideoId(item.youtubeUrl || '');
        let videoEmbedHtml = '';
        if (videoId) {
            const embedSrc = `https://www.youtube.com/embed/${videoId}`;
            videoEmbedHtml = `
                <div class="portfolio-video-container">
                    <iframe
                        src="${embedSrc}"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                    ></iframe>
                </div>
            `;
        }

        const isOwner = currentUserId && item.userId === currentUserId;

        // Vytvoříme element místo innerHTML pro lepší výkon
        const itemDiv = document.createElement('div');
        itemDiv.className = 'portfolio-item';
        itemDiv.setAttribute('data-item-id', item.id);
        itemDiv.style.cssText = 'background-color: #f9f9f9; padding: 1rem; border-radius: 4px; border: 1px solid #ddd; position: relative;';
        
        itemDiv.innerHTML = `
            <h3 data-editable-portfolio="title">${item.title || 'Název projektu'}</h3>
            <p data-editable-portfolio="desc1">${item.desc1 || 'Popis projektu'}</p>
            ${item.desc2 ? `<p data-editable-portfolio="desc2">${item.desc2}</p>` : ''}

            ${videoEmbedHtml}

            <a href="${item.linkUrl || '#'}" class="button editable-link" target="_blank" rel="noopener noreferrer">
                ${item.linkText || 'Zobrazit projekt →'}
            </a>
            <div class="edit-controls ${isEditMode && isOwner ? '' : 'hidden'}">
                <button onclick="editPortfolioItem('${item.id}')">Editovat</button>
                <button onclick="deletePortfolioItem('${item.id}')" class="button btn-danger">Smazat</button>
            </div>
        `;
        
        fragment.appendChild(itemDiv);
    });

    // Přidáme všechny elementy najednou
    portfolioContainer.appendChild(fragment);

    // Nastavíme viditelnost edit controls
    portfolioContainer.querySelectorAll('.portfolio-item .edit-controls').forEach(controls => {
        const itemId = controls.closest('.portfolio-item').dataset.itemId;
        const item = portfolioItemsData.find(p => p.id === itemId);
        const isOwner = currentUserId && item && item.userId === currentUserId;
        controls.classList.toggle('hidden', !(isEditMode && isOwner));
    });

    // Po renderování aplikujeme styly pro aktuální zařízení
    applyStylesBasedOnDevice();
}

// --- Vystavení funkcí pro debugging ---
window.deviceDetector = {
    getCurrentDeviceType: () => currentDeviceType,
    refresh: refreshDeviceDetection,
    getWidth: () => window.innerWidth
};

// NOVÁ FUNKCE: Rychlé uložení URL dat
    async function saveUrlDataToFirestore(projectId, urlData) {
        if (!currentUserId) {
            console.warn("Nelze uložit URL data - uživatel není přihlášen");
            return false;
        }

        try {
            // Aktualizujeme lokální data
            editableContentData[`${projectId}-link-text`] = urlData.linkText;
            editableContentData[`${projectId}-link-url`] = urlData.linkUrl;
            
            // Uložíme do Firestore
            const dataToSave = {
                editableContent: editableContentData,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            };                       

            await db.collection('publicContent').doc(DOC_ID).set(dataToSave, { merge: true });
            console.log(`✅ URL data pro ${projectId} uložena do Firestore`);
            return true;
        } catch (error) {
            console.error('Chyba při ukládání URL dat:', error);
            return false;
        }
    }