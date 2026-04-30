// ============================================================
// script.js  — UPRAVENO: Supabase odstraněno, Firebase Auth přidáno
// ============================================================

// --- Firebase Konfigurace (Firestore + Auth) ---
const firebaseConfig = {
    apiKey: "AIzaSyBBep6Nyn9jEp_Q1bryULEbfuWfngMT07Y",
    authDomain: "muj-osobni-web-pokus-10.firebaseapp.com",
    projectId: "muj-osobni-web-pokus-10",
    storageBucket: "muj-osobni-web-pokus-10.firebasestorage.app",
    messagingSenderId: "546998884348",
    appId: "1:546998884348:web:c5efd177dc1144b80cc479",
    measurementId: "G-1PCS4F72KJ"
};

// --- Inicializace Firebase App, Firestore a Auth ---
let fbApp;
let db;

try {
    fbApp = firebase.initializeApp(firebaseConfig);
    db = fbApp.firestore();
    // Firebase Auth je automaticky dostupný přes firebase.auth()
    console.log("✅ Firebase Firestore + Auth úspěšně inicializovány.");
} catch (error) {
    console.error("❌ Chyba při inicializaci Firebase:", error);
    const loadingEl = document.getElementById('loading-indicator');
    if (loadingEl) loadingEl.textContent = 'Kritická chyba: Firebase se nenačetl.';
    document.body.style.visibility = 'visible';
}

// --- Globální stavové proměnné ---
let isEditMode = false;
console.log("isEditMode inicializováno");

const EDIT_MODE_KEY = 'portfolio_edit_mode_active';
console.log("EDIT_MODE_KEY nastaveno");

// Identifikátor hlavního dokumentu ve Firestore
const DOC_ID = 'websiteContent';
console.log('DOC_ID (websiteContent) inicializován.');

// Globální data
let currentModalImageIndex = 0;
let editableContentData = {};
let portfolioItemsData = [];
let galleryImagesData = null;
let savedCodesData = [];
let externalLinksData = [];
let currentUserId = null;           // Nastavuje google-auth.js přes onAuthStateChanged
let editingPortfolioItemId = null;

console.log("✅ Všechny globální proměnné inicializovány.");

