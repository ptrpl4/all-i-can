document.addEventListener('DOMContentLoaded', () => {
    const { showInfo } = window.BrowserTester;

    const algorithmSelect = document.getElementById('jwtAlgorithm');
    const headerInput = document.getElementById('jwtHeaderInput');
    const payloadInput = document.getElementById('jwtPayloadInput');
    const secretInput = document.getElementById('jwtSecretInput');
    const encodeButton = document.getElementById('jwtEncodeButton');
    const encodeClearButton = document.getElementById('jwtEncodeClearButton');
    const encodeStatus = document.getElementById('jwtEncodeStatus');
    const encodedOutput = document.getElementById('jwtEncodedOutput');

    const decodeInput = document.getElementById('jwtDecodeInput');
    const decodeButton = document.getElementById('jwtDecodeButton');
    const decodeClearButton = document.getElementById('jwtDecodeClearButton');
    const decodeStatus = document.getElementById('jwtDecodeStatus');
    const decodedHeader = document.getElementById('jwtDecodedHeader');
    const decodedPayload = document.getElementById('jwtDecodedPayload');
    const decodedSignature = document.getElementById('jwtDecodedSignature');

    const compareInputA = document.getElementById('jwtCompareA');
    const compareInputB = document.getElementById('jwtCompareB');
    const compareAFromEncodeButton = document.getElementById('jwtCompareAFromEncode');
    const compareAFromDecodeButton = document.getElementById('jwtCompareAFromDecode');
    const compareBFromEncodeButton = document.getElementById('jwtCompareBFromEncode');
    const compareBFromDecodeButton = document.getElementById('jwtCompareBFromDecode');
    const compareButton = document.getElementById('jwtCompareButton');
    const fullscreenButton = document.getElementById('jwtFullscreenButton');
    const compareClearButton = document.getElementById('jwtCompareClearButton');
    const compareStatus = document.getElementById('jwtCompareStatus');
    const diffSummary = document.getElementById('jwtDiffSummary');
    const diffOutput = document.getElementById('jwtDiffOutput');
    const compareDialog = document.getElementById('jwtCompareDialog');
    const compareDialogClose = document.getElementById('jwtCompareDialogClose');
    const compareDialogSummary = document.getElementById('jwtCompareDialogSummary');
    const compareDialogOutput = document.getElementById('jwtCompareDialogOutput');
    let lastCompareState = null;
    let lastDecodedToken = null;

    syncHeaderAlgorithm();
    renderStatus(encodeStatus, 'Pick an algorithm, provide JSON, and generate a token.');
    renderStatus(decodeStatus, 'Paste any JWT to inspect the decoded header and payload.');
    renderStatus(compareStatus, 'Paste two encoded JWTs to compare their decoded contents.');

    algorithmSelect.addEventListener('change', syncHeaderAlgorithm);
    encodeButton.addEventListener('click', handleEncode);
    encodeClearButton.addEventListener('click', clearEncodeSection);
    decodeButton.addEventListener('click', handleDecode);
    decodeClearButton.addEventListener('click', clearDecodeSection);
    compareButton.addEventListener('click', handleCompare);
    fullscreenButton.addEventListener('click', openFullscreenCompare);
    compareClearButton.addEventListener('click', clearCompareSection);
    compareDialogClose.addEventListener('click', () => compareDialog.close());
    compareDialog.addEventListener('click', (event) => {
        if (event.target === compareDialog) {
            compareDialog.close();
        }
    });
    compareDialog.addEventListener('close', () => {
        document.body.classList.remove('dialog-open');
    });
    compareAFromEncodeButton.addEventListener('click', () => fillCompareField(compareInputA, encodedOutput.value));
    compareAFromDecodeButton.addEventListener('click', () => {
        if (lastDecodedToken) {
            compareInputA.value = createDecodedSnapshot(lastDecodedToken);
            renderStatus(compareStatus, 'Snapshot copied into compare input.');
        }
    });
    compareBFromEncodeButton.addEventListener('click', () => fillCompareField(compareInputB, encodedOutput.value));
    compareBFromDecodeButton.addEventListener('click', () => {
        if (lastDecodedToken) {
            compareInputB.value = createDecodedSnapshot(lastDecodedToken);
            renderStatus(compareStatus, 'Snapshot copied into compare input.');
        }
    });
    encodedOutput.addEventListener('input', syncCompareButtons);
    decodeInput.addEventListener('input', syncCompareButtons);

    async function handleEncode() {
        clearStatus(encodeStatus);

        try {
            const header = parseJsonInput(headerInput.value, 'Header');
            const payload = parseJsonInput(payloadInput.value, 'Payload');
            const algorithm = algorithmSelect.value;

            header.alg = algorithm;
            if (!header.typ) {
                header.typ = 'JWT';
            }

            headerInput.value = JSON.stringify(header, null, 2);

            const encodedHeader = encodeBase64Url(JSON.stringify(header));
            const encodedPayload = encodeBase64Url(JSON.stringify(payload));
            const signingInput = `${encodedHeader}.${encodedPayload}`;

            let signature = '';
            if (algorithm === 'HS256') {
                if (!secretInput.value) {
                    throw new Error('Secret is required for HS256 signing.');
                }
                signature = await signHs256(signingInput, secretInput.value);
            }

            const token = `${signingInput}.${signature}`;
            encodedOutput.value = token;
            syncCompareButtons();

            renderStatus(encodeStatus, algorithm === 'HS256'
                ? 'JWT generated with HS256 in the browser.'
                : 'Unsigned JWT generated with alg=none.');
        } catch (error) {
            renderStatus(encodeStatus, error.message, true);
        }
    }

    function handleDecode() {
        clearStatus(decodeStatus);

        try {
            const decoded = decodeJwt(decodeInput.value.trim());
            decodedHeader.value = prettyJson(decoded.header);
            decodedPayload.value = prettyJson(decoded.payload);
            decodedSignature.value = decoded.signature || '(empty signature)';
            lastDecodedToken = decoded;
            syncCompareButtons();
            renderStatus(decodeStatus, `Decoded ${decoded.algorithmLabel}.`);
        } catch (error) {
            decodedHeader.value = '';
            decodedPayload.value = '';
            decodedSignature.value = '';
            lastDecodedToken = null;
            renderStatus(decodeStatus, error.message, true);
        }
    }

    function handleCompare() {
        clearStatus(compareStatus);
        diffSummary.innerHTML = '';
        diffOutput.innerHTML = '';
        fullscreenButton.disabled = true;
        lastCompareState = null;

        try {
            const tokenA = parseCompareInput(compareInputA.value.trim());
            const tokenB = parseCompareInput(compareInputB.value.trim());
            const fragment = document.createDocumentFragment();
            let changeCount = 0;

            const summaryItems = [
                ['Algorithm', tokenA.header.alg || '(missing)', tokenB.header.alg || '(missing)'],
                ['Signature', tokenA.signature || '(empty)', tokenB.signature || '(empty)'],
            ];

            summaryItems.forEach(([label, left, right]) => {
                const row = createDiffRow(label, left, right, left !== right);
                if (left !== right) {
                    changeCount++;
                }
                fragment.appendChild(row);
            });

            fragment.appendChild(createDiffBlock('Header Fields', diffObjects(tokenA.header, tokenB.header)));
            changeCount += countChanges(diffObjects(tokenA.header, tokenB.header));

            fragment.appendChild(createDiffBlock('Payload Fields', diffObjects(tokenA.payload, tokenB.payload)));
            changeCount += countChanges(diffObjects(tokenA.payload, tokenB.payload));

            const summaryMessage = changeCount === 0
                ? 'No decoded differences found between the two JWTs.'
                : `${changeCount} difference${changeCount === 1 ? '' : 's'} found between the two JWTs.`;

            diffSummary.innerHTML = '';
            showInfo(diffSummary, 'Comparison Summary', summaryMessage);

            diffOutput.appendChild(fragment);

            // The clone is re-rendered inside the dialog, so it must not carry
            // the id of the element it was copied from.
            const outputNode = diffOutput.cloneNode(true);
            outputNode.removeAttribute('id');
            lastCompareState = {
                summaryText: summaryMessage,
                outputNode
            };
            fullscreenButton.disabled = false;
            renderStatus(compareStatus, 'JWT comparison complete.');
        } catch (error) {
            renderStatus(compareStatus, error.message, true);
        }
    }

    function syncHeaderAlgorithm() {
        try {
            const header = parseJsonInput(headerInput.value, 'Header');
            header.alg = algorithmSelect.value;
            if (!header.typ) {
                header.typ = 'JWT';
            }
            headerInput.value = JSON.stringify(header, null, 2);
        } catch {
            // Leave invalid JSON untouched until encode is requested.
        }
        secretInput.disabled = algorithmSelect.value === 'none';
        if (secretInput.disabled) {
            secretInput.value = '';
        }
    }

    function syncCompareButtons() {
        const hasGeneratedToken = isValidCompareSource(encodedOutput.value);
        const hasDecodedToken = Boolean(lastDecodedToken);

        compareAFromEncodeButton.disabled = !hasGeneratedToken;
        compareBFromEncodeButton.disabled = !hasGeneratedToken;
        compareAFromDecodeButton.disabled = !hasDecodedToken;
        compareBFromDecodeButton.disabled = !hasDecodedToken;
    }

    function fillCompareField(target, value, statusContainer = compareStatus) {
        if (!value || !value.trim()) {
            return;
        }
        try {
            target.value = createDecodedSnapshot(parseCompareInput(value.trim()));
            renderStatus(statusContainer, 'Snapshot copied into compare input.');
        } catch (error) {
            renderStatus(statusContainer, error.message, true);
        }
    }

    function openFullscreenCompare() {
        if (!lastCompareState) {
            return;
        }

        compareDialogSummary.innerHTML = '';
        compareDialogOutput.innerHTML = '';
        showInfo(compareDialogSummary, 'Comparison Summary', lastCompareState.summaryText);
        compareDialogOutput.appendChild(lastCompareState.outputNode.cloneNode(true));
        compareDialog.showModal();
        document.body.classList.add('dialog-open');
    }

    function clearEncodeSection() {
        headerInput.value = JSON.stringify({
            alg: algorithmSelect.value,
            typ: 'JWT'
        }, null, 2);
        payloadInput.value = '';
        secretInput.value = '';
        encodedOutput.value = '';
        renderStatus(encodeStatus, 'Encode inputs cleared.');
        syncCompareButtons();
    }

    function clearDecodeSection() {
        decodeInput.value = '';
        decodedHeader.value = '';
        decodedPayload.value = '';
        decodedSignature.value = '';
        lastDecodedToken = null;
        renderStatus(decodeStatus, 'Decode inputs cleared.');
        syncCompareButtons();
    }

    function clearCompareSection() {
        compareInputA.value = '';
        compareInputB.value = '';
        diffSummary.innerHTML = '';
        diffOutput.innerHTML = '';
        compareDialogSummary.innerHTML = '';
        compareDialogOutput.innerHTML = '';
        fullscreenButton.disabled = true;
        lastCompareState = null;
        if (compareDialog.open) {
            compareDialog.close();
        }
        renderStatus(compareStatus, 'Compare inputs cleared.');
    }

    function isValidCompareSource(value) {
        if (!value || !value.trim()) {
            return false;
        }

        try {
            parseCompareInput(value.trim());
            return true;
        } catch {
            return false;
        }
    }

});

