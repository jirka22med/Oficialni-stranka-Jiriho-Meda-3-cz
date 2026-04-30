// --- Funkce pro inicializaci aplikace ---
async function initializeApp() {
        setupNavigation();
        setupHtmlEditor();
        setupGallery();
        setupDataManagement();
        
        await loadDataFromFirestore();
        setupFirestoreRealtimeListener();

        const currentYearEl = document.getElementById('currentYear');
        if (currentYearEl) currentYearEl.textContent = new Date().getFullYear();
        
        showSection(activeSection, true);
        console.log("Aplikace inicializována.");
    }