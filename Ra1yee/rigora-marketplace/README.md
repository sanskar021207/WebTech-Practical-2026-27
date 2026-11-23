# Rigora — PC Hardware Marketplace Demo

A responsive, premium-styled frontend demo for a new and pre-owned PC parts marketplace. Built with vanilla HTML, CSS, and JavaScript so it can run locally without a build step.

## Run locally

1. Extract the ZIP.
2. Open the `rigora-marketplace` folder.
3. Double-click `index.html`, or use VS Code with the Live Server extension and choose **Open with Live Server**.
4. Internet access is needed for Google Fonts and the remote demo product imagery. Most interactions work locally.

## Included routes

- `#home` — Homepage
- `#new-parts` — New products catalogue
- `#used-parts` — Pre-owned catalogue
- `#product/gpu-01` — Example product details
- `#sell` — Sell a part form
- `#pc-builder` — Interactive component selector and total
- `#cart` — Cart with quantities and subtotal
- `#checkout` — Clearly labelled demo checkout
- `#account` — Demo customer/seller dashboard
- `#wishlist` — Saved products
- `#help`, `#shipping`, `#safety`, `#contact`, `#privacy`, `#terms` — Supporting pages

## Demo interactions

- Search, category filters, brand filters, price filters, and sorting.
- Add/remove cart items and update quantities.
- Persistent cart and wishlist using browser `localStorage`.
- Product detail pages.
- Listing form with local photo previews.
- Local demo listing and order history.
- PC builder selection and live total.
- Demo checkout that explicitly does **not** process payment.
- Responsive layout and reduced-motion support.

## Important limitations

This is a frontend prototype, not a production-ready marketplace. Demo listings, carts, and orders are stored only in the current browser. Authentication, a shared database, real seller messaging, image hosting, inventory reservation, tax calculation, shipping integration, and real payment processing are not connected.

To accept real payments, add a backend and integrate a payment provider in test mode first. Create payment orders server-side, verify signatures/webhooks server-side, keep secrets in environment variables, and never trust prices submitted by the browser. Do not store raw card numbers or CVVs.

## Suggested next production phase

- React + TypeScript frontend or Django templates
- Django/Express API and PostgreSQL database
- Secure authentication and role-based permissions
- Product catalog and seller listing APIs
- Image object storage
- Server-side cart/order/stock validation
- Razorpay/Stripe sandbox integration
- Payment webhooks and order state machine
- Automated tests and deployment configuration
