/**
 * Payment Integration Frontend - Stripe Elements
 * Connects to the Node.js/Express backend to process real payments.
 */

// Replace with your Stripe publishable key from .env
const STRIPE_PUBLISHABLE_KEY = 'pk_test_your_publishable_key_here';

// Backend URL (update when deploying)
const API_BASE = window.location.origin;

// Initialize Stripe
let stripe;
let elements;
let cardElement;

document.addEventListener('DOMContentLoaded', () => {
    const publishableKey = document.body.dataset.stripeKey || STRIPE_PUBLISHABLE_KEY;

    if (publishableKey && publishableKey !== 'pk_test_your_publishable_key_here') {
        stripe = Stripe(publishableKey);
        initStripeElements();
    } else {
        console.warn('Stripe publishable key not configured. Payment form will run in demo mode.');
        showMessage('Stripe not configured. Add your publishable key to enable real payments.', 'error');
    }

    setupForm();
    setupAmountListeners();
});

function initStripeElements() {
    elements = stripe.elements();

    const cardOptions = {
        style: {
            base: {
                iconColor: '#666666',
                color: '#31325f',
                lineHeight: '40px',
                fontWeight: 400,
                fontFamily: 'Inter, Helvetica, Arial, sans-serif',
                fontSize: '16px',
                '::placeholder': {
                    color: '#95a3b6',
                },
            },
            invalid: {
                iconColor: '#ef4444',
                color: '#ef4444',
            },
        },
    };

    cardElement = elements.create('card', cardOptions);
    cardElement.mount('#card-element');

    cardElement.on('change', (event) => {
        const displayError = document.getElementById('card-errors');
        if (event.error) {
            displayError.textContent = event.error.message;
        } else {
            displayError.textContent = '';
        }
    });
}

function setupForm() {
    const form = document.getElementById('payment-form');
    const btn = document.getElementById('submit-btn');
    const btnText = document.getElementById('btn-text');
    const spinner = document.getElementById('spinner');
    const message = document.getElementById('payment-message');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const amount = parseFloat(document.getElementById('amount').value);
        const currency = document.getElementById('currency').value;

        // Validation
        if (!email || !isValidEmail(email)) {
            showMessage('Please enter a valid email address.', 'error');
            return;
        }

        if (!amount || amount <= 0) {
            showMessage('Please enter a valid amount.', 'error');
            return;
        }

        if (!stripe || !cardElement) {
            showMessage('Stripe is not configured. Please add your publishable key.', 'error');
            return;
        }

        // UI loading state
        btn.disabled = true;
        spinner.classList.remove('hidden');
        btnText.textContent = 'Processing...';
        message.classList.add('hidden');

        try {
            // Step 1: Create PaymentIntent on the backend
            const createResponse = await fetch(`${API_BASE}/api/create-payment-intent`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount,
                    currency,
                    metadata: {
                        email,
                        order_type: 'portfolio_checkout',
                        source: 'website'
                    }
                })
            });

            if (!createResponse.ok) {
                const errorData = await createResponse.json();
                throw new Error(errorData.error || 'Failed to create payment intent');
            }

            const { clientSecret, paymentIntentId } = await createResponse.json();

            // Step 2: Confirm card payment with Stripe Elements
            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: cardElement,
                    billing_details: {
                        email,
                    },
                },
            });

            if (error) {
                // Card was declined or error occurred
                showMessage(error.message || 'Payment failed. Please try again.', 'error');
            } else if (paymentIntent.status === 'succeeded') {
                // Payment successful
                showMessage(
                    `Payment successful!<br><strong>Transaction ID:</strong> ${paymentIntent.id}<br><strong>Amount:</strong> $${(amount).toFixed(2)}<br><strong>Status:</strong> ${paymentIntent.status}`,
                    'success'
                );
                form.reset();
                document.getElementById('amount').value = '49.99';
                updateButtonText();
                updateSummary();
                cardElement.clear();
            }
        } catch (err) {
            console.error('Payment error:', err);
            showMessage(err.message || 'An unexpected error occurred. Please try again.', 'error');
        } finally {
            btn.disabled = false;
            spinner.classList.add('hidden');
            btnText.textContent = `Pay $${document.getElementById('amount').value}`;
        }
    });
}

function setupAmountListeners() {
    const amountInput = document.getElementById('amount');
    const btnText = document.getElementById('btn-text');
    const summarySubtotal = document.getElementById('summary-subtotal');
    const summaryTotal = document.getElementById('summary-total');

    amountInput.addEventListener('input', () => {
        const val = parseFloat(amountInput.value) || 0;
        btnText.textContent = `Pay $${val.toFixed(2)}`;
        updateSummary();
    });

    amountInput.addEventListener('blur', () => {
        const val = parseFloat(amountInput.value);
        if (val > 0) {
            amountInput.value = val.toFixed(2);
        }
        btnText.textContent = `Pay $${amountInput.value}`;
        updateSummary();
    });
}

function updateButtonText() {
    const amount = document.getElementById('amount').value;
    document.getElementById('btn-text').textContent = `Pay $${amount}`;
}

function updateSummary() {
    const amount = parseFloat(document.getElementById('amount').value) || 0;
    document.getElementById('summary-subtotal').textContent = `$${amount.toFixed(2)}`;
    document.getElementById('summary-total').textContent = `$${amount.toFixed(2)}`;
}

function showMessage(text, type) {
    const message = document.getElementById('payment-message');
    message.innerHTML = text;
    message.classList.remove('hidden', 'success', 'error');
    message.classList.add(type);
    message.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Auto-hide error messages after 8 seconds
    if (type === 'error') {
        setTimeout(() => {
            message.classList.add('hidden');
        }, 8000);
    }
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}
