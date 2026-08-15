# NEXUS USER PANEL — COMPLETE PROJECT DOCUMENTATION

## WHAT IS THIS PROJECT
Firebase-powered user dashboard/storefront. Users can create accounts, browse panels, purchase license keys, deposit wallet balance (UPI/crypto/gateway), refer friends, manage profile & support tickets.

---

## PROJECT STRUCTURE (EVERY FILE EXPLAINED)

```
PANEL STORE/
│
├── firebase.json              Firebase Hosting config. Serves pages/index/index.html on root "/".
│                               All other routes also served via index.html (SPA-like rewrites).
│
├── package.json               Keeps list of NPM dependencies (terser, obfuscator).
│                               Run "npm install" to download node_modules/ folder.
│
├── sw.js                      Service Worker. Runs in browser background.
│                               Caches all HTML/JS/CSS for offline access.
│                               Speeds up repeat visits (loads from cache instead of network).
│
├── .gitignore                 Tells Git which files/folders to ignore (node_modules/, backups/).
│
├── docs/
│   └── BLUEPRINT.md           ← YOU ARE HERE. Full project documentation.
│
├── pages/                     ─── ALL MAIN PAGES (one folder per page) ───
│   │
│   ├── index/                 ★ LOGIN / SIGNUP PAGE
│   │   ├── index.html         HTML structure. Two tabs: Login | Register.
│   │   ├── index.css          Styles: cyberpunk theme, glassmorphism, particles.
│   │   └── index.js           Auth logic: email/password login, signup, Google login.
│   │                           Calls: signInWithEmailAndPassword, createUserWithEmailAndPassword,
│   │                           signInWithPopup (Google). Creates user profile in Firebase /users/ node.
│   │
│   ├── home/                  ★ USER DASHBOARD (landing page after login)
│   │   ├── home.html          Shows: user name, balance, stats (purchases count, spent, keys).
│   │   ├── home.css           Styles with animations, stat cards, featured panels carousel.
│   │   └── home.js            Reads: /users/{uid}, /purchases/{uid}, /panels, /promotions, /settings/branding.
│   │                           onAuthStateChanged → loads all data. onValue for real-time balance.
│   │
│   ├── shop/                  ★ STORE / PRODUCT LISTING
│   │   ├── shop.html          Shows all panels with filters, search, category chips.
│   │   ├── shop.css           Product cards with tilt effect, YouTube previews, plan popups.
│   │   └── shop.js            Reads: /panels (all products), /users/{uid}/balance (check funds).
│   │                           Purchase flow: runTransaction on balance → create purchase record →
│   │                           create transaction record → apply coupon → show success.
│   │
│   ├── wallet/                ★ WALLET / DEPOSITS
│   │   ├── wallet.html        Shows balance, transaction history, deposit tabs.
│   │   ├── wallet.css         Deposit forms, payment method tabs, transaction list.
│   │   └── wallet.js          Three deposit methods:
│   │                           1. AUTO (ZapUPI API) — creates order, polls for payment status
│   │                           2. MANUAL (UPI) — user enters UTR, admin approves
│   │                           3. CRYPTO (USDT) — user sends crypto, admin approves
│   │                           Reads: /zap_config, /payment_config, /transactions/{uid}
│   │
│   └── profile/               ★ USER PROFILE & KEYS
│       ├── profile.html       Shows user info, balance, purchased license keys.
│       ├── profile.css        Profile card, key cards with copy function.
│       └── profile.js         Reads: /users/{uid}, /purchases/{uid}. Real-time balance updates.
│                               Key copy function with clipboard API.
│
├── components/                ─── REUSABLE COMPONENTS ───
│   │
│   └── pages/                 Sub-pages (full standalone pages)
│       ├── hwid-reset.html    HWID reset tool. User enters old HWID, requests reset.
│       ├── payment-settings.html  Admin-only payment config (ZapKey, UPI, Crypto, USDT rate).
│       │                           Checks ADMIN_UID before loading. Writes to: /payment_config, /zap_config.
│       │                           Reads crypto deposits for approval.
│       ├── referrals.html     Referral program page. Shows referrer link, earned commissions.
│       ├── helpdesk.html      Support ticket system. Create ticket, view replies.
│       └── my-keys.html       List all purchased license keys.
│
├── assets/                    ─── SHARED RESOURCES ───
│   │
│   ├── scripts/
│   │   ├── core/
│   │   │   ├── firebase.js    ★ CENTRAL FIREBASE CONFIG (single source of truth)
│   │   │   │                   Initializes Firebase app with API key, auth domain, database URL.
│   │   │   │                   Exports: app, auth, db, ref, set, get, update, remove, push,
│   │   │   │                   onValue, runTransaction, serverTimestamp, onAuthStateChanged, 
│   │   │   │                   signInWithEmailAndPassword, signOut, ADMIN_UID
│   │   │   │
│   │   │   └── security.js    Anti-copy protection. Blocks F12, Ctrl+Shift+I/J, Ctrl+U,
│   │   │                       right-click, text selection (except on inputs).
│   │   │
│   │   └── utils/
│   │       └── language.js    Multi-language support. Defines window.i18n object with
│   │                           translations for English/Hindi/etc. Loaded as regular <script>.
│   │
│   └── css/
│       └── styles.css         Global styles. Base theme, colors, premium glass cards, toasts.
```

