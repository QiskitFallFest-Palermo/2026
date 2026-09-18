document.addEventListener('DOMContentLoaded', function () {
    var shortContentMain = document.querySelector('body.page-layout > main');
    if (shortContentMain) {
        var footerBufferRoot = document.documentElement;
        var footerBufferPending = false;
        var tabletLayout = window.matchMedia('(max-width: 991.98px)');

        function updateShortContentFooterBuffer() {
            footerBufferPending = false;
            var viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
            var isShortContentPage = tabletLayout.matches && shortContentMain.getBoundingClientRect().height <= viewportHeight;

            footerBufferRoot.classList.toggle('short-content-footer-buffer', isShortContentPage);
        }

        function requestShortContentFooterBufferUpdate() {
            if (footerBufferPending) return;
            footerBufferPending = true;
            window.requestAnimationFrame(updateShortContentFooterBuffer);
        }

        window.addEventListener('resize', requestShortContentFooterBufferUpdate);
        window.addEventListener('pageshow', requestShortContentFooterBufferUpdate);
        if (window.visualViewport) window.visualViewport.addEventListener('resize', requestShortContentFooterBufferUpdate);
        if (tabletLayout.addEventListener) tabletLayout.addEventListener('change', requestShortContentFooterBufferUpdate);
        else tabletLayout.addListener(requestShortContentFooterBufferUpdate);
        if ('ResizeObserver' in window) new ResizeObserver(requestShortContentFooterBufferUpdate).observe(shortContentMain);

        updateShortContentFooterBuffer();
    }

    var hero = document.querySelector('.full-jumbo');
    var heroViewport = window.visualViewport;
    if (hero && heroViewport) {
        var heroViewportUpdatePending = false;

        function updateHeroViewport() {
            heroViewportUpdatePending = false;
            // Keep pinch zoom and the software keyboard from resizing the hero.
            var activeElement = document.activeElement;
            if (Math.abs(heroViewport.scale - 1) > 0.01 ||
                (activeElement && (activeElement.isContentEditable ||
                    /^(INPUT|TEXTAREA|SELECT)$/.test(activeElement.tagName)))) return;
            if (heroViewport.height > 0) {
                hero.style.setProperty('--hero-visible-height', heroViewport.height + 'px');
            }
        }

        function requestHeroViewportUpdate() {
            if (!heroViewportUpdatePending) {
                heroViewportUpdatePending = true;
                window.requestAnimationFrame(updateHeroViewport);
            }
        }

        heroViewport.addEventListener('resize', requestHeroViewportUpdate);
        window.addEventListener('resize', requestHeroViewportUpdate);
        window.addEventListener('pageshow', requestHeroViewportUpdate);
        document.addEventListener('focusout', requestHeroViewportUpdate);
        updateHeroViewport();
    }

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
            if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
            if (anchor.target && anchor.target !== '_self') return;
            if (anchor.origin !== location.origin || anchor.pathname !== location.pathname || anchor.search !== location.search || !anchor.hash) return;

            var target = document.getElementById(decodeURIComponent(anchor.hash.slice(1)));
            if (!target) return;

            event.preventDefault();
            if (location.hash !== anchor.hash) {
                history.pushState(null, '', anchor.hash);
            }
            target.scrollIntoView({
                behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
            });
        });
    });

    // URL fragments are not included in HTTP referrers. The News CTA records
    // its origin in the query string so the Blog return link can restore it.
    var blogReturnHome = document.querySelector('[data-blog-return-home]');
    if (blogReturnHome && new URLSearchParams(window.location.search).get('from') === 'news') {
        blogReturnHome.hash = 'news';
    }

    document.querySelectorAll('.agenda-speaker-trigger').forEach(function (trigger) {
        trigger.addEventListener('click', function () {
            var modal = document.querySelector(trigger.getAttribute('data-bs-target'));
            if (modal) modal.dataset.agendaFocusSpeaker = 'true';
        });
    });

    document.querySelectorAll('.agenda-abstract-modal').forEach(function (modal) {
        modal.addEventListener('shown.bs.modal', function () {
            if (modal.dataset.agendaFocusSpeaker !== 'true') return;

            delete modal.dataset.agendaFocusSpeaker;
            var speakerHeading = modal.querySelector('.agenda-modal-speaker h4');
            if (speakerHeading) speakerHeading.focus({ preventScroll: true });
        });

        modal.addEventListener('hidden.bs.modal', function () {
            delete modal.dataset.agendaFocusSpeaker;
        });
    });

    var agendaScrollViewport = document.querySelector('#agenda .table-responsive');
    var agendaScrollControls = document.querySelector('[data-agenda-scroll-controls]');
    if (agendaScrollViewport && agendaScrollControls) {
        var agendaScrollButtons = agendaScrollControls.querySelectorAll('[data-agenda-scroll-direction]');
        var agendaScrollColumn = agendaScrollViewport.querySelector('thead th');
        var agendaScrollAnimation;

        function updateAgendaScrollControls() {
            var maxScroll = agendaScrollViewport.scrollWidth - agendaScrollViewport.clientWidth;
            var viewportBounds = agendaScrollViewport.getBoundingClientRect();
            var visibleAgendaHeight = Math.max(0, Math.min(viewportBounds.bottom, window.innerHeight) - Math.max(viewportBounds.top, 0));
            var agendaIsVisible = visibleAgendaHeight >= window.innerHeight * 0.5;

            agendaScrollControls.hidden = maxScroll <= 1 || !agendaIsVisible;
            agendaScrollButtons[0].disabled = agendaScrollViewport.scrollLeft <= 1;
            agendaScrollButtons[1].disabled = agendaScrollViewport.scrollLeft >= maxScroll - 1;
        }

        function scrollAgendaTo(requestedTarget) {
            var maxScroll = agendaScrollViewport.scrollWidth - agendaScrollViewport.clientWidth;
            var start = agendaScrollViewport.scrollLeft;
            var target = Math.max(0, Math.min(maxScroll, requestedTarget));

            if (Math.abs(target - start) < 1) {
                agendaScrollViewport.scrollLeft = target;
                return;
            }

            if (agendaScrollAnimation) window.cancelAnimationFrame(agendaScrollAnimation);

            var startTime;
            var duration = Math.max(420, Math.min(600, Math.abs(target - start) * 2.5));
            function animateAgendaScroll(timestamp) {
                if (!startTime) startTime = timestamp;
                var progress = Math.min(1, (timestamp - startTime) / duration);
                var easedProgress = -(Math.cos(Math.PI * progress) - 1) / 2;
                agendaScrollViewport.scrollLeft = start + (target - start) * easedProgress;

                if (progress < 1) {
                    agendaScrollAnimation = window.requestAnimationFrame(animateAgendaScroll);
                } else {
                    agendaScrollAnimation = undefined;
                }
            }

            agendaScrollAnimation = window.requestAnimationFrame(animateAgendaScroll);
        }

        agendaScrollButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                var direction = Number(button.dataset.agendaScrollDirection);
                var columnWidth = agendaScrollColumn
                    ? Math.max(120, agendaScrollColumn.getBoundingClientRect().width)
                    : Math.max(120, agendaScrollViewport.clientWidth * 0.45);
                var currentColumn = Math.round(agendaScrollViewport.scrollLeft / columnWidth);

                scrollAgendaTo((currentColumn + direction) * columnWidth);
            });
        });

        agendaScrollViewport.addEventListener('scroll', updateAgendaScrollControls, { passive: true });
        agendaScrollViewport.addEventListener('pointerdown', function () {
            if (agendaScrollAnimation) {
                window.cancelAnimationFrame(agendaScrollAnimation);
                agendaScrollAnimation = undefined;
            }
        }, { passive: true });
        window.addEventListener('scroll', updateAgendaScrollControls, { passive: true });
        window.addEventListener('resize', updateAgendaScrollControls);
        if ('ResizeObserver' in window) {
            new ResizeObserver(updateAgendaScrollControls).observe(agendaScrollViewport);
        }
        updateAgendaScrollControls();
    }

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
            var navbarOffset = fixedNavbar ? fixedNavbar.getBoundingClientRect().bottom : 0;
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

    // The Qiskit example stays compact until "Run" reveals the circuit and
    // sampled counts. It deliberately behaves as a learning example, not as
    // a simulated desktop window in the event hero.
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
