// --- Externí odkazy (ukládá do Firestore) ---
function renderExternalLinks() {
    const tableBody = document.querySelector('#links-table tbody');
    if (!tableBody) {
        console.error("Table body for links not found!");
        return;
    }
    tableBody.innerHTML = '';

    if (externalLinksData.length === 0) {
        const row = tableBody.insertRow();
        const cell = row.insertCell();
        cell.colSpan = 4;
        cell.textContent = 'Žádné odkazy.';
        cell.style.textAlign = 'center';
        return;
    }

    externalLinksData.forEach((link, index) => {
        const row = tableBody.insertRow();
        const isOwner = currentUserId && link.userId === currentUserId;

        row.insertCell().innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`;

        const titleCell = row.insertCell();
        const anchor = document.createElement('a');
        anchor.href = link.url;
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
        anchor.textContent = link.title;
        titleCell.appendChild(anchor);

        row.insertCell().textContent = link.url;

        const actionsCell = row.insertCell();
        actionsCell.className = 'edit-mode-only';
        actionsCell.innerHTML = `
            <button class="button btn-secondary edit-link-btn ${isOwner ? '' : 'hidden'}" data-index="${index}">Editovat</button>
            <button class="button btn-danger delete-link-btn ${isOwner ? '' : 'hidden'}" data-index="${index}">Smazat</button>
        `;
        actionsCell.querySelector('.edit-link-btn')?.addEventListener('click', () => editLink(link.id));
        actionsCell.querySelector('.delete-link-btn')?.addEventListener('click', () => deleteLinkFromFirestore(link.id));
    });
}

document.getElementById('add-link-btn')?.addEventListener('click', addLink);

function addLink() {
    if (!currentUserId) {
        showAlertModal("Přístup zamítnut", "Pro přidání odkazu se musíte přihlásit.");
        return;
    }
    editingLinkFirebaseId = null;
    document.getElementById('edit-link-title').value = '';
    document.getElementById('edit-link-url').value = '';
    showModal(document.getElementById('edit-link-modal'));
}

let editingLinkFirebaseId = null;
async function editLink(linkId) {
    if (!currentUserId) {
        showAlertModal("Přístup zamítnut", "Pro úpravu odkazu se musíte přihlásit.");
        return;
    }
    editingLinkFirebaseId = linkId;
    const link = externalLinksData.find(l => l.id === linkId);
    if (!link || link.userId !== currentUserId) {
        showAlertModal("Přístup zamítnut", "Nemáte oprávnění upravit tento odkaz. Můžete upravit pouze své vlastní odkazy.");
        return;
    }
    if (link) {
        document.getElementById('edit-link-title').value = link.title;
        document.getElementById('edit-link-url').value = link.url;
        showModal(document.getElementById('edit-link-modal'));
    }
}

async function saveEditedLink() {
        if (!currentUserId) {
            showAlertModal("Uložení selhalo", "Pro úpravu odkazu se musíte přihlásit.");
            return;
        }
        const title = document.getElementById('edit-link-title').value.trim();
        const url = document.getElementById('edit-link-url').value.trim();

        if (!title || !url || !isValidHttpUrl(url)) {
            showAlertModal("Chybějící/neplatné údaje", "Zadejte platný název a URL (http:// nebo https://) pro odkaz.");
            return;
        }

        showLoading("Ukládám odkaz...");
        try {
            if (editingLinkFirebaseId === null) {
                const newLink = {
                    id: `link-${Date.now()}-${Math.random().toString(36).substr(2,5)}`,
                    title, url,
                    createdAt: Date.now(), // ZMĚNA ZDE: Používáme Date.now() pro časový otisk na straně klienta
                    userId: currentUserId
                };
                externalLinksData.push(newLink);
                showAlertModal("Odkaz přidán", `Odkaz "${title}" byl přidán do cloudu.`);
            } else {
                const index = externalLinksData.findIndex(l => l.id === editingLinkFirebaseId);
                if (index !== -1 && externalLinksData[index].userId === currentUserId) {
                    externalLinksData[index].title = title;
                    externalLinksData[index].url = url;
                    showAlertModal("Odkaz upraven", `Odkaz "${title}" byl upraven v cloudu.`);
                } else {
                    showAlertModal("Chyba", "Odkaz k úpravě nebyl nalezen nebo nemáte oprávnění.");
                }
            }
            await saveDataToFirestore();
            hideModal(document.getElementById('edit-link-modal'));
            hideLoading();
        } catch (error) {
            console.error('Chyba při ukládání odkazu do Firestore:', error);
            showAlertModal("Chyba ukládání", `Nepodařilo se uložit odkaz: ${error.message}`);
            hideLoading();
        }
    }

async function deleteLinkFromFirestore(idToDelete) {
    if (!currentUserId) {
        showAlertModal("Přístup zamítnut", "Pro smazání odkazu se musíte přihlásit.");
        return;
    }
    const linkToDelete = externalLinksData.find(l => l.id === idToDelete);
    if (!linkToDelete || linkToDelete.userId !== currentUserId) {
        showAlertModal("Přístup zamítnut", "Nemáte oprávnění smazat tento odkaz. Můžete smazat pouze své vlastní odkazy.");
        return;
    }
    const confirmed = await (window.showConfirmModal ?
        showConfirmModal("Smazat odkaz?", `Opravdu smazat odkaz "${linkToDelete.title}"? Tato akce je nevratná!`) :
        confirm(`Smazat odkaz "${linkToDelete.title}"?`)
    );
    if (confirmed) {
        showLoading("Mažu odkaz...");
        try {
            externalLinksData = externalLinksData.filter(link => link.id !== idToDelete);
            await saveDataToFirestore();
            showAlertModal("Odkaz smazán", "Odkaz byl úspěšně smazán z cloudu.");
            hideLoading();
        } catch (error) {
            console.error('Chyba při mazání odkazu z Firestore:', error);
            showAlertModal("Chyba mazání", `Nepodařilo se smazat odkaz: ${error.message}`);
            hideLoading();
        }
    }
}