---

## HOW THE SYSTEM WORKS — COMPLETE FLOW

### 1. USER VISITS SITE
```
User types your domain → Firebase Hosting serves pages/index/index.html
→ Login/Signup page loads
→ User sees: Login form | Register form | Google login button
```

### 2. USER CREATES ACCOUNT (Signup)
```
→ User fills: Name, Username, Email, Password, Agree to Terms
→ Click "CREATE ACCOUNT"
→ index.js calls createUserWithEmailAndPassword(auth, email, password)
→ Firebase Auth creates user (Firebase Console → Authentication)
→ User profile saved to Firebase Realtime Database:
  /users/{uid}: {
    uid, name, username, email, balance: 0, role: "user",
    status: "active", createdAt: serverTimestamp()
  }
→ If referral code in URL (?ref=username), referrer gets ₹5 bonus
→ Redirect to home page
```

### 3. USER LOGS IN
```
→ Enter email + password
→ Click "LOGIN"
→ signInWithEmailAndPassword(auth, email, password)
→ onAuthStateChanged detects user → redirect to /pages/home/home.html
→ "Remember Me" saves email+password in localStorage
```

### 4. DASHBOARD (home page)
```
→ Shows: User name, email, wallet balance
→ Stats: Total purchases, total spent, unique keys count
→ Featured panels carousel (auto-scrolls)
→ Active promotions carousel
→ Recent purchases list with license keys
→ Real-time balance updates via onValue listener
```

### 5. BROWSING & PURCHASING (shop)
```
→ Shop loads all panels from /panels node
→ Each panel shows: YouTube preview, description, features, pricing plans
→ Filter by category or search by name
→ Click "PURCHASE KEY" → select plan → checkout modal
→ Apply coupon code (optional) → discount applied
→ Click "CONFIRM PAY":
  1. runTransaction deducts balance from /users/{uid}/balance
  2. Purchase record created in /purchases/{uid}
  3. Transaction record created in /transactions/{uid}
  4. Coupon usage count incremented
  5. Success modal shows license key
```

### 6. DEPOSITS (wallet)
```
Three ways to add money:

A) AUTO PAYMENT (ZapUPI API):
   → Need ZapUPI API key configured in admin panel
   → User enters amount + phone number
   → Creates order via ZapUPI API
   → Shows UPI QR/payment link
   → Polls every 5 seconds for payment status
   → On success: balance added automatically, transaction updated

B) MANUAL UPI DEPOSIT:
   → User enters amount + UTR number
   → Record saved to /manual_deposits/{txId}
   → Admin approves manually in admin panel
   → On approval: balance added, referral commission credited

C) CRYPTO DEPOSIT (USDT):
   → User sees Binance Pay ID, USDT address
   → Sends crypto, submits request
   → Record saved to /crypto_deposits/{txId}
   → Admin approves manually
   → Balance added at configured USDT→INR rate
```

### 7. REFERRAL SYSTEM
```
→ Each user has a referral link: yourdomain.com?ref=username
→ When new user signs up with referral:
  - referrer gets ₹5 signup bonus in /users/{referrer}/referralClaimable
  - Referral record created in /referrals/{referrer}/{newUserId}
→ When referred user deposits money:
  - referrer gets 5% commission
  - Commission added to referralClaimable balance
```

---

## FIREBASE DATABASE STRUCTURE

