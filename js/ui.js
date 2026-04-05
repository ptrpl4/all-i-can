document.addEventListener('DOMContentLoaded', () => {
    const themeSwitcher = document.getElementById('themeSwitcher');
    const navLinks = document.querySelectorAll('nav a[href]');
    const pageLinks = document.querySelectorAll('a[href]');
    const themeController = window.BrowserTesterTheme;
    const themeModes = themeController ? themeController.themeModes : ['auto', 'light', 'dark'];
    let themeMode = themeController ? themeController.loadMode() : 'auto';

    applyTheme(themeMode);
    syncThemeLinks();
    syncThemeSwitcherLabel();

    if (themeSwitcher) {
        themeSwitcher.addEventListener('click', () => {
            const currentIndex = themeModes.indexOf(themeMode);
            themeMode = themeModes[(currentIndex + 1) % themeModes.length];
            if (themeController) {
                themeController.saveMode(themeMode);
            }
            applyTheme(themeMode);
            syncThemeLinks();
            syncThemeSwitcherLabel();
        });
    }

    if (themeController) {
        themeController.themeMedia.addEventListener('change', () => {
            if (themeMode === 'auto') {
                applyTheme(themeMode);
                syncThemeSwitcherLabel();
            }
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            const destination = new URL(link.href, window.location.href);
            const isSamePage =
                destination.origin === window.location.origin &&
                destination.pathname === window.location.pathname &&
                destination.search === window.location.search;

            if (!isSamePage) {
                return;
            }

            event.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    });

    function syncThemeLinks() {
        pageLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (!href || href.startsWith('#')) {
                return;
            }

            const destination = new URL(link.href, window.location.href);
            const isInternalPage =
                destination.origin === window.location.origin &&
                destination.pathname.endsWith('.html');

            if (!isInternalPage) {
                return;
            }

            destination.searchParams.set('theme', themeMode);
            link.href = destination.href;
        });
    }

    function applyTheme(mode) {
        if (themeController) {
            themeController.applyMode(mode);
            return;
        }

        const resolvedTheme = mode === 'dark' ? 'dark' : 'light';
        document.documentElement.dataset.theme = resolvedTheme;
        document.documentElement.dataset.themeMode = mode;
    }

    function syncThemeSwitcherLabel() {
        if (!themeSwitcher) {
            return;
        }

        const activeTheme = document.documentElement.dataset.theme;
        const labels = {
            auto: `Theme: Auto (${activeTheme === 'dark' ? 'Dark' : 'Light'})`,
            light: 'Theme: Light',
            dark: 'Theme: Dark'
        };

        themeSwitcher.textContent = labels[themeMode];
        themeSwitcher.setAttribute('aria-label', 'Toggle theme mode');
        themeSwitcher.setAttribute('data-theme-mode', themeMode);
    }
});
