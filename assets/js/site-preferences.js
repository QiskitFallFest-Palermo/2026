/*
 * Privacy preferences for the Qiskit Fall Fest site.
 *
 * Replaces the former Iubenda widget. Two purposes are modelled, matching the
 * categories declared in the Cookie Policy page:
 *
 *   necessary  - always on, cannot be refused, covers this stored choice itself
 *   experience - third-party embeds (venue map, Airtable forms)
 *
 * Embeds opt in by carrying their URL in `data-consent-src` instead of `src`,
 * so nothing is requested from a third party before consent is given. Any
 * element matching `.consent-embed[data-consent-purpose]` is gated here.
 */

(function () {
    'use strict';

    var STORAGE_KEY = 'qff.cookie-consent';
    var OPTIONAL_PURPOSES = ['experience'];

    var root = document.querySelector('[data-cookie-consent]');
    if (!root) return;

    var version = root.getAttribute('data-consent-version') || '1';
    var policyUrl = root.getAttribute('data-consent-policy-url') || '/cookies/';
    var banner = root.querySelector('#cookie-banner');
    var settingsButton = root.querySelector('[data-consent-action="open"]');
    var closeButton = root.querySelector('[data-consent-action="close"]');
    var checkboxes = Array.prototype.slice.call(root.querySelectorAll('[data-consent-purpose]'));

    var listeners = [];
    var lastFocused = null;

    /* Storage ------------------------------------------------------------ */

    // Private browsing and blocked storage both throw, so every access is
    // guarded: without storage the banner simply asks again next visit.
    function readStored() {
        var raw;
        try {
            raw = window.localStorage.getItem(STORAGE_KEY);
        } catch (error) {
            return null;
        }
        if (!raw) return null;

        var parsed;
        try {
            parsed = JSON.parse(raw);
        } catch (error) {
            return null;
        }

        if (!parsed || parsed.version !== version) return null;
        return parsed;
    }

    function writeStored(purposes) {
        var record = {
            version: version,
            date: new Date().toISOString(),
            purposes: purposes
        };

        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
        } catch (error) {
            /* Choice still applies to this page view. */
        }

        return record;
    }

    var consent = readStored();

    function granted(purpose) {
        return !!(consent && consent.purposes && consent.purposes[purpose] === true);
    }

    /* Banner ------------------------------------------------------------- */

    // Reopening the panel shows the standing decision rather than asking the
    // question again from scratch.
    function syncPurposeStates() {
        checkboxes.forEach(function (checkbox) {
            checkbox.checked = granted(checkbox.getAttribute('data-consent-purpose'));
        });
        // Dismissing without answering is only offered once a choice exists.
        if (closeButton) closeButton.hidden = !consent;
    }

    function openBanner(userRequested) {
        syncPurposeStates();
        banner.hidden = false;
        settingsButton.hidden = true;
        settingsButton.setAttribute('aria-expanded', 'true');

        // A first visit must not yank focus away from the page; reopening the
        // panel deliberately should land the visitor inside it.
        if (userRequested) {
            lastFocused = document.activeElement;
            var target = checkboxes[0] || banner.querySelector('button');
            if (target) target.focus();
        }
    }

    function closeBanner(restoreFocus) {
        banner.hidden = true;
        settingsButton.hidden = false;
        settingsButton.setAttribute('aria-expanded', 'false');

        if (restoreFocus) {
            var target = lastFocused && document.contains(lastFocused) ? lastFocused : settingsButton;
            target.focus();
        }
        lastFocused = null;
    }

    function save(purposes, restoreFocus, keepOpen) {
        consent = writeStored(purposes);
        syncPurposeStates();
        if (!keepOpen) closeBanner(restoreFocus);
        applyConsent();
    }

    function allPurposes(value) {
        var purposes = {};
        OPTIONAL_PURPOSES.forEach(function (purpose) {
            purposes[purpose] = value;
        });
        return purposes;
    }

    root.addEventListener('click', function (event) {
        var trigger = event.target.closest('[data-consent-action]');
        if (!trigger) return;

        switch (trigger.getAttribute('data-consent-action')) {
            case 'accept-all':
                save(allPurposes(true), true);
                break;
            case 'reject-all':
                save(allPurposes(false), true);
                break;
            case 'open':
                openBanner(true);
                break;
            case 'close':
                closeBanner(true);
                break;
        }
    });

    checkboxes.forEach(function (checkbox) {
        checkbox.addEventListener('change', function () {
            var purposes = allPurposes(false);
            checkboxes.forEach(function (other) {
                purposes[other.getAttribute('data-consent-purpose')] = other.checked;
            });
            save(purposes, false, true);
        });
    });

    document.addEventListener('keydown', function (event) {
        if (event.key !== 'Escape' || banner.hidden) return;
        // Escaping before any choice exists would leave the site in an
        // undecided state with no visible way back, so it stays open.
        if (!consent) return;
        closeBanner(true);
    });

    /* Gated embeds ------------------------------------------------------- */

    function buildPlaceholder(container) {
        var service = container.getAttribute('data-consent-service') || 'This content';
        var fallback = container.getAttribute('data-consent-fallback');
        var fallbackLabel = container.getAttribute('data-consent-fallback-label') || 'Open it in a new tab';

        container.setAttribute('tabindex', '-1');

        var placeholder = document.createElement('div');
        placeholder.className = 'consent-placeholder';

        var icon = document.createElement('i');
        icon.className = 'fa-solid fa-shield-halved consent-placeholder__icon';
        icon.setAttribute('aria-hidden', 'true');
        placeholder.appendChild(icon);

        var title = document.createElement('p');
        title.className = 'consent-placeholder__title';
        title.textContent = service + ' is blocked';
        placeholder.appendChild(title);

        var text = document.createElement('p');
        text.className = 'consent-placeholder__text';
        text.textContent = 'This embed is loaded from ' + service + ', which may set its own trackers. ' +
            'Allow experience content to display it here.';
        placeholder.appendChild(text);

        var actions = document.createElement('div');
        actions.className = 'consent-placeholder__actions';

        var allow = document.createElement('button');
        allow.type = 'button';
        allow.className = 'cookie-btn cookie-btn--primary';
        allow.textContent = 'Allow and load';
        allow.addEventListener('click', function () {
            var purposes = consent && consent.purposes ? consent.purposes : allPurposes(false);
            purposes[container.getAttribute('data-consent-purpose')] = true;
            save(purposes, false);
            // The button that had focus is gone once the embed loads, so hand
            // focus to the container that replaced it.
            container.focus();
        });
        actions.appendChild(allow);

        if (fallback) {
            var link = document.createElement('a');
            link.className = 'consent-placeholder__link';
            link.href = fallback;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.textContent = fallbackLabel;
            actions.appendChild(link);
        }

        placeholder.appendChild(actions);

        var policy = document.createElement('p');
        policy.className = 'consent-placeholder__policy';
        var policyLink = document.createElement('a');
        policyLink.href = policyUrl;
        policyLink.textContent = 'Read the Cookie Policy';
        policy.appendChild(policyLink);
        placeholder.appendChild(policy);

        return placeholder;
    }

    function applyConsent() {
        document.querySelectorAll('.consent-embed[data-consent-purpose]').forEach(function (container) {
            var allowed = granted(container.getAttribute('data-consent-purpose'));
            var placeholder = container.querySelector('.consent-placeholder');

            if (allowed) {
                container.classList.remove('consent-embed--blocked');
                if (placeholder) placeholder.remove();

                container.querySelectorAll('[data-consent-src]').forEach(function (frame) {
                    var src = frame.getAttribute('data-consent-src');
                    if (frame.getAttribute('src') !== src) frame.setAttribute('src', src);
                });
                return;
            }

            container.classList.add('consent-embed--blocked');
            // Dropping the src stops an already-running embed the moment
            // consent is withdrawn.
            container.querySelectorAll('[data-consent-src]').forEach(function (frame) {
                if (frame.hasAttribute('src')) frame.removeAttribute('src');
            });
            if (!placeholder) container.appendChild(buildPlaceholder(container));
        });

        listeners.forEach(function (listener) {
            listener(consent);
        });
    }

    /* Public API --------------------------------------------------------- */

    window.cookieConsent = {
        has: granted,
        get: function () {
            return consent;
        },
        open: function () {
            openBanner(true);
        },
        onChange: function (listener) {
            if (typeof listener === 'function') listeners.push(listener);
        }
    };

    if (consent) {
        closeBanner(false);
    } else {
        openBanner(false);
    }
    applyConsent();
})();
