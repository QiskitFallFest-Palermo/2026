/*!
 * Start Bootstrap - Agnecy Bootstrap Theme (http://startbootstrap.com)
 * Code licensed under the Apache License v2.0.
 * For details, see http://www.apache.org/licenses/LICENSE-2.0.
 */

document.addEventListener('DOMContentLoaded', function () {
    var backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
        var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
        var backToTopUpdatePending = false;

        function updateBackToTop() {
            var viewportHeight = window.innerHeight;
            var pageIsLong = document.documentElement.scrollHeight >= viewportHeight * 2;
            var hasScrolled = window.scrollY >= Math.min(600, viewportHeight * 0.75);
            backToTop.hidden = !(pageIsLong && hasScrolled);
            backToTopUpdatePending = false;
        }

        function requestBackToTopUpdate() {
            if (!backToTopUpdatePending) {
                backToTopUpdatePending = true;
                window.requestAnimationFrame(updateBackToTop);
            }
        }

        window.addEventListener('scroll', requestBackToTopUpdate, { passive: true });
        window.addEventListener('resize', requestBackToTopUpdate);
        backToTop.addEventListener('click', function () {
            window.scrollTo({
                top: 0,
                behavior: reducedMotion.matches ? 'auto' : 'smooth'
            });
        });

        updateBackToTop();
    }

    var homeNavbar = document.querySelector('#navbarHome.fixed-top');
    if (homeNavbar) {
        var homeDropdowns = homeNavbar.querySelectorAll('.dropdown-menu-custom');
        var headerUpdatePending = false;

        function updateHeaderState() {
            var shouldShrink = window.scrollY >= 100;
            homeNavbar.classList.toggle('navbar-shrink', shouldShrink);
            homeDropdowns.forEach(function (dropdown) {
                dropdown.classList.toggle('dropdown-menu-custom-shrink', shouldShrink);
            });
            headerUpdatePending = false;
        }

        window.addEventListener('scroll', function () {
            if (!headerUpdatePending) {
                headerUpdatePending = true;
                window.requestAnimationFrame(updateHeaderState);
            }
        }, { passive: true });

        updateHeaderState();
    }

    document.querySelectorAll('a.page-scroll').forEach(function (anchor) {
        anchor.addEventListener('click', function (event) {
            var target = document.querySelector(anchor.hash);
            if (!target) return;

            event.preventDefault();
            target.scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Hero terminal: the window is inert until the visitor asks for output, so
    // "Run" reveals the qc.draw() circuit diagram and the sampled counts.
    var terminalRun = document.querySelector('.hero-terminal__run');
    if (terminalRun) {
        var terminal = terminalRun.closest('.hero-terminal');
        var terminalOutput = document.getElementById(terminalRun.getAttribute('aria-controls'));
        var terminalBody = terminalOutput && terminalOutput.parentElement;

        if (terminal && terminalOutput && terminalBody) {
            var terminalMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

            terminalRun.addEventListener('click', function () {
                var showOutput = terminalRun.getAttribute('aria-expanded') !== 'true';

                terminalRun.setAttribute('aria-expanded', String(showOutput));
                terminalOutput.hidden = !showOutput;
                terminal.classList.toggle('hero-terminal--running', showOutput);

                // The body caps its height while running, so bring the circuit
                // into view rather than leaving it below the snippet. Scrolling
                // the body itself keeps the page where the visitor left it.
                terminalBody.scrollTo({
                    top: showOutput ? terminalOutput.offsetTop - 18 : 0,
                    behavior: terminalMotion.matches ? 'auto' : 'smooth'
                });
            });
        }
    }

    var navbar = document.querySelector('.navbar-custom');
    var navigation = document.getElementById('main-navigation');

    function closeNavigationDropdowns() {
        if (!navigation) return;

        navigation.querySelectorAll('[data-bs-toggle="dropdown"].show').forEach(function (toggle) {
            bootstrap.Dropdown.getOrCreateInstance(toggle).hide();
        });
    }

    if (navigation) {
        navigation.querySelectorAll('a:not(.dropdown-toggle)').forEach(function (link) {
            link.addEventListener('click', function () {
                if (navigation.classList.contains('show')) {
                    bootstrap.Collapse.getOrCreateInstance(navigation).hide();
                }
            });
        });

        var desktopNavigation = window.matchMedia('(min-width: 768px)');
        var desktopDropdownCloseTimer;

        document.addEventListener('pointerover', function (event) {
            if (!desktopNavigation.matches || event.pointerType === 'touch') return;

            var toggle = navigation.querySelector('[data-bs-toggle="dropdown"].show');
            if (!toggle) return;

            var dropdown = toggle.closest('.nav-item.dropdown');
            window.clearTimeout(desktopDropdownCloseTimer);
            if (dropdown && dropdown.contains(event.target)) return;

            desktopDropdownCloseTimer = window.setTimeout(function () {
                if (dropdown && !dropdown.matches(':hover') && toggle.classList.contains('show')) {
                    bootstrap.Dropdown.getOrCreateInstance(toggle).hide();
                }
            }, 120);
        });

        navigation.addEventListener('hide.bs.collapse', closeNavigationDropdowns);
    }

    if (navbar) {
        // 'menu-open' gives the bar its solid background while either the
        // collapsed navigation or a dropdown is open, so it is only cleared
        // once both are closed again.
        function openMenuState() {
            navbar.classList.add('menu-open');
        }

        function syncMenuOpenState() {
            var dropdownOpen = !!navbar.querySelector('[data-bs-toggle="dropdown"].show');
            var collapseOpen = !!navigation && navigation.classList.contains('show');
            navbar.classList.toggle('menu-open', dropdownOpen || collapseOpen);
        }

        navbar.addEventListener('show.bs.dropdown', openMenuState);
        navbar.addEventListener('hidden.bs.dropdown', syncMenuOpenState);

        if (navigation) {
            navigation.addEventListener('show.bs.collapse', openMenuState);
            navigation.addEventListener('hidden.bs.collapse', syncMenuOpenState);
        }

        document.addEventListener('click', function (event) {
            if (window.innerWidth >= 768 || navbar.contains(event.target)) return;

            closeNavigationDropdowns();
            if (navigation && navigation.classList.contains('show')) {
                bootstrap.Collapse.getOrCreateInstance(navigation).hide();
            }
        });
    }

    document.querySelectorAll('.modal').forEach(function (modal) {
        modal.addEventListener('show.bs.modal', function () {
            history.replaceState(null, '', '#' + modal.id);
        });

        modal.addEventListener('hidden.bs.modal', function () {
            if (location.hash === '#' + modal.id) {
                history.replaceState(null, '', location.pathname + location.search);
            }
        });
    });
});
