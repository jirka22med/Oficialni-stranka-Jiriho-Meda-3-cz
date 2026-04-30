// --- Funkce pro ukládání ostatních dat do Firestore (mimo portfolia) ---
async function saveDataToFirestore() {
    if (!currentUserId) {
        //showAlertModal("Uložení selhalo", "Pro uložení dat se musíte přihlásit.");
        return false;
    }
    showLoading("Ukládám data do cloudu...");

    // Aktualizujeme editableContentData z DOM, ale jen pro obecné texty, ne portfolio
    document.querySelectorAll('[data-editable]').forEach(el => {
        const id = el.dataset.editable;
        // Kontrolujeme, zda ID nezačíná na 'portfolio-item-', abychom se vyhnuli staré struktuře
        if (id && !id.startsWith('portfolio-item-')) {
            if (el.tagName === 'A' && el.classList.contains('editable-link')) {
                editableContentData[id] = { url: el.href, text: el.childNodes[0] ? el.childNodes[0].nodeValue.trim() : '' };
            } else {
                editableContentData[id] = el.innerHTML;
            }
        }
    });

// NOVÝ KÓD: Ukládání URL dat ze stávajících portfolio položek
    document.querySelectorAll('#cloude-projek-test .portfolio-item').forEach(portfolioItem => {
        const itemId = portfolioItem.dataset.itemId;
        if (itemId) {
            // Najdeme odkaz v této portfolio položce
            const linkElement = portfolioItem.querySelector('a.editable-link');
            if (linkElement) {
                const linkTextSpan = linkElement.querySelector('[data-url-editable-text]');
                const linkText = linkTextSpan ? linkTextSpan.textContent.trim() : '';
                const linkUrl = linkElement.getAttribute('href') || '';
                
                // Uložíme do editableContentData
                editableContentData[`${itemId}-link-text`] = linkText;
                editableContentData[`${itemId}-link-url`] = linkUrl;
                
                console.log(`💾 Ukládám URL data pro ${itemId}:`, { linkText, linkUrl });
            }
        }
    });

    const dataToSave = {
        galleryImages: galleryImagesData,
        savedCodes: savedCodesData,
        externalLinks: externalLinksData,
        editableContent: editableContentData, // Toto jsou obecné texty
        editorUserId: currentUserId,
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp(),
         
    };

    try {
        await db.collection('publicContent').doc(DOC_ID).set(dataToSave, { merge: false }); // Použijeme merge: false pro přepsání
        hideLoading();
        //showAlertModal("Uloženo do cloudu", "Všechna data (mimo portfolia) byla úspěšně uložena do Cloud Firestore.");
        return true;
    } catch (error) {
        console.error('Chyba při ukládání ostatních dat do Firestore:', error);
        hideLoading();
        showAlertModal("Chyba ukládání", `Nepodařilo se uložit data do cloudu: ${error.message}`);
        return false;
    }
}

// --- Funkce pro načítání dat z Firestore (všichni vidí) ---
async function loadDataFromFirestore() {
    showLoading("Načítám data z cloudu...");
    try {
        const docRef = db.collection('publicContent').doc(DOC_ID);
        const doc = await docRef.get();

        if (doc.exists) {
            const data = doc.data();
            editableContentData = data.editableContent || {};
            galleryImagesData = data.galleryImages || [...initialImageUrls];
            savedCodesData = data.savedCodes || [];
            externalLinksData = data.externalLinks || [...initialExternalLinksData];

            // NOVÉ: Načítáme položky portfolia z pod-kolekce
            const portfolioCollectionRef = docRef.collection('portfolioItems');
            const portfolioSnapshot = await portfolioCollectionRef.get();
            portfolioItemsData = portfolioSnapshot.docs.map(doc => ({
                id: doc.id, // Ukládáme si ID dokumentu z Firestore
                ...doc.data()
            }));

            applyEditableContent(); // Aplikuje obecné editovatelné texty
            updateGalleryDisplay();
            renderSavedCodesDisplay();
            renderExternalLinks();
            renderPortfolioItems(); // NOVÉ: Zavoláme funkci pro renderování portfolia
        } else {
            console.log("Hlavní dokument v cloudu nenalezen, používám výchozí data.");
            editableContentData = {};
            portfolioItemsData = [];
            galleryImagesData = [...initialImageUrls];
            savedCodesData = [];
            externalLinksData = [...initialExternalLinksData];
        }
        hideLoading();
    } catch (error) {
        console.error('Chyba při načítání dat z Firestore:', error);
        hideLoading();
        showAlertModal("Chyba načítání", `Nepodařilo se načíst data z cloudu: ${error.message}`);
    }
}

