/* Dr. Asif Mansoori Dental Clinic — all site JS */
(function () {
    'use strict';
    document.documentElement.classList.add('js');

    /* ---------- Theme: light / dark ---------- */
    var themeToggle = document.getElementById('theme-toggle');
    var themeToggleMobile = document.getElementById('theme-toggle-mobile');

    function paintToggle() {
        var theme = document.documentElement.getAttribute('data-theme') || 'light';
        var isDark = theme === 'dark';
        [themeToggle, themeToggleMobile].forEach(function (btn) {
            if (!btn) return;
            btn.setAttribute('aria-pressed', String(isDark));
            btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
            btn.setAttribute('title', isDark ? 'Switch to light mode' : 'Switch to dark mode');
            var icon = btn.querySelector('.toggle-icon');
            var label = btn.querySelector('.toggle-label');
            if (icon) icon.textContent = isDark ? '🌙' : '☀️';
            if (label) label.textContent = isDark ? 'Light' : 'Dark';
        });
    }

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        try { localStorage.setItem('theme', theme); } catch (e) { /* private mode */ }
        paintToggle();
    }

    paintToggle();
    [themeToggle, themeToggleMobile].forEach(function (btn) {
        if (!btn) return;
        btn.addEventListener('click', function () {
            var current = document.documentElement.getAttribute('data-theme') || 'light';
            setTheme(current === 'dark' ? 'light' : 'dark');
        });
    });
    try {
        var mq = window.matchMedia('(prefers-color-scheme: dark)');
        mq.addEventListener('change', function (e) {
            if (!localStorage.getItem('theme')) {
                document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
                paintToggle();
            }
        });
    } catch (e) { /* older browsers */ }

    /* ---------- Mobile menu ---------- */
    var mobileMenuBtn = document.getElementById('mobile-menu-btn');
    var mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', function () {
            mobileMenu.classList.toggle('hidden');
        });
    }

    /* ---------- Scroll reveal ---------- */
    var revealEls = document.querySelectorAll('.anim-reveal');
    if ('IntersectionObserver' in window && revealEls.length) {
        var revealObs = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    revealObs.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });
        revealEls.forEach(function (el) { revealObs.observe(el); });
        setTimeout(function () {
            revealEls.forEach(function (el) {
                var r = el.getBoundingClientRect();
                if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('visible');
            });
        }, 800);
    } else {
        revealEls.forEach(function (el) { el.classList.add('visible'); });
    }

    /* ---------- Before / After Slider ---------- */
    var sliderContainer = document.getElementById('comparison-container');
    var slider = document.getElementById('comparison-slider');
    var afterLayer = document.getElementById('comparison-after');
    var afterImg = afterLayer ? afterLayer.querySelector('img') : null;

    if (sliderContainer && slider && afterLayer && afterImg) {
        var isDragging = false;

        function syncAfterWidth() {
            afterImg.style.width = sliderContainer.clientWidth + 'px';
        }

        function setPosition(pct) {
            if (pct < 2) pct = 2;
            if (pct > 98) pct = 98;
            slider.style.left = pct + '%';
            afterLayer.style.width = pct + '%';
            sliderContainer.setAttribute('aria-valuenow', String(Math.round(pct)));
        }

        function handleMove(clientX) {
            var rect = sliderContainer.getBoundingClientRect();
            var x = clientX - rect.left;
            if (x < 0) x = 0;
            if (x > rect.width) x = rect.width;
            setPosition((x / rect.width) * 100);
        }

        syncAfterWidth();
        setPosition(50);
        window.addEventListener('resize', function () { syncAfterWidth(); });

        sliderContainer.addEventListener('pointerdown', function (e) {
            isDragging = true;
            try { sliderContainer.setPointerCapture(e.pointerId); } catch (err) {}
            handleMove(e.clientX);
        });
        sliderContainer.addEventListener('pointermove', function (e) {
            if (!isDragging) return;
            handleMove(e.clientX);
        });
        ['pointerup', 'pointercancel'].forEach(function (evt) {
            sliderContainer.addEventListener(evt, function () { isDragging = false; });
        });
        sliderContainer.addEventListener('click', function (e) { handleMove(e.clientX); });
        sliderContainer.addEventListener('keydown', function (e) {
            var current = parseFloat(sliderContainer.getAttribute('aria-valuenow')) || 50;
            if (e.key === 'ArrowLeft') { e.preventDefault(); setPosition(current - 5); }
            if (e.key === 'ArrowRight') { e.preventDefault(); setPosition(current + 5); }
            if (e.key === 'Home') { e.preventDefault(); setPosition(0); }
            if (e.key === 'End') { e.preventDefault(); setPosition(100); }
        });
    }

    /* ---------- Gallery filter ---------- */
    var filterBtns = document.querySelectorAll('[data-filter]');
    if (filterBtns.length) {
        filterBtns.forEach(function (btn) {
            btn.addEventListener('click', function () {
                filterBtns.forEach(function (b) { b.classList.remove('active'); });
                btn.classList.add('active');
                var category = btn.getAttribute('data-filter');
                document.querySelectorAll('.gallery-item').forEach(function (item) {
                    if (category === 'all' || item.getAttribute('data-category') === category) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
    }

    /* ---------- About video: play ONCE when scrolled into view ---------- */
    var aboutVideo = document.getElementById('about-video');
    if (aboutVideo) {
        var hasPlayed = false;
        if ('IntersectionObserver' in window) {
            var videoObs = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting && !hasPlayed) {
                        hasPlayed = true;
                        videoObs.disconnect();
                        var p = aboutVideo.play();
                        if (p && p.catch) p.catch(function () { /* autoplay blocked; stays paused */ });
                    }
                });
            }, { threshold: 0.5 });
            videoObs.observe(aboutVideo);
        } else if (!hasPlayed) {
            hasPlayed = true;
            var p2 = aboutVideo.play();
            if (p2 && p2.catch) p2.catch(function () {});
        }
        aboutVideo.addEventListener('ended', function () {
            aboutVideo.pause();
            aboutVideo.classList.add('video-locked');
        });
        aboutVideo.addEventListener('click', function (e) { e.preventDefault(); });
        aboutVideo.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    }

    /* ---------- Booking form -> WhatsApp ---------- */
    var bookingForm = document.getElementById('booking-form');
    var formSuccess = document.getElementById('form-success');
    var waAgain = document.getElementById('whatsapp-again');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function (event) {
            event.preventDefault();
            var name = document.getElementById('field-name').value.trim();
            var phone = document.getElementById('field-phone').value.trim();
            var service = document.getElementById('field-service').value;
            var date = document.getElementById('field-date').value;
            var notes = document.getElementById('field-notes').value.trim();
            var lines = [
                '🦷 *New Appointment Request*',
                '------------------------------',
                '*Name:* ' + name,
                '*Phone:* ' + phone,
                '*Service:* ' + service,
                '*Preferred Date:* ' + (date || 'Not specified'),
                '*Message:* ' + (notes || '—')
            ];
            var waUrl = 'https://wa.me/923332181153?text=' + encodeURIComponent(lines.join('\n'));
            if (formSuccess) formSuccess.classList.remove('hidden');
            if (waAgain) waAgain.href = waUrl;
            window.open(waUrl, '_blank', 'noopener');
            bookingForm.reset();
        });
    }
})();

/* Backwards-compatible global (older inline handlers) */
function filterGallery(category) {
    var items = document.querySelectorAll('.gallery-item');
    items.forEach(function (item) {
        if (category === 'all' || item.getAttribute('data-category') === category) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}
