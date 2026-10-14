document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    setupScrollAnimations();
    setupLightbox();
    setupHeroMotion();
    setupBirthdayGate(setupBackgroundMusic);
    setupBirthdaySurprises();
});

function setupBirthdayGate(onUnlocked) {
    const gate = document.getElementById('birthdayGate');
    const countdown = document.getElementById('birthdayCountdown');
    const passwordForm = document.getElementById('birthdayPasswordForm');
    const passwordInput = document.getElementById('birthdayPassword');
    const passwordStatus = document.getElementById('birthdayPasswordStatus');
    const gateNote = document.getElementById('birthdayGateNote');
    const gateTitle = document.getElementById('birthdayGateTitle');
    const countdownFields = {
        days: document.getElementById('countdownDays'),
        hours: document.getElementById('countdownHours'),
        minutes: document.getElementById('countdownMinutes'),
        seconds: document.getElementById('countdownSeconds')
    };
    if (!gate || !countdown || !passwordForm || !passwordInput || !passwordStatus || !gateNote || !gateTitle
        || Object.values(countdownFields).some((field) => !field)) {
        console.error('Birthday lock could not be initialized because required page elements are missing.');
        return;
    }

    const birthday = new Date(2026, 9, 17);
    const birthdayPassword = '17';
    const lockedContent = [...document.body.children].filter((element) => (
        !['birthdayGate', 'particles', 'backgroundMusic'].includes(element.id)
    ));
    let countdownInterval;

    const unlock = () => {
        gate.hidden = true;
        document.body.classList.remove('birthday-locked');
        lockedContent.forEach((element) => { element.inert = false; });
        if (countdownInterval) window.clearInterval(countdownInterval);
        onUnlocked();
    };

    if (new URLSearchParams(window.location.search).get('preview') === '1') {
        unlock();
        return;
    }

    const updateCountdown = () => {
        const remaining = birthday.getTime() - Date.now();
        if (remaining <= 0) {
            countdown.hidden = true;
            gateNote.hidden = true;
            passwordForm.hidden = false;
            passwordInput.focus();
            if (countdownInterval) window.clearInterval(countdownInterval);
            return;
        }

        const totalSeconds = Math.floor(remaining / 1000);
        countdownFields.days.textContent = String(Math.floor(totalSeconds / 86400));
        countdownFields.hours.textContent = String(Math.floor((totalSeconds % 86400) / 3600)).padStart(2, '0');
        countdownFields.minutes.textContent = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
        countdownFields.seconds.textContent = String(totalSeconds % 60).padStart(2, '0');
    };

    document.body.classList.add('birthday-locked');
    lockedContent.forEach((element) => { element.inert = true; });
    updateCountdown();
    if (!passwordForm.hidden) passwordInput.focus();
    else gateTitle.focus();
    if (!countdown.hidden) countdownInterval = window.setInterval(updateCountdown, 1000);

    passwordForm.addEventListener('submit', (event) => {
        event.preventDefault();
        if (passwordInput.value === birthdayPassword) {
            unlock();
            return;
        }

        passwordInput.value = '';
        passwordStatus.textContent = 'That date is not quite right. Please try again.';
        passwordInput.focus();
    });
}

function setupBirthdaySurprises() {
    const cake = document.getElementById('cakeScene');
    const cutButton = document.getElementById('cutCake');
    const cakeStatus = document.getElementById('cakeStatus');
    if (cake && cutButton && cakeStatus) {
        cutButton.addEventListener('click', () => {
            if (cake.classList.contains('cut')) return;
            cake.classList.add('cut');
            cutButton.disabled = true;
            cutButton.textContent = 'Cake Cut!';
            cakeStatus.textContent = 'Make a wish! Happy Birthday! \u2728';
            const rect = cake.getBoundingClientRect();
            createCelebrationBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
        });
    }

    const screen = document.getElementById('couponScreen');
    const openButton = document.getElementById('openCoupon');
    const closeButton = document.getElementById('closeCoupon');
    const redeemButton = document.getElementById('redeemCoupon');
    const status = document.getElementById('couponStatus');
    if (!screen || !openButton || !closeButton || !redeemButton || !status) return;

    const closeCoupon = () => {
        screen.hidden = true;
        openButton.focus();
    };
    openButton.addEventListener('click', () => {
        screen.hidden = false;
        closeButton.focus();
    });
    closeButton.addEventListener('click', closeCoupon);
    screen.addEventListener('click', (event) => {
        if (event.target === screen) closeCoupon();
    });
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !screen.hidden) closeCoupon();
    });
    redeemButton.addEventListener('click', () => {
        redeemButton.disabled = true;
        redeemButton.textContent = 'Coupon Redeemed!';
        status.textContent = 'Your big hug and birthday kiss are ready! \u2764';
        const rect = redeemButton.getBoundingClientRect();
        createCelebrationBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
    });
}

