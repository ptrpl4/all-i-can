document.addEventListener('DOMContentLoaded', () => {
    // JavaScript Performance Tests
    const jsPerformance = document.getElementById('jsPerformance');
    
    // Test array operations
    const arrayOpsTime = testArrayOperations();
    showResult(jsPerformance, 'Array Operations', `${arrayOpsTime.toFixed(2)}ms`);

    // Test object operations
    const objectOpsTime = testObjectOperations();
    showResult(jsPerformance, 'Object Operations', `${objectOpsTime.toFixed(2)}ms`);

    // Test math operations
    const mathOpsTime = testMathOperations();
    showResult(jsPerformance, 'Math Operations', `${mathOpsTime.toFixed(2)}ms`);

    // DOM Performance Tests
    const domPerformance = document.getElementById('domPerformance');
    
    // Test DOM creation
    const domCreationTime = testDOMCreation();
    showResult(domPerformance, 'DOM Creation (1000 elements)', `${domCreationTime.toFixed(2)}ms`);

    // Test DOM manipulation
    const domManipulationTime = testDOMManipulation();
    showResult(domPerformance, 'DOM Manipulation', `${domManipulationTime.toFixed(2)}ms`);

    // Test event handling
    const eventHandlingTime = testEventHandling();
    showResult(domPerformance, 'Event Handling', `${eventHandlingTime.toFixed(2)}ms`);

    // Network Performance Tests
    const networkPerformance = document.getElementById('networkPerformance');
    
    // Test download speed
    testDownloadSpeed().then(speed => {
        showResult(networkPerformance, 'Download Speed', `${speed.toFixed(2)} Mbps`);
    });

    // Test latency
    testLatency().then(latency => {
        showResult(networkPerformance, 'Latency', `${latency.toFixed(2)}ms`);
    });

    // Memory Tests
    const memoryTests = document.getElementById('memoryTests');
    
    if (performance.memory) {
        showResult(memoryTests, 'Heap Size Limit', formatBytes(performance.memory.jsHeapSizeLimit));
        showResult(memoryTests, 'Total Heap Size', formatBytes(performance.memory.totalJSHeapSize));
        showResult(memoryTests, 'Used Heap Size', formatBytes(performance.memory.usedJSHeapSize));
    } else {
        showResult(memoryTests, 'Memory API', 'Not Available');
    }
});

function testArrayOperations() {
    const start = performance.now();
    const arr = [];
    for (let i = 0; i < 100000; i++) {
        arr.push(i);
    }
    arr.sort((a, b) => b - a);
    arr.filter(x => x % 2 === 0);
    arr.map(x => x * 2);
    return performance.now() - start;
}

function testObjectOperations() {
    const start = performance.now();
    const obj = {};
    for (let i = 0; i < 100000; i++) {
        obj[`key${i}`] = i;
    }
    Object.keys(obj).forEach(key => obj[key] *= 2);
    return performance.now() - start;
}

function testMathOperations() {
    const start = performance.now();
    for (let i = 0; i < 100000; i++) {
        Math.sqrt(i);
        Math.sin(i);
        Math.cos(i);
        Math.pow(i, 2);
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
    document.body.appendChild(container);
    for (let i = 0; i < 1000; i++) {
        container.innerHTML += `<div>Element ${i}</div>`;
    }
    document.body.removeChild(container);
    return performance.now() - start;
}

function testEventHandling() {
    const start = performance.now();
    const el = document.createElement('div');
    for (let i = 0; i < 1000; i++) {
        el.addEventListener('click', () => {});
        el.removeEventListener('click', () => {});
    }
    return performance.now() - start;
}

async function testDownloadSpeed() {
    const startTime = performance.now();
    const response = await fetch('https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png');
    const blob = await response.blob();
    const endTime = performance.now();
    const durationInSeconds = (endTime - startTime) / 1000;
    const fileSizeInBits = blob.size * 8;
    return fileSizeInBits / durationInSeconds / 1000000; // Convert to Mbps
}

async function testLatency() {
    const start = performance.now();
    await fetch('https://www.google.com/generate_204');
    return performance.now() - start;
}

function formatBytes(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
}

function showResult(container, feature, value) {
    const div = document.createElement('div');
    div.className = 'test-result success';
    div.textContent = `${feature}: ${value}`;
    container.appendChild(div);
} 