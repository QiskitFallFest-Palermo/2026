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

    var faqAccordion = document.getElementById('faqAccordion');
    if (faqAccordion) {
        var faqMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

        faqAccordion.addEventListener('show.bs.collapse', function () {
            faqAccordion.style.removeProperty('--faq-scroll-space');
        });

        faqAccordion.addEventListener('shown.bs.collapse', function (event) {
            var headingId = event.target.getAttribute('aria-labelledby');
            var heading = headingId && document.getElementById(headingId);
            if (!heading) return;

            var fixedNavbar = document.querySelector('.navbar-custom.fixed-top');
            var navbarOffset = fixedNavbar ? fixedNavbar.getBoundingClientRect().height : 0;
            var headingTop = window.scrollY + heading.getBoundingClientRect().top;
            var targetTop = Math.max(0, headingTop - navbarOffset - 16);
            var maxScrollTop = document.documentElement.scrollHeight - window.innerHeight;
            var requiredScrollSpace = Math.max(0, targetTop - maxScrollTop);

            faqAccordion.style.setProperty('--faq-scroll-space', requiredScrollSpace + 'px');

            window.requestAnimationFrame(function () {
                window.scrollTo({
                    top: targetTop,
                    behavior: faqMotion.matches ? 'auto' : 'smooth'
                });
            });
        });

        faqAccordion.addEventListener('hidden.bs.collapse', function () {
            if (!faqAccordion.querySelector('.accordion-collapse.show')) {
                faqAccordion.style.removeProperty('--faq-scroll-space');
            }
        });
    }

    // Hero terminal: the code output stays hidden until the visitor asks for
    // it, so "Run" reveals the qc.draw() diagram and the sampled counts.
    var terminalRun = document.querySelector('.hero-terminal__run');
    if (terminalRun) {
        var terminal = terminalRun.closest('.hero-terminal');
        var terminalOutput = document.getElementById(terminalRun.getAttribute('aria-controls'));
        var terminalBody = terminalOutput && terminalOutput.parentElement;

        if (terminal && terminalOutput && terminalBody) {
            var terminalMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
            var terminalClose = terminal.querySelector('.hero-terminal__dot--close');
            var terminalMinimise = terminal.querySelector('.hero-terminal__dot--minimise');
            var terminalZoom = terminal.querySelector('.hero-terminal__dot--zoom');
            var terminalCloseFocusTarget = document.querySelector('.hero-cta');
            var terminalHome = terminal.parentNode;
            var terminalNextSibling = terminal.nextSibling;
            var terminalHeader = terminal.closest('.full-jumbo');
            var terminalMarquee = terminalHeader && terminalHeader.querySelector('.marquee');
            var terminalNavbar = document.querySelector('.navbar-custom');

            function setTerminalMaximised(maximised) {
                if (maximised && terminalHeader && terminalMarquee) {
                    syncTerminalChromeOffsets();
                    terminalHeader.insertBefore(terminal, terminalMarquee);
                } else if (!terminal.classList.contains('hero-terminal--minimised') &&
                    terminal.parentNode !== terminalHome) {
                    terminalHome.insertBefore(terminal, terminalNextSibling);
                }
                terminal.classList.toggle('hero-terminal--maximised', maximised);
                terminalZoom.setAttribute('aria-pressed', String(maximised));
                terminalZoom.setAttribute('aria-label', maximised ? 'Exit full screen' : 'Enter full screen');
                terminalZoom.title = maximised ? 'Exit full screen' : 'Enter full screen';
            }

            function syncTerminalChromeOffsets() {
                if (!terminalHeader || !terminalMarquee) return;
                terminalHeader.style.setProperty('--hero-marquee-height', terminalMarquee.offsetHeight + 'px');
                if (terminalNavbar) {
                    terminalHeader.style.setProperty('--hero-navbar-height', terminalNavbar.offsetHeight + 'px');
                }
            }

            function setTerminalMinimised(minimised) {
                if (minimised) {
                    setTerminalMaximised(false);
                    if (terminalHeader && terminalMarquee) {
                        syncTerminalChromeOffsets();
                        terminalHeader.insertBefore(terminal, terminalMarquee);
                    }
                } else if (terminal.parentNode !== terminalHome) {
                    terminalHome.insertBefore(terminal, terminalNextSibling);
                    if (terminalHeader) terminalHeader.style.removeProperty('--hero-marquee-height');
                }

                terminal.classList.toggle('hero-terminal--minimised', minimised);
                terminalBody.hidden = minimised;
                terminalMinimise.setAttribute('aria-pressed', String(minimised));
                terminalMinimise.setAttribute('aria-label', minimised ? 'Restore code window' : 'Minimise code window');
                terminalMinimise.title = minimised ? 'Restore' : 'Minimise';
            }

            terminalClose.addEventListener('click', function (event) {
                setTerminalMaximised(false);
                setTerminalMinimised(false);
                terminal.hidden = true;
                if (event.detail === 0 && terminalCloseFocusTarget) terminalCloseFocusTarget.focus();
            });

            terminalMinimise.addEventListener('click', function () {
                var minimise = !terminal.classList.contains('hero-terminal--minimised');

                setTerminalMinimised(minimise);
            });

            terminalZoom.addEventListener('click', function () {
                var maximise = !terminal.classList.contains('hero-terminal--maximised');

                if (maximise && terminal.classList.contains('hero-terminal--minimised')) {
                    setTerminalMinimised(false);
                }
                setTerminalMaximised(maximise);
            });

            window.addEventListener('resize', function () {
                var terminalIsResized = terminal.classList.contains('hero-terminal--minimised') ||
                    terminal.classList.contains('hero-terminal--maximised');

                if (terminalIsResized) syncTerminalChromeOffsets();
            });

            // A maximised window belongs to the hero presentation. Restore it
            // before the visitor continues down the page; scrolling inside the
            // terminal body does not trigger the document's scroll event.
            window.addEventListener('scroll', function () {
                if (terminal.classList.contains('hero-terminal--maximised')) {
                    setTerminalMaximised(false);
                }
            }, { passive: true });

            document.addEventListener('click', function (event) {
                if (window.matchMedia('(min-width: 768px)').matches &&
                    terminal.classList.contains('hero-terminal--maximised') &&
                    !terminal.contains(event.target)) {
                    setTerminalMaximised(false);
                }
            });

            if ('ResizeObserver' in window) {
                var terminalChromeObserver = new ResizeObserver(function () {
                    if (terminal.classList.contains('hero-terminal--maximised')) {
                        syncTerminalChromeOffsets();
                    }
                });

                if (terminalNavbar) terminalChromeObserver.observe(terminalNavbar);
                if (terminalMarquee) terminalChromeObserver.observe(terminalMarquee);
            }

            document.addEventListener('keydown', function (event) {
                if (event.key === 'Escape' && terminal.classList.contains('hero-terminal--maximised')) {
                    setTerminalMaximised(false);
                    terminalZoom.focus();
                }
            });

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
        // 'menu-open' gives the bar its solid background while the collapsed
        // navigation is open, which is the only time the menu needs the bar as
        // its surface. A dropdown carries its own panel, so opening one leaves
        // the bar as it is: over the hero, filling the bar under the pointer
        // would read as a flicker rather than as a state.
        if (navigation) {
            navigation.addEventListener('show.bs.collapse', function () {
                navbar.classList.add('menu-open');
            });

            navigation.addEventListener('hidden.bs.collapse', function () {
                navbar.classList.remove('menu-open');
            });
        }

        document.addEventListener('click', function (event) {
            if (window.innerWidth >= 768 || navbar.contains(event.target)) return;

            closeNavigationDropdowns();
            if (navigation && navigation.classList.contains('show')) {
                bootstrap.Collapse.getOrCreateInstance(navigation).hide();
            }
        });
    }

    // Scroll reveal. The hidden state is applied from here, not from the
    // stylesheet, so the page stays fully readable when scripting or
    // IntersectionObserver is unavailable.
    var revealTargets = document.querySelectorAll('[data-reveal]');
    var revealMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (revealTargets.length && 'IntersectionObserver' in window && !revealMotion.matches) {
        var revealObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-revealed');
                revealObserver.unobserve(entry.target);
            });
        }, { rootMargin: '0px 0px -10% 0px', threshold: 0.05 });

        revealTargets.forEach(function (target) {
            // Cards in the same row come in one after another; the cap keeps
            // the last item in a long row from lagging noticeably behind.
            var group = target.parentElement
                ? Array.prototype.filter.call(target.parentElement.children, function (child) {
                    return child.hasAttribute('data-reveal');
                })
                : [target];
            var position = Math.min(group.indexOf(target), 5);

            target.classList.add('reveal');
            if (position > 0) {
                target.style.setProperty('--reveal-delay', (position * 70) + 'ms');
            }
            revealObserver.observe(target);
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
