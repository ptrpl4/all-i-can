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

    // Add Hardware Acceleration Tests
    const hardwareTests = document.getElementById('hardwareTests');
    const hardwareFeatures = testHardwareAcceleration();
    Object.entries(hardwareFeatures).forEach(([feature, supported]) => {
        showResult(hardwareTests, feature, supported);
    });

    // Add Font Tests
    const fontTests = document.getElementById('fontTests');
    const fontFeatures = testFontCapabilities();
    Object.entries(fontFeatures).forEach(([feature, supported]) => {
        showResult(fontTests, feature, supported);
    });

    // Create Visual Demos
    createWebGLDemo();
    createCanvasDemo();
    createCSSDemo();
    createSVGDemo();
    createFontDemo();
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

function createWebGLDemo() {
    const container = document.getElementById('webglDemo');
    const canvas = document.createElement('canvas');
    canvas.className = 'demo-canvas';
    canvas.width = 300;
    canvas.height = 300;
    container.appendChild(canvas);

    const gl = canvas.getContext('webgl');
    if (!gl) return;

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

    // Initialize shaders and start animation
    initShaderProgram(gl, vsSource, fsSource);
    // ... (WebGL initialization code)
}

function createCanvasDemo() {
    const container = document.getElementById('canvasDemo');
    const canvas = document.createElement('canvas');
    canvas.className = 'demo-canvas';
    canvas.width = 300;
    canvas.height = 300;
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let frame = 0;

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw animated patterns
        for(let i = 0; i < 12; i++) {
            ctx.beginPath();
            ctx.arc(
                150 + Math.cos(frame/50 + i) * 50,
                150 + Math.sin(frame/50 + i) * 50,
                10,
                0,
                Math.PI * 2
            );
            ctx.fillStyle = `hsl(${frame + i * 30}, 70%, 50%)`;
            ctx.fill();
        }

        frame++;
        requestAnimationFrame(animate);
    }

    animate();
}

function createCSSDemo() {
    const container = document.getElementById('cssDemo');
    const demo = document.createElement('div');
    demo.innerHTML = `
        <div class="css-demo-item" style="
            width: 100px;
            height: 100px;
            background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
            border-radius: 10px;
            animation: rotate 3s infinite linear;
            transform-style: preserve-3d;
        "></div>
    `;
    container.appendChild(demo);

    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes rotate {
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

    // Create animated SVG content
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
            <animate attributeName="r" values="20;25;20" dur="2s" repeatCount="indefinite"/>
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
            <p class="font-sample" style="writing-mode: vertical-rl;">Vertical Text: こんにちは世界</p>
            <p class="font-sample" style="direction: rtl;">RTL Text: مرحبا بالعالم</p>
        </div>
    `;
}

// Add helper functions for WebGL initialization... 

function testHardwareAcceleration() {
    return {
        'Hardware Acceleration': testWebGL('webgl'),
        'GPU Compositing': CSS.supports('transform', 'translate3d(0,0,0)'),
        'WebGL2 Support': testWebGL('webgl2'),
        'Canvas Hardware Acceleration': testCanvasHardwareAcceleration()
    };
}

function testCanvasHardwareAcceleration() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { alpha: false });
    return ctx && ctx.getContextAttributes().alpha === false;
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

function testEmojiSupport() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.fillText('😀', 0, 0);
    return ctx.getImageData(0, 0, 1, 1).data[3] !== 0;
}

// Complete WebGL demo implementation
function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

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
    function render() {
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        const fieldOfView = 45 * Math.PI / 180;
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const projectionMatrix = mat4.create();
        mat4.perspective(projectionMatrix, fieldOfView, aspect, 0.1, 100.0);

        const modelViewMatrix = mat4.create();
        mat4.translate(modelViewMatrix, modelViewMatrix, [0.0, 0.0, -6.0]);
        mat4.rotate(modelViewMatrix, modelViewMatrix, rotation, [1, 1, 1]);

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

        rotation += 0.02;
        requestAnimationFrame(render);
    }

    render();
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