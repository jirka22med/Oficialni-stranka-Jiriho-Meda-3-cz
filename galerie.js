
let isFullscreenMode = false;

// BEZPEČNÁ FUNKCE PRO ZÍSKÁNÍ PLATNÉHO INDEXU
function getSafeIndex(index) {
    if (galleryImagesData.length === 0) return -1;
    if (index < 0) return galleryImagesData.length - 1;
    if (index >= galleryImagesData.length) return 0;
    return index;
}

// HLAVNÍ FUNKCE PRO PŘEPÍNÁNÍ CELOOBRAZOVKOVÉHO REŽIMU PROHLÍŽEČE (F11 EFEKT)
// Tato funkce je nyní jediným vstupním bodem pro aktivaci/deaktivaci fullscreenu.
function toggleBrowserFullscreen() {
    const modal = document.getElementById('image-modal');
    if (!modal) {
       // console.error('❌ Celoobrazovkový režim prohlížeče: Chybí image-modal!');
        return;
    }

    if (!document.fullscreenElement) {
        // Pokud nejsme ve fullscreenu, přepneme modal do fullscreenu
        if (modal.requestFullscreen) {
            modal.requestFullscreen().then(() => {
                console.log('🖥️ Prohlížeč: Celoobrazovkový režim ZAPNUT (přes API)');
                // Styly a stav isFullscreenMode budou aktualizovány přes 'fullscreenchange' listener
            }).catch(err => {
               // console.error(`❌ Chyba při aktivaci prohlížečového fullscreenu: ${err.message}`);
                // V případě chyby se ujistíme, že naše interní proměnná je správně nastavena
                isFullscreenMode = false;
                updateFullscreenButtonIcon();
                updateAllIndicators();
            });
        } else {
            console.warn('⚠️ Váš prohlížeč nepodporuje Fullscreen API.');
            // Pokud prohlížeč nepodporuje Fullscreen API, nemůžeme nic dělat
        }
    } else {
        // Pokud jsme ve fullscreenu, ukončíme ho
        if (document.exitFullscreen) {
            document.exitFullscreen().then(() => {
                console.log('🖥️ Prohlížeč: Celoobrazovkový režim VYPNUT (přes API)');
                // Styly a stav isFullscreenMode budou aktualizovány přes 'fullscreenchange' listener
            }).catch(err => {
               // console.error(`❌ Chyba při deaktivaci prohlížečového fullscreenu: ${err.message}`);
                // V případě chyby se ujistíme, že naše interní proměnná je správně nastavena
                isFullscreenMode = true;
                updateFullscreenButtonIcon();
                updateAllIndicators();
            });
        }
    }
}

// Funkce pro aktualizaci ikony tlačítka fullscreen
function updateFullscreenButtonIcon() {
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    if (fullscreenBtn) {
        // Ikona se nyní řídí pouze stavem prohlížečového fullscreenu
        if (document.fullscreenElement) {
            fullscreenBtn.innerHTML = '🗗'; // Ikona pro minimalizaci
            fullscreenBtn.title = 'Ukončit celoobrazovkový režim';
        } else {
            fullscreenBtn.innerHTML = '🗖'; // Ikona pro maximalizaci
            fullscreenBtn.title = 'Celoobrazovkový režim';
        }
    }
}

// FUNKCE PRO AUTOMATICKÉ VYPNUTÍ CELOOBRAZOVKOVÉHO REŽIMU PŘI ZAVŘENÍ MODALU
function resetFullscreenMode() {
    // Ukončíme skutečný fullscreen prohlížeče, pokud je aktivní
    if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().then(() => {
            console.log('🖥️ Prohlížeč: Fullscreen ukončen při zavření modalu');
            // Zbytek resetu (CSS třídy, isFullscreenMode) proběhne po události 'fullscreenchange'
        }).catch(err => {
            //console.error(`❌ Chyba při ukončení prohlížečového fullscreenu při zavření modalu: ${err.message}`);
        });
    }
    // Pokud nejsme ve fullscreenu prohlížeče, ale naše třídy jsou z nějakého důvodu aktivní, resetujeme je
    // (To by se nemělo stávat často, pokud 'fullscreenchange' funguje správně)
    if (!document.fullscreenElement && isFullscreenMode) {
        isFullscreenMode = false;
        const modal = document.getElementById('image-modal');
        const body = document.body;
        if (modal) modal.classList.remove('fullscreen-mode');
        if (body) body.classList.remove('fullscreen-active');
        updateFullscreenButtonIcon();
        console.log('🖥️ Celoobrazovkový režim RESETOVÁN (manuálně po zavření modalu)');
    }
}