function parseJsonInput(value, label) {
    try {
        const parsed = JSON.parse(value);
        if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
            throw new Error(`${label} must be a JSON object.`);
        }
        return parsed;
    } catch (error) {
        if (error.message.endsWith('must be a JSON object.')) {
            throw error;
        }
        throw new Error(`${label} is not valid JSON.`);
    }
}

function encodeBase64Url(value) {
    const bytes = new TextEncoder().encode(value);
    let binary = '';
    bytes.forEach(byte => {
        binary += String.fromCharCode(byte);
    });
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function decodeBase64Url(value) {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized + '='.repeat((4 - normalized.length % 4) % 4);
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
    return new TextDecoder().decode(bytes);
}

async function signHs256(input, secret) {
    const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(input));
    return uint8ArrayToBase64Url(new Uint8Array(signature));
}

function uint8ArrayToBase64Url(bytes) {
    let binary = '';
    bytes.forEach(byte => {
        binary += String.fromCharCode(byte);
    });
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function decodeJwt(token) {
    if (!token) {
        throw new Error('JWT input is empty.');
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
        throw new Error('JWT must have exactly three dot-separated parts.');
    }

    const [encodedHeader, encodedPayload, signature] = parts;
    const header = JSON.parse(decodeBase64Url(encodedHeader));
    const payload = JSON.parse(decodeBase64Url(encodedPayload));

    return {
        header,
        payload,
        signature,
        algorithmLabel: header.alg ? `JWT with alg=${header.alg}` : 'JWT'
    };
}

function parseCompareInput(input) {
    try {
        return decodeJwt(input);
    } catch {
        return parseDecodedSnapshot(input);
    }
}

function parseDecodedSnapshot(input) {
    if (!input) {
        throw new Error('Compare input is empty.');
    }

    let parsed;
    try {
        parsed = JSON.parse(input);
    } catch {
        throw new Error('Compare input must be an encoded JWT or a decoded JSON snapshot.');
    }

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('Decoded snapshot must be a JSON object.');
    }

    if (!parsed.header || !parsed.payload) {
        throw new Error('Decoded snapshot must include "header" and "payload" objects.');
    }

    return {
        header: parsed.header,
        payload: parsed.payload,
        signature: typeof parsed.signature === 'string' ? parsed.signature : '',
        algorithmLabel: parsed.header.alg ? `JWT with alg=${parsed.header.alg}` : 'JWT'
    };
}