```
/users/{uid}                User profile data
  ├── uid                   Firebase Auth UID
  ├── name                  Full name
  ├── username              Unique username
  ├── email                 Email address
  ├── photo                 Profile photo URL
  ├── balance               Wallet balance (INR)
  ├── referralClaimable     Referral earnings balance
  ├── referredBy            UID of user who referred them
  ├── role                  "user" or "admin"
  ├── status                "active" or "banned"
  └── createdAt             Server timestamp

/transactions/{uid}/{txId}  Transaction history
  ├── id                    Transaction ID
  ├── type                  "deposit_manual" | "deposit_auto" | "deposit_crypto" | "purchase" | "admin_edit"
  ├── amount                Amount in INR
  ├── status                "pending" | "success" | "failed"
  ├── desc                  Description
  ├── date                  Date/timestamp
  └── (utr, txn_id)         Optional payment details

/purchases/{uid}/{purchaseId}  Purchase records
  ├── panelId               Panel ID
  ├── panelName             Panel display name
  ├── plan                  Plan key
  ├── label                 Plan label
  ├── price                 Purchase price
  ├── key                   Generated license key
  ├── link                  Panel download/update link
  ├── date                  Purchase date
  └── status                "active" | "disabled"

/panels/{panelId}           Product panels
  ├── name                  Panel name
  ├── logo                  Logo image URL
  ├── category              Category reference
  ├── youtube               YouTube video ID
  ├── link                  Download/update link
  ├── feedback              Feedback link
  ├── description           Panel features
  ├── status                "active" | "inactive"
  └── plans/{planKey}       Pricing plans
      ├── label             Plan name (e.g. "1 Month")
      ├── price             Price in INR
      └── keys              Number of keys included

/categories/{catId}         Panel categories
  ├── name                  Category name
  └── createdAt             Creation timestamp

/promotions/{promoId}       Promotional banners
  ├── title                 Banner title
  ├── description           Banner text
  ├── discount              Discount percentage
  ├── image                 Banner image URL
  ├── link                  Click-through link
  ├── status                true | false
  └── createdAt             Creation timestamp

/coupons/{couponId}         Discount coupons
  ├── code                  Coupon code (uppercase)
  ├── discount              Discount percentage
  ├── maxUse                Max usage limit (null = unlimited)
  ├── used                  Current usage count
  ├── status                true | false
  └── createdAt             Creation timestamp

/gateway_payments/{orderId}   Auto gateway payments
  ├── uid                   User UID
  ├── email                 User email
  ├── amount                Amount
  ├── phone                 User phone
  ├── status                "pending" | "approved" | "rejected"
  └── timestamp             Creation timestamp

/manual_deposits/{txId}     Manual UPI deposits
  ├── uid                   User UID
  ├── email                 User email
  ├── amount                Amount
  ├── utr                   UTR number
  ├── status                "pending" | "approved" | "rejected"
  └── timestamp             Creation timestamp

/crypto_deposits/{txId}     Crypto deposits
  ├── uid                   User UID
  ├── email                 User email
  ├── amount                Amount (INR)
  ├── usdt_amount           Amount in USDT
  ├── hash                  Transaction hash
  ├── status                "pending" | "approved" | "rejected"
  └── timestamp             Creation timestamp

/zap_config                 Auto payment API config
  └── api_key               ZapUPI API key

/payment_config             Payment method settings
  ├── upiId                 UPI ID for manual deposits
  ├── qrImage               QR code image URL
  ├── binance_pay_id        Binance Pay ID for crypto
  ├── usdt_address          USDT TRC20 address
  ├── crypto_qr             Crypto QR image URL
  └── crypto_rate           1 USDT = ? INR

/settings/branding          Site branding
  ├── name                  Store name
  ├── tagline               Tagline
  ├── logo                  Logo URL
  ├── announcement          Announcement text
  └── footer                Footer text

/support_links              Contact/support links
  ├── whatsapp              WhatsApp number
  ├── email                 Support email
  ├── telegram              Telegram link
  └── discord               Discord invite

/tickets/{uid}/{ticketId}   Support tickets
  ├── uid                   User UID
  ├── subject               Ticket subject
  ├── message               Ticket message
  ├── category              "payment" | "product" | "hwid" | "account" | "other"
  ├── priority              "low" | "medium" | "high" | "urgent"
  ├── status                "open" | "closed" | "resolved"
  ├── adminReply            Admin reply text
  └── createdAt             Creation timestamp

/notifications/{uid}/{notifId}  User notifications
  ├── type                  "deposit" | "reply" | "system"
  ├── title                 Notification title
  ├── message               Notification text
  ├── link                  Click-through link
  ├── read                  true | false
  └── createdAt             Creation timestamp

/referrals/{referrerUid}/{refUid}  Referral records
  ├── email                 Referred user email
  ├── date                  Referral date
  ├── deposited             Total deposited by referred user
  ├── commission            Commission earned
  └── signupReward          Signup bonus amount

/hwid_resets/{uid}/{resetId}  HWID reset requests
  ├── hwid                  New HWID
  ├── oldHwid               Old HWID
  ├── key                   License key
  └── timestamp             Request timestamp

/contact_messages/{msgId}   Contact form messages
  ├── name                  Sender name
  ├── email                 Sender email
  ├── message               Message text
  └── timestamp             Submission timestamp

/admins/{uid}               Authorized admin UIDs
  └── (exists = true)

/audit_log/{logId}          Admin action audit log
  ├── action                Action name
  ├── details               Action details
  ├── adminUID              Admin UID
  └── timestamp             Action timestamp
```

