(() => {
    const themeModes = ['auto', 'light', 'dark'];
    const storageKey = 'theme-mode';
    const themeMedia = window.matchMedia('(prefers-color-scheme: dark)');
    const params = new URLSearchParams(window.location.search);

    function loadMode() {
        const queryMode = params.get('theme');
        if (themeModes.includes(queryMode)) {
            saveMode(queryMode);
            return queryMode;
        }

        const storedMode = window.localStorage.getItem(storageKey);
        return themeModes.includes(storedMode) ? storedMode : 'auto';
    }

    function saveMode(mode) {
        if (themeModes.includes(mode)) {
            window.localStorage.setItem(storageKey, mode);
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
