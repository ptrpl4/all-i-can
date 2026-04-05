document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('nav a[href]');

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
});
