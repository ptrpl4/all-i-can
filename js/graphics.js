document.addEventListener('DOMContentLoaded', () => {
    const { showResult, showInfo, runSection } = window.BrowserTester;

    // WebGL Tests
    const webglTests = document.getElementById('webglTests');

    runSection('WebGL Capabilities', webglTests, () => {
        const hasWebGL1 = testWebGL('webgl');
        showResult(webglTests, 'WebGL 1.0', hasWebGL1);
        showResult(webglTests, 'WebGL 2.0', testWebGL('webgl2'));

        if (hasWebGL1) {
            withWebGLContext('webgl', gl => {
                const { vendor, renderer } = readRendererStrings(gl);
                showResult(webglTests, 'GPU Vendor', vendor);
                showResult(webglTests, 'GPU Renderer', renderer);
                showResult(webglTests, 'WebGL Version', gl.getParameter(gl.VERSION));
                showResult(webglTests, 'Shader Version', gl.getParameter(gl.SHADING_LANGUAGE_VERSION));
            });
        }
    });

    // Canvas Features
    const canvasTests = document.getElementById('canvasTests');

    runSection('Canvas Features', canvasTests, () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        showResult(canvasTests, '2D Canvas', !!ctx);
        showResult(canvasTests, 'Path2D', 'Path2D' in window);
        showResult(canvasTests, 'ImageData', 'ImageData' in window);
        showResult(canvasTests, 'OffscreenCanvas', 'OffscreenCanvas' in window);
    });

    // CSS Features
    const cssTests = document.getElementById('cssTests');

    runSection('CSS Features', cssTests, () => {
        const cssFeatures = {
            'Grid': testCSSProperty('display', 'grid'),
            'Flexbox': testCSSProperty('display', 'flex'),
            'CSS Variables': testCustomProperties(),
            'Transform 3D': testCSSProperty('transform', 'translate3d(0,0,0)'),
            'Animations': testCSSProperty('animation', 'none'),
            'Transitions': testCSSProperty('transition', 'none'),
            'Media Queries': 'matchMedia' in window,
            'CSS Masks': testCSSProperty('-webkit-mask', 'none') || testCSSProperty('mask', 'none')
        };

        Object.entries(cssFeatures).forEach(([feature, supported]) => {
            showResult(cssTests, feature, supported);
        });
    });

    // SVG Support
    const svgTests = document.getElementById('svgTests');

    runSection('SVG Support', svgTests, () => {
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

    // Graphics Hardware
    const hardwareTests = document.getElementById('hardwareTests');

    runSection('Graphics Hardware', hardwareTests, () => {
        showInfo(hardwareTests, 'Scope', 'Browsers do not expose whether compositing or canvas painting is GPU-backed. These rows report the GPU strings the driver is willing to share, plus support for CSS properties commonly used to request a compositing layer.');

        const renderer = withWebGLContext('webgl', gl => readRendererStrings(gl));
        showResult(hardwareTests, 'Reported GPU Renderer', (renderer && renderer.renderer) || 'Not available');
        showResult(hardwareTests, 'Unmasked Renderer Exposed', Boolean(renderer && renderer.unmasked));
        showResult(hardwareTests, 'WebGL 2.0 Available', testWebGL('webgl2'));
        showResult(hardwareTests, 'Compositing Hint: translate3d', CSS.supports('transform', 'translate3d(0,0,0)'));
        showResult(hardwareTests, 'Compositing Hint: will-change', CSS.supports('will-change', 'transform'));
    });

    // Add Font Tests
    const fontTests = document.getElementById('fontTests');

    runSection('Font & Text Rendering', fontTests, () => {
        const fontFeatures = testFontCapabilities();
        Object.entries(fontFeatures).forEach(([feature, supported]) => {
            showResult(fontTests, feature, supported);
        });
    });

    // Create Visual Demos
    runSection('WebGL Demo', document.getElementById('webglDemo'), createWebGLDemo);
    runSection('Canvas Demo', document.getElementById('canvasDemo'), createCanvasDemo);
    runSection('CSS Demo', document.getElementById('cssDemo'), createCSSDemo);
    runSection('SVG Demo', document.getElementById('svgDemo'), createSVGDemo);
    runSection('Font Demo', document.getElementById('fontDemo'), createFontDemo);
});

// Demos animate only when the user has not asked for reduced motion.
function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function releaseContext(gl) {
    const lose = gl.getExtension('WEBGL_lose_context');
    if (lose) {
        lose.loseContext();
    }
}

// Contexts are a limited per-document resource, so probe contexts are always
// released rather than left for the browser to evict.
function withWebGLContext(contextType, fn) {
    const gl = document.createElement('canvas').getContext(contextType);
    if (!gl) {
        return undefined;
    }

    try {
        return fn(gl);
    } finally {
        releaseContext(gl);
    }
}

const webglSupport = {};
function testWebGL(contextType) {
    if (!(contextType in webglSupport)) {
        webglSupport[contextType] = withWebGLContext(contextType, () => true) === true;
    }
    return webglSupport[contextType];
}

function readRendererStrings(gl) {
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
        return {
            vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
            renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL),
            unmasked: true
        };
    }

    return {
        vendor: gl.getParameter(gl.VENDOR),
        renderer: gl.getParameter(gl.RENDERER),
        unmasked: false
    };
}

