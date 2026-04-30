// --- Správa dat (nyní vše do/z Firestore) ---
 function setupDataManagement() {
    const dataManagementContainer = document.getElementById('data-management');
    if (dataManagementContainer) {
        document.getElementById('save-all-data-btn')?.addEventListener('click', saveDataToFirestore);
        document.getElementById('clear-all-data-btn')?.addEventListener('click', handleClearAllData);
        document.getElementById('export-data-btn')?.addEventListener('click', exportData);
        document.getElementById('import-data-btn')?.addEventListener('click', () => {
            document.getElementById('import-file-input')?.click();
        });
        document.getElementById('import-file-input')?.addEventListener('change', handleImportData);
    }
} 

 async function handleClearAllData() {
    if (!currentUserId) {
        showAlertModal("Přístup zamítnut", "Pro vymazání dat v cloudu se musíte přihlásit.");
        return;
    }
    const confirmed = await (window.showConfirmModal ?
        showConfirmModal("Vymazat všechna data v cloudu?", "Opravdu chcete vymazat všechna uložená data v cloudu? Tato akce je nevratná! Zahrnuje i texty upravené na stránce a smaže je PRO VŠECHNY!", { okText: 'Ano, vymazat', cancelText: 'Zrušit' }) :
        confirm("Opravdu chcete vymazat všechna uložená data v cloudu? Tato akce je nevratná!")
    );

    if (confirmed) {
        showLoading("Mažu data z cloudu...");
        try {
            // Smazání hlavního dokumentu
            await db.collection('publicContent').doc(DOC_ID).delete();

            // Smazání všech dokumentů v pod-kolekci portfolioItems
            const portfolioItemsSnapshot = await db.collection('publicContent').doc(DOC_ID).collection('portfolioItems').get();
            const deletePromises = portfolioItemsSnapshot.docs.map(doc => doc.ref.delete());
            await Promise.all(deletePromises);

            // Reset lokálních dat
             galleryImagesData = [...initialImageUrls];
            savedCodesData = [];
            externalLinksData = [...initialExternalLinksData];
            editableContentData = {};
            portfolioItemsData = []; // NOVÉ: Resetujeme i portfolio data

            applyEditableContent();
            updateGalleryDisplay();
            renderSavedCodesDisplay();
            renderExternalLinks();
            renderPortfolioItems(); // NOVÉ: Znovu vykreslíme prázdné portfolio

            hideLoading();
            showAlertModal("Data vymazána", "Všechna data byla úspěšně vymazána z Cloud Firestore. Stránka se vrátila k výchozímu obsahu.");
        } catch (error) {
            console.error('Chyba při mazání z Firestore:', error);
            hideLoading();
            showAlertModal("Chyba mazání", `Nepodařilo se vymazat data z cloudu: ${error.message}`);
        }
    }
}