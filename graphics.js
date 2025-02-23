document.addEventListener('DOMContentLoaded', () => {
    // WebGL Tests
    const webglTests = document.getElementById('webglTests');
    
    // Test WebGL 1.0
    const hasWebGL1 = testWebGL('webgl');
    showResult(webglTests, 'WebGL 1.0', hasWebGL1);

    // Test WebGL 2.0
    const hasWebGL2 = testWebGL('webgl2');
    showResult(webglTests, 'WebGL 2.0', hasWebGL2);

    if (hasWebGL1) {
        const gl = document.createElement('canvas').getContext('webgl');
        showResult(webglTests, 'GPU Vendor', gl.getParameter(gl.VENDOR));
        showResult(webglTests, 'GPU Renderer', gl.getParameter(gl.RENDERER));
        showResult(webglTests, 'WebGL Version', gl.getParameter(gl.VERSION));
        showResult(webglTests, 'Shader Version', gl.getParameter(gl.SHADING_LANGUAGE_VERSION));
    }

    // Canvas Features
    const canvasTests = document.getElementById('canvasTests');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    showResult(canvasTests, '2D Canvas', !!ctx);
    showResult(canvasTests, 'Path2D', 'Path2D' in window);
    showResult(canvasTests, 'ImageData', 'ImageData' in window);
    showResult(canvasTests, 'OffscreenCanvas', 'OffscreenCanvas' in window);

    // CSS Features
    const cssTests = document.getElementById('cssTests');
    const cssFeatures = {
        'Grid': testCSSProperty('display', 'grid'),
        'Flexbox': testCSSProperty('display', 'flex'),
        'CSS Variables': testCSSProperty('--test', '0'),
        'Transform 3D': testCSSProperty('transform', 'translate3d(0,0,0)'),
        'Animations': testCSSProperty('animation', 'none'),
        'Transitions': testCSSProperty('transition', 'none'),
        'Media Queries': 'matchMedia' in window,
        'CSS Masks': testCSSProperty('-webkit-mask', 'none') || testCSSProperty('mask', 'none')
    };

    Object.entries(cssFeatures).forEach(([feature, supported]) => {
        showResult(cssTests, feature, supported);
    });

    // SVG Support
    const svgTests = document.getElementById('svgTests');
    const svgFeatures = {
        'Basic SVG': 'createElementNS' in document,
        'SVG in HTML': 'SVGElement' in window,
        'SVG Animation (SMIL)': 'createElementNS' in document && testSVGAnimation(),
        'SVG Filters': testSVGFilters()
    };

    Object.entries(svgFeatures).forEach(([feature, supported]) => {
        showResult(svgTests, feature, supported);
    });
});

function testWebGL(contextType) {
    const canvas = document.createElement('canvas');
    return !!(canvas.getContext(contextType));
}

function testCSSProperty(property, value) {
    const el = document.createElement('div');
    el.style[property] = value;
    return el.style[property] === value;
}

function testSVGAnimation() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    return 'animate' in svg;
}

function testSVGFilters() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const filter = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    return 'filter' in svg && filter instanceof SVGElement;
}

function showResult(container, feature, supported) {
    const div = document.createElement('div');
    div.className = `test-result ${supported ? 'success' : 'failure'}`;
    div.textContent = `${feature}: ${supported === true || supported === false ? 
        (supported ? 'Supported' : 'Not Supported') : supported}`;
    container.appendChild(div);
} 