/**
 * TechFest 2026 - College Event Registration
 * Main JavaScript Module
 */

(function() {
    'use strict';

    // ========================================
    // Utility Functions
    // ========================================
    const $ = (selector, context = document) => context.querySelector(selector);
    const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));

    const debounce = (fn, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => fn(...args), delay);
        };
    };

    const throttle = (fn, limit) => {
        let inThrottle;
        return (...args) => {
            if (!inThrottle) {
                fn(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    };

    // ========================================
    // Audio Manager (Web Audio API)
    // ========================================
    class AudioManager {
        constructor() {
            this.generator = null;
            this.enabled = false;
            this.init();
        }

        init() {
            // Use the SoundGenerator if available, otherwise fallback
            if (window.SoundGenerator) {
                this.generator = new window.SoundGenerator();
                this.generator.init();
            }
        }

        play(name) {
            if (!this.generator) return;
            switch (name) {
                case 'click':
                    this.generator.playClick();
                    break;
                case 'hover':
                    this.generator.playHover();
                    break;
                case 'success':
                    this.generator.playSuccess();
                    break;
                case 'error':
                    this.generator.playError();
                    break;
                case 'transition':
                    this.generator.playTransition();
                    break;
            }
        }

        setVolume(volume) {
            if (this.generator) {
                this.generator.setVolume(volume);
            }
        }
    }

    // ========================================
    // Form Validator
    // ========================================
    class FormValidator {
        constructor(form) {
            this.form = form;
            this.errors = new Map();
            this.rules = {
                firstName: { required: true, minLength: 2, pattern: /^[a-zA-Z\s'-]+$/ },
                lastName: { required: true, minLength: 2, pattern: /^[a-zA-Z\s'-]+$/ },
                email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
                phone: { required: true, pattern: /^[\+]?[(]?[0-9]{1,3}[)]?[-\s\.]?[(]?[0-9]{1,3}[)]?[-\s\.]?[0-9]{4,6}$/ },
                college: { required: true },
                year: { required: true },
                major: { required: true, minLength: 2 },
                cardName: { required: true, minLength: 2 },
                cardNumber: { required: true, pattern: /^[\d\s]{13,19}$/ },
                cardExpiry: { required: true, pattern: /^(0[1-9]|1[0-2])\/?([0-9]{2})$/ },
                cardCvc: { required: true, pattern: /^\d{3,4}$/ },
                terms: { required: true }
            };
        }

        validateField(name, value) {
            const rule = this.rules[name];
            if (!rule) return true;

            const input = this.form.querySelector(`[name="${name}"]`);
            const group = input?.closest('.form-group');
            const errorEl = group?.querySelector('.error-message');

            // Clear previous error
            group?.classList.remove('has-error');
            if (errorEl) errorEl.textContent = '';

            // Required check
            if (rule.required && (!value || (Array.isArray(value) && value.length === 0))) {
                this.showError(group, errorEl, `${this.getFieldLabel(name)} is required`);
                return false;
            }

            // Skip other validations if empty and not required
            if (!value) return true;

            // Min length
            if (rule.minLength && value.length < rule.minLength) {
                this.showError(group, errorEl, `${this.getFieldLabel(name)} must be at least ${rule.minLength} characters`);
                return false;
            }

            // Pattern
            if (rule.pattern && !rule.pattern.test(value)) {
                this.showError(group, errorEl, this.getPatternMessage(name));
                return false;
            }

            // Custom validations
            if (name === 'email' && !this.isValidEmail(value)) {
                this.showError(group, errorEl, 'Please enter a valid email address');
                return false;
            }

            if (name === 'cardNumber' && !this.luhnCheck(value.replace(/\s/g, ''))) {
                this.showError(group, errorEl, 'Invalid card number');
                return false;
            }

            if (name === 'cardExpiry' && !this.isFutureDate(value)) {
                this.showError(group, errorEl, 'Card has expired');
                return false;
            }

            return true;
        }

        showError(group, errorEl, message) {
            group?.classList.add('has-error');
            if (errorEl) errorEl.textContent = message;
        }

        getFieldLabel(name) {
            const labels = {
                firstName: 'First name',
                lastName: 'Last name',
                email: 'Email',
                phone: 'Phone number',
                college: 'College',
                year: 'Academic year',
                major: 'Major',
                cardName: 'Name on card',
                cardNumber: 'Card number',
                cardExpiry: 'Expiry date',
                cardCvc: 'CVC',
                terms: 'Terms acceptance'
            };
            return labels[name] || name;
        }

        getPatternMessage(name) {
            const messages = {
                phone: 'Please enter a valid phone number',
                cardNumber: 'Enter a valid card number',
                cardExpiry: 'Use MM/YY format',
                cardCvc: 'Enter 3-4 digit CVC'
            };
            return messages[name] || 'Invalid format';
        }

        isValidEmail(email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        }

        luhnCheck(num) {
            let sum = 0;
            let isEven = false;
            for (let i = num.length - 1; i >= 0; i--) {
                let digit = parseInt(num[i], 10);
                if (isEven) {
                    digit *= 2;
                    if (digit > 9) digit -= 9;
                }
                sum += digit;
                isEven = !isEven;
            }
            return sum % 10 === 0;
        }

        isFutureDate(expiry) {
            const [month, year] = expiry.split('/').map(Number);
            const now = new Date();
            const currentYear = now.getFullYear() % 100;
            const currentMonth = now.getMonth() + 1;
            if (year < currentYear) return false;
            if (year === currentYear && month < currentMonth) return false;
            return true;
        }

        validateStep(stepNumber) {
            const step = this.form.querySelector(`.form-step[data-step="${stepNumber}"]`);
            if (!step) return true;

            const inputs = step.querySelectorAll('input[required], select[required]');
            let isValid = true;

            inputs.forEach(input => {
                const name = input.name;
                const value = input.type === 'checkbox' ? input.checked : input.value;
                if (!this.validateField(name, value)) {
                    isValid = false;
                }
            });

            // Special validation for checkboxes (events, workshops)
            if (stepNumber === 2) {
                const events = step.querySelectorAll('input[name="events"]:checked');
                if (events.length === 0) {
                    this.showError(step.querySelector('.event-cards'), null, 'Select at least one event');
                    isValid = false;
                }
            }

            if (stepNumber === 3) {
                const workshops = step.querySelectorAll('input[name="workshops"]:checked');
                if (workshops.length === 0) {
                    this.showError(step.querySelector('.workshop-panels'), null, 'Select at least one workshop');
                    isValid = false;
                }
                if (workshops.length > 3) {
                    this.showError(step.querySelector('.workshop-panels'), null, 'Maximum 3 workshops allowed');
                    isValid = false;
                }
            }

            return isValid;
        }

        validateAll() {
            for (let i = 1; i <= 4; i++) {
                if (!this.validateStep(i)) return false;
            }
            return true;
        }

        getFormData() {
            const formData = new FormData(this.form);
            const data = {};
            for (const [key, value] of formData.entries()) {
                if (data[key]) {
                    if (!Array.isArray(data[key])) data[key] = [data[key]];
                    data[key].push(value);
                } else {
                    data[key] = value;
                }
            }
            return data;
        }
    }

    // ========================================
    // Registration Form Controller
    // ========================================
    class RegistrationForm {
        constructor() {
            this.form = $('#registration-form');
            this.currentStep = 1;
            this.totalSteps = 4;
            this.validator = new FormValidator(this.form);
            this.audio = new AudioManager();
            this.init();
        }

        init() {
            this.bindEvents();
            this.updateProgress();
            this.initWorkshopTabs();
            this.initWorkshopSelection();
            this.initPaymentMethod();
            this.initCardFormatting();
            this.animateStats();
            this.initTestimonials();
            this.initFAQ();
            this.initMobileMenu();
            this.initSmoothScroll();
        }

        bindEvents() {
            // Next/Previous buttons
            $('#next-btn').addEventListener('click', () => this.nextStep());
            $('#prev-btn').addEventListener('click', () => this.prevStep());

            // Progress step clicks
            $$('.progress-step').forEach(step => {
                step.addEventListener('click', () => this.goToStep(parseInt(step.dataset.step)));
            });

            // Form submission
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));

            // Real-time validation
            $$('input, select', this.form).forEach(input => {
                input.addEventListener('blur', () => this.validateField(input));
                input.addEventListener('input', debounce(() => this.clearError(input), 500));
            });

            // Event card selection
            $$('.event-card').forEach(card => {
                card.addEventListener('click', () => {
                    this.audio.play('click');
                });
            });

            // Workshop card selection
            $$('.workshop-card').forEach(card => {
                card.addEventListener('click', () => {
                    this.audio.play('click');
                });
            });

            // Hero CTA
            $('#hero-cta')?.addEventListener('click', (e) => {
                e.preventDefault();
                this.scrollToRegister();
            });

            // Sound on hover for interactive elements
            $$('button, .event-card, .workshop-card, .payment-option, .nav-link, .category-tab').forEach(el => {
                el.addEventListener('mouseenter', () => this.audio.play('hover'));
            });

            // Modal close
            $('#modal-close')?.addEventListener('click', () => this.closeModal());
            $('.modal-overlay')?.addEventListener('click', (e) => {
                if (e.target === e.currentTarget) this.closeModal();
            });
        }

        validateField(input) {
            const name = input.name;
            const value = input.type === 'checkbox' ? input.checked : input.value;
            return this.validator.validateField(name, value);
        }

        clearError(input) {
            const group = input.closest('.form-group');
            if (group) {
                group.classList.remove('has-error');
                const errorEl = group.querySelector('.error-message');
                if (errorEl) errorEl.textContent = '';
            }
        }

        nextStep() {
            if (this.validator.validateStep(this.currentStep)) {
                this.audio.play('click');
                this.goToStep(this.currentStep + 1);
            } else {
                this.audio.play('error');
                this.shakeStep();
            }
        }

        prevStep() {
            this.audio.play('click');
            this.goToStep(this.currentStep - 1);
        }

        goToStep(step) {
            if (step < 1 || step > this.totalSteps) return;

            // Hide current step
            const currentStepEl = this.form.querySelector(`.form-step[data-step="${this.currentStep}"]`);
            if (currentStepEl) {
                currentStepEl.classList.remove('active');
            }

            // Update progress steps
            $$('.progress-step').forEach((el, i) => {
                const stepNum = i + 1;
                el.classList.toggle('active', stepNum === step);
                el.setAttribute('aria-disabled', stepNum > step);
                if (stepNum === step) el.setAttribute('aria-current', 'step');
                else el.removeAttribute('aria-current');
            });

            // Show new step
            const newStepEl = this.form.querySelector(`.form-step[data-step="${step}"]`);
            if (newStepEl) {
                newStepEl.classList.add('active');
            }

            this.currentStep = step;
            this.updateProgress();
            this.updateNavigation();
        }

        updateProgress() {
            const progress = (this.currentStep / this.totalSteps) * 100;
            $('#progress-fill').style.width = `${progress}%`;
            $('.progress-tracker').setAttribute('aria-valuenow', this.currentStep);
        }

        updateNavigation() {
            const prevBtn = $('#prev-btn');
            const nextBtn = $('#next-btn');
            const submitBtn = $('#submit-btn');

            prevBtn.disabled = this.currentStep === 1;

            if (this.currentStep === this.totalSteps) {
                nextBtn.hidden = true;
                submitBtn.hidden = false;
            } else {
                nextBtn.hidden = false;
                submitBtn.hidden = true;
            }
        }

        shakeStep() {
            const stepEl = this.form.querySelector(`.form-step[data-step="${this.currentStep}"]`);
            if (stepEl) {
                stepEl.style.animation = 'shake 0.3s ease-out';
                setTimeout(() => stepEl.style.animation = '', 300);
            }
        }

        async handleSubmit(e) {
            e.preventDefault();

            if (!this.validator.validateAll()) {
                this.audio.play('error');
                // Find first invalid step
                for (let i = 1; i <= this.totalSteps; i++) {
                    if (!this.validator.validateStep(i)) {
                        this.goToStep(i);
                        break;
                    }
                }
                return;
            }

            this.audio.play('success');
            this.showLoading();

            // Simulate API call
            await this.delay(2000);

            this.hideLoading();
            this.showSuccessModal();
        }

        showLoading() {
            $('#loading-overlay').hidden = false;
        }

        hideLoading() {
            $('#loading-overlay').hidden = true;
        }

        showSuccessModal() {
            const modal = $('#success-modal');
            const regId = 'TF26-' + Math.random().toString(36).substring(2, 8).toUpperCase();

            $('#reg-id').textContent = regId;

            // Get selected events
            const events = this.form.querySelectorAll('input[name="events"]:checked');
            const eventNames = Array.from(events).map(e => {
                const card = e.closest('.event-card');
                return card?.querySelector('.event-name')?.textContent || e.value;
            }).join(', ') || 'None selected';

            $('#reg-events').textContent = eventNames;

            modal.hidden = false;
            document.body.style.overflow = 'hidden';
        }

        closeModal() {
            $('#success-modal').hidden = true;
            document.body.style.overflow = '';
            this.form.reset();
            this.goToStep(1);
            this.updateWorkshopSummary();
        }

        delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        // ========================================
        // Workshop Tabs
        // ========================================
        initWorkshopTabs() {
            $$('.category-tab').forEach(tab => {
                tab.addEventListener('click', () => this.switchTab(tab));
            });
        }

        switchTab(tab) {
            const target = tab.getAttribute('aria-controls');

            $$('.category-tab').forEach(t => {
                t.setAttribute('aria-selected', 'false');
                t.classList.remove('active');
            });
            tab.setAttribute('aria-selected', 'true');
            tab.classList.add('active');

            $$('.workshop-panel').forEach(panel => {
                if (panel.id === target) {
                    panel.hidden = false;
                    panel.classList.add('active');
                } else {
                    panel.hidden = true;
                    panel.classList.remove('active');
                }
            });
        }

        // ========================================
        // Workshop Selection Limit
        // ========================================
        initWorkshopSelection() {
            $$('input[name="workshops"]').forEach(checkbox => {
                checkbox.addEventListener('change', () => this.updateWorkshopSelection(checkbox));
            });
        }

        updateWorkshopSelection(changedCheckbox) {
            const checked = $$('input[name="workshops"]:checked');

            if (checked.length > 3) {
                changedCheckbox.checked = false;
                this.audio.play('error');
                this.showToast('Maximum 3 workshops allowed', 'error');
            }

            this.updateWorkshopSummary();
        }

        updateWorkshopSummary() {
            const count = $$('input[name="workshops"]:checked').length;
            $('#workshop-count').textContent = count;
            $('#summary-fill').style.width = `${(count / 3) * 100}%`;
        }

        // ========================================
        // Payment Method Toggle
        // ========================================
        initPaymentMethod() {
            $$('input[name="paymentMethod"]').forEach(radio => {
                radio.addEventListener('change', () => this.toggleCardForm(radio.value));
            });
        }

        toggleCardForm(method) {
            const cardForm = $('#card-form');
            if (method === 'card') {
                cardForm.hidden = false;
                $$('#card-form input[required]').forEach(input => input.required = true);
            } else {
                cardForm.hidden = true;
                $$('#card-form input[required]').forEach(input => input.required = false);
            }
        }

        // ========================================
        // Card Number Formatting
        // ========================================
        initCardFormatting() {
            const cardNumber = $('#cardNumber');
            const cardExpiry = $('#cardExpiry');

            if (cardNumber) {
                cardNumber.addEventListener('input', (e) => {
                    let value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
                    value = value.replace(/(\d{4})/g, '$1 ').trim();
                    e.target.value = value.substring(0, 19);
                });
            }

            if (cardExpiry) {
                cardExpiry.addEventListener('input', (e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length >= 2) {
                        value = value.substring(0, 2) + '/' + value.substring(2, 4);
                    }
                    e.target.value = value.substring(0, 5);
                });
            }
        }

        // ========================================
        // Animated Stats Counter
        // ========================================
        animateStats() {
            const stats = $$('.stat-number[data-count]');
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        this.animateNumber(entry.target);
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });

            stats.forEach(stat => observer.observe(stat));
        }

        animateNumber(element) {
            const target = parseInt(element.dataset.count, 10);
            const duration = 2000;
            const start = performance.now();

            const animate = (currentTime) => {
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / duration, 1);
                const eased = this.easeOutQuart(progress);
                const current = Math.floor(target * eased);
                element.textContent = current.toLocaleString();

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    element.textContent = target.toLocaleString();
                }
            };

            requestAnimationFrame(animate);
        }

        easeOutQuart(t) {
            return 1 - Math.pow(1 - t, 4);
        }

        // ========================================
        // Testimonials Slider
        // ========================================
        initTestimonials() {
            const track = $('.testimonials-track');
            const cards = $$('.testimonial-card', track);
            const prevBtn = $('.slider-btn.prev');
            const nextBtn = $('.slider-btn.next');
            const dotsContainer = $('.slider-dots');

            if (!track || cards.length === 0) return;

            let currentIndex = 0;
            const cardsPerView = this.getCardsPerView();

            // Create dots
            const totalPages = Math.ceil(cards.length / cardsPerView);
            dotsContainer.innerHTML = '';
            for (let i = 0; i < totalPages; i++) {
                const dot = document.createElement('button');
                dot.setAttribute('role', 'tab');
                dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
                dot.setAttribute('aria-selected', i === 0);
                dot.addEventListener('click', () => this.goToSlide(i));
                dotsContainer.appendChild(dot);
            }

            this.testimonialState = { track, cards, prevBtn, nextBtn, dotsContainer, currentIndex, cardsPerView, totalPages };

            prevBtn.addEventListener('click', () => this.prevSlide());
            nextBtn.addEventListener('click', () => this.nextSlide());

            // Auto-play
            this.startAutoPlay();

            // Pause on hover
            track.addEventListener('mouseenter', () => this.stopAutoPlay());
            track.addEventListener('mouseleave', () => this.startAutoPlay());
        }

        getCardsPerView() {
            if (window.innerWidth >= 1024) return 3;
            if (window.innerWidth >= 768) return 2;
            return 1;
        }

        goToSlide(index) {
            const { track, cards, dotsContainer, cardsPerView } = this.testimonialState;
            const maxIndex = Math.ceil(cards.length / cardsPerView) - 1;
            index = Math.max(0, Math.min(index, maxIndex));

            this.testimonialState.currentIndex = index;
            const translateX = -index * (100 / cardsPerView);
            track.style.transform = `translateX(${translateX}%)`;

            $$('button', dotsContainer).forEach((dot, i) => {
                dot.setAttribute('aria-selected', i === index);
            });
        }

        nextSlide() {
            const { currentIndex, totalPages } = this.testimonialState;
            this.goToSlide((currentIndex + 1) % totalPages);
        }

        prevSlide() {
            const { currentIndex, totalPages } = this.testimonialState;
            this.goToSlide((currentIndex - 1 + totalPages) % totalPages);
        }

        startAutoPlay() {
            this.stopAutoPlay();
            this.autoPlayTimer = setInterval(() => this.nextSlide(), 5000);
        }

        stopAutoPlay() {
            if (this.autoPlayTimer) {
                clearInterval(this.autoPlayTimer);
                this.autoPlayTimer = null;
            }
        }

        // ========================================
        // FAQ Accordion
        // ========================================
        initFAQ() {
            $$('.faq-item').forEach(item => {
                const summary = item.querySelector('.faq-question');
                summary.addEventListener('click', (e) => {
                    // Allow default behavior for <details>
                    this.audio.play('click');
                });
            });
        }

        // ========================================
        // Mobile Menu
        // ========================================
        initMobileMenu() {
            const toggle = $('.nav-toggle');
            const links = $('.nav-links');

            if (!toggle || !links) return;

            toggle.addEventListener('click', () => {
                const expanded = toggle.getAttribute('aria-expanded') === 'true';
                toggle.setAttribute('aria-expanded', !expanded);
                links.style.display = expanded ? 'none' : 'flex';
            });

            // Close on link click
            $$('.nav-link', links).forEach(link => {
                link.addEventListener('click', () => {
                    if (window.innerWidth < 768) {
                        toggle.setAttribute('aria-expanded', 'false');
                        links.style.display = 'none';
                    }
                });
            });
        }

        // ========================================
        // Smooth Scroll
        // ========================================
        initSmoothScroll() {
            $$('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', (e) => {
                    const targetId = anchor.getAttribute('href');
                    if (targetId === '#') return;

                    const target = $(targetId);
                    if (target) {
                        e.preventDefault();
                        const offset = 80; // navbar height
                        const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;
                        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
                    }
                });
            });
        }

        scrollToRegister() {
            const registerSection = $('#register');
            if (registerSection) {
                const offset = 80;
                const targetPosition = registerSection.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
                // Focus first input after scroll
                setTimeout(() => {
                    $('#firstName')?.focus();
                }, 500);
            }
        }

        // ========================================
        // Toast Notifications
        // ========================================
        showToast(message, type = 'info') {
            let container = $('.toast-container');
            if (!container) {
                container = document.createElement('div');
                container.className = 'toast-container';
                document.body.appendChild(container);
            }

            const toast = document.createElement('div');
            toast.className = `toast toast-${type}`;
            toast.innerHTML = `
                <div class="toast-icon">
                    ${this.getToastIcon(type)}
                </div>
                <span class="toast-message">${message}</span>
                <button class="toast-close" aria-label="Dismiss">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
            `;

            container.appendChild(toast);

            toast.querySelector('.toast-close').addEventListener('click', () => this.removeToast(toast));

            setTimeout(() => this.removeToast(toast), 5000);
        }

        getToastIcon(type) {
            const icons = {
                success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
                error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
                info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
            };
            return icons[type] || icons.info;
        }

        removeToast(toast) {
            toast.classList.add('removing');
            setTimeout(() => toast.remove(), 300);
        }
    }

    // ========================================
    // Initialize
    // ========================================
    document.addEventListener('DOMContentLoaded', () => {
        new RegistrationForm();
    });

    // Handle window resize for testimonials
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            // Reinitialize testimonials if needed
        }, 250);
    });

})();