document.addEventListener('DOMContentLoaded', () => {
    const { showInfo, showPending, updateResult, runSection } = window.BrowserTester;

    // Browser Information
    const browserInfo = document.getElementById('browserInfo');
    runSection('Browser Information', browserInfo, () => {
        displayData(browserInfo, {
            'User Agent': navigator.userAgent,
            'Browser Language': navigator.language,
            'Browser Languages': navigator.languages?.join(', '),
            'Cookies Enabled': navigator.cookieEnabled,
            'Do Not Track': navigator.doNotTrack,
            'Plugins Count': navigator.plugins?.length,
            'Maximum Touch Points': navigator.maxTouchPoints,
            'PDF Viewer Built-in': navigator.pdfViewerEnabled,
            'Browser Vendor': navigator.vendor,
            'Browser Version': navigator.appVersion,
            'Browser Platform Hint': getPlatformHint()
        });
    });

    // System Information
    const systemInfo = document.getElementById('systemInfo');
    runSection('System Information', systemInfo, () => {
        displayData(systemInfo, {
            'Operating System': getOS(),
            'CPU Cores': navigator.hardwareConcurrency,
            'Device Memory': navigator.deviceMemory != null ? navigator.deviceMemory + ' GB' : 'Not available',
            'Screen Resolution': `${window.screen.width}x${window.screen.height}`,
            'Color Depth': window.screen.colorDepth + ' bits',
            'Pixel Ratio': window.devicePixelRatio,
            'Screen Orientation': screen.orientation?.type,
            'System Theme': window.matchMedia('(prefers-color-scheme: dark)').matches ? 'Dark' : 'Light'
        });
    });

    // Network Information
    const networkInfo = document.getElementById('networkInfo');
    runSection('Network Information', networkInfo, () => {
        const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        if (!conn) {
            displayData(networkInfo, { 'Network Information API': 'Not available' });
            return;
        }

        displayData(networkInfo, {
            'Connection Type': conn.effectiveType || null,
            'Downlink Speed': conn.downlink != null ? conn.downlink + ' Mbps' : null,
            'Round Trip Time': conn.rtt != null ? conn.rtt + ' ms' : null,
            'Save Data Mode': conn.saveData != null ? (conn.saveData ? 'Enabled' : 'Disabled') : null,
            'Network Type': conn.type || null
        });
    });

    // Location & Sensors — requesting a position prompts for permission, so it
    // runs on demand rather than on page load.
    const locationInfo = document.getElementById('locationInfo');
    runSection('Location & Sensors', locationInfo, () => {
        if (!('geolocation' in navigator)) {
            displayData(locationInfo, { 'Geolocation API': 'Not available' });
            return;
        }

        showInfo(locationInfo, 'Geolocation API', 'Available. Reading a position asks for permission, so it only runs when requested.');

        const requestButton = document.createElement('button');
        requestButton.type = 'button';
        requestButton.className = 'action-btn';
        requestButton.textContent = 'Request location';
        locationInfo.appendChild(requestButton);

        // Rows land below the button, and a repeat request rewrites them
        // instead of appending a second set.
        const positionOutput = document.createElement('div');
        locationInfo.appendChild(positionOutput);

        requestButton.addEventListener('click', () => {
            requestButton.disabled = true;
            positionOutput.textContent = '';
            const pending = showPending(positionOutput, 'Current Position');

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    requestButton.disabled = false;
                    updateResult(pending, 'Current Position', 'Received');
                    displayData(positionOutput, {
                        'Latitude': position.coords.latitude,
                        'Longitude': position.coords.longitude,
                        'Accuracy': position.coords.accuracy + ' meters',
                        'Altitude': position.coords.altitude,
                        'Speed': position.coords.speed,
                        'Timestamp': new Date(position.timestamp).toLocaleString()
                    });
                },
                (error) => {
                    requestButton.disabled = false;
                    updateResult(pending, 'Current Position', `Denied or unavailable (${error.message})`);
                },
                // Without a timeout the request hangs indefinitely on a device
                // with no location provider, stranding the row on "Running...".
                { timeout: 10000 }
            );
        });
    });

    // Device Information
    const deviceInfo = document.getElementById('deviceInfo');
    runSection('Device Information', deviceInfo, () => {
        displayData(deviceInfo, {
            'Device Type': getDeviceType(),
            'Touch Support': 'ontouchstart' in window,
            'Battery Support': 'getBattery' in navigator,
            'Vibration Support': 'vibrate' in navigator,
            'Bluetooth Support': 'bluetooth' in navigator,
            'USB Support': 'usb' in navigator,
            'WebGL Support': testWebGLSupport(),
            'Audio Support': 'AudioContext' in window,
            'Speech Recognition': 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
        });
    });

    // User Preferences
    const preferencesInfo = document.getElementById('preferencesInfo');
    runSection('User Preferences', preferencesInfo, () => {
        displayData(preferencesInfo, {
            'Color Scheme': window.matchMedia('(prefers-color-scheme: dark)').matches ? 'Dark' : 'Light',
            'Reduced Motion': window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'Enabled' : 'Disabled',
            'Reduced Data': window.matchMedia('(prefers-reduced-data: reduce)').matches ? 'Enabled' : 'Disabled',
            'Contrast': window.matchMedia('(prefers-contrast: high)').matches ? 'High' : 'Normal',
            'Language': navigator.language,
            'Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone,
            'Time Format': new Date().toLocaleTimeString(),
            'Date Format': new Date().toLocaleDateString()
        });
    });
});

function displayData(container, data) {
    Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            window.BrowserTester.showResult(container, key, String(value));
        }
    });
}

// Released immediately: contexts are a limited per-document resource.
function testWebGLSupport() {
    const gl = document.createElement('canvas').getContext('webgl');
    if (!gl) {
        return false;
    }

    const lose = gl.getExtension('WEBGL_lose_context');
    if (lose) {
        lose.loseContext();
    }
    return true;
}

function getOS() {
    const userAgent = window.navigator.userAgent;
    const userAgentDataPlatform = navigator.userAgentData && navigator.userAgentData.platform;

    if (userAgentDataPlatform) {
        return userAgentDataPlatform;
    } else if (/iPhone|iPad|iPod/.test(userAgent)) {
        return 'iOS';
    } else if (/Mac OS X|Macintosh/.test(userAgent)) {
        return 'macOS';
    } else if (/Windows/.test(userAgent)) {
        return 'Windows';
    } else if (/Android/.test(userAgent)) {
        return 'Android';
    } else if (/Linux|X11/.test(userAgent)) {
        return 'Linux';
    }
    return 'Unknown';
}

function getPlatformHint() {
    if (navigator.userAgentData && navigator.userAgentData.platform) {
        return navigator.userAgentData.platform;
    }

    return 'Not exposed';
}

function getDeviceType() {
    const ua = navigator.userAgent;
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        return "Tablet";
    }
    if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
        return "Mobile";
    }
    return "Desktop";
}
