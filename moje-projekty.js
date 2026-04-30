// Vyčištění náhledu při zavření modalu (již integrováno v initializeAllEventListeners pro cancel-edit-portfolio-btn)

// --- Dynamický vkladač pro obrázky ---
document.addEventListener('DOMContentLoaded', function() {
    const projectImagesData = {
        'zly-obrazek-1': {
            src: 'https://img40.rajce.idnes.cz/d4003/19/19517/19517492_984d6887838eae80a8eb677199393188/images/Moderni-foto-editor.jpg?ver=1',
            desktop: {
                width: '450px',
                height: '250px',
                objectFit: 'cover',
                borderRadius: '12px',
                border: '5px solid black'
            },
            mobile: {
                width: '100%',
                height: 'auto',
                objectFit: 'contain',
                borderRadius: '6px',
                border: '1px solid black'
            }
        },
        'zly-obrazek-2': {
            src: 'https://img40.rajce.idnes.cz/d4003/19/19517/19517492_984d6887838eae80a8eb677199393188/images/Star-Trek-Hudebni-Prehravac.jpg?ver=2',
            desktop: {
                width: '450px',
                height: '250px',
                objectFit: 'cover',
                borderRadius: '12px',
                border: '5px solid #00ffff'
            },
            mobile: {
                width: '100%',
                height: 'auto',
                objectFit: 'contain',
                borderRadius: '6px',
                border: '1px solid #00ffff'
            }
        },
        'zly-obrazek-3': {
            src: 'https://img40.rajce.idnes.cz/d4003/19/19517/19517492_984d6887838eae80a8eb677199393188/images/pokrocili-vahovy-tracker.jpg?ver=3',
            desktop: {
                width: '450px',
                height: '250px',
                objectFit: 'cover',
                borderRadius: '12px',
                border: '5px solid #a0a0a0'
            },
            mobile: {
                width: '100%',
                height: 'auto',
                objectFit: 'contain',
                borderRadius: '6px',
                border: '1px solid #a0a0a0'
            }
        },
        'zly-obrazek-4': {
            src: 'https://img40.rajce.idnes.cz/d4003/19/19517/19517492_984d6887838eae80a8eb677199393188/images/mapy-html-kodu.jpg?ver=0',
            desktop: {
                width: '450px',
                height: '250px',
                objectFit: 'cover',
                borderRadius: '12px',
                border: '5px solid #5cb85c'
            },
            mobile: {
                width: '100%',
                height: 'auto',
                objectFit: 'contain',
                borderRadius: '6px',
                border: '1px solid #5cb85c'
            }
        },
        'zly-obrazek-5': {
            src: 'https://img41.rajce.idnes.cz/d4102/19/19244/19244630_db82ad174937335b1a151341387b7af2/images/Tutorial.jpg?ver=0',
            desktop: {
                width: '450px',
                height: '250px',
                objectFit: 'cover',
                borderRadius: '12px',
                border: '5px solid #FF00FF'
            },
            mobile: {
                width: '100%',
                height: 'auto',
                objectFit: 'contain',
                borderRadius: '6px',
                border: '1px solid #5cb85c'
            }
        }
    };

    const mobileMediaQuery = window.matchMedia('(max-width: 768px)');

    function applyImageStyles(imgElement, imgData) {
        let stylesToApply;
        if (mobileMediaQuery.matches) {
            stylesToApply = imgData.mobile;
        } else {
            stylesToApply = imgData.desktop;
        }

        imgElement.style.width = stylesToApply.width;
        imgElement.style.height = stylesToApply.height;
        imgElement.style.objectFit = stylesToApply.objectFit;
        imgElement.style.borderRadius = stylesToApply.borderRadius;
        imgElement.style.border = stylesToApply.border;
    }

    function loadAndStyleProjectImages() {
        for (const id in projectImagesData) {
            const imgElement = document.getElementById(id);
            if (imgElement) {
                const imgData = projectImagesData[id];
                imgElement.src = imgData.src;
                applyImageStyles(imgElement, imgData);
            }
        }
    }

    loadAndStyleProjectImages();

    mobileMediaQuery.addEventListener('change', function() {
        console.log("Změna velikosti okna, aktualizuji styly obrázků.");
        for (const id in projectImagesData) {
            const imgElement = document.getElementById(id);
            if (imgElement) {
                applyImageStyles(imgElement, projectImagesData[id]);
            }
        }
    });
});

