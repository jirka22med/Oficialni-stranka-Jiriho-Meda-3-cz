//nově jsem testoval zda se obraky zachovají v galerii [ updateGalleryDisplay(); ] 
// --- Funkce pro přepínání editačního módu ---
function toggleEditMode() {
    if (!currentUserId) {
        showAlertModal("Přístup zamítnut", "Pro úpravy stránky se musíte přihlásit.");
        showAuthModal();
        return;
    }

    if (isEditMode) {
        disableEditMode();
        
          saveDataToFirestore(); // Už se nevolá zde, ukládání je automatické přes listenery nebo specifické funkce
       console.log("%c🔄 Volám funkci updateGalleryDisplay()...", "color: #ff9900; font-weight: bold;");
         updateGalleryDisplay();
       console.log("%c✅ Funkce updateGalleryDisplay() dokončena.", "color: #ff00ff; font-weight: bold;");
       // showAlertModal("Editace ukončena", "Režim úprav byl vypnut. Změny byly uloženy.");
    } else {
        enableEditMode();
        //showAlertModal("Režim úprav", "Jste v režimu úprav. Klikněte na text pro úpravu, nebo použijte ikony pro obrázky/odkazy. Změny se ukládají automaticky, ale můžete také použít 'Uložit vše do cloudu'.");
    }
}

function enableEditMode() {
    isEditMode = true;
    document.body.classList.add('edit-mode');
    document.getElementById('login-button').classList.add('hidden');
    document.getElementById('edit-mode-toggle-btn').textContent = '💾';
    document.getElementById('edit-mode-toggle-btn').classList.remove('hidden');

    document.querySelectorAll('[data-editable]').forEach(el => {
        el.setAttribute('contenteditable', 'true');
    });

    document.querySelectorAll('.editable-image-wrapper .edit-icon').forEach(icon => {
        icon.classList.remove('hidden');
    });
    document.querySelectorAll('.editable-link .edit-icon').forEach(icon => {
        icon.classList.remove('hidden');
    });

    // Zobrazíme editovací prvky pro portfolio
    document.querySelectorAll('.portfolio-item .edit-controls').forEach(controls => {
        const itemId = controls.closest('.portfolio-item').dataset.itemId;
        const item = portfolioItemsData.find(p => p.id === itemId);
        const isOwner = currentUserId && item && item.userId === currentUserId;
        if (isOwner) { // Zobrazit jen pokud je uživatel vlastníkem
            controls.classList.remove('hidden');
        }
    });

    document.getElementById('add-portfolio-item-btn').classList.remove('hidden');
    document.getElementById('add-link-btn').classList.remove('hidden');
    document.getElementById('data-management').classList.remove('hidden');

    document.querySelectorAll('.link-edit-controls').forEach(controls => {
        controls.classList.remove('hidden');
    });

    document.querySelectorAll('#links-table .edit-mode-only').forEach(el => {
        el.style.display = 'table-cell';
    });

    localStorage.setItem(EDIT_MODE_KEY, 'true');
}

function disableEditMode() {
    isEditMode = false;
    document.body.classList.remove('edit-mode');
    document.getElementById('edit-mode-toggle-btn').textContent = '🔐';

    if (!currentUserId) {
        document.getElementById('login-button').classList.remove('hidden');
        document.getElementById('edit-mode-toggle-btn').classList.add('hidden');
    }

    document.querySelectorAll('[contenteditable="true"]').forEach(el => {
        el.removeAttribute('contenteditable');
        const id = el.dataset.editable;
        // Uložíme jen obecné editovatelné texty, ne portfolio
        if (id && !id.startsWith('portfolio-item-')) {
            if (el.tagName === 'A' && el.classList.contains('editable-link')) {
                editableContentData[id] = { url: el.href, text: el.childNodes[0] ? el.childNodes[0].nodeValue.trim() : '' };
            } else {
                editableContentData[id] = el.innerHTML;
            }
        }
    });
    console.log('disableEditMode - galleryImagesData před uložením:', galleryImagesData);
    // Voláme saveDataToFirestore() pro uložení obecných textů
   // saveDataToFirestore();

    document.querySelectorAll('.editable-image-wrapper .edit-icon').forEach(icon => {
        icon.classList.add('hidden');
    });
    document.querySelectorAll('.editable-link .edit-icon').forEach(icon => {
        icon.classList.add('hidden');
    });

    // Skryjeme editovací prvky pro portfolio
    document.querySelectorAll('.portfolio-item .edit-controls').forEach(controls => {
        controls.classList.add('hidden');
    });

    document.getElementById('add-portfolio-item-btn').classList.add('hidden');
    document.getElementById('add-link-btn').classList.add('hidden');
    document.getElementById('data-management').classList.add('hidden');

    document.querySelectorAll('.link-edit-controls').forEach(controls => {
        controls.classList.add('hidden');
    });

    document.querySelectorAll('#links-table .edit-mode-only').forEach(el => {
        el.style.display = 'none';
    });

    localStorage.removeItem(EDIT_MODE_KEY);
}