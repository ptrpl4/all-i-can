document.addEventListener('DOMContentLoaded', () => {
    // Test WebAuthn support
    const webauthnTests = document.getElementById('webauthnTests');
    
    // Check basic WebAuthn availability
    const hasWebAuthn = 'credentials' in navigator && 'PublicKeyCredential' in window;
    showResult(webauthnTests, 'WebAuthn Basic Support', hasWebAuthn);

    if (hasWebAuthn && PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
        PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable().then(available => {
            showResult(webauthnTests, 'Platform Authenticator', available);
        }).catch(() => {
            showResult(webauthnTests, 'Platform Authenticator', false);
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
            {
                name: 'RSA-OAEP',
                params: { name: 'RSA-OAEP', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
                usage: ['encrypt', 'decrypt']
            },
            {
                name: 'AES-GCM',
                params: { name: 'AES-GCM', length: 256 },
                usage: ['encrypt', 'decrypt']
            },
            {
                name: 'ECDSA',
                params: { name: 'ECDSA', namedCurve: 'P-256' },
                usage: ['sign', 'verify']
            }
        ];

        algorithms.forEach(algo => {
            window.crypto.subtle.generateKey(algo.params, true, algo.usage).then(() => {
                showResult(cryptoTests, `${algo.name} Algorithm`, true);
            }).catch(() => {
                showResult(cryptoTests, `${algo.name} Algorithm`, false);
            });
        });

        window.crypto.subtle.digest('SHA-256', new Uint8Array([1, 2, 3])).then(() => {
            showResult(cryptoTests, 'SHA-256 Digest', true);
        }).catch(() => {
            showResult(cryptoTests, 'SHA-256 Digest', false);
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

    // HSTS is a server header — check if we're on HTTPS as a proxy indicator
    const hasHSTS = window.location.protocol === 'https:';
    showResult(securityFeatureTests, 'HTTPS (HSTS-eligible)', hasHSTS);
});

function showResult(container, feature, supported) {
    const div = document.createElement('div');
    div.className = `test-result ${supported ? 'success' : 'failure'}`;
    div.textContent = `${feature}: ${supported === true || supported === false ?
        (supported ? 'Supported' : 'Not Supported') : supported}`;
    container.appendChild(div);
}