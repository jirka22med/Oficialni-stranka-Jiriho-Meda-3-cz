// --- Modální okna ---
function showModal(modalElement) {
    if(modalElement) modalElement.classList.add('visible');
}
function hideModal(modalElement) {
    if(modalElement) modalElement.classList.remove('visible');
}

const saveCodeModalEl = document.getElementById('save-code-modal');
const codeTitleInputEl = document.getElementById('code-title-input');
const confirmSaveCodeBtnEl = document.getElementById('confirm-save-code-btn');
const cancelSaveCodeBtnEl = document.getElementById('cancel-save-code-btn');

if(confirmSaveCodeBtnEl && codeTitleInputEl) {
    confirmSaveCodeBtnEl.addEventListener('click', () => {
        const title = codeTitleInputEl.value.trim();
        const editor = document.getElementById('html-editor');
        const code = editor ? editor.value : '';
        if (title && code) {
            saveHtmlCodeToFirestore(title, code);
            if(saveCodeModalEl) hideModal(saveCodeModalEl);
            codeTitleInputEl.value = '';
        } else {
            showAlertModal("Chybějící údaje", "Zadejte název a ujistěte se, že kód není prázdný.");
        }
    });
}
if(cancelSaveCodeBtnEl) cancelSaveCodeBtnEl.addEventListener('click', () => {
    if(saveCodeModalEl) hideModal(saveCodeModalEl);
    if(codeTitleInputEl) codeTitleInputEl.value = '';
});

if (!window.showAlertModal) {
    window.showAlertModal = (title, message) => {
        console.warn("Custom showAlertModal not fully initialized, using native alert.");
        return new Promise((resolve) => {
            alert(`${title}\n\n${message}`);
            resolve(true);
        });
    };
}
if (!window.showConfirmModal) {
    window.showConfirmModal = (title, message, buttonTexts = {}) => {
        console.warn("Custom showConfirmModal not fully initialized, using native confirm.");
        return new Promise((resolve) => {
            resolve(confirm(`${title}\n\n${message}`));
        });
    };
}

const alertModalEl = document.getElementById('alert-modal');
const alertModalTitleEl = document.getElementById('alert-modal-title');
const alertModalMessageEl = document.getElementById('alert-modal-message');
let alertModalOkBtnEl = document.getElementById('alert-modal-ok-btn');

if(alertModalEl && alertModalTitleEl && alertModalMessageEl && alertModalOkBtnEl) {
    window.showAlertModal = (title, message) => {
        return new Promise((resolve) => {
            alertModalTitleEl.textContent = title;
            alertModalMessageEl.textContent = message;

            const newOkBtn = alertModalOkBtnEl.cloneNode(true);
            alertModalOkBtnEl.parentNode.replaceChild(newOkBtn, alertModalOkBtnEl);
            alertModalOkBtnEl = newOkBtn;

            alertModalOkBtnEl.onclick = () => {
                hideModal(alertModalEl);
                resolve(true);
            };
            showModal(alertModalEl);
        });
    };
}

const confirmModalEl = document.getElementById('confirm-modal');
const confirmModalTitleEl = document.getElementById('confirm-modal-title');
const confirmModalMessageEl = document.getElementById('confirm-modal-message');
let confirmModalOkBtnEl = document.getElementById('confirm-modal-ok-btn');
let confirmModalCancelBtnEl = document.getElementById('confirm-modal-cancel-btn');

if(confirmModalEl && confirmModalTitleEl && confirmModalMessageEl && confirmModalOkBtnEl && confirmModalCancelBtnEl) {
    window.showConfirmModal = (title, message, buttonTexts = {}) => {
        return new Promise((resolve) => {
            confirmModalTitleEl.textContent = title;
            confirmModalMessageEl.textContent = message;

            const newOkBtn = confirmModalOkBtnEl.cloneNode(true);
            newOkBtn.textContent = buttonTexts.okText || 'Potvrdit';
            confirmModalOkBtnEl.parentNode.replaceChild(newOkBtn, confirmModalOkBtnEl);
            confirmModalOkBtnEl = newOkBtn;

            const newCancelBtn = confirmModalCancelBtnEl.cloneNode(true);
            newCancelBtn.textContent = buttonTexts.cancelText || 'Zrušit';
            confirmModalCancelBtnEl.parentNode.replaceChild(newCancelBtn, confirmModalCancelBtnEl);
            confirmModalCancelBtnEl = newCancelBtn;

            confirmModalOkBtnEl.onclick = () => {
                hideModal(confirmModalEl);
                resolve(true);
            };
            confirmModalCancelBtnEl.onclick = () => {
                hideModal(confirmModalEl);
                resolve(false);
            };
            showModal(confirmModalEl);
        });
    };
}

window.showSection = showSection;