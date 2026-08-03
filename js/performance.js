document.addEventListener('DOMContentLoaded', () => {
    const { showResult, showPending, updateResult, markError, runSection } = window.BrowserTester;

    const jsPerformance = document.getElementById('jsPerformance');
    const domPerformance = document.getElementById('domPerformance');
    const networkPerformance = document.getElementById('networkPerformance');
    const memoryTests = document.getElementById('memoryTests');

    // Queue a benchmark behind a pending row, then resolve that row in place
    function queueBenchmark(container, label, fn) {
        const placeholder = showPending(container, label);
        scheduleTask(() => {
            try {
                updateResult(placeholder, label, `${fn().toFixed(2)}ms`);
            } catch (error) {
                markError(placeholder, label, `Benchmark errored: ${error.message}`);
                console.error(`[${label}]`, error);
            }
        });
    }

    runSection('JavaScript Performance', jsPerformance, () => {
        const jsBenchmarks = [
            { label: 'Array Operations', fn: testArrayOperations },
            { label: 'Object Operations', fn: testObjectOperations },
            { label: 'Math Operations', fn: testMathOperations },
        ];

        jsBenchmarks.forEach(({ label, fn }) => queueBenchmark(jsPerformance, label, fn));
    });

    // DOM benchmarks — run after JS benchmarks to avoid contention
    runSection('DOM Operations', domPerformance, () => {
        const domBenchmarks = [
            { label: 'DOM Creation (1000 elements)', fn: testDOMCreation },
            { label: 'DOM Manipulation', fn: testDOMManipulation },
            { label: 'Event Handling', fn: testEventHandling },
        ];

        domBenchmarks.forEach(({ label, fn }) => queueBenchmark(domPerformance, label, fn));
    });

    // Network — use navigator.connection if available, no cross-origin fetch
    runSection('Network Capabilities', networkPerformance, () => {
        showNetworkInfo(networkPerformance);
    });

    runSection('Memory Usage', memoryTests, () => {
        if (performance.memory) {
            showResult(memoryTests, 'Heap Size Limit', formatBytes(performance.memory.jsHeapSizeLimit));
            showResult(memoryTests, 'Total Heap Size', formatBytes(performance.memory.totalJSHeapSize));
            showResult(memoryTests, 'Used Heap Size', formatBytes(performance.memory.usedJSHeapSize));
        } else {
            showResult(memoryTests, 'Memory API', 'Not available');
        }
    });
});

// Queue tasks so they don't all run in one long frame
let taskQueue = Promise.resolve();
function scheduleTask(fn) {
    taskQueue = taskQueue.then(() => new Promise(resolve => {
        const run = 'requestIdleCallback' in window
            ? cb => requestIdleCallback(cb, { timeout: 2000 })
            : cb => setTimeout(cb, 0);
        run(() => { fn(); resolve(); });
    }));
}

function showNetworkInfo(container) {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!conn) {
        window.BrowserTester.showResult(container, 'Network Information API', 'Not available');
        return;
    }
    if (conn.downlink != null)  window.BrowserTester.showResult(container, 'Downlink', `${conn.downlink} Mbps`);
    if (conn.rtt != null)       window.BrowserTester.showResult(container, 'Round-Trip Time', `${conn.rtt}ms`);
    if (conn.effectiveType)     window.BrowserTester.showResult(container, 'Effective Type', conn.effectiveType);
    if (conn.saveData != null)  window.BrowserTester.showResult(container, 'Save Data Mode', conn.saveData ? 'On' : 'Off');
}

function testArrayOperations() {
    const start = performance.now();
    const arr = [];
    for (let i = 0; i < 100000; i++) arr.push(i);
    arr.sort((a, b) => b - a);
    arr.filter(x => x % 2 === 0);
    arr.map(x => x * 2);
    return performance.now() - start;
}

function testObjectOperations() {
    const start = performance.now();
    const obj = {};
    for (let i = 0; i < 100000; i++) obj[`key${i}`] = i;
    Object.keys(obj).forEach(key => obj[key] *= 2);
    return performance.now() - start;
}

function testMathOperations() {
    const start = performance.now();
    for (let i = 0; i < 100000; i++) {
        Math.sqrt(i); Math.sin(i); Math.cos(i); Math.pow(i, 2);
    }
    return performance.now() - start;
}

function testDOMCreation() {
    const start = performance.now();
    const container = document.createElement('div');
    for (let i = 0; i < 1000; i++) {
        const el = document.createElement('div');
        el.textContent = `Element ${i}`;
        container.appendChild(el);
    }
    return performance.now() - start;
}

function testDOMManipulation() {
    const start = performance.now();
    const container = document.createElement('div');
    container.style.display = 'none';
    document.body.appendChild(container);
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < 1000; i++) {
        const el = document.createElement('div');
        el.textContent = `Element ${i}`;
        fragment.appendChild(el);
    }
    container.appendChild(fragment);
    document.body.removeChild(container);
    return performance.now() - start;
}

function testEventHandling() {
    const start = performance.now();
    const el = document.createElement('div');
    const handler = () => {};
    for (let i = 0; i < 1000; i++) {
        el.addEventListener('click', handler);
        el.removeEventListener('click', handler);
    }
    return performance.now() - start;
}

function formatBytes(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
}
