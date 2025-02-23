document.addEventListener('DOMContentLoaded', () => {
    // Test Storage APIs
    const storageTests = document.getElementById('storageTests');
    
    // LocalStorage
    const hasLocalStorage = 'localStorage' in window;
    showResult(storageTests, 'LocalStorage', hasLocalStorage);

    // SessionStorage
    const hasSessionStorage = 'sessionStorage' in window;
    showResult(storageTests, 'SessionStorage', hasSessionStorage);

    // IndexedDB
    const hasIndexedDB = 'indexedDB' in window;
    showResult(storageTests, 'IndexedDB', hasIndexedDB);

    // Cache API
    const hasCacheAPI = 'caches' in window;
    showResult(storageTests, 'Cache API', hasCacheAPI);

    // Test Device APIs
    const deviceTests = document.getElementById('deviceTests');

    // Geolocation
    const hasGeolocation = 'geolocation' in navigator;
    showResult(deviceTests, 'Geolocation', hasGeolocation);

    // Device Orientation
    const hasDeviceOrientation = 'DeviceOrientationEvent' in window;
    showResult(deviceTests, 'Device Orientation', hasDeviceOrientation);

    // Battery Status
    const hasBattery = 'getBattery' in navigator;
    showResult(deviceTests, 'Battery Status', hasBattery);

    // Vibration
    const hasVibration = 'vibrate' in navigator;
    showResult(deviceTests, 'Vibration', hasVibration);

    // Test Communication APIs
    const communicationTests = document.getElementById('communicationTests');

    // WebSocket
    const hasWebSocket = 'WebSocket' in window;
    showResult(communicationTests, 'WebSocket', hasWebSocket);

    // WebRTC
    const hasWebRTC = 'RTCPeerConnection' in window;
    showResult(communicationTests, 'WebRTC', hasWebRTC);

    // Fetch API
    const hasFetch = 'fetch' in window;
    showResult(communicationTests, 'Fetch API', hasFetch);

    // Server-Sent Events
    const hasSSE = 'EventSource' in window;
    showResult(communicationTests, 'Server-Sent Events', hasSSE);

    // Test Performance APIs
    const performanceTests = document.getElementById('performanceTests');

    // Performance API
    const hasPerformance = 'performance' in window;
    showResult(performanceTests, 'Performance API', hasPerformance);

    // RequestAnimationFrame
    const hasRAF = 'requestAnimationFrame' in window;
    showResult(performanceTests, 'RequestAnimationFrame', hasRAF);

    // Web Workers
    const hasWebWorkers = 'Worker' in window;
    showResult(performanceTests, 'Web Workers', hasWebWorkers);

    // SharedArrayBuffer (Parallel Processing)
    const hasSharedArrayBuffer = 'SharedArrayBuffer' in window;
    showResult(performanceTests, 'SharedArrayBuffer', hasSharedArrayBuffer);

    // Additional Modern APIs
    if (hasPerformance) {
        // Navigation Timing API
        const hasNavigationTiming = 'PerformanceNavigationTiming' in window;
        showResult(performanceTests, 'Navigation Timing', hasNavigationTiming);

        // Resource Timing API
        const hasResourceTiming = 'PerformanceResourceTiming' in window;
        showResult(performanceTests, 'Resource Timing', hasResourceTiming);
    }
});

function showResult(container, feature, supported) {
    const div = document.createElement('div');
    div.className = `test-result ${supported ? 'success' : 'failure'}`;
    div.textContent = `${feature}: ${supported ? 'Supported' : 'Not Supported'}`;
    container.appendChild(div);
} 