// HLAVNÍ FUNKCE PRO OTEVŘENÍ MODALU - ZPĚT K JEDNODUCHOSTI
function openImageModal(index) {
    console.log(`🚀 openImageModal voláno s indexem: ${index}, celkem obrázků: ${galleryImagesData.length}`);

    if (galleryImagesData.length === 0) {
        console.warn('⚠️ Galerie je prázdná!');
        return;
    }

    // OPRAVA: Bezpečná kontrola a korekce indexu
    const safeIndex = getSafeIndex(index);
    if (safeIndex === -1) {
        console.error('❌ Nelze zobrazit obrázek - prázdná galerie');
        return;
    }

    // KLÍČOVÁ OPRAVA: Vždy nastav index
    currentModalImageIndex = safeIndex;
    console.log(`✅ Nastavuji currentModalImageIndex na: ${currentModalImageIndex}`);

    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-img');

    if (!modal || !modalImg) {
        console.error('❌ Modal nebo modalImg element nenalezen!');
        return;
    }

    // OVĚŘENÍ: Zkontroluj, že index je opravdu platný
    if (currentModalImageIndex < 0 || currentModalImageIndex >= galleryImagesData.length) {
        console.error(`❌ KRITICKÁ CHYBA: Index ${currentModalImageIndex} je mimo rozsah 0-${galleryImagesData.length-1}`);
        currentModalImageIndex = 0; // Fallback na první obrázek
    }

    const currentImage = galleryImagesData[currentModalImageIndex];
    console.log(`📸 Zobrazuji obrázek: "${currentImage.name}" na pozici ${currentModalImageIndex + 1}/${galleryImagesData.length}`);

    // JEDNODUCHÉ loading
    modalImg.style.transition = 'opacity 0.5s ease-out';
    modalImg.style.opacity = '0.8';

    modalImg.onload = function() {
        console.log(`✅ Obrázek načten: ${currentImage.name}`);
        modalImg.style.opacity = '0.8';
    };

    modalImg.onerror = function() {
        console.error(`❌ Chyba načítání: ${currentImage.name}`);
        modalImg.style.opacity = '0.8';
        modalImg.alt = `❌ Chyba načítání: ${currentImage.name}`;
    };

    // Nastavení URL s cache busterem
    const finalUrl = currentImage.url + (currentImage.url.includes('?') ? '&' : '?') + `t=${Date.now()}`;
    modalImg.src = finalUrl;
    modalImg.alt = `${currentImage.name} (${currentModalImageIndex + 1}/${galleryImagesData.length})`;

    // Aktualizace všech indikátorů
    updateAllIndicators();

    // Otevři modal pouze pokud není už otevřený
    if (!modal.classList.contains('show')) {
        showModal(modal);
    }

    // Debug info
    console.log(`🔍 Finální stav: index=${currentModalImageIndex}, obrázek="${currentImage.name}"`);
}

// ZACHOVÁNO: Aktualizuje všechny indikátory najednou
function updateAllIndicators() {
    updateImageIndicator(currentModalImageIndex, galleryImagesData.length);
    addPositionIndicator(currentModalImageIndex, galleryImagesData.length, galleryImagesData[currentModalImageIndex].name);
    updateNavigationButtons();
    updateFullscreenButtonIcon(); // Aktualizace ikony při každé aktualizaci
}

// ZACHOVÁNO: Aktualizace číselných indikátorů
function updateImageIndicator(currentIndex, totalImages) {
    const currentNumberElement = document.getElementById('current-image-number');
    const totalCountElement = document.getElementById('total-images-count');

    if (currentNumberElement) {
        currentNumberElement.textContent = currentIndex + 1;
        console.log(`🔢 current-image-number aktualizován na: ${currentIndex + 1}`);
    }

    if (totalCountElement) {
        totalCountElement.textContent = totalImages;
        console.log(`🔢 total-images-count aktualizován na: ${totalImages}`);
    }
}

// ZACHOVÁNO: Aktualizace stavu navigačních tlačítek
function updateNavigationButtons() {
    const prevBtn = document.getElementById('prev-image-btn');
    const nextBtn = document.getElementById('next-image-btn');

    if (galleryImagesData.length <= 1) {
        // Pokud je jen jeden nebo žádný obrázek, skryj tlačítka
        if (prevBtn) prevBtn.style.opacity = '0.3';
        if (nextBtn) nextBtn.style.opacity = '0.3';
    } else {
        // Jinak je zobraz normálně
        if (prevBtn) prevBtn.style.opacity = '1';
        if (nextBtn) nextBtn.style.opacity = '1';
    }
}

// ZACHOVÁNO: Vizuální indikátor pozice
function addPositionIndicator(index, total, name) {
    const modal = document.getElementById('image-modal');
    if (!modal) return;

    let indicator = modal.querySelector('.position-indicator');

    if (!indicator) {
        indicator = document.createElement('div');
        indicator.className = 'position-indicator';
        indicator.style.cssText = `
            position: absolute;
            top: 10px;
            left: 10px;
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: bold;
            z-index: 1001;
        `;
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.appendChild(indicator);
        }
    }

    indicator.textContent = `${index + 1}/${total} - ${name}`;
    console.log(`📍 Indikátor aktualizován: ${indicator.textContent}`);
}

