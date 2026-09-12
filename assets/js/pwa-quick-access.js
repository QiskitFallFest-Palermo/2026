(function () {
    'use strict';

    var root = document.documentElement;
    var trigger = document.getElementById('pwa-quick-trigger');
    var panel = document.getElementById('pwa-quick-modal');
    if (!trigger || !panel || !window.bootstrap) return;

    var mode = window.matchMedia('(display-mode: standalone)');
    var banner = document.getElementById('cookie-banner');
    var modal = new bootstrap.Modal(panel);
    var restoreFocus = true;
    var welcomePanel = document.getElementById('pwa-welcome-modal');
    var guideTrigger = document.getElementById('pwa-guide-trigger');
    var welcome = welcomePanel ? new bootstrap.Modal(welcomePanel) : null;
    var welcomeKey = welcomePanel && welcomePanel.getAttribute('data-welcome-key');
    var welcomeSeen = false;
    var welcomeInterrupted = false;
    try {
        welcomeSeen = window.localStorage.getItem(welcomeKey) === 'seen';
    } catch (error) { /* Without storage, remember dismissal for this page view. */ }

    function showWelcome(manual) {
        if (!welcome || trigger.hidden || (banner && !banner.hidden) ||
            document.querySelector('.modal.show') || (!manual && (welcomeSeen || !window.cookieConsent))) return;
        welcomeInterrupted = false;
        welcome.show();
    }

    function scheduleWelcome() {
        // Cookie preferences finish restoring focus before the guide opens.
        window.setTimeout(function () { showWelcome(false); }, 0);
    }

    if (welcome) {
        welcomePanel.addEventListener('hidden.bs.modal', function () {
            if (welcomeInterrupted) return;
            welcomeSeen = true;
            try { window.localStorage.setItem(welcomeKey, 'seen'); } catch (error) { /* Storage may be blocked. */ }
            if (!trigger.hidden) trigger.focus();
        });
        guideTrigger.addEventListener('click', function () {
            restoreFocus = false;
            modal.hide();
            showWelcome(true);
        });
        if (banner) new MutationObserver(scheduleWelcome).observe(banner, { attributes: true, attributeFilter: ['hidden'] });
        document.addEventListener('hidden.bs.modal', scheduleWelcome);
        // Never stack another Bootstrap modal over the guide.
        document.addEventListener('show.bs.modal', function (event) {
            if (event.target !== welcomePanel && welcomePanel.classList.contains('show')) {
                welcomeInterrupted = true;
                welcome.hide();
            }
        });
    }

    function measure() {
        // Keep this as a layout measurement. The elastic iOS pull is handled
        // separately by pwa-overscroll.js through --pwa-navbar-pull-offset.
        var height = trigger.hidden ? 0 : trigger.offsetHeight;

        root.style.setProperty(
            '--pwa-bar-height',
            height + 'px'
        );
    }

    function syncMode() {
        trigger.hidden = !(mode.matches || window.navigator.standalone === true);
        document.documentElement.classList.toggle('pwa-standalone', !trigger.hidden);
        if (trigger.hidden) {
            modal.hide();
            welcomeInterrupted = true;
            if (welcome) welcome.hide();
        }
        measure();
        scheduleWelcome();
    }

    function openQuickAccess() {
        if (banner && !banner.hidden) {
            if (window.cookieConsent) window.cookieConsent.open();
            return;
        }
        restoreFocus = true;
        modal.show();
    }

    trigger.addEventListener('click', function () {
        openQuickAccess();
    });
    window.addEventListener('qff:pwa-quick-access-request', function () {
        openQuickAccess();
    });
    panel.addEventListener('shown.bs.modal', function () {
        trigger.setAttribute('aria-expanded', 'true');
    });
    panel.addEventListener('hidden.bs.modal', function () {
        trigger.setAttribute('aria-expanded', 'false');
        if (restoreFocus && !trigger.hidden) trigger.focus();
    });
    panel.addEventListener('click', function (event) {
        if (event.target.closest('a[href]')) modal.hide();
    });
    // Close synchronously before the cookie panel takes focus.
    document.addEventListener('qff:cookie-banner-open', function () {
        restoreFocus = false;
        modal.hide();
        welcomeInterrupted = true;
        if (welcome) welcome.hide();
    });
    if (mode.addEventListener) mode.addEventListener('change', syncMode);
    else mode.addListener(syncMode);
    if (window.ResizeObserver) new ResizeObserver(measure).observe(trigger);
    window.addEventListener('resize', measure);
    syncMode();
})();
