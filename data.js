document.addEventListener('DOMContentLoaded', () => {
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
        'Browser Platform': navigator.platform
    };
    displayData(browserInfo, browserData);

    // System Information
    const systemInfo = document.getElementById('systemInfo');
    const systemData = {
        'Operating System': getOS(),
        'CPU Cores': navigator.hardwareConcurrency,
        'Device Memory': navigator.deviceMemory + ' GB',
        'Screen Resolution': `${window.screen.width}x${window.screen.height}`,
        'Color Depth': window.screen.colorDepth + ' bits',
        'Pixel Ratio': window.devicePixelRatio,
        'Screen Orientation': screen.orientation?.type,
        'System Theme': window.matchMedia('(prefers-color-scheme: dark)').matches ? 'Dark' : 'Light'
    };
    displayData(systemInfo, systemData);

    // Network Information
    const networkInfo = document.getElementById('networkInfo');
    if ('connection' in navigator) {
        const conn = navigator.connection;
        const networkData = {
            'Connection Type': conn.effectiveType,
            'Downlink Speed': conn.downlink + ' Mbps',
            'Round Trip Time': conn.rtt + ' ms',
            'Save Data Mode': conn.saveData ? 'Enabled' : 'Disabled',
            'Network Type': conn.type
        };
        displayData(networkInfo, networkData);
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
            const div = document.createElement('div');
            div.className = 'test-result success';
            div.innerHTML = `<strong>${key}:</strong> ${value}`;
            container.appendChild(div);
        }
    });
}

function getOS() {
    const userAgent = window.navigator.userAgent;
    const platform = window.navigator.platform;
    const macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];
    const windowsPlatforms = ['Win32', 'Win64', 'Windows', 'WinCE'];
    const iosPlatforms = ['iPhone', 'iPad', 'iPod'];

    if (macosPlatforms.indexOf(platform) !== -1) {
        return 'macOS';
    } else if (iosPlatforms.indexOf(platform) !== -1) {
        return 'iOS';
    } else if (windowsPlatforms.indexOf(platform) !== -1) {
        return 'Windows';
    } else if (/Android/.test(userAgent)) {
        return 'Android';
    } else if (/Linux/.test(platform)) {
        return 'Linux';
    }
    return 'Unknown';
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