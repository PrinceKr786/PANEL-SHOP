# NEXUS ADMIN PANEL — COMPLETE PROJECT DOCUMENTATION

## WHAT IS THIS PROJECT
Admin dashboard for managing the user store. Admins can manage users, products (panels), payments (auto/manual/crypto), purchases, coupons, promotions, branding, support tickets, and site settings. All data is stored in Firebase Realtime Database.

---

## PROJECT STRUCTURE (EVERY FILE EXPLAINED)

```
ADMIN PANEL STORE/
│
├── firebase.json               Firebase Hosting config. Serves pages/ on root.
│
├── package.json                NPM dependencies list (terser for minification).
├── sw.js                       Service Worker. Caches files for offline + faster loading.
├── .gitignore                  Ignores node_modules/, backups/ from Git.
│
├── BLUEPRINT.md                ← YOU ARE HERE. Full documentation.
│
├── assets/
│   ├── scripts/                ─── ALL JAVASCRIPT ───
│   │   ├── firebase.js         ★ CENTRAL FIREBASE CONFIG
│   │   │                        Initialize Firebase with API key, auth domain, database URL.
│   │   │                        Exports: auth, db, ref, get, set, update, remove, push, onValue,
│   │   │                        runTransaction, serverTimestamp, signInWithEmailAndPassword,
│   │   │                        signOut, onAuthStateChanged, ADMIN_UID, isAdmin(uid)
│   │   │                        isAdmin(): checks hardcoded UID first, then Firebase /admins/ node
│   │   │
│   │   ├── auth-guard.js       ★ ROUTE GUARD (runs on every admin page)
│   │   │                        assertAdmin(): checks if current user is authorized admin.
│   │   │                        If not → sign out + redirect to login page.
│   │   │                        logAudit(): logs every admin action to /audit_log node.
│   │   │
│   │   ├── security.js         Anti-copy protection. Blocks F12, Ctrl+Shift+I/J, Ctrl+U,
│   │   │                        right-click, text selection (except inputs/textarea).
│   │   │
│   │   ├── badges.js           Live badge counters on sidebar. Shows pending counts for:
│   │   │                        gateway payments, crypto deposits, manual deposits, tickets, users.
│   │   │                        Uses onValue listeners + localStorage for "seen" tracking.
│   │   │
│   │   └── sidebar-loader.js   Loads sidebar HTML dynamically.
│   │                            fetch('../../components/shell/sidebar.html') → inject into DOM.
│   │                            Error handling: shows error message if sidebar fails to load.
│   │
│   ├── styles/
│   │   └── base.css            Global admin styles. Cyberpunk theme, glass panels, tables,
│   │                            buttons, toasts, modals, badges, form inputs, scrollbars.
│   │
│   └── images/                 Static images (logos, default avatars, etc.).
│
├── components/
│   └── shell/
│       └── sidebar.html        Sidebar navigation. Inline CSS + dark/light theme toggle.
│                                Loads badges from badges.js. Nav links to all admin pages.
│
├── pages/                      ─── ALL ADMIN PAGE FOLDERS ───
│   │
│   ├── index/                  ★ LOGIN PAGE
│   │   ├── index.html          Cyberpunk login UI with fingerprint icon, glitch text.
│   │   ├── index.css           Login page styles: neon orbs, particle background.
│   │   └── index.js            Login logic: signInWithEmailAndPassword → isAdmin() check.
│   │                            Remember Me saves email + password in localStorage.
│   │                            If admin → redirect to dashboard. If not → error + sign out.
│   │
│   ├── dashboard/              ★ DASHBOARD (main landing after login)
│   │   ├── dashboard.html      Shows: Total Revenue, Total Users, Pending Manual/Gateway.
│   │   ├── dashboard.js        Loads stats via onValue + get on /users, /gateway_payments,
│   │                            /manual_deposits. Revenue chart using Chart.js (loaded from CDN).
│   │                           Recent payments list (last 5).
│   │
│   ├── users/                  ★ USER MANAGEMENT
│   │   ├── users.html          Table: Joined date, Username/Email/UID, Balance, Status, Actions.
│   │   ├── users.js            Read: /users (all users). Actions:
│   │                            - Edit Balance (open modal → add/deduct/set → save)
│   │                            - Ban/Unban user
│   │                           All actions logged via logAudit().
│   │
│   ├── add-panel/              ★ ADD NEW PRODUCT PANEL
│   │   ├── add-panel.html      Form: Name, Logo URL, Category, YouTube, Links, Description.
│   │   ├── add-panel.js        Dynamic pricing plans (add/remove rows). Live preview card.
│   │                            Save to: /panels. Validates required fields before submit.
│   │
│   ├── manage-panels/          ★ EDIT / DELETE PANELS
│   │   ├── manage-panels.html  Grid view of all panels with video preview, status badge.
│   │   ├── manage-panels.js    Read: /panels. Actions: Enable/Disable, Edit (modal with forms),
│   │                            Delete (with confirm dialog). Categories loaded dynamically.
│   │
│   ├── categories/             ★ CATEGORY MANAGEMENT
│   │   ├── categories.html     List of categories with panel count per category.
│   │   ├── categories.js       CRUD: Add new category, Edit inline (click name), Delete.
│   │                            Real-time updates via onValue. Panel count fetched from /panels.
│   │
│   ├── gateway/                ★ AUTO GATEWAY PAYMENTS
│   │   ├── gateway.html        Table: Date, User Info, Amount, Order ID, Status, Actions.
│   │   ├── gateway.js          Read: /gateway_payments. Pending ones show Accept/Reject buttons.
│   │                            On Accept: update status, add balance to user (runTransaction),
│   │                            credit referral commission (5%), log audit.
│   │
│   ├── manual/                 ★ MANUAL UPI DEPOSITS
│   │   ├── manual.html         Table: Date, User Info, Amount, App & UTR, Status, Actions.
│   │   ├── manual.js           Same flow as gateway but for /manual_deposits.
│   │                            Shows screenshot button if available.
│   │
│   ├── crypto/                 ★ CRYPTO DEPOSITS
│   │   ├── crypto.html         Table: Date, User Info, Amount, Hash & Note, Status, Actions.
│   │   ├── crypto.js           Same flow as manual but for /crypto_deposits.
│   │
│   ├── purchases/              ★ PURCHASE HISTORY
│   │   ├── purchases.html      Table: Date, User, Panel & Plan, Delivered Key.
│   │   ├── purchases.js        Read: /purchases (all users' purchases). Sort by date (latest first).
│   │
│   ├── promotions/             ★ PROMOTIONS (redirect page)
│   │   ├── promotions.html     Redirects to branding page (promotions moved there).
│   │
│   ├── coupons/                ★ DISCOUNT COUPONS
│   │   ├── coupons.html        Table: Code, Discount %, Usage (used/max), Status, Actions.
│   │   ├── coupons.js          CRUD: /coupons. Toggle enable/disable. Validates duplicate codes.
│   │
│   ├── settings/               ★ PAYMENT SETTINGS
│   │   ├── settings.html       ZapKey, UPI ID, QR, Binance Pay ID, USDT Address, Crypto Rate.
│   │   ├── settings.js         Read/Write: /payment_config, /zap_config. QR preview on input.
│   │                            Live USDT rate display with real-time updates.
│   │
│   ├── branding/               ★ BRANDING & PROMOTIONS
│   │   ├── branding.html       Tabs: Branding (name, tagline, announcement, footer) + Promotions.
│   │   ├── branding.js         Save: /settings/branding. Posts to /announcement_history.
│   │                            Promotions CRUD + auto-creates /global_alerts/promotions entries.
│   │                            Auto-deletes global alerts older than 7 days.
│   │
│   └── contact/                ★ SUPPORT & TICKETS
│       ├── contact.html        Tabs: Support Links (WhatsApp, Email, Telegram, Discord) + Tickets.
│       ├── contact.js          Support links save to: /support_links.
│                                Tickets: real-time list from /tickets. Reply inline, close ticket.
│                                Send notification to user on reply.
│
├── docs/
│   ├── firebase/
│   │   ├── Rules.md            ★ FIREBASE RTDB SECURITY RULES (copy-paste to Firebase Console)
│   │   └── rules.json          Same rules in JSON format (for reference/backup)
│   └── STRUCTURE.md            Previous structure doc (kept for reference)
│
└── backups/                    (auto-created by build) Original JS before minification.
```