function setupBackgroundMusic() {
    const audio = document.getElementById('backgroundMusic');
    if (!audio) return;

    audio.volume = 0.18;
    const startMusic = () => {
        if (!audio.paused) return;
        audio.play().then(() => {
            document.removeEventListener('pointerdown', startMusic);
            document.removeEventListener('keydown', startMusic);
        }).catch((error) => {
            if (error.name !== 'NotAllowedError') {
                console.error('Background music could not be played.', error);
            }
        });
    };

    audio.addEventListener('error', () => {
        console.error('Background music could not be loaded.', audio.error);
    });
    document.addEventListener('pointerdown', startMusic);
    document.addEventListener('keydown', startMusic);
    startMusic();
}

function createParticles() {
    const layer = document.getElementById('particles');
    if (!layer) return;
    const symbols = ['&#10084;&#65039;', '&#128149;', '&#128150;', '&#128151;', '&#127800;', '&#10024;'];

    for (let i = 0; i < 24; i += 1) {
        const particle = document.createElement('span');
        particle.className = 'particle';
        particle.innerHTML = symbols[Math.floor(Math.random() * symbols.length)];
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.animationDuration = `${Math.random() * 3 + 4}s`;
        particle.style.animationDelay = `${Math.random() * 2}s`;
        layer.appendChild(particle);
    }
}

function setupScrollAnimations() {
    const items = document.querySelectorAll('[data-reveal], .section-title');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('visible');

            if (entry.target.classList.contains('message-card')) {
                entry.target.querySelectorAll('.message-text, .message-signature').forEach((text, index) => {
                    setTimeout(() => text.classList.add('visible'), index * 420);
                });
            }
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

    items.forEach((item) => {
        const delay = item.dataset.delay;
        if (delay) item.style.transitionDelay = `${delay}ms`;
        observer.observe(item);
    });
}

function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    createCelebrationBurst(window.innerWidth / 2, window.innerHeight * 0.48);
}

function toggleLike(event, button) {
    event.stopPropagation();
    button.classList.toggle('liked');
    button.innerHTML = button.classList.contains('liked') ? '&#10084;&#65039;' : '&#9825;';

    if (button.classList.contains('liked')) {
        const rect = button.getBoundingClientRect();
        createCelebrationBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }
}

function createCelebrationBurst(x, y) {
    const symbols = ['&#10084;&#65039;', '&#128150;', '&#128149;', '&#10024;'];
    for (let i = 0; i < 14; i += 1) {
        const heart = document.createElement('span');
        heart.className = 'burst-heart';
        heart.innerHTML = symbols[i % symbols.length];
        heart.style.left = `${x}px`;
        heart.style.top = `${y}px`;
        heart.style.setProperty('--x', `${(Math.random() - 0.5) * 190}px`);
        heart.style.setProperty('--y', `${-50 - Math.random() * 120}px`);
        document.body.appendChild(heart);
        heart.addEventListener('animationend', () => heart.remove(), { once: true });
    }
}

function setupLightbox() {
    const lightbox = document.getElementById('lightbox');
    const image = document.getElementById('lightboxImage');
    const caption = document.getElementById('lightboxCaption');
    const closeButton = document.getElementById('lightboxClose');
    if (!lightbox || !image || !caption || !closeButton) return;

    document.querySelectorAll('.photo-container img, .reel-track img').forEach((photo) => {
        photo.addEventListener('click', () => {
            const cardCaption = photo.closest('.photo-container')?.querySelector('.photo-overlay p')?.textContent;
            image.src = photo.currentSrc || photo.src;
            image.alt = photo.alt;
            caption.textContent = cardCaption || 'A beautiful memory';
            lightbox.classList.add('open');
            lightbox.setAttribute('aria-hidden', 'false');
        });
    });

    const close = () => {
        lightbox.classList.remove('open');
        lightbox.setAttribute('aria-hidden', 'true');
        image.src = '';
    };
    closeButton.addEventListener('click', close);
    lightbox.addEventListener('click', (event) => { if (event.target === lightbox) close(); });
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') close(); });
}

function setupHeroMotion() {
    const hearts = document.querySelector('.floating-hearts');
    const photos = document.querySelectorAll('.hero-photo');
    document.addEventListener('mousemove', (event) => {
        const x = event.clientX / window.innerWidth - 0.5;
        const y = event.clientY / window.innerHeight - 0.5;
        if (hearts) hearts.style.transform = `translate(${x * 22}px, ${y * 18}px)`;
        photos.forEach((photo, index) => {
            const depth = (index + 1) * 5;
            photo.style.marginLeft = `${x * depth}px`;
            photo.style.marginTop = `${y * depth}px`;
        });
    });
}
