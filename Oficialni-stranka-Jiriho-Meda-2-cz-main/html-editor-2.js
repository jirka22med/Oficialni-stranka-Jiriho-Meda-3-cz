// --- HTML Editor (ukládá do Firestore) ---
function setupHtmlEditor() {
    const editor = document.getElementById('html-editor');
    const preview = document.getElementById('html-preview');
    const saveBtn = document.getElementById('save-code-btn');

    if (!editor || !preview || !saveBtn) {
        console.error("HTML editor elementy nebyly nalezeny!");
        return;
    }

    editor.addEventListener('input', () => { preview.srcdoc = editor.value; });
    preview.srcdoc = editor.value;

    saveBtn.addEventListener('click', () => {
        if (!currentUserId) {
            showAlertModal("Přístup zamítnut", "Pro uložení kódu se musíte přihlásit.");
            return;
        }
        if (!editor.value.trim()) {
            showAlertModal("Prázdný kód", "Nelze uložit prázdný HTML kód.");
            return;
        }
        const saveModal = document.getElementById('save-code-modal');
        if(saveModal) showModal(saveModal);
        document.getElementById('code-title-input')?.focus();
    });
}

async function saveHtmlCodeToFirestore(title, code) {
    if (!currentUserId) {
        //showAlertModal("Uložení selhalo", "Pro uložení kódu se musíte přihlásit.");
        return;
    }
    showLoading("Ukládám HTML kód...");
    const newCode = {
        id: `html-code-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        title,
        code,
        createdAt: Date.now(),
        userId: currentUserId
    };
    try {
        savedCodesData.unshift(newCode); // Přidá na začátek
        await saveDataToFirestore(); // Uloží celý savedCodesData pole
        showAlertModal("Kód uložen", `Kód "${title}" byl úspěšně uložen do cloudu.`);
        hideLoading();
    } catch (error) {
        console.error('Chyba při ukládání kódu do Firestore:', error);
        showAlertModal("Chyba ukládání", `Nepodařilo se uložit kód: ${error.message}`);
        hideLoading();
    }
}

async function deleteHtmlCodeFromFirestore(idToDelete) {
    if (!currentUserId) {
        showAlertModal("Přístup zamítnut", "Pro smazání kódu se musíte přihlásit.");
        return;
    }
    const codeToDelete = savedCodesData.find(code => code.id === idToDelete);
    if (!codeToDelete || codeToDelete.userId !== currentUserId) {
        showAlertModal("Přístup zamítnut", "Nemáte oprávnění smazat tento kód. Můžete smazat pouze své vlastní kódy.");
        return;
    }

    const confirmed = await (window.showConfirmModal ?
        showConfirmModal("Smazat kód?", `Opravdu chcete smazat kód "${codeToDelete.title}"? Tato akce je nevratná!`) :
        confirm(`Smazat kód "${codeToDelete.title}"?`)
    );
    if (confirmed) {
        showLoading("Mažu HTML kód...");
        try {
            savedCodesData = savedCodesData.filter(code => code.id !== idToDelete);
            await saveDataToFirestore(); // Uloží aktualizované savedCodesData pole
            showAlertModal("Kód smazán", "Kód byl úspěšně smazán z cloudu.");
            hideLoading();
        } catch (error) {
            console.error('Chyba při mazání kódu z Firestore:', error);
            showAlertModal("Chyba mazání", `Nepodařilo se smazat kód: ${error.message}`);
            hideLoading();
        }
    }
}

