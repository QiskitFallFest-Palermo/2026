(function () {
    'use strict';

    var deferredPrompt = null;
    var isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true;
    var installPage = document.querySelector('[data-install-page]');
    var pageInstallButton = document.querySelector('[data-install-page-action]');
    var pageStatus = document.querySelector('[data-install-status]');
    var browserCards = document.querySelectorAll('[data-browser-card]');

    function setPageStatus(status) {
        if (!pageStatus) return;
        pageStatus.textContent = status;
        pageStatus.hidden = !status;
    }

    function isIOS() {
        return /iphone|ipad|ipod/i.test(window.navigator.userAgent) ||
            (window.navigator.platform === 'MacIntel' && window.navigator.maxTouchPoints > 1);
    }

    function detectInstructionTarget() {
        var userAgent = window.navigator.userAgent;
        if (isIOS()) return 'ios';
        if (/edg\//i.test(userAgent)) return 'edge';
        if (/firefox\//i.test(userAgent)) return 'firefox';
        if (/chrome\//i.test(userAgent) || /chromium\//i.test(userAgent)) return 'chrome';
        if (/safari\//i.test(userAgent) && /macintosh|mac os x/i.test(userAgent)) return 'safari-macos';
        return null;
    }

    function highlightInstructions() {
        var instructionTarget = detectInstructionTarget();
        var highlightedCard = null;

        browserCards.forEach(function (card) {
            if (card.getAttribute('data-browser-card') === instructionTarget) highlightedCard = card;
        });

        if (!highlightedCard) return;

        browserCards.forEach(function (card) {
            var isMatch = card === highlightedCard;
            card.classList.toggle('is-highlighted', isMatch);
            card.open = isMatch;
        });

        if (highlightedCard.parentElement.firstElementChild !== highlightedCard) {
            highlightedCard.parentElement.insertBefore(highlightedCard, highlightedCard.parentElement.firstElementChild);
        }

        highlightedCard.querySelector('summary').insertBefore(
            document.createTextNode('(detected) '),
            highlightedCard.querySelector('summary').firstChild
        );
    }

    async function showInstallPrompt() {
        if (!deferredPrompt) return;
        await deferredPrompt.prompt();
        deferredPrompt.userChoice.then(function () {
            deferredPrompt = null;
            updateVisibility();
        });
    }

    function updateVisibility() {
        if (pageInstallButton) pageInstallButton.hidden = !deferredPrompt;

        if (installPage) {
            if (isStandalone) {
                setPageStatus('App already installed');
            } else {
                setPageStatus('');
            }
        }
    }

    if (!installPage) return;

    window.addEventListener('beforeinstallprompt', function (event) {
        event.preventDefault();
        deferredPrompt = event;
        updateVisibility();
    });

    window.addEventListener('appinstalled', function () {
        deferredPrompt = null;
        isStandalone = true;
        updateVisibility();
    });

    if (pageInstallButton) pageInstallButton.addEventListener('click', showInstallPrompt);
    browserCards.forEach(function (card) {
        card.addEventListener('toggle', function () {
            if (!card.open) return;
            browserCards.forEach(function (otherCard) {
                if (otherCard !== card) otherCard.open = false;
            });
        });
    });

    updateVisibility();
    if (installPage) highlightInstructions();
}());