function createDecodedSnapshot(decoded) {
    return JSON.stringify({
        header: decoded.header,
        payload: decoded.payload,
        signature: decoded.signature || ''
    }, null, 2);
}

function prettyJson(value) {
    return JSON.stringify(value, null, 2);
}

function renderStatus(container, message, isError = false) {
    container.innerHTML = '';
    if (!message) {
        return;
    }
    const status = document.createElement('div');
    status.className = `tool-status ${isError ? 'tool-status-error' : 'tool-status-info'}`;
    status.textContent = message;
    container.appendChild(status);
}

function clearStatus(container) {
    container.innerHTML = '';
}

function diffObjects(left, right) {
    return diffValues(left, right);
}

function stringifyValue(value) {
    return typeof value === 'string' ? value : JSON.stringify(value);
}

function diffValues(left, right, path = '') {
    if (isPlainObject(left) || isPlainObject(right)) {
        const leftObject = isPlainObject(left) ? left : {};
        const rightObject = isPlainObject(right) ? right : {};
        const keys = Array.from(new Set([...Object.keys(leftObject), ...Object.keys(rightObject)])).sort();

        return keys.flatMap(key => {
            const nextPath = path ? `${path}.${key}` : key;
            return diffValues(leftObject[key], rightObject[key], nextPath);
        });
    }

    const leftValue = left === undefined ? '(missing)' : stringifyValue(left);
    const rightValue = right === undefined ? '(missing)' : stringifyValue(right);

    return [{
        key: path || '(value)',
        leftValue,
        rightValue,
        changed: leftValue !== rightValue
    }];
}

