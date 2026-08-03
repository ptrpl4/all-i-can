document.addEventListener('DOMContentLoaded', () => {
    const { showResult, showInfo, runSection } = window.BrowserTester;

    // Screen Reader Tests
    const screenReaderTests = document.getElementById('screenReaderTests');

    runSection('ARIA and DOM Semantics', screenReaderTests, () => {
        showInfo(screenReaderTests, 'Scope', 'These checks cover DOM and CSS APIs related to accessibility, not assistive technology behavior.');

        // Test ARIA support
        const hasARIA = testARIASupport();
        showResult(screenReaderTests, 'ARIA Role Attribute Reflection', hasARIA);

        // Test role attribute
        const hasRoles = testRoleAttribute();
        showResult(screenReaderTests, 'Common Role Attribute Reflection', hasRoles);

        // Test live regions
        const hasLiveRegions = testLiveRegions();
        showResult(screenReaderTests, 'aria-live Attribute Reflection', hasLiveRegions);
    });

    // Keyboard Navigation Tests
    const keyboardTests = document.getElementById('keyboardTests');

    runSection('Keyboard-Related APIs', keyboardTests, () => {
        // Test focus management
        const hasFocus = testFocusManagement();
        showResult(keyboardTests, 'Element.focus API', hasFocus);

        // Test tab index
        const hasTabIndex = testTabIndex();
        showResult(keyboardTests, 'Tab Index', hasTabIndex);

        // Test keyboard events
        const hasKeyboardEvents = testKeyboardEvents();
        showResult(keyboardTests, 'KeyboardEvent Interface', hasKeyboardEvents);
    });

    // High Contrast Tests
    const contrastTests = document.getElementById('contrastTests');

    runSection('User Preference Media Queries', contrastTests, () => {
        // Test media queries
        const hasContrastQueries = testContrastQueries();
        showResult(contrastTests, 'prefers-contrast Media Query Parsing', hasContrastQueries);

        // Test forced colors
        const hasForcedColors = testForcedColors();
        showResult(contrastTests, 'forced-colors Media Query Parsing', hasForcedColors);
    });

    // ARIA Support Tests
    const ariaTests = document.getElementById('ariaTests');

    runSection('ARIA Attribute Reflection', ariaTests, () => {
        // Test specific ARIA attributes
        const ariaAttributes = testARIAAttributes();
        Object.entries(ariaAttributes).forEach(([attr, supported]) => {
            showResult(ariaTests, `ARIA ${attr} Attribute Reflection`, supported);
        });
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

// An unparsable media query serializes back as "not all", which is how a
// browser signals it does not understand the feature.
function supportsMediaQuery(query) {
    return 'matchMedia' in window && window.matchMedia(query).media !== 'not all';
}

function testContrastQueries() {
    return supportsMediaQuery('(prefers-contrast: more)');
}

function testForcedColors() {
    return supportsMediaQuery('(forced-colors: active)');
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