---

## HOW THE SYSTEM WORKS — COMPLETE FLOW

### 1. ADMIN LOGIN
```
→ Visit admin panel URL → login page loads
→ Enter admin email + password
→ signInWithEmailAndPassword() called
→ isAdmin(uid) checks: (a) matches hardcoded ADMIN_UID? (b) exists in /admins/ node?
→ If not admin → sign out + show error
→ If admin → redirect to /pages/dashboard/dashboard.html
→ "Remember Me" saves email + password in localStorage
```

### 2. EVERY PAGE LOADS
```
→ assertAdmin() runs on DOMContentLoaded:
   1. Wait for auth state
   2. If user not logged in → redirect to login page
   3. If user logged in → isAdmin() check
   4. If not admin → sign out + redirect to login
   5. If admin → allow page to load, run page code
```

### 3. DASHBOARD
```
→ Real-time stats from Firebase:
   - Total Revenue: sum of approved gateway + manual deposits
   - Total Users: /users node size
   - Pending Manual: count of /manual_deposits where status="pending"
   - Pending Gateway: count of /gateway_payments where status="pending"
→ Revenue Chart (last 7 days): Chart.js loaded dynamically
→ Recent Deposits: last 5 gateway payments sorted by timestamp
```

### 4. PAYMENT APPROVAL FLOW (Gateway/Manual/Crypto)
```
→ Admin opens gateway/manual/crypto page
→ Table shows all payments with pending ones highlighted
→ Click "Accept":
   1. Confirm dialog
   2. Update deposit record status → "approved"
   3. runTransaction: add amount to user's /users/{uid}/balance
   4. Update /transactions/{uid}/{txId} status → "success"
   5. Credit referral commission (5% to referrer)
   6. logAudit() record created
   7. Toast notification shown
→ Click "Reject":
   1. Update deposit record status → "rejected"
   2. Update transaction status → "failed"
   3. logAudit() record created
```