function isPlainObject(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function countChanges(entries) {
    return entries.reduce((count, entry) => count + (entry.changed ? 1 : 0), 0);
}

function createDiffBlock(title, entries) {
    const block = document.createElement('section');
    block.className = 'diff-block';

    const heading = document.createElement('h3');
    heading.textContent = title;
    block.appendChild(heading);

    const changes = entries.filter(entry => entry.changed);
    if (changes.length === 0) {
        const empty = document.createElement('p');
        empty.className = 'diff-empty';
        empty.textContent = 'No differences.';
        block.appendChild(empty);
        return block;
    }

    changes.forEach(entry => {
        block.appendChild(createDiffRow(entry.key, entry.leftValue, entry.rightValue, true));
    });

    return block;
}

function createDiffRow(label, left, right, changed) {
    const row = document.createElement('div');
    row.className = `diff-row${changed ? ' diff-row-changed' : ''}`;

    const heading = document.createElement('div');
    heading.className = 'diff-label';
    heading.textContent = label;
    row.appendChild(heading);

    const before = document.createElement('pre');
    before.className = 'diff-panel';
    before.textContent = left;
    row.appendChild(before);

    const after = document.createElement('pre');
    after.className = 'diff-panel';
    after.textContent = right;
    row.appendChild(after);

    return row;
}
