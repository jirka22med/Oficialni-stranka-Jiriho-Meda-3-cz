// --- Funkce pro načítání a skrývání indikátoru ---
function showLoading(message = "Načítání...") {
    const loadingIndicatorElement = document.getElementById('loading-indicator');
    if (loadingIndicatorElement) {
        loadingIndicatorElement.textContent = message;
        loadingIndicatorElement.classList.remove('hidden');
    }
}
function hideLoading() {
    const loadingIndicatorElement = document.getElementById('loading-indicator');
    if (loadingIndicatorElement) {
        loadingIndicatorElement.classList.add('hidden');
    }
}