//funkce pro celoobrazovy rezim

document.addEventListener('DOMContentLoaded', () => {
    const navContainerDiv = document.querySelector('.nav-container');

    if (navContainerDiv) {
        const fullscreenButton = document.createElement('button');
        fullscreenButton.id = 'jirka-rezim-obrazovky';
        fullscreenButton.textContent = '⛶'; // Ikonka zůstává

        


        fullscreenButton.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(err => {
                    console.error(`Chyba při pokusu o fullscreen: ${err.message}`);
                });
            } else {
                document.exitFullscreen();
            }
        });

        navContainerDiv.appendChild(fullscreenButton);
    }
});



// Vylepšený Responsive Grid JavaScript
// Tento kód vytvoří grid layout s pokročilým responsivním chováním

function initializeResponsiveGrid() {
    // Najdeme kontejner s projekty
    const projectContainer = document.getElementById('cloude-projek-test');
    
    if (!projectContainer) {
        console.error('Kontejner #cloude-projek-test nebyl nalezen');
        return;
    }

    // Přidáme CSS styly pro grid
    const style = document.createElement('style');
    style.textContent = `
        /* Base grid layout */
        #cloude-projek-test {
            display: grid;
            gap: 20px;
            padding: 20px;
            width: 100%;
            box-sizing: border-box;
            transition: all 0.3s ease;
        }

        /* Zajistíme, že h2 a p jsou na plnou šířku */
        #cloude-projek-test h2,
        #cloude-projek-test > p {
            grid-column: 1 / -1;
            margin: 0 0 15px 0;
        }

        /* Styly pro jednotlivé sekce */
        .jirkova-sekce-1,
        .jirkova-sekce-2,
        .jirkova-sekce-3,
        .jirkova-sekce-4,
        .jirkova-sekce-5 {
            display: flex;
            flex-direction: column;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 8px;
            background-color: #f9f9f9;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            min-height: 200px;
            box-sizing: border-box;
            width: 100%;
        }

         

        /* Desktop layout - 4 a více sloupců pro velmi široké obrazovky */
        @media screen and (min-width: 1400px) {
            #cloude-projek-test {
                grid-template-columns: repeat(2, 1fr);
                gap: 25px;
                padding: 25px;
            }
        }

        /* Desktop layout - 3 sloupce pro široké obrazovky */
        @media screen and (min-width: 1200px) and (max-width: 1399px) {
            #cloude-projek-test {
                grid-template-columns: repeat(2, 1fr);
                gap: 20px;
                padding: 20px;
            }
        }

        /* Desktop layout - 2 sloupce pro střední obrazovky */
        @media screen and (min-width: 900px) and (max-width: 1199px) {
            #cloude-projek-test {
                grid-template-columns: repeat(2, 1fr);
                gap: 20px;
                padding: 20px;
            }
        }

        /* Tablet landscape - 2 sloupce pro tablety na šířku */
        @media screen and (min-width: 769px) and (max-width: 899px) {
            #cloude-projek-test {
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
                padding: 15px;
            }
            
            .jirkova-sekce-1,
            .jirkova-sekce-2,
            .jirkova-sekce-3,
            .jirkova-sekce-4,
            .jirkova-sekce-5 {
                padding: 12px;
                min-height: 180px;
            }
        }

        /* Tablet portrait a mobil landscape - 1 sloupec */
        @media screen and (max-width: 768px) {
            #cloude-projek-test {
                grid-template-columns: 1fr;
                gap: 15px;
                padding: 15px;
            }
            
            .jirkova-sekce-1,
            .jirkova-sekce-2,
            .jirkova-sekce-3,
            .jirkova-sekce-4,
            .jirkova-sekce-5 {
                padding: 12px;
                min-height: 160px;
            }
        }

        /* Malé mobily - optimalizace pro velmi malé obrazovky */
        @media screen and (max-width: 480px) {
            #cloude-projek-test {
                grid-template-columns: 1fr;
                gap: 12px;
                padding: 10px;
            }
            
            .jirkova-sekce-1,
            .jirkova-sekce-2,
            .jirkova-sekce-3,
            .jirkova-sekce-4,
            .jirkova-sekce-5 {
                padding: 10px;
                min-height: 140px;
            }
            
            .button {
                padding: 8px 12px;
                font-size: 14px;
            }
        }

        /* Velmi malé mobily */
        @media screen and (max-width: 360px) {
            #cloude-projek-test {
                gap: 10px;
                padding: 8px;
            }
            
            .jirkova-sekce-1,
            .jirkova-sekce-2,
            .jirkova-sekce-3,
            .jirkova-sekce-4,
            .jirkova-sekce-5 {
                padding: 8px;
                min-height: 120px;
            }
        }

        /* Speciální pravidla pro orientaci zařízení */
        @media screen and (orientation: landscape) and (max-height: 500px) {
            .jirkova-sekce-1,
            .jirkova-sekce-2,
            .jirkova-sekce-3,
            .jirkova-sekce-4,
            .jirkova-sekce-5 {
                min-height: 120px;
            }
        }

        /* Skrytí user-id-display */
        #user-id-display {
             
            grid-column: 1 / -1;
            margin-top: 20px;
        }
    `;
    
    // Přidáme styly do head
    document.head.appendChild(style);

    // Pokročilá funkce pro sledování změn velikosti okna a orientace
    function handleResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const orientation = width > height ? 'landscape' : 'portrait';
        const gridContainer = document.getElementById('cloude-projek-test');
        
        if (!gridContainer) return;

        // Určíme počet sloupců na základě šířky a orientace
        let columns;
        let layoutType;

        if (width >= 1400) {
            columns = 2;
            layoutType = 'extra-wide-desktop';
        } else if (width >= 1200) {
            columns = 2;
            layoutType = 'wide-desktop';
        } else if (width >= 900) {
            columns = 2;
            layoutType = 'desktop';
        } else if (width >= 769) {
            columns = 2;
            layoutType = 'tablet-landscape';
        } else if (width >= 481) {
            columns = 1;
            layoutType = 'tablet-portrait';
        } else if (width >= 361) {
            columns = 1;
            layoutType = 'mobile';
        } else {
            columns = 1;
            layoutType = 'small-mobile';
        }

        // Speciální úprava pro landscape orientaci na malých zařízeních
        if (orientation === 'landscape' && height < 500) {
            if (width >= 800) {
                columns = 2;
                layoutType = 'mobile-landscape-wide';
            } else {
                columns = 1;
                layoutType = 'mobile-landscape';
            }
        }

        // Aplikujeme změny
        gridContainer.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        
        // Přidáme CSS třídu pro další styling
        gridContainer.className = `grid-layout-${layoutType}`;
        
        // Debug info
        console.log(`Layout změněn na: ${layoutType}`);
        console.log(`Rozměry: ${width}x${height}, Orientace: ${orientation}, Sloupce: ${columns}`);
    }

    // Funkce pro debouncing - zpoždění spuštění funkce
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Vytvoříme debounced verzi handleResize
    const debouncedResize = debounce(handleResize, 150);

    // Přidáme event listenery
    window.addEventListener('resize', debouncedResize);
    window.addEventListener('orientationchange', () => {
        // Malé zpoždění pro orientationchange kvůli pomalému updatu rozměrů
        setTimeout(handleResize, 100);
    });
    
    // Spustíme při načtení
    handleResize();
    
    console.log('Vylepšený responsivní grid byl úspěšně inicializován!');
    console.log('Podporované breakpointy:');
    console.log('- Velmi malé mobily: 0-360px');
    console.log('- Mobily: 361-480px');
    console.log('- Tablet portrait: 481-768px');
    console.log('- Tablet landscape: 769-899px');
    console.log('- Desktop: 900-1199px');
    console.log('- Široký desktop: 1200-1399px');
    console.log('- Extra široký desktop: 1400px+');
}

// Spustíme když je DOM načten
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeResponsiveGrid);
} else {
    initializeResponsiveGrid();
}
