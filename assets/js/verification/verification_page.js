const verificationPage = document.querySelector('.verification-page');

initializeVerificationPage();

async function initializeVerificationPage() {
    const certInfo = getCertificateInfo(window);

    if (certInfo === null || !certInfo.cert) {
        finishVerification(null,
            'Do you want to verify a certificate? From the .pdf certificate you received, click on the link "Verify here" or scan the QR code.');
        return;
    }

    let certInfoObj;
    try {
        certInfoObj = JSON.parse(certInfo.cert);
    } catch (error) {
        finishVerification(false, 'Sorry, but the certificate data is not valid JSON.');
        return;
    }

    // Render the complete, unverified structure before the browser's first paint.
    // Network verification then updates content in place without moving the page.
    certInfoObj.revoked = null;
    renderCertificateDetails(certInfoObj, {
        isValid: null,
        isRevoked: null,
    });
    renderEarningCriteria(certInfoObj);
    hideElement('certificate_details_title', false);
    hideElement('certificateDetails', false);

    const response = await verifyCertificate(certInfo);
    certInfoObj.revoked = response.isRevoked;
    renderCertificateDetails(certInfoObj, response);

    if (response.isValid) {
        finishVerification(true,
            `This certificate is valid and it was issued to ${certInfoObj.issued_to} on ${certInfoObj.issued_on}.`);
    } else if (response.isValid === false) {
        finishVerification(false, `Sorry, but this certificate is not valid! Details: ${response.error}`);
    } else {
        finishVerification(null,
            `Sorry, but an unexpected error occurred while verifying the certificate. Please contact the issuer for more information. Details: ${response.error}`);
    }
}

function finishVerification(isValid, resultMessage) {
    createAlertElement('verificationResult', 'bd-callout', isValid, resultMessage);

    const result = document.getElementById('verificationResult');
    result.setAttribute('role', 'alert');
    result.setAttribute('aria-busy', 'false');

    verificationPage.setAttribute('aria-busy', 'false');
    document.getElementById('earningCriteria').setAttribute('aria-hidden', String(isValid !== true));
}

function createAlertElement(elementId, classPrefix, isValid, resultMessage) {
    const element = document.getElementById(elementId);
    element.textContent = resultMessage;
    element.classList.remove(
        `${classPrefix}-success`,
        `${classPrefix}-danger`,
        `${classPrefix}-warning`,
    );
    element.classList.add(
        classPrefix,
        `${classPrefix}-${isValid === true ? 'success' : isValid === false ? 'danger' : 'warning'}`,
    );
}

function hideElement(elementId, wantToHide = true) {
    const element = document.getElementById(elementId);
    if (element) {
        element.hidden = wantToHide;
    }
}

function renderCertificateDetails(certInfoObj, response, elementId = 'certificateDetails') {
    const ul = document.getElementById(elementId);
    ul.replaceChildren();

    const statusItem = document.createElement('li');
    statusItem.classList.add(
        'list-group-item',
        response.isValid === true
            ? 'list-group-item-success'
            : response.isValid === false
                ? 'list-group-item-danger'
                : 'list-group-item-warning',
    );
    statusItem.textContent = response.isValid === true
        ? 'Valid certificate'
        : response.isValid === false
            ? 'Invalid certificate'
            : 'Verification in progress';
    ul.appendChild(statusItem);

    for (const [key, value] of Object.entries(certInfoObj)) {
        const item = document.createElement('li');
        item.classList.add('list-group-item', 'd-flex', 'align-items-center');
        item.id = key;

        const badge = document.createElement('span');
        badge.classList.add('badge', 'rounded-pill', 'certificate-detail-badge');

        if (key === 'revoked') {
            badge.classList.add(response.isRevoked === true ? 'bg-danger' : response.isRevoked === false ? 'bg-success' : 'bg-warning');
            badge.textContent = response.isRevoked === true ? '\u2713' : response.isRevoked === false ? '\u00d7' : '?';
        } else {
            badge.classList.add(response.isValid === true ? 'bg-success' : response.isValid === false ? 'bg-danger' : 'bg-warning');
            badge.textContent = response.isValid === true ? '\u2713' : response.isValid === false ? '\u00d7' : '!';
        }

        const label = document.createTextNode(`${key.replaceAll('_', ' ')}\u00a0`);
        const detailValue = document.createElement('b');
        detailValue.textContent = value === null ? '?' : String(value);

        item.append(badge, label, detailValue);
        ul.appendChild(item);
    }
}

function renderEarningCriteria(certInfoObj) {
    const list = document.getElementById('earningCriteriaList');
    list.replaceChildren();

    const item = document.createElement('li');
    const criteriaByRole = {
        partecipant: '<b>Attendance</b>: &ge;80%',
        volunteer: `<b>Volunteering</b>: In recognition of your exceptional dedication to sharing your skills and your enthusiasm and passion within our community.<br><br>
            Your contributions have enhanced our projects and inspired your peers—demonstrating how individual talents can catalyze collective progress.<br><br>
            For all the time you've invested and the expertise you've imparted, we extend our deepest thanks. Your actions have affirmed that through passionate giving, we all grow stronger together.`,
        collaborator: `<b>Collaboration</b>: In recognition of your exceptional collaborative spirit and efforts.<br><br>
            Your active participation, shared responsibility in our projects, deep investment in our shared goals, proactive contributions to decision-making, had a significant impact on project outcomes and they have been invaluable.<br><br>
            Thank you for making a difference with your passion and drive. Your work has not only furthered our objectives but also enriched the experience of all involved.`,
        speaker: `<b>Scientific contribution</b>: In recognition of your contribution as a speaker at our event. Your expertise and insights have significantly enriched the knowledge and experience of all who attended.<br><br>
            Your dedication to engaging with the audience and sharing your knowledge was evident and much appreciated. Your ability to connect with participants, address their questions, and stimulate thoughtful discussion contributed immeasurably to the success of our gathering.<br><br>
            Thank you once again for your inspiring presence and for adding such remarkable value to our endeavors.`,
        organizer: `<b>Organization</b>: In recognition of your contribution as an organizer at our event. Your incredible dedication and monumental effort have contributed to the success of our event.<br><br>
            Your organizational and communication skills, your unwavering commitment, collaborative spirit, creativity and passion have ensured that every aspect of the event was executed flawlessly.<br><br>
            Thank you for your invaluable contribution and for making a difference with your passion and drive.`,
    };

    const criteria = criteriaByRole[certInfoObj.role];
    if (criteria) {
        item.innerHTML = criteria;
        list.appendChild(item);
    }
}