---

## FIREBASE SECURITY RULES

File: `docs/firebase/Rules.md`

Rules enforce:
- Only admin can write to /panels, /categories, /promotions, /coupons, /settings
- Users can read/write only their own data under /users/{uid}, /transactions/{uid}, /purchases/{uid}
- Deposits can be created by any authenticated user but only admin can change status
- .validate rules ensure data integrity (correct types, positive amounts, valid status values)
- "$other" catch-all blocks any undeclared paths

---

## IMPORTANT SECURITY NOTES

1. Firebase API key is client-side (required for Web SDK). MUST add HTTP referrer restriction
   in Firebase Console → Project Settings → API keys → restrict to your domain.

2. Admin UID ("PmgO7qHYasOdgQfkmai0YnpQIWB3") is hardcoded in firebase.js.
   To change admin: update UID in both firebase.js AND Firebase rules.
   Or add new admin UID to /admins/ node in Firebase Database.

3. payment-settings.html in components/pages/ is admin-only. It checks ADMIN_UID on load.
   Unauthorized users are redirected to home page.

---

## BUILD & DEPLOY

```bash
# Deploy to Firebase Hosting
firebase deploy

# Test locally
firebase serve
```

---

## PAGE LOAD SEQUENCE (HOW A PAGE WORKS)

```
1. Browser requests pages/{page}/{page}.html
2. HTML loads:
   a) CDN libraries: Tailwind CSS, Font Awesome, Google Fonts
   b) language.js (non-module, sets up translations)
   c) security.js (non-module, blocks dev tools)
   d) {page}.css (page-specific styles)
   e) Header is INLINE in the page (nav + styles + auth/balance/notification scripts)
      → home.html = dashboard header, shop.html = shop header, wallet.html = wallet header,
        profile.html = profile header, components/pages/*.html = panel header
   f) User menu (dropdown), bottom navigation bar and the notifications popup
      are INLINE in the page:
      - #nexusDropdownMenu (user menu: HWID Reset, My Keys, Refer & Earn, Helpdesk,
        App Settings, Admin Panel) + #dropdown-container styles/scripts
      - #bottomNav (Home/Store/Center/Wallet/Profile) + bottom-nav styles/scripts
      - #notification-container (hidden by default; toggled + refreshed by the header
        bell button via window.refreshNotifPopup) + notif-popup styles/scripts
      NOTE: payment-settings.html only inlines the notifications popup (it never had
      the user menu or bottom nav).
   g) {page}.js (ES module, imports firebase.js)
      - onAuthStateChanged → if not logged in, redirect to login
      - Loads data from Firebase (onValue for real-time)
      - Sets up event listeners
3. Page is interactive
```

---

## KEY TECHNOLOGIES USED

| Technology | Purpose |
|---|---|
| Firebase Auth | User authentication (email/password, Google) |
| Firebase Realtime Database | All data storage (users, products, purchases, etc.) |
| Firebase Hosting | Website hosting + CDN |
| Tailwind CSS (CDN) | Utility-first CSS framework |
| Font Awesome (CDN) | Icons |
| Google Fonts (Poppins) | Typography |
| JavaScript ES Modules | Code organization (type="module") |
| Service Worker | Offline caching |
| ZapUPI API | Auto UPI payment processing |
