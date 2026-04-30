function renderSavedCodesDisplay() {
    const listEl = document.getElementById('saved-codes-list');
    if(!listEl) return;
    listEl.innerHTML = savedCodesData.length === 0 ? '<p>Žádné kódy nejsou aktuálně uloženy.</p>' : '';

    savedCodesData.forEach(item => {
        const div = document.createElement('div');
        div.className = 'saved-code-item';
        const isOwner = currentUserId && item.userId === currentUserId;

        div.innerHTML = `
            <div class="item-header">
                <h3>${item.title}</h3>
                <div class="actions">
                    <button class="button btn-secondary load-code">Načíst</button>
                    <button class="button btn-danger delete-code ${isEditMode && isOwner ? '' : 'hidden'}">Smazat</button>
                </div>
            </div>
            <p>Uloženo: ${formatTimestamp(item.createdAt)}</p>
        `;
        div.querySelector('.load-code').addEventListener('click', (e) => {
            e.stopPropagation();
            document.getElementById('html-editor').value = item.code;
            document.getElementById('html-preview').srcdoc = item.code;
            showSection('editor');
            document.querySelector('.nav-container a.nav-link[data-section="editor"]')?.click();
        });
        div.querySelector('.delete-code')?.addEventListener('click', async (e) => {
            e.stopPropagation();
            deleteHtmlCodeFromFirestore(item.id);
        });
        div.addEventListener('click', () => {
            document.getElementById('html-editor').value = item.code;
            document.getElementById('html-preview').srcdoc = item.code;
            showSection('editor');
            document.querySelector('.nav-container a.nav-link[data-section="editor"]')?.click();
        });
        listEl.appendChild(div);
    });
}