function testCSSProperty(property, value) {
    const el = document.createElement('div');
    el.style[property] = value;
    return el.style[property] === value;
}

// Custom properties are not CSSOM attributes, so they only round-trip through
// setProperty/getPropertyValue.
function testCustomProperties() {
    const el = document.createElement('div');
    el.style.setProperty('--browser-tester-probe', 'ok');
    return el.style.getPropertyValue('--browser-tester-probe').trim() === 'ok';
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

function showDemoMessage(container, message) {
    window.BrowserTester.showInfo(container, 'Demo', message);
}

function createWebGLDemo() {
    const container = document.getElementById('webglDemo');
    const canvas = document.createElement('canvas');
    canvas.className = 'demo-canvas';
    canvas.width = 300;
    canvas.height = 300;

    const gl = canvas.getContext('webgl');
    if (!gl) {
        showDemoMessage(container, 'WebGL is not available in this browser, so the rotating cube cannot render.');
        return;
    }

    container.appendChild(canvas);

    // Create a rotating cube
    const vsSource = `
        attribute vec4 aVertexPosition;
        attribute vec4 aVertexColor;
        uniform mat4 uModelViewMatrix;
        uniform mat4 uProjectionMatrix;
        varying lowp vec4 vColor;
        void main(void) {
            gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
            vColor = aVertexColor;
        }
    `;

    const fsSource = `
        varying lowp vec4 vColor;
        void main(void) {
            gl_FragColor = vColor;
        }
    `;

    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
    if (!shaderProgram) {
        canvas.remove();
        showDemoMessage(container, 'The demo shader program failed to compile or link. See the console for the driver log.');
        return;
    }

    startCubeDemo(gl, shaderProgram);
}

function createCanvasDemo() {
    const container = document.getElementById('canvasDemo');
    const canvas = document.createElement('canvas');
    canvas.className = 'demo-canvas';
    canvas.width = 300;
    canvas.height = 300;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        showDemoMessage(container, '2D canvas is not available in this browser.');
        return;
    }

    container.appendChild(canvas);

    let frame = 0;
    let rafId = null;

    function drawFrame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < 12; i++) {
            ctx.beginPath();
            ctx.arc(
                150 + Math.cos(frame / 50 + i) * 50,
                150 + Math.sin(frame / 50 + i) * 50,
                10, 0, Math.PI * 2
            );
            ctx.fillStyle = `hsl(${frame + i * 30}, 70%, 50%)`;
            ctx.fill();
        }
    }

    if (prefersReducedMotion()) {
        drawFrame();
        return;
    }

    function animate() {
        drawFrame();
        frame++;
        rafId = requestAnimationFrame(animate);
    }

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                if (!rafId) rafId = requestAnimationFrame(animate);
            } else {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
        });
        observer.observe(canvas);
    }

    rafId = requestAnimationFrame(animate);
}