// JEDNODUŠE OPTIMALIZOVANÁ NAVIGACE - bez cache komplikací
let isNavigating = false; // Jen anti-spam ochrana

function navigateImageModal(direction) {
    // Zabránění spam klikání
    if (isNavigating) {
        console.log('⏳ Navigace již probíhá...');
        return;
    }

    console.log(`🧭 NAVIGACE: směr=${direction}, současný index=${currentModalImageIndex}`);
    console.log(`📊 Stav galerie: ${galleryImagesData.length} obrázků`);

    if (galleryImagesData.length === 0) {
        console.warn('⚠️ Nelze navigovat - prázdná galerie!');
        return;
    }

    if (galleryImagesData.length === 1) {
        console.log('ℹ️ Pouze jeden obrázek - zůstáváme na místě');
        updateAllIndicators();
        return;
    }

    isNavigating = true;

    // BEZPEČNÝ výpočet nového indexu - STEP BY STEP DEBUG
    const oldIndex = currentModalImageIndex;
    console.log(`🔢 PŘED: currentModalImageIndex = ${oldIndex}`);

    let rawNewIndex = currentModalImageIndex + direction;
    console.log(`🔢 RAW: ${oldIndex} + ${direction} = ${rawNewIndex}`);

    let safeNewIndex = getSafeIndex(rawNewIndex);
    console.log(`🔢 SAFE: getSafeIndex(${rawNewIndex}) = ${safeNewIndex}`);

    // KRITICKY DŮLEŽITÉ: Nastav index JEDNOZNAČNĚ
    currentModalImageIndex = safeNewIndex;
    console.log(`🔢 FINÁL: currentModalImageIndex nastaveno na ${currentModalImageIndex}`);

    // OVĚŘENÍ že se opravdu nastavilo
    if (currentModalImageIndex !== safeNewIndex) {
        console.error(`❌ FATÁLNÍ CHYBA: Index se nenastavil správně! Očekáváno: ${safeNewIndex}, Skutečnost: ${currentModalImageIndex}`);
        currentModalImageIndex = safeNewIndex; // Force fix
    }

    // OKAMŽITÁ aktualizace indikátorů
    updateAllIndicators();

    const modalImg = document.getElementById('modal-img');
    if (modalImg) {
        const currentImage = galleryImagesData[currentModalImageIndex];
        console.log(`🖼️ Zobrazuji: "${currentImage.name}" na indexu ${currentModalImageIndex}`);

        // RYCHLÁ vizuální odezva
        modalImg.style.transition = 'opacity 0.1s ease-out';
        modalImg.style.opacity = '0.8';

        modalImg.onload = function() {
            console.log(`✅ Navigace dokončena: "${currentImage.name}" na indexu ${currentModalImageIndex}`);
            modalImg.style.opacity = '0.8';
            isNavigating = false; // Uvolni navigaci
        };

        modalImg.onerror = function() {
            console.error(`❌ Chyba při navigaci: "${currentImage.name}" na indexu ${currentModalImageIndex}`);
            modalImg.style.opacity = '0.8';
            isNavigating = false; // Uvolni navigaci i při chybě
        };

        // Nastavení nového obrázku
        const finalUrl = currentImage.url + (currentImage.url.includes('?') ? '&' : '?') + `t=${Date.now()}`;
        modalImg.src = finalUrl;
        modalImg.alt = `${currentImage.name} (${currentModalImageIndex + 1}/${galleryImagesData.length})`;

        console.log(`🎯 NAVIGACE HOTOVÁ: Zobrazuji obrázek "${currentImage.name}" na pozici ${currentModalImageIndex + 1}/${galleryImagesData.length}`);
    } else {
        isNavigating = false; // Uvolni i když není modalImg
    }
}

// UPRAVENÁ FUNKCE PRO ZAVŘENÍ MODALU - S RESETEM CELOOBRAZOVKOVÉHO REŽIMU
function closeImageModal() {
    console.log('🚪 Zavírám modal');
    const modal = document.getElementById('image-modal');

    // Reset celoobrazovkového režimu před zavřením
    resetFullscreenMode();

    hideModal(modal);

    // Reset indexu není potřeba - zůstává pro příští otevření
    console.log(`💾 Index zůstává: ${currentModalImageIndex} pro příští otevření`);
}

