// Site baseurl (e.g. "/2026"), injected by the page before this script loads
const SITE_BASEURL = window.SITE_BASEURL || '';

// Fetch the public key from a static file
async function fetchPublicKey(keyPath = SITE_BASEURL + '/assets/verification/public_key.pem') {
    try {
        const response = await fetch(keyPath);
        if (!response.ok) {
            throw new Error(`Error fetching public key: ${response.statusText}`);
        }
        return await response.text();
    } catch (error) {
        console.error('Error fetching public key:', error);
        return null;
    }
}

// Fetch the certificate revocation list (CRL) from a static file
async function fetchCRL(crlUrl = SITE_BASEURL + '/assets/verification/crl.json') {
    try {
        const response = await fetch(crlUrl);
        if (!response.ok) {
            throw new Error(`Error fetching CRL: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.warn(`Error fetching CRL: ${error}`);
        return null;
    }
}

// Function to extract query parameters from the URL
function getQueryParams(url) {
    const urlObj = new URL(url);
    return Object.fromEntries(urlObj.searchParams.entries());
}

// Extract certificate data and signature from the URL
function getCertificateInfo(window) {
    const urlParams = new URLSearchParams(window.location.search);

    // Early return if no query string is present
    if (!urlParams.keys().next().value) {
        console.warn('Query string not found in the URL.');
        return null;
    }

    const response = {};

    for (const [key, value] of urlParams) {
        if (key === 'cert' || key === 'signature') {
            try {
                // Base64 URL-safe to base64
                let base64String = value.replace(/-/g, '+').replace(/_/g, '/');
                // Pad string with '=' to make it base64 compliant
                base64String += '='.repeat((4 - base64String.length % 4) % 4);
                response[key] = atob(base64String);
            } catch (error) {
                console.warn(`Error decoding base64 string for key '${key}':`, error);
                response[key] = null;
            }
        } else {
            response[key] = value;
        }
    }

    if (!response.cert) {
        console.warn('Certificate data not found in the URL.');
    } else {
        console.debug('Certificate data:', response.cert);
    }

    if (!response.signature) {
        console.warn('Signature not available.');
    } else {
        console.debug('Signature found in the URL.');
    }

    return response;
}


/*
Convert the binary string returned by atob() into bytes without UTF-8
re-encoding, which would alter DER byte values above 127.
*/
function binaryStringToBytes(binaryString) {
    const bytes = new Uint8Array(binaryString.length);

    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }

    return bytes;
}

function importRsaKey(pem) {
    if (typeof pem !== 'string') {
        throw new Error('Public key is not valid text.');
    }

    // Extract the payload without relying on a specific line-ending style.
    const pemMatch = pem.match(
        /-----BEGIN PUBLIC KEY-----([\s\S]*?)-----END PUBLIC KEY-----/
    );

    if (!pemMatch) {
        throw new Error('Public key PEM header or footer is missing.');
    }

    const pemContents = pemMatch[1].replace(/\s/g, '');

    if (!pemContents || !/^[A-Za-z0-9+/]+={0,2}$/.test(pemContents) || pemContents.length % 4 !== 0) {
        throw new Error('Public key PEM contains invalid Base64 data.');
    }

    let binaryDerString;
    try {
        binaryDerString = window.atob(pemContents);
    } catch (error) {
        throw new Error('Public key PEM could not be decoded.', { cause: error });
    }

    // Convert the decoded binary string into the DER bytes WebCrypto expects.
    const binaryDer = binaryStringToBytes(binaryDerString);

    // is window.crypto.subtle not defined?
    if (window?.crypto?.subtle === undefined) {
        console.error("WebCrypto API not available in this browser! Are you using HTTPS?");
        throw new Error("WebCrypto API not available in this browser! Are you using HTTPS?");
    }

    return window.crypto.subtle.importKey(
        "spki",
        binaryDer,
        {
            name: "RSASSA-PKCS1-v1_5",
            hash: "SHA-256",
        },
        true,
        ["verify"],
    );
}

// Function to verify the signature
async function verifySignature_1(data, signature, publicKey) {


    // Create a CryptoKey object from the public key
    const cryptoKey = await importRsaKey(publicKey);

    // Verify the signature using the retrieved certificate data and publicKey
    // If the signature is valid, return true; otherwise, return false
    const signatureBytes = Uint8Array.from(signature, c => c.charCodeAt(0));

    const isSigned = await crypto.subtle.verify(
        { name: 'RSASSA-PKCS1-v1_5' },
        cryptoKey,
        signatureBytes,
        new TextEncoder().encode(data)
    );

    return isSigned;
}

// Function to verify the signature using the public key
async function verifySignature_2(data, signature, publicKey) {

    // Create a CryptoKey object from the public key
    const cryptoKey = await importPrivateKey(publicKey);

    // Compute the SHA-256 hash of the data
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);

    // Verify the signature
    const signatureBuffer = new Uint8Array(signature.match(/[\s\S]/g).map((ch) => ch.charCodeAt(0)));

    const isSigned = await crypto.subtle.verify(
        { name: 'RSA-PSS', saltLength: 20 },
        cryptoKey,
        signatureBuffer,
        hashBuffer
    );

    return isSigned;
}

// Verify the certificate using the public key and signature
async function verifyCertificate(certInfo) {
    // Destructure certInfo to extract properties directly.
    //const certData = certInfo.cert;
    //const signature = certInfo.signature;
    const { cert: certData, signature } = certInfo;

    // Initiate both asynchronous operations simultaneously to save time.
    //const publicKey = await fetchPublicKey();
    //const crl = await fetchCRL();
    const [publicKey, crl] = await Promise.all([
        fetchPublicKey(),
        fetchCRL()
    ]);

    // Parse the certData only if all required information is present.
    let certInfoObj;
    try {
        //from jsonstring to object
        certInfoObj = JSON.parse(certData);
    } catch (error) {
        console.warn("Invalid certificate data format.");
        return { isValid: false, isSigned: null, isRevoked: null, error: "Invalid certificate data format." };
    }

    // Initialize response object.
    let response = {
        isValid: null,
        isSigned: null,
        isRevoked: null,
        error: null
    };

    // Check for missing required data.
    if (!certInfoObj || !signature || !publicKey || !crl) {
        const errorMsgs = [];
        if (!certInfoObj) errorMsgs.push("Certificate not provided.");
        if (!signature) {
            errorMsgs.push("Signature not provided.");
            response.isSigned = false;
        }
        if (!publicKey) {
            errorMsgs.push("Public Key not available.");
            response.isSigned = null;
        }
        if (!crl) errorMsgs.push("Certificate Revocation List (CRL) not available. Revocation status unknown.");

        const msg = errorMsgs.join(' ');
        console.warn(msg);
        response.error = msg;
        return response;
    }

    // Verify the signature only if all checks passed.
    try {
        const isSigned = await verifySignature_1(certInfo.cert, signature, publicKey);
        console.log('Certificate verification passed? ', isSigned);
        response.isSigned = isSigned;
    } catch (error) {
        console.warn(`Error verifying certificate: ${error}`);
        response.error = `Error verifying certificate: ${error}`;
        return response;
    }

    //Check if the certificate has been revoked looking up the certificate UID 
    //in the Certificate Revocation List (CRL), available at the following URL in JSON format:
    //https://raw.githubusercontent.com/andrea-angella/certificate-revocation-list/main/crl.json

    // If the signature is valid, check CRL.
    if (response.isSigned) {
        const crl_inclusion = crl.includes(certInfoObj.uid);
        response.isRevoked = crl_inclusion;

        if (response.isRevoked) {
            console.warn("Certificate has been revoked by the issuer!");
            response.error = "Certificate has been revoked by the issuer!";
        }
    } else {
        console.warn("Invalid signature!");
        response.error = "Invalid signature!";
    }


    // The certificate is valid if it is signed and not revoked.
    response.isValid = response.isSigned && !response.isRevoked;

    return response;
}
