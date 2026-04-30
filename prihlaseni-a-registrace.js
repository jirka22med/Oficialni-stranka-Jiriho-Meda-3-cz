// ============================================================
// prihlaseni-a-registrace.js  — PŘEPSÁNO pro Google Sign-In
// Odstraněno: Supabase auth, email/heslo formulář
// Zachováno:  Lokální hardcoded heslo jako brána před Google loginem
// ============================================================
(function() {
    'use strict';

    // SHA-256 hash přístupového hesla (stejný jako dříve — beze změny)
    const HARDCODED_ACCESS_PASSWORD_HASH = '256b5537a792c98a13c9b32bb6b6c90f0e63531fe77c3b4dee69ee1ca82c984b';

    const loginButton = document.getElementById('login-button');

    if (!loginButton) {
        console.warn("prihlaseni-a-registrace.js: Tlačítko #login-button nenalezeno.");
        return;
    }

    // --- Hash funkce (stejná jako dříve) ---
    async function hashString(text) {
        const data = new TextEncoder().encode(text);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hashBuffer))
            .map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // --- Zobrazení lokálního heslo-modalu ---
    function showLocalPasswordModal() {
        return new Promise(resolve => {
            const modal     = document.getElementById('local-password-modal');
            const input     = document.getElementById('local-password-input');
            const okBtn     = document.getElementById('local-password-ok-btn');
            const cancelBtn = document.getElementById('local-password-cancel-btn');
            const errorEl   = document.getElementById('local-password-error');

            if (!modal || !input || !okBtn || !cancelBtn) {
                console.error("Chybí HTML elementy pro local-password-modal.");
                resolve(null);
                return;
            }

            input.value = '';
            if (errorEl) errorEl.textContent = '';

            const handleEnter = (e) => {
                if (e.key === 'Enter') { e.preventDefault(); okBtn.click(); }
            };
            input.addEventListener('keydown', handleEnter);

            const cleanup = () => {
                okBtn.onclick = null;
                cancelBtn.onclick = null;
                input.removeEventListener('keydown', handleEnter);
            };

            okBtn.onclick = () => {
                cleanup();
                if (typeof window.hideModal === 'function') window.hideModal(modal);
                resolve(input.value);
            };
            cancelBtn.onclick = () => {
                cleanup();
                if (typeof window.hideModal === 'function') window.hideModal(modal);
                resolve(null);
            };

            if (typeof window.showModal === 'function') window.showModal(modal);
            input.focus();
        });
    }

    // --- Hlavní handler: lokální heslo → Google Sign-In ---
    async function handleLoginClick() {
        // Pokud je uživatel již přihlášen přes Firebase Auth, otevřeme auth-modal rovnou
        const currentUser = firebase.auth().currentUser;
        if (currentUser) {
            console.log("Uživatel již přihlášen:", currentUser.displayName);
            if (typeof window.showAuthModal === 'function') window.showAuthModal();
            return;
        }

        // Nejdříve ověříme lokální přístupové heslo
        const enteredPassword = await showLocalPasswordModal();
        if (enteredPassword === null) {
            console.log("Zadání hesla zrušeno uživatelem.");
            return;
        }

        const enteredHash = await hashString(enteredPassword);

        if (enteredHash === HARDCODED_ACCESS_PASSWORD_HASH) {
            console.log("✅ Lokální heslo správně — otevírám Google Sign-In.");
            if (typeof window.showAuthModal === 'function') window.showAuthModal();
        } else {
            const errorEl = document.getElementById('local-password-error');
            const modal   = document.getElementById('local-password-modal');
            if (errorEl) errorEl.textContent = "Chybné heslo! Zkuste to znovu.";
            if (modal && typeof window.showModal === 'function') {
                window.showModal(modal);
                const input = document.getElementById('local-password-input');
                if (input) input.focus();
            } else {
                alert("Chybné heslo. Přístup zamítnut.");
            }
            console.log("❌ Lokální heslo chybné.");
        }
    }

    loginButton.onclick = handleLoginClick;
    console.log("✅ prihlaseni-a-registrace.js načten (Google Sign-In mode).");
})();

// ============================================================
// Logout tlačítko — viditelnost řízena Firebase Auth state
// ============================================================
(function() {
    'use strict';
    const logoutButton = document.getElementById('logout-button');
    if (!logoutButton) return;

    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            logoutButton.classList.remove('hidden');
        } else {
            logoutButton.classList.add('hidden');
        }
    });
})();
