function exportData() {
    // Ujistíme se, že editableContentData obsahuje aktuální stav obecných textů
    document.querySelectorAll('[data-editable]').forEach(el => {
        const id = el.dataset.editable;
        if (id && !id.startsWith('portfolio-item-')) { // Exportujeme jen obecné texty
            if (el.tagName === 'A' && el.classList.contains('editable-link')) {
                editableContentData[id] = { url: el.href, text: el.childNodes[0] ? el.childNodes[0].nodeValue.trim() : '' };
            } else {
                editableContentData[id] = el.innerHTML;
            }
        }
    });

    const exportObject = {
        galleryImages: galleryImagesData,
        savedCodes: savedCodesData,
        externalLinks: externalLinksData,
        editableContent: editableContentData, // Obecné texty
        portfolioItems: portfolioItemsData, // NOVÉ: Exportujeme i portfolio
        exportDate: new Date().toISOString(),
        version: "1.3" // Aktualizovaná verze pro novou strukturu
    };

    const dataStr = JSON.stringify(exportObject, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `portfolio-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showAlertModal("Export dokončen", "Data byla exportována do souboru JSON.");
}

function handleImportData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            const confirmed = await (window.showConfirmModal ?
                showConfirmModal("Importovat data?", "Importování přepíše všechna současná data (včetně textů na stránce) LOKÁLNĚ! Chcete pokračovat?", { okText: 'Ano, importovat', cancelText: 'Zrušit' }) :
                confirm("Importování přepíše data. Pokračovat?")
            );

            if (confirmed) {
                if (importedData.galleryImages) galleryImagesData = importedData.galleryImages;
                if (importedData.savedCodes) savedCodesData = importedData.savedCodes;
                if (importedData.externalLinks) externalLinksData = importedData.externalLinks;
                if (importedData.editableContent) editableContentData = importedData.editableContent;
                if (importedData.portfolioItems) portfolioItemsData = importedData.portfolioItems; // NOVÉ: Importujeme i portfolio

                if (currentUserId) {
                    // Uložíme hlavní data
                    await saveDataToFirestore();
                    // NOVÉ: Uložíme portfolio položky do Firestore
                    const portfolioCollectionRef = db.collection('publicContent').doc(DOC_ID).collection('portfolioItems');
                    // Nejprve smažeme stávající, pak přidáme nové
                    const existingPortfolioSnapshot = await portfolioCollectionRef.get();
                    const deletePromises = existingPortfolioSnapshot.docs.map(doc => doc.ref.delete());
                    await Promise.all(deletePromises);

                    // Přidáme naimportované portfolio položky
                    const addPromises = portfolioItemsData.map(item => {
                        const { id, ...data } = item; // Oddělíme ID, protože ho chceme použít jako ID dokumentu
                        return portfolioCollectionRef.doc(id).set(data);
                    });
                    await Promise.all(addPromises);

                } else {
                    showAlertModal("Upozornění", "Data byla importována pouze lokálně, protože nejste přihlášeni. Pro trvalé uložení se přihlaste a uložte je do cloudu.");
                }

                applyEditableContent();
                updateGalleryDisplay();
                renderSavedCodesDisplay();
                renderExternalLinks();
                renderPortfolioItems(); // NOVÉ: Znovu vykreslíme portfolio
                showAlertModal("Import dokončen", "Data byla úspěšně naimportována a aplikována.");
            }
        } catch (error) {
            console.error('Chyba při importu:', error);
            showAlertModal("Chyba importu", "Nepodařilo se načíst data ze souboru. Zkontrolujte, zda je soubor platný JSON.");
        }
    };
    reader.readAsText(file);
    event.target.value = '';
} 