// VYLEPŠENÉ KLÁVESOVÉ ZKRATKY - Nyní F11 a tlačítko spouští skutečný fullscreen
function setupKeyboardNavigation() {
    document.addEventListener('keydown', function(event) {
        const imageModal = document.getElementById('image-modal');

        // Krok 1: Kontrola, zda je modal viditelný
        if (!imageModal || imageModal.style.display === 'none') {
            return; // Pokud modal není viditelný, nic neděláme
        }

        // Krok 2: Klíčové vylepšení - Zkontrolovat, zda je uživatel v editačním poli
        // activeElement vrací aktuálně fokusovaný element.
        // tagName vrací název tagu ve velkých písmenech (např. 'INPUT', 'TEXTAREA').
        const activeElement = document.activeElement;
        const isEditingText = (
            activeElement.tagName === 'INPUT' ||
            activeElement.tagName === 'TEXTAREA' ||
            activeElement.hasAttribute('contenteditable') // Pro případ, že edituješ DIV s contenteditable
        );

        // Pokud uživatel edituje text A stiskl šipku nebo F11 (nebo Esc),
        // Esc by ale měl fungovat vždy pro zavření modalu.
        if (isEditingText && (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'F11')) {
            // Logiku pro přepínání obrázku v modalu ignorujeme, necháme šipku pro textové pole
            console.log(`⌨️ Uživatel edituje text. Klávesa ${event.key} bude ignorována pro modal.`);
            return; // Důležité: Ukončíme funkci, aby se dál nezpracovávala pro modal
        }

        // Zabráníme defaultnímu chování šipek a F11 (pokud nejsme v textovém poli)
        if (['ArrowLeft', 'ArrowRight', 'Escape', 'F11'].includes(event.key)) {
            event.preventDefault();
            event.stopPropagation();
        }

        console.log(`⌨️ Klávesa stisknuta: ${event.key}`);

        switch(event.key) {
            case 'ArrowLeft':
                console.log('⬅️ Předchozí obrázek (←)');
                navigateImageModal(-1);
                break;
            case 'ArrowRight':
                console.log('➡️ Další obrázek (→)');
                navigateImageModal(1);
                break;
            case 'Escape':
                console.log('🚪 Zavírám modal (ESC)');
                closeImageModal();
                break;
            case 'F11':
                console.log('🖥️ Přepínám PROHLÍŽEČOVÝ celoobrazovkový režim (F11)');
                toggleBrowserFullscreen(); // Voláme skutečný prohlížečový fullscreen
                break;
        }
    });

    // Listener pro událost fullscreenchange (když uživatel opustí/vstoupí do fullscreenu přes prohlížeč, např. F11)
    document.addEventListener('fullscreenchange', () => {
        const modal = document.getElementById('image-modal');
        const body = document.body;
        // Aktualizujeme náš stav isFullscreenMode a třídy podle skutečného stavu prohlížeče
        if (document.fullscreenElement) {
            console.log('🖥️ Fullscreen prohlížeče je aktivní.');
            if (modal) modal.classList.add('fullscreen-mode');
            if (body) body.classList.add('fullscreen-active');
            isFullscreenMode = true; // Aktualizujeme interní proměnnou
        } else {
            console.log('🖥️ Fullscreen prohlížeče byl ukončen.');
            if (modal) modal.classList.remove('fullscreen-mode');
            if (body) body.classList.remove('fullscreen-active');
            isFullscreenMode = false; // Aktualizujeme interní proměnnou
        }
        updateFullscreenButtonIcon(); // Aktualizujeme ikonu tlačítka
        updateAllIndicators(); // Aktualizujeme indikátory (např. pozici)
    });
}

