document.addEventListener('DOMContentLoaded', () => {
    const mouseLog = document.getElementById('mouseActivity');
    const keyboardLog = document.getElementById('keyboardActivity');
    const browserLog = document.getElementById('browserActivity');
    const interactionLog = document.getElementById('interactionActivity');

    function addLogEntry(container, message) {
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        entry.textContent = `${new Date().toLocaleTimeString()}: ${message}`;
        container.insertBefore(entry, container.firstChild);
        
        // Keep only last 10 entries
        if (container.children.length > 10) {
            container.removeChild(container.lastChild);
        }
    }

    // Mouse tracking
    document.addEventListener('mousemove', (e) => {
        addLogEntry(mouseLog, `Mouse moved to (${e.clientX}, ${e.clientY})`);
    });

    document.addEventListener('click', (e) => {
        addLogEntry(mouseLog, `Clicked at (${e.clientX}, ${e.clientY})`);
    });

    document.addEventListener('wheel', (e) => {
        addLogEntry(mouseLog, `Scrolled ${e.deltaY > 0 ? 'down' : 'up'}`);
    });

    // Keyboard tracking
    document.addEventListener('keydown', (e) => {
        addLogEntry(keyboardLog, `Key pressed: ${e.key}`);
    });

    // Browser events
    window.addEventListener('resize', () => {
        addLogEntry(browserLog, `Window resized to ${window.innerWidth}x${window.innerHeight}`);
    });

    window.addEventListener('focus', () => {
        addLogEntry(browserLog, 'Window focused');
    });

    window.addEventListener('blur', () => {
        addLogEntry(browserLog, 'Window lost focus');
    });

    // DevTools detection
    let devToolsOpen = false;

    function checkDevTools() {
        const threshold = 160;
        const widthThreshold = window.outerWidth - window.innerWidth > threshold;
        const heightThreshold = window.outerHeight - window.innerHeight > threshold;

        if ((widthThreshold || heightThreshold) !== devToolsOpen) {
            devToolsOpen = !devToolsOpen;
            addLogEntry(browserLog, `DevTools ${devToolsOpen ? 'opened' : 'closed'}`);
        }
    }

    setInterval(checkDevTools, 1000);

    // Page interactions
    document.addEventListener('copy', () => {
        addLogEntry(interactionLog, 'Content copied');
    });

    document.addEventListener('cut', () => {
        addLogEntry(interactionLog, 'Content cut');
    });

    document.addEventListener('paste', () => {
        addLogEntry(interactionLog, 'Content pasted');
    });

    document.addEventListener('visibilitychange', () => {
        addLogEntry(browserLog, `Page ${document.hidden ? 'hidden' : 'visible'}`);
    });
}); 