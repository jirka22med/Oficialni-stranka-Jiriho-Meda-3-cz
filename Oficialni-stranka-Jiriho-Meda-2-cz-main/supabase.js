document.addEventListener('DOMContentLoaded', async function() { // Zde je klíčové 'async'
    const loadingIndicatorElement = document.getElementById('loading-indicator');

    if (loadingIndicatorElement) {
        loadingIndicatorElement.textContent = "Načítání stránky a dat...";
        loadingIndicatorElement.classList.remove('hidden');
    } else {
        console.error("Loading indicator element not found!");
    }

    if (typeof supabase === 'undefined' || typeof supabase.createClient !== 'function') {
        console.error('Supabase library not loaded or createClient is not a function.');
        if (loadingIndicatorElement) {
            loadingIndicatorElement.textContent = 'Kritická chyba: Knihovna Supabase se nenačetla.';
        }
        document.body.style.visibility = 'visible';
        return;
    }
    if (typeof firebase === 'undefined' || typeof firebase.initializeApp !== 'function') {
        console.error('Firebase library not loaded or initializeApp is not a function.');
        if (loadingIndicatorElement) {
            loadingIndicatorElement.textContent = 'Kritická chyba: Knihovna Firebase se nenačetla.';
        }
        document.body.style.visibility = 'visible';
        return;
    }

    // --- Supabase autentizace (pro správu přihlášení) ---
    supabaseClient.auth.onAuthStateChange((event, session) => {
        console.log('Supabase Auth State Change:', event, session);
        if (session && session.user) {
            console.log('Uživatel je přihlášen přes Supabase:', session.user.email);
            currentUserId = session.user.id;
            document.getElementById('login-button').classList.add('hidden');
            document.getElementById('edit-mode-toggle-btn').classList.remove('hidden');

            const userIdDisplaySpan = document.getElementById('firebase-user-id');
            const userIdContainer = document.getElementById('user-id-display');
            if (currentUserId && userIdDisplaySpan && userIdContainer) {
                userIdDisplaySpan.textContent = currentUserId;
                userIdContainer.classList.remove('hidden');
            }

            if (localStorage.getItem(EDIT_MODE_KEY) === 'true') {
                enableEditMode();
                document.getElementById('edit-mode-toggle-btn').textContent = ' 💾';
            } else {
                disableEditMode();
                document.getElementById('edit-mode-toggle-btn').textContent = '🔐';
            }
        } else {
            console.log('Uživatel není přihlášen přes Supabase.');
            currentUserId = null;
            document.getElementById('login-button').classList.remove('hidden');
            document.getElementById('edit-mode-toggle-btn').classList.add('hidden');
            document.getElementById('user-id-display').classList.add('hidden');
            disableEditMode();
            localStorage.removeItem(EDIT_MODE_KEY);
        }
        initializeApp();
        if (loadingIndicatorElement) loadingIndicatorElement.classList.add('hidden');
        document.body.style.visibility = 'visible';
    });

    async function checkInitialAuthStateSupabase() {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        if (error) {
            console.error("Chyba při získávání Supabase session:", error);
        } else if (session) {
            // Stav bude zpracován v onAuthStateChange listeneru
        }
    }
    await checkInitialAuthStateSupabase(); // Voláme s await, protože je to async
});

// --- Pomocná funkce pro formátování časového otisku ---
function formatTimestamp(timestamp) {
    if (!timestamp) return 'Neznámé datum';
    if (typeof timestamp.toDate === 'function') {
        return new Date(timestamp.toDate()).toLocaleString('cs-CZ');
    }
    return new Date(timestamp).toLocaleString('cs-CZ');
}

// --- Funkce pro zobrazení/skrytí přihlašovacího modalu ---
function showAuthModal() {
    showModal(document.getElementById('auth-modal'));
    document.getElementById('auth-email').focus();
    document.getElementById('auth-error-message').textContent = '';
}

function hideAuthModal() {
    hideModal(document.getElementById('auth-modal'));
    document.getElementById('auth-email').value = '';
    document.getElementById('auth-password').value = '';
    document.getElementById('auth-error-message').textContent = '';
}

document.getElementById('cancel-auth-btn')?.addEventListener('click', hideAuthModal);

// --- Funkce pro přihlášení (pouze Supabase) ---
document.getElementById('login-auth-btn')?.addEventListener('click', async () => {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const errorMessageEl = document.getElementById('auth-error-message');
    errorMessageEl.textContent = '';

    showLoading("Přihlašování přes Supabase...");

    const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
        console.error('Chyba při přihlašování:', error.message);
        errorMessageEl.textContent = `Chyba: ${error.message}`;
        hideLoading();
    } else {
        hideAuthModal();
        hideLoading();
    }
});

// --- Funkce pro registraci (pouze Supabase) ---
document.getElementById('signup-auth-btn')?.addEventListener('click', async () => {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    const errorMessageEl = document.getElementById('auth-error-message');
    errorMessageEl.textContent = '';

    showLoading("Registrace přes Supabase...");

    const { data, error } = await supabaseClient.auth.signUp({ email, password });
    if (error) {
        console.error('Chyba při registraci:', error.message);
        errorMessageEl.textContent = `Chyba: ${error.message}`;
        hideLoading();
    } else {
        if (data && data.user) {
            showAlertModal("Registrace úspěšná", "Registrace proběhla úspěšně! Nyní se můžete přihlásit.");
            hideAuthModal();
            hideLoading();
        } else {
            showAlertModal("Registrace vyžaduje potvrzení", "Zkontrolujte svůj email pro potvrzení registrace. Poté se můžete přihlásit.");
            hideAuthModal();
            hideLoading();
        }
    }
});

// --- Funkce pro odhlášení (pouze Supabase) ---
window.signOut = async function() {
    const confirmed = await (window.showConfirmModal ?
        showConfirmModal("Odhlásit se?", "Opravdu se chcete odhlásit?", { okText: 'Ano, odhlásit', cancelText: 'Zůstat přihlášen' }) :
        confirm("Opravdu se chcete odhlásit?")
    );

    if (confirmed) {
        showLoading("Odhlašování přes Supabase...");
        const { error } = await supabaseClient.auth.signOut();
        if (error) {
            console.error('Chyba při odhlašování:', error.message);
            showAlertModal("Chyba odhlášení", `Nepodařilo se odhlásit: ${error.message}`);
            hideLoading();
        } else {
            showAlertModal("Odhlášení", "Byli jste úspěšně odhlášeni. Pro úpravy se opět přihlaste.");
            hideLoading();
        }
    }
};