// Funkce pro dynamické vložení CSS stylů
function injectFullscreenStyles() {
    const style = document.createElement('style');
    style.textContent = `
        /* Univerzální reset pro HTML a BODY, aby se zajistilo plné pokrytí viewportu bez okrajů */
        html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            text-align: center;
             /*TOTO ZPŮSOBOVALO PROBLÉM, ODSTRANĚNO */
        }

        /* Skrytí posuvníků, pokud by se náhodou objevily při fullscreenu */
       /* body.fullscreen-active {
            overflow: hidden;
        }*/

        /* --- Styly pro Celoobrazovkový režim (Fullscreen Mode) --- */
        .modal.fullscreen-mode {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            max-width: 100vw;
            max-height: 100vh;
            background-color: black; /* Čistě černé pozadí pro fullscreen */
            z-index: 9999; /* Zajištění, že bude nad vším ostatním */
            display: flex; /* Použití flexboxu pro centrování obsahu */
            align-items: center; /* Vertikální centrování */
            justify-content: center; /* Horizontální centrování */
            padding: 0; /* Bez vnitřního odsazení */
            backdrop-filter: none; /* Vypnutí rozmazání, aby nic nerušilo */
            animation: none; /* Vypnutí animace při přepnutí do fullscreenu */
        }

        .modal.fullscreen-mode .modal-content {
            width: 100%;
            height: 100%;
            max-width: 100%;
            max-height: 100%;
            border-radius: 0;
            background: transparent;
            box-shadow: none;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0;
            animation: none; /* Vypnutí animace při přepnutí do fullscreenu */
        }

        .modal.fullscreen-mode #modal-img {
            /* Ponechání automatických rozměrů */
            width: auto;
            height: auto;
            /* Omezení na 60% s centrováním */
            max-width: 60%;
            max-height: 60%;
            /* Zajištění správného poměru stran */
            object-fit: contain;
            /* Perfektní centrování pomocí flexboxu */
            margin: 0; /* Reset všech margin hodnot */
            /* Cursor pro indikaci možnosti kliknutí */
            cursor: zoom-out;
            /* Reset ostatních stylů */
            border-radius: 0;
            padding: 0;
            border: none;
            transform: none;
            /* Dodatečné centrování pro jistotu */
            position: relative;
            display: block;
        }

        /* Alternativní způsob centrování pro lepší kompatibilitu */
        .modal.fullscreen-mode .modal-content {
            position: relative;
        }

        .modal.fullscreen-mode #modal-img {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            /* Ponechání původních omezení velikosti */
            max-width: 80%;
            max-height: 80%;
            width: auto;
            height: auto;
            object-fit: contain;
            cursor: zoom-out;
            border-radius: 0;
            padding: 0;
            border: none;
            margin: 0;
        }

        /* zobrazeny ovládacích prvků, které nechceme ve fullscreenu */
        .modal.fullscreen-mode .modal-header,
        .modal.fullscreen-mode .modal-footer,
        /*.modal.fullscreen-mode .position-indicator,*/
        .modal.fullscreen-mode .modal-caption {
            display: none;
             
        }
       
           /* Centrování indikátoru pozice v celoobrazovkovém režimu */
        .modal.fullscreen-mode .position-indicator {
            position: absolute;
            top: 10px;
            left: 10px;
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: bold;
            z-index: 1001;
        }

        /* Úpravy pro navigační a fullscreen tlačítka ve fullscreenu */
        .modal.fullscreen-mode #prev-image-btn,
        .modal.fullscreen-mode #next-image-btn,
        .modal.fullscreen-mode #fullscreen-btn,
        .modal.fullscreen-mode #close-modal-btn {
            position: absolute; /* Absolutní pozice */
            z-index: 10000; /* Ještě vyšší z-index, aby byly vidět */
            background-color: rgba(50, 50, 50, 0.6); /* Tmavší, průhledné pozadí */
            color: white;
            border-radius: 0%; /* Kulaté tlačítka */
            padding: 10px;
            font-size: 1.0em;
            width: 50px;
            height: 50px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background-color 0.2s ease, opacity 0.2s ease;
            /* Reset původních pozic, pokud byly definovány jinak */
            top: 95%; /* Reset top */
            bottom: auto; /* Reset bottom */
            left: auto; /* Reset left */
            right: auto; /* Reset right */
            transform: none; /* Reset transform */
        }

        .modal.fullscreen-mode #prev-image-btn {
            left: 20px;
             font-size: 0.8em;
            transform: translateY(-50%);
  
        }

        .modal.fullscreen-mode #next-image-btn {
            right: 20px;
             font-size: 0.8em;
                          
            transform: translateY(-50%);
        }

       .modal.fullscreen-mode #fullscreen-btn {
    /* Původní transform: translateY(-50%); zůstává pro vertikální centrování */
    /* Následující řádky přidáš pro horizontální centrování */
font-size: 0.8em;
   
    left: 50%; /* Posune levý okraj tlačítka na 50% šířky */
    transform: translate(5px, -50%); /* Posune ho o 5px doprava a o polovinu vlastní výšky nahoru */
}

.modal.fullscreen-mode #close-modal-btn {
    /* Původní transform: translateY(-50%); zůstává pro vertikální centrování */
    /* Následující řádky přidáš pro horizontální centrování */
font-size: 0.8em;
    
    left: 50%; /* Posune levý okraj tlačítka na 50% šířky */
    transform: translate(calc(-100% - 55px), -50%); /* Posune ho o vlastní šířku + 5px doleva a o polovinu vlastní výšky nahoru */
}

        /* Hover efekty pro tlačítka ve fullscreenu */
        .modal.fullscreen-mode button:hover {
            background-color: rgba(80, 80, 80, 0.8);
        }

        /* Responzivní úpravy pro fullscreen tlačítka */
        @media (max-width: 480px) {
            .modal.fullscreen-mode #prev-image-btn,
            .modal.fullscreen-mode #next-image-btn {
                width: 20px;
                height: 20px;
                font-size: 0.8em;  
                 
            }
            .modal.fullscreen-mode #close-modal-btn,
            .modal.fullscreen-mode #fullscreen-btn {
                font-size: 0.8em;
                width: 20px;
                height: 20px;
                padding: 5px;
                  
                left: 10px; /* Pro close button */
                right: 10px; /* Pro fullscreen button */
            }
            .modal.fullscreen-mode #fullscreen-btn {
                left: auto; /* Reset pro fullscreen button */
                right: 10px; /* Přesun na pravou stranu */
            }
        }
    `;
    document.head.appendChild(style);
    console.log('✅ Celoobrazovkové styly dynamicky vloženy do <head>.');
}



