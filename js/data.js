document.addEventListener('DOMContentLoaded', () => {
    const { showResult } = window.BrowserTester;

    // Browser Information
    const browserInfo = document.getElementById('browserInfo');
    const browserData = {
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
    };
    displayData(browserInfo, browserData);

    // System Information
    const systemInfo = document.getElementById('systemInfo');
    const systemData = {
        'Operating System': getOS(),
        'CPU Cores': navigator.hardwareConcurrency,
        'Device Memory': navigator.deviceMemory != null ? navigator.deviceMemory + ' GB' : 'Not available',
        'Screen Resolution': `${window.screen.width}x${window.screen.height}`,
        'Color Depth': window.screen.colorDepth + ' bits',
        'Pixel Ratio': window.devicePixelRatio,
        'Screen Orientation': screen.orientation?.type,
        'System Theme': window.matchMedia('(prefers-color-scheme: dark)').matches ? 'Dark' : 'Light'
    };
    displayData(systemInfo, systemData);

    // Network Information
    const networkInfo = document.getElementById('networkInfo');
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn) {
        const networkData = {
            'Connection Type': conn.effectiveType || null,
            'Downlink Speed': conn.downlink != null ? conn.downlink + ' Mbps' : null,
            'Round Trip Time': conn.rtt != null ? conn.rtt + ' ms' : null,
            'Save Data Mode': conn.saveData != null ? (conn.saveData ? 'Enabled' : 'Disabled') : null,
            'Network Type': conn.type || null
        };
        displayData(networkInfo, networkData);
    } else {
        displayData(networkInfo, { 'Network Information API': 'Not available' });
    }

    // Location & Sensors
    const locationInfo = document.getElementById('locationInfo');
    if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const locationData = {
                    'Latitude': position.coords.latitude,
                    'Longitude': position.coords.longitude,
                    'Accuracy': position.coords.accuracy + ' meters',
                    'Altitude': position.coords.altitude,
                    'Speed': position.coords.speed,
                    'Timestamp': new Date(position.timestamp).toLocaleString()
                };
                displayData(locationInfo, locationData);
            },
            () => {
                displayData(locationInfo, {'Location Access': 'Denied or Not Available'});
            }
        );
    }

    // Device Information
    const deviceInfo = document.getElementById('deviceInfo');
    const deviceData = {
        'Device Type': getDeviceType(),
        'Touch Support': 'ontouchstart' in window,
        'Battery Support': 'getBattery' in navigator,
        'Vibration Support': 'vibrate' in navigator,
        'Bluetooth Support': 'bluetooth' in navigator,
        'USB Support': 'usb' in navigator,
        'WebGL Support': !!document.createElement('canvas').getContext('webgl'),
        'Audio Support': 'AudioContext' in window,
        'Speech Recognition': 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
    };
    displayData(deviceInfo, deviceData);

    // User Preferences
    const preferencesInfo = document.getElementById('preferencesInfo');
    const preferencesData = {
        'Color Scheme': window.matchMedia('(prefers-color-scheme: dark)').matches ? 'Dark' : 'Light',
        'Reduced Motion': window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'Enabled' : 'Disabled',
        'Reduced Data': window.matchMedia('(prefers-reduced-data: reduce)').matches ? 'Enabled' : 'Disabled',
        'Contrast': window.matchMedia('(prefers-contrast: high)').matches ? 'High' : 'Normal',
        'Language': navigator.language,
        'Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone,
        'Time Format': new Date().toLocaleTimeString(),
        'Date Format': new Date().toLocaleDateString()
    };
    displayData(preferencesInfo, preferencesData);
});

function displayData(container, data) {
    Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            window.BrowserTester.showResult(container, key, String(value));
        }
    });
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
