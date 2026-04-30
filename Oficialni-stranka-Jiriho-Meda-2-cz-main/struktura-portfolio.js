// --- NOVÉ FUNKCE PRO EDITACI PORTFOLIA (ukládá do Firestore pod-kolekce) ---

// Zjednodušená addPortfolioItem pro novou strukturu
function addPortfolioItem() {
    if (!currentUserId) {
        showAlertModal("Přístup zamítnut", "Pro přidání položky se musíte přihlásit.");
        return;
    }
    editingPortfolioItemId = null; // Indikuje, že se přidává nová položka
    document.getElementById('edit-portfolio-title').value = '';
    document.getElementById('edit-portfolio-desc-1').value = '';
    document.getElementById('edit-portfolio-desc-2').value = '';
    document.getElementById('edit-portfolio-link-text').value = '';
    document.getElementById('edit-portfolio-link-url').value = '';
    document.getElementById('edit-portfolio-youtube').value = '';
    document.getElementById('youtube-preview-container').style.display = 'none';
    document.getElementById('youtube-preview').src = '';
    document.getElementById('delete-portfolio-btn').classList.add('hidden'); // Skryje tlačítko Smazat
    showModal(document.getElementById('edit-portfolio-modal'));
}

// Zjednodušená editPortfolioItem pro novou strukturu
async function editPortfolioItem(itemId) {
    if (!currentUserId) {
        showAlertModal("Přístup zamítnut", "Pro úpravu položky se musíte přihlásit.");
        return;
    }
    editingPortfolioItemId = itemId;
    const item = portfolioItemsData.find(p => p.id === itemId);

    if (!item) {
        showAlertModal("Chyba", "Položka portfolia k úpravě nebyla nalezena.");
        return;
    }
    if (item.userId !== currentUserId) {
        showAlertModal("Přístup zamítnut", "Nemáte oprávnění upravit tuto položku portfolia. Můžete upravit pouze své vlastní položky.");
        return;
    }

    document.getElementById('edit-portfolio-title').value = item.title || '';
    document.getElementById('edit-portfolio-desc-1').value = item.desc1 || '';
    document.getElementById('edit-portfolio-desc-2').value = item.desc2 || '';
    document.getElementById('edit-portfolio-link-text').value = item.linkText || '';
    document.getElementById('edit-portfolio-link-url').value = item.linkUrl || '';
    const youtubeInput = document.getElementById('edit-portfolio-youtube');
    youtubeInput.value = item.youtubeUrl || '';

    const event = new Event('input');
    youtubeInput.dispatchEvent(event);

    document.getElementById('delete-portfolio-btn').classList.remove('hidden'); // Zobrazí tlačítko Smazat
    showModal(document.getElementById('edit-portfolio-modal'));
}

// Úprava saveEditedPortfolioItem pro ukládání do pod-kolekce
async function saveEditedPortfolioItem() {
    if (!currentUserId) {
       // showAlertModal("Uložení selhalo", "Pro úpravu položky se musíte přihlásit.");
        return;
    }
    const title = document.getElementById('edit-portfolio-title').value.trim();
    const desc1 = document.getElementById('edit-portfolio-desc-1').value.trim();
    const desc2 = document.getElementById('edit-portfolio-desc-2').value.trim();
    const linkText = document.getElementById('edit-portfolio-link-text').value.trim();
    const linkUrl = document.getElementById('edit-portfolio-link-url').value.trim();
    const youtubeUrl = document.getElementById('edit-portfolio-youtube').value.trim();

    if (!title || !desc1) {
        showAlertModal("Chybějící údaje", "Vyplňte prosím název a první popis položky portfolia.");
        return;
    }
    if (linkUrl && !isValidHttpUrl(linkUrl)) {
        showAlertModal("Neplatná URL", "Zadejte platnou URL adresu pro odkaz (http:// nebo https://).");
        return;
    }

    showLoading("Ukládám položku portfolia...");
    try {
        const portfolioCollectionRef = db.collection('publicContent').doc(DOC_ID).collection('portfolioItems');
        let itemData = {
            title,
            desc1,
            desc2,
            linkText,
            linkUrl,
            youtubeUrl,
            userId: currentUserId,
            lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
        };

        if (editingPortfolioItemId) {
            // Úprava existující položky
            await portfolioCollectionRef.doc(editingPortfolioItemId).update(itemData);
            showAlertModal("Položka upravena", `Položka portfolia "${title}" byla upravena v cloudu.`);
        } else {
            // Přidání nové položky
            itemData.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            const newDocRef = await portfolioCollectionRef.add(itemData);
            // Aktualizujeme editingPortfolioItemId pro případné okamžité smazání po přidání
            editingPortfolioItemId = newDocRef.id;
            showAlertModal("Položka přidána", `Nová položka portfolia "${title}" byla přidána do cloudu.`);
        }

        hideModal(document.getElementById('edit-portfolio-modal'));
        hideLoading();
        // Po uložení/úpravě se data automaticky aktualizují přes realtime listener
        // renderPortfolioItems(); se zavolá z listeneru
        editingPortfolioItemId = null;
    } catch (error) {
        console.error('Chyba při ukládání položky portfolia do Firestore:', error);
        showAlertModal("Chyba ukládání", `Nepodařilo se uložit položku portfolia: ${error.message}`);
        hideLoading();
    }
}

// Úprava deletePortfolioItem pro mazání z pod-kolekce
async function deletePortfolioItem(itemIdToDelete) {
    if (!currentUserId) {
        showAlertModal("Přístup zamítnut", "Pro smazání položky se musíte přihlásit.");
        return;
    }
    if (!itemIdToDelete) { // Používáme přímo ID z argumentu, ne z editingPortfolioItemId
        showAlertModal("Chyba", "Nebylo zadáno ID položky k smazání.");
        return;
    }

    const itemToDelete = portfolioItemsData.find(p => p.id === itemIdToDelete);
    if (!itemToDelete || itemToDelete.userId !== currentUserId) {
        showAlertModal("Přístup zamítnut", "Nemáte oprávnění smazat tuto položku portfolia. Můžete smazat pouze své vlastní položky.");
        return;
    }

    hideModal(document.getElementById('edit-portfolio-modal'));
    const confirmed = await (window.showConfirmModal ?
        showConfirmModal("Smazat položku portfolia?", "Opravdu chcete smazat tuto položku z portfolia? Tato akce je nevratná! Smaže se i z cloudu pro všechny!", { okText: 'Ano, smazat', cancelText: 'Zrušit' }) :
        confirm("Opravdu chcete smazat tuto položku z portfolia? Tato akce je nevratná!")
    );

    if (confirmed) {
        showLoading("Mažu položku portfolia...");
        try {
            // Smažeme dokument přímo z pod-kolekce
            await db.collection('publicContent').doc(DOC_ID).collection('portfolioItems').doc(itemIdToDelete).delete();

            showAlertModal("Položka smazána", "Položka portfolia byla úspěšně smazána z cloudu.");
            hideLoading();
            // Data se automaticky aktualizují přes realtime listener, který zavolá renderPortfolioItems()
            editingPortfolioItemId = null; // Resetujeme
        } catch (error) {
            console.error('Chyba při mazání položky portfolia z Firestore:', error);
            showAlertModal("Chyba mazání", `Nepodařilo se smazat položku portfolia: ${error.message}`);
            hideLoading();
        }
    } else {
        showModal(document.getElementById('edit-portfolio-modal')); // Znovu otevřeme modal, pokud uživatel zrušil
    }
}