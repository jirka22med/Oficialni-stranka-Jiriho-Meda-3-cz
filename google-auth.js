// ============================================================
// google-auth.js  — kompletní náhrada supabase.js
// Firebase Auth s Google Sign-In
// Zachovány: initializeApp(), formatTimestamp(), editMode logika,
//            showAuthModal(), hideAuthModal(), login-button viditelnost
// ============================================================

document.addEventListener('DOMContentLoaded', async function() {

    const loadingIndicatorElement = document.getElementById('loading-indicator');

    if (loadingIndicatorElement) {
        loadingIndicatorElement.textContent = "Načítání stránky a dat...";
        loadingIndicatorElement.classList.remove('hidden');
    } else {
        console.error("Loading indicator element not found!");
    }

    // Kontrola Firebase
    if (typeof firebase === 'undefined' || typeof firebase.initializeApp !== 'function') {
        console.error('Firebase library not loaded.');
        if (loadingIndicatorElement) {
            loadingIndicatorElement.textContent = 'Kritická chyba: Knihovna Firebase se nenačetla.';
        }
        document.body.style.visibility = 'visible';
        return;
    }

    // --- Auth state listener (nahrazuje Supabase onAuthStateChange) ---
    let _authInitialized = false;

    firebase.auth().onAuthStateChanged((user) => {
        console.log('Firebase Auth State Change:', user ? 'přihlášen' : 'nepřihlášen');

        const loginBtn    = document.getElementById('login-button');
        const editModeBtn = document.getElementById('edit-mode-toggle-btn');
        const userIdDisplay = document.getElementById('user-id-display');
        const userIdSpan    = document.getElementById('firebase-user-id');

        if (user) {
            console.log('Uživatel je přihlášen přes Firebase:', user.displayName || user.email);
            currentUserId = user.uid;

            if (loginBtn)    loginBtn.classList.add('hidden');
            if (editModeBtn) editModeBtn.classList.remove('hidden');

            if (userIdSpan)    userIdSpan.textContent = user.uid;
            if (userIdDisplay) userIdDisplay.classList.remove('hidden');

            // Obnovení edit módu z localStorage (stejná logika jako v supabase.js)
            if (localStorage.getItem(EDIT_MODE_KEY) === 'true') {
                if (typeof enableEditMode === 'function') enableEditMode();
                if (editModeBtn) editModeBtn.textContent = ' 💾';
            } else {
                if (typeof disableEditMode === 'function') disableEditMode();
                if (editModeBtn) editModeBtn.textContent = '🔐';
            }

        } else {
            console.log('Uživatel není přihlášen přes Firebase.');
            currentUserId = null;

            if (loginBtn)      loginBtn.classList.remove('hidden');
            if (editModeBtn)   editModeBtn.classList.add('hidden');
            if (userIdDisplay) userIdDisplay.classList.add('hidden');

            if (typeof disableEditMode === 'function') disableEditMode();
            try { localStorage.removeItem(EDIT_MODE_KEY); } catch(e) {}
        }

        // Inicializace stránky — provede se při KAŽDÉM auth eventu
        // (stejně jako v supabase.js — initializeApp() + skrytí loading + zobrazení body)
        initializeApp();
        if (loadingIndicatorElement) loadingIndicatorElement.classList.add('hidden');
        document.body.style.visibility = 'visible';
    });

});

// ============================================================
// initializeApp() — spouští načtení dat a navigaci
// (volala se v supabase.js po auth state change)
// ============================================================
async function initializeApp() {
    try {
        if (typeof setupNavigation === 'function') setupNavigation();
        if (typeof showSection === 'function') showSection('about', true);

        if (typeof loadDataFromFirestore === 'function') {
            await loadDataFromFirestore();
        }

        if (typeof setupFirestoreRealtimeListener === 'function') {
            setupFirestoreRealtimeListener();
        }

        console.log("✅ initializeApp() dokončeno.");
    } catch (err) {
        console.error("❌ Chyba v initializeApp():", err);
    }
}

// ============================================================
// Pomocná funkce pro formátování časového otisku
// (byla v supabase.js, používají ji jiné skripty)
// ============================================================
function formatTimestamp(timestamp) {
    if (!timestamp) return 'Neznámé datum';
    if (typeof timestamp.toDate === 'function') {
        return new Date(timestamp.toDate()).toLocaleString('cs-CZ');
    }
    return new Date(timestamp).toLocaleString('cs-CZ');
}