// --- Listener pro aktualizace v reálném čase z Firestore ---
function setupFirestoreRealtimeListener() {
    // Listener pro hlavní dokument
    db.collection('publicContent').doc(DOC_ID)
        .onSnapshot((doc) => {
            if (doc.exists) {
                const data = doc.data();
                console.log("Realtime aktualizace hlavního dokumentu z Firestore:", data);
                galleryImagesData = data.galleryImages || [...initialImageUrls];
                savedCodesData = data.savedCodes || [];
                externalLinksData = data.externalLinks || [...initialExternalLinksData];
                editableContentData = data.editableContent || {}; // Obecné texty
                applyEditableContent();
                updateGalleryDisplay();
                renderSavedCodesDisplay();
                renderExternalLinks();
                hideLoading();
                console.log("Firestore Aktualizace: Obsah stránky byl automaticky aktualizován z cloudu.");
               console.log('Realtime update - galleryImagesData po aktualizaci:', doc.data().galleryImages);
            } else {
                console.log("Hlavní dokument v Firestore neexistuje, nebo byl smazán.");
                console.log('Realtime update - galleryImagesData po aktualizaci:', doc.data().galleryImages);  
                galleryImagesData = [...initialImageUrls];
                savedCodesData = [];
                externalLinksData = [...initialExternalLinksData];
                editableContentData = {};
                applyEditableContent();
                updateGalleryDisplay();
                renderSavedCodesDisplay();
                renderExternalLinks();
            }
        }, (error) => {
            console.error("Chyba při poslouchání realtime aktualizací hlavního dokumentu:", error);
            showAlertModal("Chyba synchronizace", `Nepodařilo se synchronizovat data v reálném čase: ${error.message}`);
        });

    // NOVÉ: Listener pro pod-kolekci portfolioItems
    db.collection('publicContent').doc(DOC_ID).collection('portfolioItems')
        .onSnapshot((snapshot) => {
            console.log("Realtime aktualizace portfolia z Firestore.");
            portfolioItemsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            renderPortfolioItems(); // Znovu vykreslí portfolio po změně
            hideLoading();
        }, (error) => {
            console.error("Chyba při poslouchání realtime aktualizací portfolia:", error);
            showAlertModal("Chyba synchronizace portfolia", `Nepodařilo se synchronizovat portfolio v reálném čase: ${error.message}`);
        });
}

// --- Funkce pro aplikaci editovatelného obsahu (obecné texty) ---
function applyEditableContent() {
    for (const id in editableContentData) {
        const element = document.querySelector(`[data-editable="${id}"]`);
        if (element) {
            // Zajišťujeme, že neaplikujeme na portfolio položky, ty se renderují zvlášť
            if (!id.startsWith('portfolio-item-')) {
                if (element.tagName === 'A' && element.classList.contains('editable-link')) {
                    element.href = editableContentData[id].url || '#';
                    element.innerHTML = `${editableContentData[id].text || ''}<i class="fas fa-edit edit-icon ${isEditMode ? '' : 'hidden'}"></i>`;
                } else {
                    element.innerHTML = editableContentData[id];
                }
            }
        }
    }

    // Aktualizace editovatelných elementů podle edit módu
    document.querySelectorAll('[data-editable]').forEach(el => {
        if (isEditMode) {
            el.setAttribute('contenteditable', 'true');
        } else {
            el.removeAttribute('contenteditable');
        }
    });
    document.querySelectorAll('.editable-image-wrapper .edit-icon').forEach(icon => {
        if (isEditMode) icon.classList.remove('hidden'); else icon.classList.add('hidden');
    });
    document.querySelectorAll('.editable-link .edit-icon').forEach(icon => {
        if (isEditMode) icon.classList.remove('hidden'); else icon.classList.add('hidden');
    });
}

 // NOVÝ KÓD: Aplikace URL dat na stávající portfolio položky
        document.querySelectorAll('#cloude-projek-test .portfolio-item').forEach(portfolioItem => {
            const itemId = portfolioItem.dataset.itemId;
            if (itemId) {
                // Načteme uložená URL data
                const savedLinkText = editableContentData[`${itemId}-link-text`];
                const savedLinkUrl = editableContentData[`${itemId}-link-url`];
                
                // Najdeme odkaz v této portfolio položce
                const linkElement = portfolioItem.querySelector('a.editable-link');
                if (linkElement && (savedLinkText || savedLinkUrl)) {
                    // Aktualizujeme URL
                    if (savedLinkUrl) {
                        linkElement.setAttribute('href', savedLinkUrl);
                    }
                    
                    // Aktualizujeme text odkazu
                    const linkTextSpan = linkElement.querySelector('[data-url-editable-text]');
                    if (linkTextSpan && savedLinkText) {
                        linkTextSpan.textContent = savedLinkText;
                    }
                    
                    console.log(`🔄 Aplikuji URL data pro ${itemId}:`, { 
                        text: savedLinkText, 
                        url: savedLinkUrl 
                    });
                }
            }
        });