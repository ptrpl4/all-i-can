document.addEventListener('DOMContentLoaded', () => {
    // Test WebAuthn support
    const webauthnTests = document.getElementById('webauthnTests');
    
    // Check basic WebAuthn availability
    const hasWebAuthn = 'credentials' in navigator && 'PublicKeyCredential' in window;
    showResult(webauthnTests, 'WebAuthn Basic Support', hasWebAuthn);

    if (hasWebAuthn) {
        // Check if platform authenticator is available
        navigator.credentials.get({
            publicKey: {
                challenge: new Uint8Array(32),
                rpId: window.location.hostname,
                allowCredentials: []
            }
        }).catch(error => {
            const isPlatformAuthAvailable = error.name !== 'NotSupportedError';
            showResult(webauthnTests, 'Platform Authenticator', isPlatformAuthAvailable);
        });
    }

    // Test Crypto API support
    const cryptoTests = document.getElementById('cryptoTests');
    
    // Check for basic crypto support
    const hasCrypto = 'crypto' in window;
    showResult(cryptoTests, 'Basic Crypto API', hasCrypto);

    // Check for subtle crypto
    const hasSubtleCrypto = hasCrypto && 'subtle' in window.crypto;
    showResult(cryptoTests, 'Subtle Crypto API', hasSubtleCrypto);

    // Test specific algorithms
    if (hasSubtleCrypto) {
        const algorithms = [
            { name: 'RSA-OAEP', usage: ['encrypt', 'decrypt'] },
            { name: 'AES-GCM', usage: ['encrypt', 'decrypt'] },
            { name: 'ECDSA', usage: ['sign', 'verify'] },
            { name: 'SHA-256', usage: ['digest'] }
        ];

        algorithms.forEach(algo => {
            window.crypto.subtle.generateKey(
                {
                    name: algo.name,
                    modulusLength: 2048,
                    publicExponent: new Uint8Array([1, 0, 1]),
                    hash: 'SHA-256'
                },
                true,
                algo.usage
            ).then(() => {
                showResult(cryptoTests, `${algo.name} Algorithm`, true);
            }).catch(() => {
                showResult(cryptoTests, `${algo.name} Algorithm`, false);
            });
        });
    }

    // Test security features
    const securityFeatureTests = document.getElementById('securityFeatureTests');
    
    // Check Content Security Policy support
    const hasCSP = 'SecurityPolicyViolationEvent' in window;
    showResult(securityFeatureTests, 'Content Security Policy', hasCSP);

    // Check Secure Context
    const isSecureContext = window.isSecureContext;
    showResult(securityFeatureTests, 'Secure Context', isSecureContext);

    // Check Cross-Origin Isolation
    const isCrossOriginIsolated = window.crossOriginIsolated;
    showResult(securityFeatureTests, 'Cross-Origin Isolation', isCrossOriginIsolated);

    // Check Permissions API
    const hasPermissionsAPI = 'permissions' in navigator;
    showResult(securityFeatureTests, 'Permissions API', hasPermissionsAPI);

    // Check HTTP Strict Transport Security support
    const hasHSTS = 'Strict-Transport-Security' in (document.createElement('meta')).dataset;
    showResult(securityFeatureTests, 'HSTS Support', hasHSTS);
});

function showResult(container, feature, supported) {
    const div = document.createElement('div');
    div.className = `test-result ${supported ? 'success' : 'failure'}`;
    div.textContent = `${feature}: ${supported ? 'Supported' : 'Not Supported'}`;
    container.appendChild(div);
} 