(function () {
    'use strict';

    var root = document.documentElement;
    var mode = window.matchMedia('(display-mode: standalone)');
    var navbar = document.querySelector('.navbar-custom.fixed-top');
    var pending = false;
    var pullStartY = null;
    var pullCurrentY = null;
    var pullTriggered = false;
    var pullActive = false;
    var releaseTimer = null;

    function isStandalone() {
        return mode.matches || window.navigator.standalone === true;
    }

    function isStandaloneAtTop() {
        return isStandalone() && window.scrollY <= 0;
    }

    function beginPull(event) {
        if (!navbar || !event.touches || event.touches.length !== 1 || !isStandaloneAtTop()) {
            return;
        }

        window.clearTimeout(releaseTimer);
        root.classList.remove('pwa-navbar-releasing');

        pullStartY = event.touches[0].clientY;
        pullCurrentY = pullStartY;
        pullTriggered = false;
        pullActive = true;
    }

    function endPull() {
        var followedDocument = root.classList.contains('pwa-navbar-pulling');

        pullStartY = null;
        pullCurrentY = null;
        pullActive = false;

        if (!navbar) return;

        root.classList.remove('pwa-navbar-pulling');

        if (!followedDocument) {
            root.classList.remove('pwa-navbar-releasing');
            return;
        }

        /*
         * Keep the navbar document-positioned while WebKit finishes its native
         * elastic return. Switching back to fixed immediately on touchend would
         * make the bar snap while the rest of the page is still bouncing.
         */
        root.classList.add('pwa-navbar-releasing');
        releaseTimer = window.setTimeout(function () {
            root.classList.remove('pwa-navbar-releasing');
        }, 360);
    }

    function update() {
        pending = false;

        var standalone = isStandalone();
        var scroller = document.scrollingElement || root;
        var distance = Math.max(0, scroller.scrollHeight - scroller.clientHeight);
        var nearBottom = distance > 0 && window.scrollY > distance / 2;

        root.classList.toggle('pwa-standalone', standalone);
        root.classList.toggle('overscroll-near-bottom', standalone && nearBottom);

        if (!standalone) {
            endPull();
        }
    }

    function schedule() {
        if (pending) return;
        pending = true;
        window.requestAnimationFrame(update);
    }

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('pageshow', schedule);

    if (mode.addEventListener) mode.addEventListener('change', schedule);
    else mode.addListener(schedule);

    if (window.ResizeObserver) {
        new ResizeObserver(schedule).observe(document.body);
    }

    /*
     * Track a possible downward pull that starts at the top. We do not change
     * the navbar mode until the finger actually moves downward, so an ordinary
     * upward swipe from the top keeps the navbar fixed as usual.
     */
    window.addEventListener('touchstart', function (event) {
        beginPull(event);
    }, { passive: true });

    window.addEventListener('touchmove', function (event) {
        if (
            !pullActive ||
            pullStartY === null ||
            !event.touches ||
            event.touches.length !== 1
        ) return;

        pullCurrentY = event.touches[0].clientY;

        var pullDistance = pullCurrentY - pullStartY;
        if (pullDistance <= 1) return;

        /* Let WebKit move the navbar with the document: no per-frame `top`. */
        root.classList.add('pwa-navbar-pulling');

        if (pullTriggered) return;

        var threshold = window.innerHeight * 0.4;
        if (pullDistance < threshold) return;

        pullTriggered = true;
        window.dispatchEvent(
            new CustomEvent('qff:pwa-quick-access-request')
        );
    }, { passive: true });

    window.addEventListener('touchend', endPull, { passive: true });
    window.addEventListener('touchcancel', endPull, { passive: true });

    schedule();
})();
