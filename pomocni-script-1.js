// --- Pomocný script pro správu viditelnosti tlačítek ---
(function() {
    'use strict';

    function hideDataManagementButtons() {
        const container = document.querySelector('.function-setupDataManagement');
        if (container) {
            container.style.display = 'none';
        }
    }

    function showDataManagementButtons() {
        const container = document.querySelector('.function-setupDataManagement');
        if (container) {
            container.style.display = 'flex';
        }
    }

    function applyBaseVisualStyles() {
        const container = document.querySelector('.function-setupDataManagement');
        const innerContainer = document.querySelector('.function-setupDataManagement .data-management-container');
        const buttons = document.querySelectorAll('.function-setupDataManagement .button');
        const logoutBtn = document.getElementById('logout-button');

        if (container) {
            container.style.cssText = `
                justify-content: center !important;
                border: 1px solid rgba(255, 255, 255, 0.2) !important;
                border-radius: 10px !important;
                box-shadow: 0 4px 8px rgba(0,0,0,0.2) !important;
            `;
        }

        if (innerContainer) {
            innerContainer.style.cssText = `
                justify-content: center !important;
                flex-wrap: wrap !important;
            `;
        }

        const baseButtonVisuals = `
            text-decoration: none !important;
            transition: all 0.3s ease !important;
            background: rgba(255, 255, 255, 0.1) !important;
            backdrop-filter: blur(5px) !important;
            -webkit-backdrop-filter: blur(5px) !important;
            border: none !important;
            cursor: pointer !important;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2) !important;
            border-radius: 10px !important;
        `;

        const baseColorStyles = {
            saveBtn: `color: white !important;`,
            clearBtn: `color: red !important;`,
            exportBtn: `color: white !important;`,
            importBtn: `color: white !important;`,
            logoutBtn: `color: red !important;`,
            jirikBtn: `color: white !important;`
        };

        if (document.getElementById('save-all-data-btn')) {
            document.getElementById('save-all-data-btn').style.cssText = baseButtonVisuals + baseColorStyles.saveBtn;
        }
        if (document.getElementById('clear-all-data-btn')) {
            document.getElementById('clear-all-data-btn').style.cssText = baseButtonVisuals + baseColorStyles.clearBtn;
        }
        if (document.getElementById('export-data-btn')) {
            document.getElementById('export-data-btn').style.cssText = baseButtonVisuals + baseColorStyles.exportBtn;
        }
        if (document.getElementById('import-data-btn')) {
            document.getElementById('import-data-btn').style.cssText = baseButtonVisuals + baseColorStyles.importBtn;
        }
        if (document.getElementById('jirik-manual-opener-btn')) {
            document.getElementById('jirik-manual-opener-btn').style.cssText = baseButtonVisuals + baseColorStyles.jirikBtn;
        }
        if (logoutBtn) {
            logoutBtn.style.cssText = `
                padding: 0.1rem 1rem !important;
                ${baseButtonVisuals}
                ${baseColorStyles.logoutBtn}
            `;
        }
    }

    function applyDataManagementResponsiveStyles() {
    const container = document.querySelector('.function-setupDataManagement');
    const innerContainer = document.querySelector('.function-setupDataManagement .data-management-container');
    const buttons = document.querySelectorAll('.function-setupDataManagement .button');

    if (!container || !innerContainer || buttons.length === 0) {
        return;
    }

    if (container.style.display === 'none') {
        return;
    }

    const width = window.innerWidth;

    buttons.forEach(btn => {
        btn.style.padding = '';
        btn.style.fontSize = '';
        btn.style.margin = '';
        btn.style.width = '';
        btn.style.textAlign = '';
        btn.style.whiteSpace = '';
        btn.style.overflow = '';
        btn.style.textOverflow = '';
    });

    if (width >= 768) {
        container.style.maxWidth = '800px';
        container.style.width = '100%';
        container.style.padding = '1rem 2rem'; // ZMENŠENO (bylo 1.5rem)
        container.style.margin = '1.5rem auto'; // ZMENŠENO (bylo 2rem)

        innerContainer.style.display = 'grid';
        innerContainer.style.gridTemplateColumns = 'repeat(8, 1fr)';
        innerContainer.style.gap = '1rem'; // ZMENŠENO (bylo 1.5rem)
        innerContainer.style.padding = '0 1rem';

        buttons.forEach(btn => {
            btn.style.padding = '0.7rem 1.2rem'; // ZMENŠENO (bylo 1rem)
            btn.style.fontSize = '1rem';
        });
    } else if (width < 768 && width >= 481) {
        container.style.maxWidth = '400px';
        container.style.width = '100%';
        container.style.padding = '0.7rem 0.5rem'; // ZMENŠENO (bylo 1rem)
        container.style.margin = '0.7rem auto'; // ZMENŠENO (bylo 1rem)

        innerContainer.style.display = 'grid';
        innerContainer.style.gridTemplateColumns = 'repeat(4, 1fr)';
        innerContainer.style.gap = '0.5rem'; // ZMENŠENO (bylo 0.8rem)
        innerContainer.style.justifyItems = 'center';
        innerContainer.style.alignItems = 'center';
        innerContainer.style.padding = '0 0.5rem';

        buttons.forEach(btn => {
            btn.style.padding = '0.5rem 1rem'; // ZMENŠENO (bylo 0.8rem)
            btn.style.fontSize = '0.85rem';
            btn.style.margin = '0';
            btn.style.width = '100%';
            btn.style.textAlign = 'center';
            btn.style.whiteSpace = 'nowrap';
            btn.style.overflow = 'hidden';
            btn.style.textOverflow = 'ellipsis';
        });
    } else if (width <= 480 && width >= 321) {
        container.style.maxWidth = '425px';
        container.style.width = '100%';
        container.style.padding = '0.5rem 0.25rem'; // ZMENŠENO (bylo 0.8rem)
        container.style.margin = '0.5rem auto'; // ZMENŠENO (bylo 0.8rem)

        innerContainer.style.display = 'grid';
        innerContainer.style.gridTemplateColumns = 'repeat(4, 1fr)';
        innerContainer.style.gap = '0.3rem'; // ZMENŠENO (bylo 0.6rem)
        innerContainer.style.justifyItems = 'center';
        innerContainer.style.alignItems = 'center';
        innerContainer.style.padding = '0 0.25rem';

        buttons.forEach(btn => {
            btn.style.fontSize = '0.75rem';
            btn.style.padding = '0.4rem 0.8rem'; // ZMENŠENO (bylo 0.7rem)
            btn.style.margin = '0';
            btn.style.width = '100%';
            btn.style.textAlign = 'center';
            btn.style.whiteSpace = 'nowrap';
            btn.style.overflow = 'hidden';
            btn.style.textOverflow = 'ellipsis';
        });
    } else if (width <= 320) {
        container.style.maxWidth = '200px';
        container.style.width = '100%';
        container.style.padding = '0.3rem 0.1rem'; // ZMENŠENO (bylo 0.6rem)
        container.style.margin = '0.3rem auto'; // ZMENŠENO (bylo 0.6rem)

        innerContainer.style.display = 'grid';
        innerContainer.style.gridTemplateColumns = 'repeat(4, 1fr)';
        innerContainer.style.gap = '0.2rem'; // ZMENŠENO (bylo 0.4rem)
        innerContainer.style.justifyItems = 'center';
        innerContainer.style.alignItems = 'center';
        innerContainer.style.padding = '0 0.1rem';

        buttons.forEach(btn => {
            btn.style.fontSize = '0.7rem';
            btn.style.padding = '0.3rem 0.4rem'; // ZMENŠENO (bylo 0.6rem)
            btn.style.margin = '0';
            btn.style.width = '100%';
            btn.style.textAlign = 'center';
            btn.style.whiteSpace = 'nowrap';
            btn.style.overflow = 'hidden';
            btn.style.textOverflow = 'ellipsis';
        });
    }
} // <--- Tato závorka uzavírá funkci applyDataManagementResponsiveStyles()


// --- Zde začíná funkce observeEditMode(), PŘESNĚ JAK JSI JI POSKYTL ---
function observeEditMode() {
    const body = document.body;

    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                if (body.classList.contains('edit-mode')) {
                    showDataManagementButtons();
                    applyDataManagementResponsiveStyles();
                } else {
                    hideDataManagementButtons();
                }
            }
        });
    });
   // <--- Tato závorka uzavírá funkci observeEditMode(), přesně podle tvého zadání.

        observer.observe(body, {
            attributes: true,
            attributeFilter: ['class']
        });

        if (body.classList.contains('edit-mode')) {
            showDataManagementButtons();
            applyDataManagementResponsiveStyles();
        } else {
            hideDataManagementButtons();
        }
    }

    function initDataManagementVisibility() {
        applyBaseVisualStyles();
        observeEditMode();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDataManagementVisibility);
    } else {
        initDataManagementVisibility();
    }

    window.hideDataManagementButtons = hideDataManagementButtons;
    window.showDataManagementButtons = showDataManagementButtons;

    window.addEventListener('resize', function() {
        const container = document.querySelector('.function-setupDataManagement');
        if (container && container.style.display !== 'none') {
            applyDataManagementResponsiveStyles();
        }
    });

})();