// --- Statické obrázky (nezměněno) ---
const initialImageUrls = [
    { id: 'initial-1', url: 'https://img.freepik.com/free-photo/futuristic-background-with-colorful-abstract-design_1340-39 futuristic-technology-background-with-neon-lights_76964-11458.jpg?w=826&t=st=1716545000~exp=1716545600~hmac=e6108f60104301f3b2886131029b0f10151707f3020142e9950b1e22704c654a', name: 'Technologie'},
    { id: 'initial-2', url: 'https://img41.rajce.idnes.cz/d4102/19/19244/19244630_db82ad174937335b1a151341387b7af2/images/image_4k18.jpg?ver=0', name: 'Srdce'},
    { id: 'initial-3', url: 'https://img.freepik.com/free-photo/glowing-spaceship-orbits-planet-starry-galaxy-generated-by-ai_188544-9655.jpg?w=1060&t=st=1716545052~exp=1716545652~hmac=c6a7d107b56da6822f221372f4476a3793075997b820160f494a887688068b14', name: 'Vesmírná loď'},
    { id: 'initial-4', url: 'https://img41.rajce.idnes.cz/d4102/19/19244/19244630_db82ad174937335b1a151341387b7af2/images/image_4k7.jpg?ver=0', name: 'Mlhovina'},
    { id: 'initial-5', url: 'https://img41.rajce.idnes.cz/d4102/19/19244/19244630_db82ad174937335b1a151341387b7af2/images/image_4k8.jpg?ver=0', name: 'Kyberpunk město'},
    { id: 'initial-6', url: 'https://img41.rajce.idnes.cz/d4102/19/19244/19244630_db82ad174937335b1a151341387b7af2/images/image_4k13.jpg?ver=0', name: 'Notebook v akci'},
    { id: 'initial-7', url: 'https://img41.rajce.idnes.cz/d4102/19/19244/19244630_db82ad174937335b1a151341387b7af2/images/image_4k14.jpg?ver=0', name: 'Galaxie'},
    { id: 'initial-8', url: 'https://img41.rajce.idnes.cz/d4102/19/19244/19244630_db82ad174937335b1a151341387b7af2/images/image_1920x10804.jpg?ver=0', name: 'Lidský mozek'},
    { id: 'initial-9', url: 'https://img41.rajce.idnes.cz/d4102/19/19244/19244630_db82ad174937335b1a151341387b7af2/images/image_15360x86402.jpg?ver=0', name: 'Vědecké laboratoře'},
    { id: 'initial-10', url: 'https://img41.rajce.idnes.cz/d4102/19/19244/19244630_db82ad174937335b1a151341387b7af2/images/misurina-sunset.jpg?ver=0', name: 'Neuronová síť'},
    { id: 'initial-11', url: 'https://img41.rajce.idnes.cz/d4102/19/19244/19244630_db82ad174937335b1a151341387b7af2/images/snowy-landscape-with-mountains-lake-with-snow-ground.jpg?ver=0', name: 'Datová mřížka'},
    { id: 'initial-12', url: 'https://img41.rajce.idnes.cz/d4102/19/19244/19244630_db82ad174937335b1a151341387b7af2/images/wet-sphere-reflective-water-abstract-beauty-generated-by-ai.jpg?ver=0', name: 'Futuristické město'},
    { id: 'initial-13', url: 'https://img41.rajce.idnes.cz/d4102/19/19244/19244630_db82ad174937335b1a151341387b7af2/images/vnon-pozadi-od-admirala-chatbota..jpg?ver=0', name: 'Světelná geometrie'},
    { id: 'initial-14', url: 'https://img41.rajce.idnes.cz/d4102/19/19244/19244630_db82ad174937335b1a151341387b7af2/images/image_1024x1792.jpg?ver=0', name: 'Digitální plameny'},
    { id: 'initial-15', url: 'https://img41.rajce.idnes.cz/d4102/19/19244/19244630_db82ad174937335b1a151341387b7af2/images/image_300x3001_2.jpg?ver=0', name: 'Exoplaneta'},
    { id: 'initial-16', url: 'https://img36.rajce.idnes.cz/d3603/10/10185/10185286_0147349ad505c43a2d9f6eb372624417/images/CIMG0039.jpg?ver=3', name: 'Kybernetická maska'},
];

let initialExternalLinksData = [];

// --- Navigace a sekce (beze změny) ---
const optimizedCSS = `
    main section {
        transition: none !important;
        animation: none !important;
        opacity: 1 !important;
        transform: none !important;
    }
    main section.active {
        transition: none !important;
        animation: none !important;
    }
    .nav-container a.nav-link {
        transition: none !important;
    }
`;

function injectOptimizedCSS() {
    const style = document.createElement('style');
    style.textContent = optimizedCSS;
    document.head.appendChild(style);
}

function setupNavigation() {
    injectOptimizedCSS();
    const navLinks = document.querySelectorAll('.nav-container a.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.dataset.section;
            showSection(sectionId);
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });
    const initialActiveLink = document.querySelector(`.nav-container a.nav-link[data-section="${activeSection}"]`);
    if (initialActiveLink) initialActiveLink.classList.add('active');
}

let activeSection = 'about';

function showSection(id, isInitial = false) {
    if (!id) id = 'about';
    activeSection = id;
    document.querySelectorAll('main section').forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });
    const sectionElement = document.getElementById(id);
    if (sectionElement) {
        sectionElement.style.display = 'block';
        sectionElement.classList.add('active');
    } else {
        console.warn(`Sekce s ID "${id}" nenalezena. Zobrazuji 'about'.`);
        const aboutSection = document.getElementById('about');
        if (aboutSection) {
            aboutSection.style.display = 'block';
            aboutSection.classList.add('active');
            activeSection = 'about';
            document.querySelectorAll('.nav-container a.nav-link').forEach(l => l.classList.remove('active'));
            document.querySelector('.nav-container a.nav-link[data-section="about"]')?.classList.add('active');
        }
    }
}
