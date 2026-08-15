# MANAGER PANEL STORE â€” BLUEPRINT

## Overview
Manager operations panel for the Nexus store. Same Firebase project as `ADMIN PANEL SHOP` and `PANEL SHOP`.
Managers handle day-to-day store operations (products, categories, coupons, deposit approvals, user moderation, support tickets).
Payment configuration, site branding, gateway payments and balance editing remain **admin-only**.

## Project Structure

```
MANAGER PANEL SHOP/
â”œâ”€â”€ assets/
â”‚   â”œâ”€â”€ scripts/                 # SHARED ES6 module scripts
â”‚   â”‚   â”œâ”€â”€ firebase.js          # Firebase init + ADMIN_UID + isManager() config
â”‚   â”‚   â”œâ”€â”€ auth-guard.js        # assertManager() â€” route guard + logAudit() audit logger
â”‚   â”‚   â”œâ”€â”€ security.js          # Anti-copy / dev-tools protection
â”‚   â”‚   â”œâ”€â”€ sidebar-loader.js    # Dynamic sidebar injection via fetch
â”‚   â”‚   â””â”€â”€ badges.js            # Live badge counters (manual/crypto/tickets/users)
â”‚   â””â”€â”€ styles/
â”‚       â””â”€â”€ base.css             # Shared global panel styles
â”œâ”€â”€ components/
â”‚   â””â”€â”€ shell/
â”‚       â””â”€â”€ sidebar.html         # Cyberpunk sidebar (MANAGER PRO, inline CSS/JS)
â”œâ”€â”€ pages/                       # ONE FOLDER PER PAGE (html + js + css together)
â”‚   â”œâ”€â”€ index/                   # Manager login (isManager() check)
â”‚   â”œâ”€â”€ dashboard/               # Revenue / users / pending approvals stats
â”‚   â”œâ”€â”€ add-panel/               # Create panel form
â”‚   â”œâ”€â”€ manage-panels/           # Panel management (edit/delete/enable)
â”‚   â”œâ”€â”€ categories/              # Category management
â”‚   â”œâ”€â”€ coupons/                 # Discount coupons
â”‚   â”œâ”€â”€ manual/                  # Manual UTR deposit approval
â”‚   â”œâ”€â”€ crypto/                  # Crypto USDT deposit approval
â”‚   â”œâ”€â”€ purchases/               # Purchase logs (read-only)
â”‚   â”œâ”€â”€ users/                   # User control (view + ban/unban; NO balance edit)
â”‚   â””â”€â”€ contact/                 # Support tickets + support links
â”œâ”€â”€ docs/
â”‚   â”œâ”€â”€ BLUEPRINT.md             # Full documentation (flows, DB, security)
â”‚   â”œâ”€â”€ STRUCTURE.md             # File-by-file structure reference
â”‚   â””â”€â”€ firebase/                # RTDB security rules (Rules.md + rules.json)
â”œâ”€â”€ firebase.json                # Firebase Hosting config
â”œâ”€â”€ sw.js                        # Service Worker (nexus-manager-v2 caching)
â”œâ”€â”€ package.json                 # Dependency manifest
â””â”€â”€ BLUEPRINT.md                 # This file
```

## Architecture

### Authentication Flow
1. `pages/index/index.html` â†’ `pages/index/index.js` logs in via `signInWithEmailAndPassword`
2. Every manager page runs `assertManager()` from `auth-guard.js` on DOMContentLoaded
3. `auth-guard.js` calls `isManager(uid)` from `firebase.js`:
   - `ADMIN_UID` always passes (admin is a super-manager)
   - otherwise a `managers/{uid}` node must exist in the DB
   - unauthorized â†’ signs out + redirects to `pages/index/index.html`
4. `auth-guard.js` also provides `logAudit()` for all manager actions (written to `audit_log`)

### Registering a Manager
- In `ADMIN PANEL SHOP` â†’ `pages/users/users.html`, each user row has a **MGR** button
- **MGR** creates `managers/{uid}` (promotes), **RM MGR** removes it
- Security rules only let the ADMIN write `managers/{uid}`

### Sidebar
- Every page has `<div id="sidebarContainer">` + a module script importing `sidebar-loader.js`
- `sidebar-loader.js` fetches `components/shell/sidebar.html` and injects it
- Sidebar nav (MANAGER PRO) groups: Core Operations, Finance & Users, Marketing & Support
- Badges: crypto, manual, tickets, users (gateway removed)

### Manager Controls (what managers CAN do)
- Add / edit / enable / delete panels and plans
- Manage categories and coupons
- Approve / reject manual and crypto deposits (credits balance + referral commission)
- View purchases and user list; ban / unban users
- Reply / close support tickets and update support links
- Read audit history? **No** â€” read of `audit_log` stays admin-only

### Admin-Only (NOT in manager panel)
- Payment settings, payment/zap config, deposit settings, crypto rates
- Site branding, promotions, store config
- Gateway payments
- User balance edit (manual add/deduct/set)
- Adding/removing managers and admins

## Firebase Exports (firebase.js)
```js
export { auth, db, ref, get, set, push, update, remove, onValue, runTransaction, query, limitToLast, serverTimestamp, onAuthStateChanged, signInWithEmailAndPassword, signOut };
export const ADMIN_UID = "PmgO7qHYasOdgQfkmai0YnpQIWB3";
export async function isAdmin(uid);   // kept for parity
export async function isManager(uid); // ADMIN_UID || managers/{uid} exists
```

## Security Rules
- Canonical rules live in `docs/firebase/Rules.md` (+ `rules.json`) â€” paste into Firebase console.
- New `managers` node: only ADMIN can write; a manager can read only their own entry (needed by `isManager()`).
- Managers get scoped write on: `panels`, `categories`, `coupons`, `manual_deposits`/`crypto_deposits` status, `tickets` status, `users` (balance for deposit crediting, `status` for ban/unban), `transactions` status, `notifications`, `support_links`, `audit_log` (write only).
- Managers get read on: `users`, `transactions`, `purchases`, `manual_deposits`, `crypto_deposits`, `tickets`, `contact_messages`.
- Admin-only writes remain: `settings`, `payment_config`, `zap_config`, `deposit_settings`, `branding`, `store_config`, `gateway_payments` status, `admins`, `managers`, `promotions`/`global_alerts`.

## Deploy
```bash
firebase deploy --only hosting
```
