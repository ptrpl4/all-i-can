window.BrowserTester = {
    showResult(container, feature, supported) {
        const div = document.createElement('div');
        const isBoolean = supported === true || supported === false;
        const statusClass = isBoolean ? (supported ? 'success' : 'failure') : 'info';
        const statusLabel = isBoolean ? (supported ? 'PASS' : 'FAIL') : 'INFO';

        div.className = `test-result ${statusClass}`;
        div.setAttribute('data-status', statusLabel);
        div.textContent = `${feature}: ${isBoolean ? (supported ? 'Supported' : 'Not Supported') : supported}`;
        container.appendChild(div);
        return div;
    },

    showInfo(container, feature, message) {
        return this.showResult(container, feature, message);
    },

    showPending(container, feature) {
        const div = document.createElement('div');
        div.className = 'test-result pending';
        div.setAttribute('data-status', 'PENDING');
        div.textContent = `${feature}: Running...`;
        container.appendChild(div);
        return div;
    }
};