// OPRAVENÁ FUNKCE SETUP S LEPŠÍMI EVENT LISTENERY + CELOOBRAZOVKOVÉ TLAČÍTKO
function setupGallery() {
    console.log('🚀 Inicializuji galerii s opraveným indexováním a celoobrazovkovým režimem...');

    // Vložení CSS stylů na začátku inicializace
     injectFullscreenStyles();

    const addBtn = document.getElementById('addImageUrlBtn');
    const closeBtn = document.getElementById('close-modal-btn');
    const prevBtn = document.getElementById('prev-image-btn');
    const nextBtn = document.getElementById('next-image-btn');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const saveEditImageBtn = document.getElementById('save-edit-image-btn');
    const cancelEditImageBtn = document.getElementById('cancel-edit-image-btn');

    // Event listenery s lepším error handlingem
    if (addBtn) {
        addBtn.addEventListener('click', handleAddImageUrl);
        console.log('✅ Add button listener nastaven');
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeImageModal);
        console.log('✅ Close button listener nastaven');
    }

    // OPRAVA: Robustní navigační tlačítka
    if (prevBtn) {
        prevBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('⬅️ Klik na předchozí tlačítko');
            navigateImageModal(-1);
        });
        console.log('✅ Previous button listener nastaven');
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('➡️ Klik na další tlačítko');
            navigateImageModal(1);
        });
        console.log('✅ Next button listener nastaven');
    }

    // NOVÝ: Celoobrazovkové tlačítko nyní volá přímo prohlížečový fullscreen
    if (fullscreenBtn) {
        fullscreenBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🖥️ Klik na celoobrazovkové tlačítko (spouští prohlížečový fullscreen)');
            toggleBrowserFullscreen(); // Tlačítko nyní volá přímo prohlížečový fullscreen
        });
        console.log('✅ Fullscreen button listener nastaven');
    }

    // Ostatní listenery
    if (saveEditImageBtn) {
        saveEditImageBtn.addEventListener('click', saveEditedImage);
        console.log('✅ Save edit listener nastaven');
    }

    if (cancelEditImageBtn) {
        cancelEditImageBtn.addEventListener('click', () => {
            hideModal(document.getElementById('edit-image-modal'));
        });
        console.log('✅ Cancel edit listener nastaven');
    }

    // Nastavení klávesových zkratek
    setupKeyboardNavigation();
    console.log('✅ Klávesové zkratky nastaveny (F11 pro skutečný celoobrazovkový režim)');

    console.log('🎉 Galerie s opraveným indexováním a celoobrazovkovým režimem je připravena!');
}

// OPRAVENÁ FUNKCE PRO AKTUALIZACI ZOBRAZENÍ GALERIE
function updateGalleryDisplay() {
    console.log('🔄 Aktualizuji zobrazení galerie...');

    const container = document.getElementById('gallery-container');
    if (!container) {
        console.error('❌ Gallery container nenalezen!');
        return;
    }

    // Prázdná galerie
    if (galleryImagesData.length === 0) {
        container.innerHTML = '<p>Galerie je prázdná.</p>';
        console.log('📭 Galerie je prázdná');
        return;
    }

    container.innerHTML = '';

    galleryImagesData.forEach((imgData, index) => {
        const div = document.createElement('div');
        div.className = 'gallery-image-wrapper';
        const isOwner = currentUserId && imgData.userId === currentUserId;

        div.innerHTML = `
            <img src="${imgData.url}" alt="${imgData.name || 'Obrázek z galerie'}"
                 onerror="this.onerror=null;this.src='https://placehold.co/250x200/cccccc/ffffff?text=Obrázek+nelze+načíst';this.alt='Obrázek nelze načíst';">
            <button class="delete-img-btn ${isEditMode && isOwner ? '' : 'hidden'}" title="Smazat obrázek">&times;</button>
            <i class="fas fa-edit edit-icon ${isEditMode && isOwner ? '' : 'hidden'}" data-image-id="${imgData.id}"></i>
        `;

        // OPRAVA: Správné předání indexu při kliku na obrázek
        const img = div.querySelector('img');
        img.addEventListener('click', () => {
            console.log(`🖱️ Klik na obrázek s indexem: ${index}`);
            openImageModal(index);
        });

        // Delete button
        const deleteBtn = div.querySelector('.delete-img-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log(`🗑️ Mazání obrázku: ${imgData.name}`);
                deleteGalleryImageFromFirestore(imgData.id);
            });
        }

        // Edit button
        const editIcon = div.querySelector('.edit-icon');
        if (editIcon) {
            editIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log(`✏️ Úprava obrázku: ${imgData.name}`);
                editImage(imgData.id);
            });
        }

        container.appendChild(div);
    });

    console.log(`✅ Zobrazení galerie aktualizováno (${galleryImagesData.length} obrázků)`);

    // OPRAVA: Po změně galerie resetujeme index pokud je neplatný
    if (currentModalImageIndex >= galleryImagesData.length) {
        currentModalImageIndex = Math.max(0, galleryImagesData.length - 1);
        console.log(`🔧 Index resetován na: ${currentModalImageIndex}`);
    }
}