function createCSSDemo() {
    const container = document.getElementById('cssDemo');
    const demo = document.createElement('div');
    const animated = !prefersReducedMotion();

    demo.innerHTML = `
        <div class="css-demo-item" style="
            width: 100px;
            height: 100px;
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
            border-radius: 10px;
            ${animated ? 'animation: browser-tester-rotate 3s infinite linear;' : ''}
            transform-style: preserve-3d;
        "></div>
    `;
    container.appendChild(demo);

    if (!animated || document.getElementById('browser-tester-demo-keyframes')) {
        return;
    }

    // Namespaced so the demo cannot collide with a page-level animation name
    const style = document.createElement('style');
    style.id = 'browser-tester-demo-keyframes';
    style.textContent = `
        @keyframes browser-tester-rotate {
            from { transform: rotate3d(1, 1, 1, 0deg); }
            to { transform: rotate3d(1, 1, 1, 360deg); }
        }
    `;
    document.head.appendChild(style);
}

function createSVGDemo() {
    const container = document.getElementById('svgDemo');
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '300');
    svg.setAttribute('height', '300');
    svg.setAttribute('viewBox', '0 0 100 100');

    const pulse = prefersReducedMotion()
        ? ''
        : '<animate attributeName="r" values="20;25;20" dur="2s" repeatCount="indefinite"/>';

    svg.innerHTML = `
        <defs>
            <filter id="glow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
        </defs>
        <circle cx="50" cy="50" r="20" fill="#4ecdc4" filter="url(#glow)">
            ${pulse}
        </circle>
    `;

    container.appendChild(svg);
}

function createFontDemo() {
    const container = document.getElementById('fontDemo');
    container.innerHTML = `
        <div class="font-samples">
            <p class="font-sample" style="font-family: system-ui;">System Font: The quick brown fox jumps over the lazy dog</p>
            <p class="font-sample" style="font-feature-settings: 'smcp' 1;">Small Caps: The quick brown fox jumps over the lazy dog</p>
            <p class="font-sample" lang="ja" style="writing-mode: vertical-rl;">Vertical Text: こんにちは世界</p>
            <p class="font-sample" lang="ar" style="direction: rtl;">RTL Text: مرحبا بالعالم</p>
        </div>
    `;
}

function testFontCapabilities() {
    return {
        'Font Loading API': 'FontFace' in window,
        'Variable Fonts': CSS.supports('font-variation-settings', 'normal'),
        'OpenType Features': CSS.supports('font-feature-settings', 'smcp'),
        'International Text': CSS.supports('writing-mode', 'vertical-rl'),
        'Emoji Support': testEmojiSupport(),
        'Custom Fonts': 'fonts' in document
    };
}

function paintGlyph(ctx, char) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillText(char, 0, 0);
    return ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height).data;
}

function testEmojiSupport() {
    const canvas = document.createElement('canvas');
    canvas.width = 24;
    canvas.height = 24;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        return false;
    }

    ctx.font = '18px sans-serif';
    ctx.textBaseline = 'top';

    const emoji = paintGlyph(ctx, '\u{1F600}');
    const painted = emoji.some((value, index) => index % 4 === 3 && value !== 0);
    if (!painted) {
        return false;
    }

    // A colour emoji font paints non-grey pixels. Nothing in the fallback path
    // does, so this alone settles the question.
    if (hasColorPixels(emoji)) {
        return true;
    }

    // Otherwise compare against an unassigned code point. U+E0000 has no font
    // coverage anywhere, so it takes the same fallback path an unsupported
    // emoji would. A noncharacter such as U+FFFF does not: engines special-case
    // noncharacters before font fallback, and may blank them while still
    // drawing a box for the emoji, which reads as support that isn't there.
    const fallback = paintGlyph(ctx, '\u{E0000}');
    return emoji.some((value, index) => value !== fallback[index]);
}

function hasColorPixels(data) {
    for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] !== 0 && (data[i] !== data[i + 1] || data[i + 1] !== data[i + 2])) {
            return true;
        }
    }
    return false;
}

// Complete WebGL demo implementation
function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    if (!vertexShader || !fragmentShader) {
        return null;
    }

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        gl.deleteProgram(shaderProgram);
        return null;
    }

    return shaderProgram;
}

