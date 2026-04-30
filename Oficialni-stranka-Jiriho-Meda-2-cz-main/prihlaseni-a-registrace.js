// --- Pomocní script pro heslo před přechodem k přihlášení a registrace ---
(function() {
    'use strict';

    const HARDCODED_ACCESS_PASSWORD_HASH = '256b5537a792c98a13c9b32bb6b6c90f0e63531fe77c3b4dee69ee1ca82c984b';

    const loginButton = document.getElementById('login-button');

    if (!loginButton) {
        console.warn("Gemini Helper: Tlačítko pro přihlášení (login-button) nebylo nalezeno. Pomocný script se nespustí.");
        return;
    }

    async function hashString(text) {
        const textEncoder = new TextEncoder();
        const data = textEncoder.encode(text);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hexHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hexHash;
    }

    function showCustomPromptModal(modalId, inputId, errorId = null) {
        return new Promise(resolve => {
            const modal = document.getElementById(modalId);
            const input = document.getElementById(inputId);
            const okBtn = modal.querySelector('#' + modalId + ' #local-password-ok-btn');
            const cancelBtn = modal.querySelector('#' + modalId + ' #local-password-cancel-btn');
            const errorEl = errorId ? document.getElementById(errorId) : null;

            if (!modal || !input || !okBtn || !cancelBtn) {
                console.error(`Chyba: Chybí HTML elementy pro vlastní prompt modal (${modalId}). Zkontrolujte ID.`);
                resolve(null);
                return;
            }

            input.value = '';
            if (errorEl) errorEl.textContent = '';

            const clearListeners = () => {
                okBtn.onclick = null;
                cancelBtn.onclick = null;
                input.removeEventListener('keydown', handleEnterKey);
            };

            const handleEnterKey = (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    okBtn.click();
                }
            };
            input.addEventListener('keydown', handleEnterKey);

            okBtn.onclick = () => {
                clearListeners();
                window.hideModal(modal);
                resolve(input.value);
            };
            cancelBtn.onclick = () => {
                clearListeners();
                window.hideModal(modal);
                resolve(null);
            };

            window.showModal(modal);
            input.focus();
        });
    }

    async function handleLocalAccessPasswordHashedCustomModal() {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session && session.user) {
            console.log("Gemini Helper: Uživatel je již přihlášen přes Supabase. Lokální hardcoded heslo přeskočeno.");
            window.showAuthModal();
            return;
        }

        const enteredPassword = await showCustomPromptModal(
            'local-password-modal',
            'local-password-input',
            'local-password-error'
        );

        if (enteredPassword === null) {
            console.log("Gemini Helper: Zadání hesla zrušeno uživatelem.");
            const errorEl = document.getElementById('local-password-error');
            if (errorEl) errorEl.textContent = '';
            return;
        }

        const enteredPasswordHash = await hashString(enteredPassword);

        if (enteredPasswordHash === HARDCODED_ACCESS_PASSWORD_HASH) {
            console.log("Gemini Helper: Lokální heslo (hash) správně, přístup povolen.");
            window.showAuthModal();
        } else {
            const errorEl = document.getElementById('local-password-error');
            if (errorEl) {
                errorEl.textContent = "Chybné heslo! Zkuste to znovu.";
                window.showModal(document.getElementById('local-password-modal'));
                document.getElementById('local-password-input').focus();
            } else {
                alert("Chybné heslo. Přístup zamítnut.");
            }
            console.log("Gemini Helper: Lokální heslo (hash) chybné, přístup zamítnut.");
        }
    }

    loginButton.onclick = handleLocalAccessPasswordHashedCustomModal;

})();

// logout_button_helper.js
(function() {
    'use strict';

    const logoutButton = document.getElementById('logout-button');

    if (!logoutButton) {
        console.warn("Logout Button Helper: Tlačítko s ID 'logout-button' nebylo nalezeno. Script se nespustí.");
        return;
    }

    if (typeof supabaseClient === 'undefined') {
        console.error("Logout Button Helper: supabaseClient není definován. Ujistěte se, že Supabase SDK je načteno a inicializováno před tímto scriptem.");
        logoutButton.classList.add('hidden');
        return;
    }

    supabaseClient.auth.onAuthStateChange((event, session) => {
        if (session && session.user) {
            logoutButton.classList.remove('hidden');
        } else {
            logoutButton.classList.add('hidden');
        }
    });

    supabaseClient.auth.getSession().then(({ data: { session } }) => {
        if (session && session.user) {
            logoutButton.classList.remove('hidden');
        } else {
            logoutButton.classList.add('hidden');
        }
    });

})();