// VYLEPŠENÁ DEBUG FUNKCE
function debugGallery() {
    console.log('🔍 === DEBUG GALERIE ===');
    console.log(`📊 Celkem obrázků: ${galleryImagesData.length}`);
    console.log(`📍 Aktuální index: ${currentModalImageIndex}`);
    console.log(`🎯 Aktuální obrázek: ${galleryImagesData[currentModalImageIndex]?.name || 'ŽÁDNÝ/NEPLATNÝ'}`);
    console.log(`✅ Index je platný: ${currentModalImageIndex >= 0 && currentModalImageIndex < galleryImagesData.length}`);
    console.log(`🖥️ Celoobrazovkový režim: ${document.fullscreenElement ? 'ZAPNUT (prohlížečový)' : 'VYPNUT'}`);

    console.log('📋 Seznam všech obrázků:');
    galleryImagesData.forEach((img, index) => {
        const indicator = index === currentModalImageIndex ? '👉 AKTUÁLNÍ' : '  ';
        console.log(`${indicator} [${index}]: ${img.name} - ${img.url.substring(0, 50)}...`);
    });

    console.log('🧪 Simulace navigace:');
    if (galleryImagesData.length > 0) {
        const prevIndex = getSafeIndex(currentModalImageIndex - 1);
        const nextIndex = getSafeIndex(currentModalImageIndex + 1);
        console.log(`⬅️ Předchozí: index ${prevIndex} (${galleryImagesData[prevIndex]?.name || 'N/A'})`);
        console.log(`➡️ Další: index ${nextIndex} (${galleryImagesData[nextIndex]?.name || 'N/A'})`);
    }

    console.log('🔧 Stav DOM elementů:');
    console.log(`Modal existuje: ${!!document.getElementById('image-modal')}`);
    console.log(`Modal img existuje: ${!!document.getElementById('modal-img')}`);
    console.log(`Prev button existuje: ${!!document.getElementById('prev-image-btn')}`);
    console.log(`Next button existuje: ${!!document.getElementById('next-image-btn')}`);
    console.log(`Fullscreen button existuje: ${!!document.getElementById('fullscreen-btn')}`);

    console.log('======================');
}