// ============================================================
// showAuthModal() / hideAuthModal()
// (byly v supabase.js, volány z prihlaseni-a-registrace.js)
// ============================================================
window.showAuthModal = function() {
    const modal = document.getElementById('auth-modal');
    if (modal && typeof showModal === 'function') {
        showModal(modal);

        // Aktualizujeme modal podle stavu přihlášení
        const currentUser = firebase.auth().currentUser;
        if (currentUser) {
            const signinSection   = document.getElementById('auth-signin-section');
            const userInfoSection = document.getElementById('auth-user-info');
            const avatarEl = document.getElementById('auth-user-avatar');
            const nameEl   = document.getElementById('auth-user-name');
            const emailEl  = document.getElementById('auth-user-email');
            if (signinSection)   signinSection.style.display = 'none';
            if (userInfoSection) userInfoSection.style.display = 'block';
            if (avatarEl && currentUser.photoURL) avatarEl.src = currentUser.photoURL;
            if (nameEl)  nameEl.textContent  = currentUser.displayName || 'Uživatel';
            if (emailEl) emailEl.textContent = currentUser.email || '';
        } else {
            const signinSection   = document.getElementById('auth-signin-section');
            const userInfoSection = document.getElementById('auth-user-info');
            const errorEl = document.getElementById('auth-error-message');
            if (signinSection)   signinSection.style.display = 'block';
            if (userInfoSection) userInfoSection.style.display = 'none';
            if (errorEl)         errorEl.textContent = '';
        }
    }
};

window.hideAuthModal = function() {
    const modal = document.getElementById('auth-modal');
    if (modal && typeof hideModal === 'function') {
        hideModal(modal);
        const errorEl = document.getElementById('auth-error-message');
        if (errorEl) errorEl.textContent = '';
    }
};

// Cancel tlačítko v auth-modalu
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('cancel-auth-btn')?.addEventListener('click', window.hideAuthModal);
});

// ============================================================
// Přihlášení přes Google
// ============================================================
window.signInWithGoogle = async function() {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const result = await firebase.auth().signInWithPopup(provider);
        console.log("✅ Google přihlášení úspěšné:", result.user.displayName);
        return result.user;
    } catch (error) {
        console.error("❌ Chyba Google přihlášení:", error);
        let msg = "Přihlášení selhalo.";
        if (error.code === 'auth/popup-closed-by-user')   msg = "Přihlašovací okno bylo zavřeno.";
        if (error.code === 'auth/popup-blocked')          msg = "Prohlížeč zablokoval popup. Povolte popupy pro tuto stránku.";
        if (error.code === 'auth/network-request-failed') msg = "Chyba sítě. Zkontrolujte připojení.";
        if (error.code === 'auth/unauthorized-domain')    msg = "Tato doména není povolena v Firebase konzoli.";
        throw { code: error.code, message: msg };
    }
};

// ============================================================
// Odhlášení — zachována confirm logika z supabase.js
// ============================================================
window.signOut = async function() {
    const confirmed = await (window.showConfirmModal ?
        showConfirmModal("Odhlásit se?", "Opravdu se chcete odhlásit?", {
            okText: 'Ano, odhlásit',
            cancelText: 'Zůstat přihlášen'
        }) :
        confirm("Opravdu se chcete odhlásit?")
    );

    if (confirmed) {
        if (typeof showLoading === 'function') showLoading("Odhlašování...");
        try {
            await firebase.auth().signOut();
            if (typeof showAlertModal === 'function') {
                showAlertModal("Odhlášení", "Byli jste úspěšně odhlášeni. Pro úpravy se opět přihlaste.");
            }
        } catch (error) {
            console.error("❌ Chyba odhlašování:", error);
            if (typeof showAlertModal === 'function') {
                showAlertModal("Chyba odhlášení", `Nepodařilo se odhlásit: ${error.message}`);
            }
        } finally {
            if (typeof hideLoading === 'function') hideLoading();
        }
    }
};

// --- Pomocné funkce ---  jirka22med/Oficialni-stranka-Jiriho-Meda-3-cz
window.getCurrentUser = () => firebase.auth().currentUser;

console.log("✅ google-auth.js načten.");