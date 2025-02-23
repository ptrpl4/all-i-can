document.addEventListener('DOMContentLoaded', () => {
    // Screen Reader Tests
    const screenReaderTests = document.getElementById('screenReaderTests');
    
    // Test ARIA support
    const hasARIA = testARIASupport();
    showResult(screenReaderTests, 'ARIA Support', hasARIA);

    // Test role attribute
    const hasRoles = testRoleAttribute();
    showResult(screenReaderTests, 'Role Attribute', hasRoles);

    // Test live regions
    const hasLiveRegions = testLiveRegions();
    showResult(screenReaderTests, 'Live Regions', hasLiveRegions);

    // Keyboard Navigation Tests
    const keyboardTests = document.getElementById('keyboardTests');
    
    // Test focus management
    const hasFocus = testFocusManagement();
    showResult(keyboardTests, 'Focus Management', hasFocus);

    // Test tab index
    const hasTabIndex = testTabIndex();
    showResult(keyboardTests, 'Tab Index', hasTabIndex);

    // Test keyboard events
    const hasKeyboardEvents = testKeyboardEvents();
    showResult(keyboardTests, 'Keyboard Events', hasKeyboardEvents);

    // High Contrast Tests
    const contrastTests = document.getElementById('contrastTests');
    
    // Test media queries
    const hasContrastQueries = testContrastQueries();
    showResult(contrastTests, 'Contrast Media Queries', hasContrastQueries);

    // Test forced colors
    const hasForcedColors = testForcedColors();
    showResult(contrastTests, 'Forced Colors Mode', hasForcedColors);

    // ARIA Support Tests
    const ariaTests = document.getElementById('ariaTests');
    
    // Test specific ARIA attributes
    const ariaAttributes = testARIAAttributes();
    Object.entries(ariaAttributes).forEach(([attr, supported]) => {
        showResult(ariaTests, `ARIA ${attr}`, supported);
    });
});

function testARIASupport() {
    const el = document.createElement('div');
    el.setAttribute('role', 'button');
    return el.getAttribute('role') === 'button';
}

function testRoleAttribute() {
    const el = document.createElement('div');
    const roles = ['button', 'alert', 'dialog', 'tooltip'];
    return roles.every(role => {
        el.setAttribute('role', role);
        return el.getAttribute('role') === role;
    });
}

function testLiveRegions() {
    const el = document.createElement('div');
    el.setAttribute('aria-live', 'polite');
    return el.getAttribute('aria-live') === 'polite';
}

function testFocusManagement() {
    const el = document.createElement('div');
    el.tabIndex = 0;
    return 'focus' in el;
}

function testTabIndex() {
    const el = document.createElement('div');
    el.tabIndex = 0;
    return el.tabIndex === 0;
}

function testKeyboardEvents() {
    return 'KeyboardEvent' in window;
}

function testContrastQueries() {
    return 'matchMedia' in window && 
           window.matchMedia('(prefers-contrast: more)').toString() !== 'not all';
}

function testForcedColors() {
    return 'matchMedia' in window && 
           window.matchMedia('(forced-colors)').toString() !== 'not all';
}

function testARIAAttributes() {
    const el = document.createElement('div');
    const attributes = {
        'label': 'aria-label',
        'description': 'aria-description',
        'hidden': 'aria-hidden',
        'expanded': 'aria-expanded',
        'checked': 'aria-checked',
        'disabled': 'aria-disabled',
        'required': 'aria-required',
        'selected': 'aria-selected'
    };

    return Object.entries(attributes).reduce((acc, [key, attr]) => {
        el.setAttribute(attr, 'test');
        acc[key] = el.getAttribute(attr) === 'test';
        return acc;
    }, {});
}

function showResult(container, feature, supported) {
    const div = document.createElement('div');
    div.className = `test-result ${supported ? 'success' : 'failure'}`;
    div.textContent = `${feature}: ${supported ? 'Supported' : 'Not Supported'}`;
    container.appendChild(div);
} 