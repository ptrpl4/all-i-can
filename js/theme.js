(() => {
    const themeModes = ['auto', 'light', 'dark'];
    const storageKey = 'theme-mode';
    const themeMedia = window.matchMedia('(prefers-color-scheme: dark)');
    const params = new URLSearchParams(window.location.search);

    // Storage can be blocked outright (site data disabled, some file:// and
    // partitioned contexts), and a throw here would take the whole theme with it.
    function readStoredMode() {
        try {
            return window.localStorage.getItem(storageKey);
        } catch {
            return null;
        }
    }

    function loadMode() {
        const queryMode = params.get('theme');
        if (themeModes.includes(queryMode)) {
            saveMode(queryMode);
            return queryMode;
        }

        const storedMode = readStoredMode();
        return themeModes.includes(storedMode) ? storedMode : 'auto';
    }

    function saveMode(mode) {
        if (!themeModes.includes(mode)) {
            return;
        }

        try {
            window.localStorage.setItem(storageKey, mode);
        } catch {
            // Preference cannot persist; the in-page mode still applies.
        }
    }

    function resolveTheme(mode) {
        return mode === 'auto'
            ? (themeMedia.matches ? 'dark' : 'light')
            : mode;
    }

    function applyMode(mode) {
        const safeMode = themeModes.includes(mode) ? mode : 'auto';
        const resolvedTheme = resolveTheme(safeMode);
        document.documentElement.dataset.theme = resolvedTheme;
        document.documentElement.dataset.themeMode = safeMode;
        return resolvedTheme;
    }

    applyMode(loadMode());

    window.BrowserTesterTheme = {
        themeModes,
        themeMedia,
        loadMode,
        saveMode,
        applyMode,
        resolveTheme
    };
})();
