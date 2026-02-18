# Dad's Breakfast — Website

A clean, modern standalone website for Dad's Breakfast, a grain-free granola brand. Built with plain HTML, CSS, and JavaScript. Uses the Shopify Buy Button for purchasing integration.

## Features

- Mobile-first responsive design
- Black & white base with baby pink and baby yellow accents
- Shopify Buy Button integration for embedded purchasing
- Contact form
- Accessible: focus states, semantic HTML, ARIA attributes, keyboard navigation
- Scroll animations
- No build tools required — pure HTML/CSS/JS

## Project Structure

```
dadsbreakfast-site/
├── index.html          # Home page
├── about.html          # Founder story
├── contact.html        # Contact form + info
├── products.html       # Shop page with Shopify Buy Button
├── assets/
│   ├── css/
│   │   └── style.css   # All styles
│   ├── js/
│   │   └── main.js     # Mobile menu, animations, Buy Button init
│   └── images/         # Product and brand images (add yours here)
├── README.md
└── CLAUDE.md
```

## Quick Start

### Local Preview

Just open `index.html` in your browser. No build step needed.

For a local dev server (optional):
```bash
npx serve .
```

### Deploy to Vercel

1. Push this folder to a GitHub repo
2. Connect the repo to Vercel
3. Vercel auto-detects it as a static site and deploys

Or deploy directly:
```bash
npx vercel
```

## Setup Guide

### 1. Replace Placeholder Images

All image placeholders are marked with visible labels like "Product Image Placeholder". Replace them by:

1. Add your photos to `assets/images/`
2. Update the `<img>` tags (or placeholder `<div>`s) in:
   - `index.html` — hero background, feature section, founder preview
   - `about.html` — founder photos, granola photos, packaging photos
   - `products.html` — product card images (if using static cards)

Recommended image sizes:
- Hero: 1920x1080px
- Product cards: 800x800px (square)
- About page: 1200x675px (16:9)

### 2. Set Up Shopify Buy Button

This is how customers will purchase granola through your site.

#### Step 1: Create a Shopify Store
1. Sign up at [shopify.com](https://www.shopify.com)
2. Add your granola products (name, price $8.00, description, images)

#### Step 2: Add the Buy Button Sales Channel
1. In Shopify Admin, go to **Settings > Apps and sales channels**
2. Click **Shopify App Store** and search for "Buy Button channel"
3. Install the **Buy Button** sales channel

#### Step 3: Create a Buy Button
1. Go to **Sales Channels > Buy Button**
2. Click **Create a Buy Button**
3. Choose "Product collection" to embed all products, or create individual product buttons
4. Customize the appearance (or skip — our JS handles styling)
5. Click **Generate code**

#### Step 4: Get Your Credentials
From the generated embed code, find:
- **Store domain**: `your-store.myshopify.com`
- **Storefront Access Token**: the long string in `storefrontAccessToken`

#### Step 5: Add to Your Site
In `products.html`, find the `#shopify-buy` div and add your credentials:

```html
<div id="shopify-buy"
     data-domain="your-store.myshopify.com"
     data-token="your-storefront-access-token">
</div>
```

The Buy Button SDK will automatically load and display your products with an Add to Cart button and a built-in cart widget.

#### Using Individual Product Embeds (Alternative)

If you prefer to control layout, use individual product embeds instead:

```html
<div class="product-listing">
  <div data-shopify-product-id="1234567890"></div>
  <div data-shopify-product-id="1234567891"></div>
</div>
```

Find product IDs in your Shopify Admin URL when editing a product.

### 3. Set Up Payments in Shopify

1. Go to **Settings > Payments** in Shopify Admin
2. Set up **Shopify Payments** (enables credit cards)
3. **Apple Pay**: Automatically enabled with Shopify Payments
4. **PayPal**: Automatically added
5. Optional: Enable Shop Pay for faster checkout

### 4. Set Up Shipping in Shopify

1. Go to **Settings > Shipping and delivery**
2. Create shipping rates:
   - "Standard Shipping": $5.95 (for orders under $30)
   - "Free Shipping": $0.00 (for orders $30+)
3. **Local pickup**: Enable under Shipping > Local pickup, set location to Lexington, VA

### 5. Contact Form

The contact form currently validates client-side and can be set up with:

**Option A: Formspree (Recommended, free)**
1. Sign up at [formspree.io](https://formspree.io)
2. Create a new form
3. Copy your form endpoint URL
4. In `contact.html`, update the form's `data-action` attribute:
   ```html
   <form id="contact-form" data-action="https://formspree.io/f/YOUR_FORM_ID">
   ```

**Option B: Direct Email (Simple)**
The form falls back to opening the user's email client with a `mailto:` link if no form action is configured.

**Option C: Web3Forms (Free)**
1. Get an access key at [web3forms.com](https://web3forms.com)
2. Add as `data-action` endpoint

### 6. Custom Domain

To use a custom domain (e.g., dadsbreakfast.com):
1. Purchase domain from a registrar (Namecheap, Google Domains, etc.)
2. In Vercel: **Settings > Domains > Add** your domain
3. Update DNS records as instructed by Vercel

## Customization

### Colors
Edit CSS custom properties in `assets/css/style.css` under `:root`:
- `--color-accent-pink`: Baby pink (#f8d7da)
- `--color-accent-yellow`: Baby yellow (#fff3cd)
- `--color-text`: Main text (#1a1a1a)
- etc.

### Content
All text is in the HTML files. Edit directly:
- Hero headline > `index.html`
- About story > `about.html`
- Contact info > `contact.html`
- Product descriptions > `products.html` (static cards) or Shopify (Buy Button)

### Adding Pages
Copy any HTML file as a template, update the `<main>` content, and add a nav link.

## Browser Support

- Chrome, Firefox, Safari, Edge (latest 2 versions)
- iOS Safari, Android Chrome
- Graceful degradation for older browsers

---

Built with care for Dad's Breakfast
