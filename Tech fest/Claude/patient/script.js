/**
 * Mercy General Hospital - Patient Admission Form
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

    // ========================================
    // Audio Manager (Web Audio API)
    // ========================================
    class AudioManager {
        constructor() {
            this.generator = null;
            this.init();
        }

        init() {
            if (window.SoundGenerator) {
                this.generator = new window.SoundGenerator();
                this.generator.init();
            }
        }

        play(name) {
            if (!this.generator) return;
            switch (name) {
                case 'click': this.generator.playClick(); break;
                case 'hover': this.generator.playHover(); break;
                case 'success': this.generator.playSuccess(); break;
                case 'error': this.generator.playError(); break;
                case 'transition': this.generator.playTransition(); break;
            }
        }

        setVolume(volume) {
            if (this.generator) this.generator.setVolume(volume);
        }
    }

    // ========================================
    // Form Validator
    // ========================================
    class FormValidator {
        constructor(form) {
            this.form = form;
            this.rules = {
                patientType: { required: true },
                firstName: { required: true, minLength: 2, pattern: /^[a-zA-Z\s'-]+$/ },
                middleName: { minLength: 1, pattern: /^[a-zA-Z\s'-]*$/ },
                lastName: { required: true, minLength: 2, pattern: /^[a-zA-Z\s'-]+$/ },
                dob: { required: true },
                gender: { required: true },
                ssn: { required: true, pattern: /^\d{4}$/ },
                maritalStatus: { required: true },
                race: {},
                language: { required: true },
                insuranceProvider: { required: true },
                policyNumber: { required: true, minLength: 5 },
                groupNumber: {},
                subscriberName: { required: true, minLength: 2 },
                subscriberDob: { required: true },
                subscriberRelation: { required: true },
                secInsuranceProvider: {},
                secPolicyNumber: {},
                primaryCare: {},
                referringDr: {},
                admissionReason: { required: true, minLength: 10 },
                ecName1: { required: true, minLength: 2 },
                ecRelation1: { required: true },
                ecPhone1: { required: true },
                ecAltPhone1: {},
                ecAddress1: {},
                ecName2: {},
                ecPhone2: {},
                advanceDirective: { required: true },
                directiveType: {},
                directiveLocation: {},
                consentTreatment: { required: true },
                consentHipaa: { required: true },
                consentFinancial: { required: true },
                consentRelease: { required: true },
                consentMedicare: {},
                patientSignature: { required: true, minLength: 2 },
                signatureDate: { required: true },
                representativeRelation: {}
            };
        }

        validateField(name, value) {
            const rule = this.rules[name];
            if (!rule) return true;

            const input = this.form.querySelector(`[name="${name}"]`);
            const group = input?.closest('.form-group');
            const errorEl = group?.querySelector('.error-message');

            group?.classList.remove('has-error');
            if (errorEl) errorEl.textContent = '';

            if (rule.required && (!value || (Array.isArray(value) && value.length === 0))) {
                this.showError(group, errorEl, `${this.getFieldLabel(name)} is required`);
                return false;
            }

            if (!value) return true;

            if (rule.minLength && value.length < rule.minLength) {
                this.showError(group, errorEl, `${this.getFieldLabel(name)} must be at least ${rule.minLength} characters`);
                return false;
            }

            if (rule.pattern && !rule.pattern.test(value)) {
                this.showError(group, errorEl, this.getPatternMessage(name));
                return false;
            }

            if (name === 'dob' && !this.isValidDOB(value)) {
                this.showError(group, errorEl, 'Invalid date of birth');
                return false;
            }

            if (name === 'subscriberDob' && !this.isValidDOB(value)) {
                this.showError(group, errorEl, 'Invalid subscriber date of birth');
                return false;
            }

            if (name === 'signatureDate' && !this.isFutureDate(value)) {
                this.showError(group, errorEl, 'Date cannot be in the future');
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
                patientType: 'Admission type',
                firstName: 'First name',
                middleName: 'Middle name',
                lastName: 'Last name',
                dob: 'Date of birth',
                gender: 'Gender',
                ssn: 'SSN (last 4)',
                maritalStatus: 'Marital status',
                race: 'Race/Ethnicity',
                language: 'Preferred language',
                insuranceProvider: 'Insurance provider',
                policyNumber: 'Policy number',
                groupNumber: 'Group number',
                subscriberName: 'Subscriber name',
                subscriberDob: 'Subscriber DOB',
                subscriberRelation: 'Relationship to patient',
                secInsuranceProvider: 'Secondary insurance provider',
                secPolicyNumber: 'Secondary policy number',
                primaryCare: 'Primary care physician',
                referringDr: 'Referring physician',
                admissionReason: 'Reason for admission',
                ecName1: 'Emergency contact name',
                ecRelation1: 'Relationship',
                ecPhone1: 'Phone number',
                ecAltPhone1: 'Alternate phone',
                ecAddress1: 'Address',
                ecName2: 'Secondary contact name',
                ecPhone2: 'Secondary phone',
                advanceDirective: 'Advance directive status',
                directiveType: 'Directive type',
                directiveLocation: 'Document location',
                consentTreatment: 'Consent for treatment',
                consentHipaa: 'HIPAA acknowledgment',
                consentFinancial: 'Financial responsibility',
                consentRelease: 'Release of information',
                consentMedicare: 'Medicare authorization',
                patientSignature: 'Signature',
                signatureDate: 'Date',
                representativeRelation: 'Relationship'
            };
            return labels[name] || name;
        }

        getPatternMessage(name) {
            const messages = {
                ssn: 'Enter last 4 digits of SSN',
                policyNumber: 'Enter a valid policy number'
            };
            return messages[name] || 'Invalid format';
        }

        isValidDOB(dateStr) {
            const date = new Date(dateStr);
            const now = new Date();
            if (date > now) return false;
            if (date < new Date('1900-01-01')) return false;
            return true;
        }

        isFutureDate(dateStr) {
            const date = new Date(dateStr);
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            return date <= now;
        }

        validateStep(stepNumber) {
            const step = this.form.querySelector(`.form-step[data-step="${stepNumber}"]`);
            if (!step) return true;

            const inputs = step.querySelectorAll('input[required], select[required], textarea[required]');
            let isValid = true;

            inputs.forEach(input => {
                const name = input.name;
                if (name.startsWith('medications') || name.startsWith('conditions') || name.startsWith('allergies')) return;
                const value = input.type === 'checkbox' || input.type === 'radio' ? input.checked : input.value;
                if (!this.validateField(name, value)) {
                    isValid = false;
                }
            });

            if (stepNumber === 3) {
                const reason = step.querySelector('[name="admissionReason"]');
                if (reason && !this.validateField('admissionReason', reason.value)) {
                    isValid = false;
                }
            }

            if (stepNumber === 4) {
                const advanceDirective = step.querySelector('input[name="advanceDirective"]:checked');
                if (!advanceDirective) {
                    this.showError(step.querySelector('.directive-cards'), null, 'Please select an advance directive option');
                    isValid = false;
                }
                if (advanceDirective && advanceDirective.value === 'yes') {
                    const directiveType = step.querySelector('[name="directiveType"]');
                    if (directiveType && !this.validateField('directiveType', directiveType.value)) {
                        isValid = false;
                    }
                }
            }

            if (stepNumber === 5) {
                const consentFields = ['consentTreatment', 'consentHipaa', 'consentFinancial', 'consentRelease'];
                consentFields.forEach(field => {
                    const input = step.querySelector(`[name="${field}"]`);
                    if (input && !this.validateField(field, input.checked)) {
                        isValid = false;
                    }
                });
            }

            return isValid;
        }

        validateAll() {
            for (let i = 1; i <= 5; i++) {
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
    // Admission Form Controller
    // ========================================
    class AdmissionForm {
        constructor() {
            this.form = $('#admission-form');
            this.currentStep = 1;
            this.totalSteps = 5;
            this.validator = new FormValidator(this.form);
            this.audio = new AudioManager();
            this.medicationCount = 1;
            this.init();
        }

        init() {
            this.bindEvents();
            this.updateProgress();
            this.initSecondaryInsuranceToggle();
            this.initAdvanceDirectiveToggle();
            this.initAllergyExclusive();
            this.initMedications();
            this.animateStats();
            this.initMobileMenu();
            this.initSmoothScroll();
        }

        bindEvents() {
            $('#next-btn').addEventListener('click', () => this.nextStep());
            $('#prev-btn').addEventListener('click', () => this.prevStep());

            $$('.progress-step').forEach(step => {
                step.addEventListener('click', () => this.goToStep(parseInt(step.dataset.step)));
            });

            this.form.addEventListener('submit', (e) => this.handleSubmit(e));

            $$('input, select, textarea', this.form).forEach(input => {
                input.addEventListener('blur', () => this.validateField(input));
                input.addEventListener('input', debounce(() => this.clearError(input), 500));
            });

            $$('.directive-card').forEach(card => {
                card.addEventListener('click', () => {
                    this.audio.play('click');
                    this.handleAdvanceDirectiveSelection(card);
                });
            });

            $('#hero-cta')?.addEventListener('click', (e) => {
                e.preventDefault();
                this.scrollToAdmission();
            });

            $$('button, .directive-card, .allergy-tag, .condition-card, .payment-option, .nav-link, .category-tab').forEach(el => {
                el.addEventListener('mouseenter', () => this.audio.play('hover'));
            });

            $('#modal-close')?.addEventListener('click', () => this.closeModal());
            $('.modal-overlay')?.addEventListener('click', (e) => {
                if (e.target === e.currentTarget) this.closeModal();
            });
        }

        validateField(input) {
            const name = input.name;
            if (name.startsWith('medications') || name.startsWith('conditions') || name.startsWith('allergies')) return true;
            const value = input.type === 'checkbox' || input.type === 'radio' ? input.checked : input.value;
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

            const currentStepEl = this.form.querySelector(`.form-step[data-step="${this.currentStep}"]`);
            if (currentStepEl) currentStepEl.classList.remove('active');

            $$('.progress-step').forEach((el, i) => {
                const stepNum = i + 1;
                el.classList.toggle('active', stepNum === step);
                el.setAttribute('aria-disabled', stepNum > step);
                if (stepNum === step) el.setAttribute('aria-current', 'step');
                else el.removeAttribute('aria-current');
            });

            const newStepEl = this.form.querySelector(`.form-step[data-step="${step}"]`);
            if (newStepEl) newStepEl.classList.add('active');

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
            const regId = 'MGH-' + Math.random().toString(36).substring(2, 8).toUpperCase();
            const typeEl = this.form.querySelector('[name="patientType"]:checked') || this.form.querySelector('[name="patientType"]');

            $('#reg-id').textContent = regId;
            $('#reg-type').textContent = typeEl ? typeEl.value.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'General';

            modal.hidden = false;
            document.body.style.overflow = 'hidden';
        }

        closeModal() {
            $('#success-modal').hidden = true;
            document.body.style.overflow = '';
            this.form.reset();
            this.goToStep(1);
            this.updateSecondaryInsuranceVisibility();
        }

        delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        // ========================================
        // Secondary Insurance Toggle
        // ========================================
        initSecondaryInsuranceToggle() {
            const toggle = $('#hasSecondary');
            const secondarySection = $('#secondary-insurance');

            if (toggle && secondarySection) {
                toggle.addEventListener('change', () => this.updateSecondaryInsuranceVisibility());
            }
        }

        updateSecondaryInsuranceVisibility() {
            const toggle = $('#hasSecondary');
            const secondarySection = $('#secondary-insurance');
            const inputs = secondarySection?.querySelectorAll('input[required], select[required]');

            if (toggle?.checked) {
                secondarySection.hidden = false;
                inputs?.forEach(input => input.required = true);
            } else {
                secondarySection.hidden = true;
                inputs?.forEach(input => input.required = false);
            }
        }

        // ========================================
        // Advance Directive Toggle
        // ========================================
        initAdvanceDirectiveToggle() {
            $$('input[name="advanceDirective"]').forEach(radio => {
                radio.addEventListener('change', () => this.handleAdvanceDirectiveChange(radio));
            });
        }

        handleAdvanceDirectiveChange(radio) {
            const details = $('#directive-details');
            const inputs = details?.querySelectorAll('input[required], select[required]');

            if (radio.value === 'yes') {
                details.hidden = false;
                inputs?.forEach(input => input.required = true);
            } else {
                details.hidden = true;
                inputs?.forEach(input => input.required = false);
            }
        }

        handleAdvanceDirectiveSelection(card) {
            const radio = card.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
                this.handleAdvanceDirectiveChange(radio);

                $$('.directive-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
            }
        }

        // ========================================
        // Allergy Exclusive (NKA)
        // ========================================
        initAllergyExclusive() {
            const nkaCheckbox = $('#no-allergies');
            const otherCheckboxes = $$('.allergy-tags .allergy-checkbox:not(#no-allergies)');

            if (nkaCheckbox) {
                nkaCheckbox.addEventListener('change', () => {
                    if (nkaCheckbox.checked) {
                        otherCheckboxes.forEach(cb => {
                            cb.checked = false;
                            cb.closest('.allergy-tag').classList.remove('checked');
                        });
                    }
                });
            }

            otherCheckboxes.forEach(cb => {
                cb.addEventListener('change', () => {
                    if (cb.checked) {
                        nkaCheckbox.checked = false;
                        nkaCheckbox.closest('.allergy-tag').classList.remove('checked');
                    }
                });
            });
        }

        // ========================================
        // Medications Dynamic Rows
        // ========================================
        initMedications() {
            const addBtn = $('#add-medication');
            if (addBtn) {
                addBtn.addEventListener('click', () => this.addMedicationRow());
            }
        }

        addMedicationRow() {
            this.medicationCount++;
            const container = $('#medications-container');
            const index = this.medicationCount - 1;

            const row = document.createElement('div');
            row.className = 'medication-row';
            row.innerHTML = `
                <div class="form-group">
                    <label for="med${index}-name" class="form-label"><span>Medication Name</span></label>
                    <div class="input-wrapper">
                        <input type="text" id="med${index}-name" name="medications[${index}][name]" class="form-input" placeholder="e.g., Lisinopril" autocomplete="off">
                        <span class="input-border"></span>
                    </div>
                </div>
                <div class="form-group">
                    <label for="med${index}-dose" class="form-label"><span>Dosage</span></label>
                    <div class="input-wrapper">
                        <input type="text" id="med${index}-dose" name="medications[${index}][dose]" class="form-input" placeholder="e.g., 10mg" autocomplete="off">
                        <span class="input-border"></span>
                    </div>
                </div>
                <div class="form-group">
                    <label for="med${index}-freq" class="form-label"><span>Frequency</span></label>
                    <div class="input-wrapper">
                        <select id="med${index}-freq" name="medications[${index}][freq]" class="form-input form-select">
                            <option value="">Select</option>
                            <option value="once-daily">Once Daily</option>
                            <option value="twice-daily">Twice Daily</option>
                            <option value="three-daily">Three Times Daily</option>
                            <option value="four-daily">Four Times Daily</option>
                            <option value="as-needed">As Needed (PRN)</option>
                            <option value="weekly">Weekly</option>
                        </select>
                        <span class="input-border"></span>
                    </div>
                </div>
                <button type="button" class="btn btn-secondary btn-remove-med" aria-label="Remove medication">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
            `;

            container.appendChild(row);

            // Add remove functionality
            const removeBtn = row.querySelector('.btn-remove-med');
            removeBtn.addEventListener('click', () => {
                this.audio.play('click');
                row.remove();
            });

            // Add validation listeners
            $$('input, select', row).forEach(input => {
                input.addEventListener('blur', () => this.validateField(input));
                input.addEventListener('input', debounce(() => this.clearError(input), 500));
            });

            this.audio.play('click');
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
                        const offset = 80;
                        const targetPosition = target.getBoundingClientRect().top + window.scrollY - offset;
                        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
                    }
                });
            });
        }

        scrollToAdmission() {
            const admissionSection = $('#admission');
            if (admissionSection) {
                const offset = 80;
                const targetPosition = admissionSection.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top: targetPosition, behavior: 'smooth' });
                setTimeout(() => {
                    $('#patientType')?.focus();
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
        new AdmissionForm();
    });

})();