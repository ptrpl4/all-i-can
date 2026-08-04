function applyResult(div, feature, supported) {
    const isBoolean = supported === true || supported === false;
    const statusClass = isBoolean ? (supported ? 'success' : 'failure') : 'info';
    const statusLabel = isBoolean ? (supported ? 'PASS' : 'FAIL') : '';

    div.className = `test-result ${statusClass}`;
    if (statusLabel) {
        div.setAttribute('data-status', statusLabel);
    } else {
        div.removeAttribute('data-status');
    }
    div.textContent = `${feature}: ${isBoolean ? (supported ? 'Supported' : 'Not Supported') : supported}`;
    return div;
}

function applyError(div, feature, message) {
    div.className = 'test-result failure';
    div.setAttribute('data-status', 'ERROR');
    div.textContent = `${feature}: ${message}`;
    return div;
}

function showResult(container, feature, supported) {
    const div = applyResult(document.createElement('div'), feature, supported);
    container.appendChild(div);
    return div;
}

function showInfo(container, feature, message) {
    return showResult(container, feature, message);
}

function showPending(container, feature) {
    const div = document.createElement('div');
    div.className = 'test-result pending';
    div.setAttribute('data-status', 'PENDING');
    div.textContent = `${feature}: Running...`;
    container.appendChild(div);
    return div;
}

// Resolve a row created by showPending, in place.
function updateResult(div, feature, supported) {
    return applyResult(div, feature, supported);
}

function showError(container, feature, message) {
    const div = applyError(document.createElement('div'), feature, message);
    container.appendChild(div);
    return div;
}

// Turn an existing row (usually a pending one) into an error row.
function markError(div, feature, message) {
    return applyError(div, feature, message);
}

// Run one page section behind a guard so a throw cannot skip every later section.
function runSection(label, container, fn) {
    try {
        return fn();
    } catch (error) {
        const message = error && error.message ? error.message : String(error);
        if (container) {
            showError(container, label, `Test errored: ${message}`);
        }
        console.error(`[${label}]`, error);
        return undefined;
    }
}

window.BrowserTester = {
    showResult,
    showInfo,
    showPending,
    updateResult,
    showError,
    markError,
    runSection
};