// POMOCNÉ FUNKCE (zůstávají stejné)
function isValidHttpUrl(string) {
    let url;
    try {
        url = new URL(string);
    }
    catch (_) {
        return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
}

// Funkce pro přidání obrázku (bez změn v logice indexování)
async function handleAddImageUrl() {
    if (!currentUserId) {
        showAlertModal("Přístup zamítnut", "Pro přidání obrázku se musíte přihlásit.");
        return;
    }

    const urlInput = document.getElementById('newImageUrl');
    if (!urlInput) {
        console.error("Element #newImageUrl not found for adding gallery image.");
        return;
    }

    const imageUrl = urlInput.value.trim();
    if (imageUrl && isValidHttpUrl(imageUrl)) {
        const imageNamePrompt = prompt(`Zadejte název pro obrázek (URL: ${imageUrl.substring(0,50)}...). Prázdné pro výchozí název.`, `Obrázek ${galleryImagesData.length + 1}`);
        let imageName = (imageNamePrompt && imageNamePrompt.trim() !== "") ? imageNamePrompt.trim() : `Obrázek ${galleryImagesData.length + 1}_${Math.floor(Math.random()*1000)}`;

        showLoading("Přidávám obrázek...");
        const newImage = {
            id: `img-${Date.now()}-${Math.random().toString(36).substr(2,5)}`,
            url: imageUrl,
            name: imageName,
            createdAt: Date.now(),
            userId: currentUserId
        };

        try {
            galleryImagesData.unshift(newImage); // Přidá na začátek
            await saveDataToFirestore();
            showAlertModal("Obrázek přidán", `Obrázek "${imageName}" byl uložen do cloudu.`);
            urlInput.value = '';

            // OPRAVA: Po přidání nového obrázku aktualizuj zobrazení
            updateGalleryDisplay();

            hideLoading();
            console.log(`✅ Přidán nový obrázek: ${imageName}, nová velikost galerie: ${galleryImagesData.length}`);
        } catch (error) {
            console.error('Chyba při přidávání obrázku do Firestore:', error);
            showAlertModal("Chyba přidání", `Nepodařilo se přidat obrázek: ${error.message}`);
            hideLoading();
        }
    } else {
        showAlertModal("Neplatná URL", "Zadejte platnou URL adresu obrázku (http:// nebo https://).");
    }
}

// Funkce pro mazání s opravou indexování
async function deleteGalleryImageFromFirestore(idToDelete) {
    if (!currentUserId) {
        showAlertModal("Přístup zamítnut", "Pro smazání obrázku se musíte přihlásit.");
        return;
    }

    const imageToDelete = galleryImagesData.find(img => img.id === idToDelete);
    if (!imageToDelete || imageToDelete.userId !== currentUserId) {
        showAlertModal("Přístup zamítnut", "Nemáte oprávnění smazat tento obrázek. Můžete smazat pouze své vlastní obrázky.");
        return;
    }

    const confirmed = await (window.showConfirmModal ?
        showConfirmModal("Smazat obrázek?", `Opravdu smazat "${imageToDelete.name || 'tento obrázek'}"? Tato akce je nevratná!`) :
        confirm(`Smazat obrázek "${imageToDelete.name || 'tento obrázek'}"?`)
    );

    if (confirmed) {
        showLoading("Mažu obrázek...");
        try {
            const deletedIndex = galleryImagesData.findIndex(img => img.id === idToDelete);
            galleryImagesData = galleryImagesData.filter(img => img.id !== idToDelete);

            // OPRAVA: Korekce indexu po smazání
            if (currentModalImageIndex >= galleryImagesData.length) {
                currentModalImageIndex = Math.max(0, galleryImagesData.length - 1);
                console.log(`🔧 Index po smazání korigován na: ${currentModalImageIndex}`);
            }

            await saveDataToFirestore();
            showAlertModal("Obrázek smazán", "Obrázek byl úspěšně smazán z cloudu.");

            // Aktualizuj zobrazení
            updateGalleryDisplay();

            hideLoading();
            console.log(`✅ Obrázek smazán, nová velikost galerie: ${galleryImagesData.length}`);
        } catch (error) {
            console.error('Chyba při mazání obrázku z Firestore:', error);
            showAlertModal("Chyba mazání", `Nepodařilo se smazat obrázek: ${error.message}`);
            hideLoading();
        }
    }
}

// Funkce pro úpravu obrázku (zůstává stejná)
let editingImageId = null;

async function editImage(imageId) {
    if (!currentUserId) {
        showAlertModal("Přístup zamítnut", "Pro úpravu obrázku se musíte přihlásit.");
        return;
    }

    editingImageId = imageId;
    const image = galleryImagesData.find(img => img.id === imageId);
    if (!image || image.userId !== currentUserId) {
        showAlertModal("Přístup zamítnut", "Nemáte oprávnění upravit tento obrázek. Můžete upravit pouze své vlastní obrázky.");
        return;
    }

    if (image) {
        document.getElementById('edit-image-url').value = image.url;
        document.getElementById('edit-image-name').value = image.name;
        showModal(document.getElementById('edit-image-modal'));
    }
}

async function saveEditedImage() {
    if (!currentUserId) {
        showAlertModal("Uložení selhalo", "Pro úpravu obrázku se musíte přihlásit.");
        return;
    }

    const url = document.getElementById('edit-image-url').value.trim();
    const name = document.getElementById('edit-image-name').value.trim();

    if (!isValidHttpUrl(url)) {
        showAlertModal("Neplatná URL", "Zadejte platnou URL adresu obrázku (http:// nebo https://).");
        return;
    }

    showLoading("Ukládám upravený obrázek...");
    try {
        const index = galleryImagesData.findIndex(img => img.id === editingImageId);
        if (index !== -1 && galleryImagesData[index].userId === currentUserId) {
            galleryImagesData[index].url = url;
            galleryImagesData[index].name = name;
            await saveDataToFirestore();
            showAlertModal("Obrázek upraven", `Obrázek "${name}" byl úspěšně upraven v cloudu.`);

            // OPRAVA: Po úpravě aktualizuj zobrazení
            updateGalleryDisplay();
        } else {
            showAlertModal("Chyba", "Obrázek k úpravě nebyl nalezen nebo nemáte oprávnění.");
        }
        hideModal(document.getElementById('edit-image-modal'));
        hideLoading();
    } catch (error) {
        console.error('Chyba při ukládání upraveného obrázku do Firestore:', error);
        showAlertModal("Chyba ukládání", `Nepodařilo se uložit úpravy obrázku: ${error.message}`);
        hideLoading();
    }
}
//tady končí obrázek
