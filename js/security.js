document.addEventListener('DOMContentLoaded', () => {
    const { showResult, showInfo } = window.BrowserTester;

    // Test WebAuthn support
    const webauthnTests = document.getElementById('webauthnTests');
    
    // Check basic WebAuthn availability
    const hasWebAuthn = 'credentials' in navigator && 'PublicKeyCredential' in window;
    showResult(webauthnTests, 'WebAuthn API Surface', hasWebAuthn);

    if (hasWebAuthn && PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) {
        PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable().then(available => {
            showResult(webauthnTests, 'Platform Authenticator Availability', available);
        }).catch(() => {
            showInfo(webauthnTests, 'Platform Authenticator Availability', 'Unavailable or blocked in the current context.');
        });
    }

    // Test Crypto API support
    const cryptoTests = document.getElementById('cryptoTests');
    
    // Check for basic crypto support
    const hasCrypto = 'crypto' in window;
    showResult(cryptoTests, 'Crypto API Surface', hasCrypto);

    // Check for subtle crypto
    const hasSubtleCrypto = hasCrypto && 'subtle' in window.crypto;
    showResult(cryptoTests, 'SubtleCrypto API Surface', hasSubtleCrypto);

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
                showResult(cryptoTests, `${algo.name} Key Generation`, true);
            }).catch(() => {
                showResult(cryptoTests, `${algo.name} Key Generation`, false);
            });
        });

        window.crypto.subtle.digest('SHA-256', new Uint8Array([1, 2, 3])).then(() => {
            showResult(cryptoTests, 'SHA-256 Digest', true);
        }).catch(() => {
            showResult(cryptoTests, 'SHA-256 Digest', false);
        });
    }

    showInfo(cryptoTests, 'Scope', 'These checks run in the current page context. Server headers and deployment policy are reported separately below.');

    // Test security features
    const securityFeatureTests = document.getElementById('securityFeatureTests');
    
    // Check Content Security Policy reporting support
    const hasCSP = 'SecurityPolicyViolationEvent' in window;
    showResult(securityFeatureTests, 'SecurityPolicyViolationEvent Interface', hasCSP);

    // Check Secure Context
    const isSecureContext = window.isSecureContext;
    showResult(securityFeatureTests, 'Secure Context (Current Page)', isSecureContext);

    // Check Cross-Origin Isolation
    const isCrossOriginIsolated = window.crossOriginIsolated;
    showResult(securityFeatureTests, 'Cross-Origin Isolated (Current Page)', isCrossOriginIsolated);

    // Check Permissions API
    const hasPermissionsAPI = 'permissions' in navigator;
    showResult(securityFeatureTests, 'Permissions API Surface', hasPermissionsAPI);

    // HSTS is a server header — check if we're on HTTPS as a proxy indicator
    const isHttpsPage = window.location.protocol === 'https:';
    showResult(securityFeatureTests, 'HTTPS Page Load (Current Page)', isHttpsPage);
    showInfo(securityFeatureTests, 'HSTS', 'HSTS is a server policy and cannot be confirmed from client-side JS alone.');
});