### 5. USER MANAGEMENT
```
→ Table shows all users with their balance, status, join date
→ Search by name/email/UID
→ Edit Balance: modal with Add/Deduct/Set options
   - Amount validated (must be positive number)
   - Transaction record created in /transactions/{uid}
   - logAudit() records the change
→ Ban/Unban: update /users/{uid}/status
```

### 6. PANEL MANAGEMENT
```
→ Add Panel: form with name, logo, YouTube, links, descriptions, pricing plans
   - YouTube URL auto-parsed to extract video ID
   - Live preview card updates on input
   - Validates required fields + at least one plan
→ Manage Panels: grid view, enable/disable toggle, edit modal, delete with confirm
→ Categories: add/edit/delete, shows panel count per category
```

### 7. COUPONS & PROMOTIONS
```
→ Coupons: code, discount %, max usage, enable/disable
   - Code auto-capitalized
   - Validates no duplicate codes
   - Users apply coupon at checkout for discount
→ Promotions: title, description, discount %, image, link, enable/disable
   - Shows on user home page as carousel
   - Branding page also creates /global_alerts/promotions entry
```

### 8. TICKET SYSTEM
```
→ Real-time ticket list from /tickets node
→ Shows: priority badge, category, subject, user info, status
→ Reply to ticket: type message → saved as adminReply
   - Notification sent to user (pushed to /notifications/{uid})
→ Close ticket: status = "closed"
→ Tickets sorted: open first, then by date
```

---

## FIREBASE DATABASE STRUCTURE

