# Full-Stack Payment Website with Stripe Backend

A complete, production-ready payment integration website with a Node.js/Express backend connected to Stripe. Perfect for your e-portfolio.

## Features

- **Real Stripe integration** — PaymentIntents API on the backend
- **Stripe Elements** — Secure, PCI-compliant card input on the frontend
- **Email validation** and amount validation
- **Order summary** with live total updates
- **Success/error handling** with transaction IDs
- **Refund endpoint** for admin use
- **Stripe webhook endpoint** for production event handling
- **Responsive design** — works on all devices

## File Structure

```
payment-website-full/
├── server.js              # Node.js/Express backend
├── package.json           # Dependencies
├── .env.example           # Environment variables template
├── README.md              # This file
└── public/
    ├── index.html         # Checkout page
    ├── styles.css         # Styling
    └── script.js          # Frontend payment logic
```

## Setup Instructions

### 1. Get Stripe API Keys
1. Create a free account at [https://stripe.com](https://stripe.com)
2. Go to the Stripe Dashboard → Developers → API keys
3. Copy your **Publishable key** (starts with `pk_test_`) and **Secret key** (starts with `sk_test_`)

### 2. Install Dependencies
```bash
cd payment-website-full
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your keys:

```bash
cp .env.example .env
```

Edit `.env`:
```
STRIPE_SECRET_KEY=sk_test_your_actual_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_actual_publishable_key
PORT=3000
FRONTEND_URL=http://localhost:3000
```

### 4. Update Frontend Script Key
In `public/script.js`, replace `STRIPE_PUBLISHABLE_KEY` with your actual publishable key, or add `data-stripe-key` to the `<body>` tag in `index.html`.

### 5. Run the Server
```bash
npm start
# or for development with auto-reload:
npm run dev
```

Open `http://localhost:3000` in your browser.

## Test Cards (Stripe Test Mode)

| Card Number | Result |
|-------------|--------|
| 4242 4242 4242 4242 | Successful payment |
| 4000 0000 0000 0002 | Card declined |
| 4000 0000 0000 9995 | Insufficient funds |
| 4000 0000 0000 0069 | Expired card |

Any CVC, any future expiry date, any postal code.

## Deployment

### Render (Recommended)
1. Push code to GitHub
2. Connect Render to your repo
3. Add environment variables in Render dashboard
4. Set build command: `npm install`
5. Set start command: `npm start`

### Railway
1. Connect GitHub repo to Railway
2. Add environment variables
3. Deploy automatically

### Heroku
1. `heroku create your-app-name`
2. `heroku config:set STRIPE_SECRET_KEY=sk_test_...`
3. `heroku config:set STRIPE_PUBLISHABLE_KEY=pk_test_...`
4. `git push heroku main`

## Security Notes

- Never commit your `.env` file to version control
- The `.env.example` file is safe to share (no real keys)
- For production, use Stripe webhooks to handle events asynchronously
- Always validate amounts on the backend (already done in `server.js`)
- Switch to live mode keys (`sk_live_`, `pk_live_`) for real payments

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/create-payment-intent` | Create a Stripe PaymentIntent |
| GET | `/api/payment-intent/:id` | Retrieve payment intent status |
| POST | `/api/refund` | Create a refund |
| POST | `/api/webhook` | Stripe webhook handler |

---
Built for e-portfolio showcase. This connects to Stripe's test environment by default — no real money is charged unless you switch to live mode keys.