function startCubeDemo(gl, shaderProgram) {
    const programInfo = {
        program: shaderProgram,
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
            vertexColor: gl.getAttribLocation(shaderProgram, 'aVertexColor'),
        },
        uniformLocations: {
            projectionMatrix: gl.getUniformLocation(shaderProgram, 'uProjectionMatrix'),
            modelViewMatrix: gl.getUniformLocation(shaderProgram, 'uModelViewMatrix'),
        },
    };

    // Create cube
    const positions = [
        // Front face
        -1.0, -1.0,  1.0,
         1.0, -1.0,  1.0,
         1.0,  1.0,  1.0,
        -1.0,  1.0,  1.0,
        // Back face
        -1.0, -1.0, -1.0,
        -1.0,  1.0, -1.0,
         1.0,  1.0, -1.0,
         1.0, -1.0, -1.0,
    ];

    const colors = [
        1.0, 0.0, 0.0, 1.0,    // red
        0.0, 1.0, 0.0, 1.0,    // green
        0.0, 0.0, 1.0, 1.0,    // blue
        1.0, 1.0, 0.0, 1.0,    // yellow
        1.0, 0.0, 1.0, 1.0,    // magenta
        0.0, 1.0, 1.0, 1.0,    // cyan
        0.5, 0.5, 0.5, 1.0,    // gray
        1.0, 1.0, 1.0, 1.0,    // white
    ];

    const indices = [
        0, 1, 2,    0, 2, 3,    // front
        4, 5, 6,    4, 6, 7,    // back
        0, 4, 7,    0, 7, 1,    // bottom
        3, 2, 6,    3, 6, 5,    // top
        0, 3, 5,    0, 5, 4,    // left
        1, 7, 6,    1, 6, 2,    // right
    ];

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    const colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    let rotation = 0;
    let rafId = null;

    function drawScene() {
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const fieldOfView = 45 * Math.PI / 180;
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const projectionMatrix = createPerspectiveMatrix(fieldOfView, aspect, 0.1, 100.0);
        const modelViewMatrix = multiplyMatrices(
            createTranslationMatrix(0.0, 0.0, -6.0),
            createRotationMatrix(rotation, [1, 1, 1])
        );

        gl.useProgram(programInfo.program);
        gl.uniformMatrix4fv(programInfo.uniformLocations.projectionMatrix, false, projectionMatrix);
        gl.uniformMatrix4fv(programInfo.uniformLocations.modelViewMatrix, false, modelViewMatrix);

        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);

        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.vertexAttribPointer(programInfo.attribLocations.vertexColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(programInfo.attribLocations.vertexColor);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
    }

    if (prefersReducedMotion()) {
        rotation = 0.6;
        drawScene();
        return;
    }

    function render() {
        drawScene();
        rotation += 0.02;
        rafId = requestAnimationFrame(render);
    }

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                if (!rafId) rafId = requestAnimationFrame(render);
            } else {
                cancelAnimationFrame(rafId);
                rafId = null;
            }
        });
        observer.observe(gl.canvas);
    }

    rafId = requestAnimationFrame(render);
}

function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

function createPerspectiveMatrix(fieldOfView, aspect, near, far) {
    const f = 1.0 / Math.tan(fieldOfView / 2);
    const rangeInv = 1 / (near - far);

    return new Float32Array([
        f / aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (near + far) * rangeInv, -1,
        0, 0, near * far * rangeInv * 2, 0
    ]);
}

function createTranslationMatrix(x, y, z) {
    return new Float32Array([
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        x, y, z, 1
    ]);
}

function createRotationMatrix(angle, axis) {
    const [x, y, z] = normalizeVector(axis);
    const s = Math.sin(angle);
    const c = Math.cos(angle);
    const t = 1 - c;

    return new Float32Array([
        x * x * t + c, y * x * t + z * s, z * x * t - y * s, 0,
        x * y * t - z * s, y * y * t + c, z * y * t + x * s, 0,
        x * z * t + y * s, y * z * t - x * s, z * z * t + c, 0,
        0, 0, 0, 1
    ]);
}

function multiplyMatrices(a, b) {
    const result = new Float32Array(16);

    for (let row = 0; row < 4; row++) {
        for (let col = 0; col < 4; col++) {
            let sum = 0;
            for (let i = 0; i < 4; i++) {
                sum += a[row + i * 4] * b[i + col * 4];
            }
            result[row + col * 4] = sum;
        }
    }

    return result;
}

function normalizeVector([x, y, z]) {
    const length = Math.hypot(x, y, z);
    if (length === 0) {
        return [0, 0, 1];
    }

    return [x / length, y / length, z / length];
}