```
/admins/{uid}                    Authorized admin UIDs (exists = true)
/audit_log/{logId}               Admin action audit trail
/users/{uid}                     All user profiles (see user panel docs for fields)
/transactions/{uid}/{txId}       User transactions
/purchases/{uid}/{purchaseId}    User purchases
/panels/{panelId}                Product panels
/categories/{catId}              Panel categories
/promotions/{promoId}            Promotional banners
/coupons/{couponId}              Discount coupons
/gateway_payments/{orderId}      Auto gateway payments
/manual_deposits/{txId}          Manual UPI deposits
/crypto_deposits/{txId}          Crypto deposits
/zap_config                      ZapUPI API key
/payment_config                  UPI, crypto, rate config
/deposit_settings                Deposit configuration
/settings/branding               Site branding
/support_links                   Contact links
/tickets/{uid}/{ticketId}        Support tickets
/notifications/{uid}/{notifId}   User notifications
/referrals/{referrer}/{refUid}   Referral records
/hwid_resets/{uid}/{resetId}     HWID reset requests
/contact_messages/{msgId}        Contact form messages
/announcement_history/{entryId}  Announcement history log
/global_alerts/promotions/{id}   Global promotion alerts (auto-cleaned after 7 days)
```

---

## FIREBASE SECURITY RULES

File: `docs/firebase/Rules.md` — Copy this to Firebase Console → Realtime Database → Rules

### Key Rules:
- Only admin (UID: PmgO7qHYasOdgQfkmai0YnpQIWB3) can write to /panels, /categories, /promotions, /coupons, /settings, /audit_log
- Users can read/write only their own data under /users/{uid}, /transactions/{uid}, /purchases/{uid}
- Deposits (gateway/manual/crypto) can be created by any authenticated user, but only admin can change status
- .validate rules ensure: correct data types, positive amounts, valid status values (pending/approved/rejected)
- "$other" catch-all at root blocks any undeclared paths

---

## CODE ARCHITECTURE

### Firebase Access Pattern
```
Every page → imports from assets/scripts/firebase.js (single source of truth)
→ Uses: ref(), get(), set(), update(), remove(), push(), onValue(), runTransaction()
→ All Firebase operations wrapped in try/catch with toast error messages
```

### Admin Check Pattern
```
Every page → runs assertAdmin() on load
→ assertAdmin waits for Firebase Auth state
→ Calls isAdmin(uid) which checks:
   1. uid === hardcoded ADMIN_UID
   2. OR exists in /admins/{uid} node
→ If fails → signOut + redirect to login
→ If passes → page code executes
```

### Audit Logging
```
logAudit(action, details) called on every admin action:
- Balance edits, user bans, payment approvals/rejections, etc.
- Logs to /audit_log/{autoId} with action, details, adminUID, timestamp
```

### Badge System
```
badges.js uses onValue listeners to track:
- Pending gateway payments
- Pending crypto deposits
- Pending manual deposits
- Open tickets
- New users (since last seen)
Each admin page calls markSeen('page_name') on load to reset its badge
```

---

## IMPORTANT SECURITY NOTES

1. Firebase API key is client-side. MUST restrict by HTTP referrer in Firebase Console.
2. To change admin: update ADMIN_UID in firebase.js AND Rules.md.
   OR add new UID to /admins/ node in Firebase Database (no code change needed).
3. auth-guard.js protects every page — unauthorized access redirects to login.
4. All admin actions are logged to /audit_log for accountability.

---

## BUILD & DEPLOY

```bash
# Deploy to Firebase Hosting
firebase deploy

# Deploy only hosting
firebase deploy --only hosting
```

---

## ACCOUNT MANAGEMENT

### Creating a new admin:
1. Firebase Console → Authentication → Add user (email + password)
2. Firebase Console → Realtime Database → /admins/ node → add {newUid: true}
3. Copy the new user's UID from Authentication section
4. Update ADMIN_UID in assets/scripts/firebase.js (or just add to /admins/ node)
5. Update docs/firebase/Rules.md with new UID (or keep both)
