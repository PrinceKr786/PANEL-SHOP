# MANAGER PANEL â€” STRUCTURE REFERENCE

```
MANAGER PANEL SHOP/
â”œâ”€â”€ assets/
â”‚   â”œâ”€â”€ scripts/
â”‚   â”‚   â”œâ”€â”€ firebase.js          # Firebase init, ADMIN_UID, isManager()/isAdmin()
â”‚   â”‚   â”œâ”€â”€ auth-guard.js        # assertManager() route guard + logAudit()
â”‚   â”‚   â”œâ”€â”€ security.js          # Anti-copy / dev-tools protection
â”‚   â”‚   â”œâ”€â”€ sidebar-loader.js    # Fetches components/shell/sidebar.html
â”‚   â”‚   â””â”€â”€ badges.js            # Live badges: crypto, manual, tickets, users
â”‚   â””â”€â”€ styles/
â”‚       â””â”€â”€ base.css             # Shared panel styles
â”œâ”€â”€ components/
â”‚   â””â”€â”€ shell/
â”‚       â””â”€â”€ sidebar.html         # MANAGER PRO sidebar (inline CSS/JS)
â”œâ”€â”€ pages/
â”‚   â”œâ”€â”€ index/                   # Login (isManager check) â€” index.html/css/js
â”‚   â”œâ”€â”€ dashboard/               # Stats + revenue chart + recent deposits
â”‚   â”œâ”€â”€ add-panel/               # Create panel form + live preview
â”‚   â”œâ”€â”€ manage-panels/           # List/edit/enable/delete panels
â”‚   â”œâ”€â”€ categories/              # Category CRUD
â”‚   â”œâ”€â”€ coupons/                 # Coupon CRUD
â”‚   â”œâ”€â”€ manual/                  # Manual deposit approvals
â”‚   â”œâ”€â”€ crypto/                  # Crypto deposit approvals
â”‚   â”œâ”€â”€ purchases/               # Purchase logs (read-only)
â”‚   â”œâ”€â”€ users/                   # Users + ban/unban (no balance edit)
â”‚   â””â”€â”€ contact/                 # Support tickets + support links
â”œâ”€â”€ docs/
â”‚   â”œâ”€â”€ BLUEPRINT.md             # Flows, roles, DB, security
â”‚   â”œâ”€â”€ STRUCTURE.md             # This file
â”‚   â””â”€â”€ firebase/
â”‚       â”œâ”€â”€ rules.json           # Canonical RTDB rules (paste into console)
â”‚       â””â”€â”€ Rules.md             # Same rules (readable copy)
â”œâ”€â”€ firebase.json                # Hosting config (public: ".", rewrite "/")
â”œâ”€â”€ index.html                   # Root entry - redirects to pages/index/index.html (login)
â”œâ”€â”€ sw.js                        # Service Worker, cache 'nexus-manager-v2'
â”œâ”€â”€ package.json                 # Manifest (no build tooling required)
â””â”€â”€ BLUEPRINT.md                 # Short overview
```

## Notable file-by-file notes

- `assets/scripts/firebase.js` â€” single place for Firebase config + `ADMIN_UID`. `isManager()`
  is used by login and `assertManager`.
- `assets/scripts/auth-guard.js` â€” every protected page imports `assertManager`; `logAudit`
  records manager actions.
- `pages/users/users.js` â€” intentionally stripped of the admin balance-edit modal; only view +
  ban/unban remain.
- `pages/dashboard/dashboard.js` â€” pending stats use `manual_deposits` + `crypto_deposits`
  (gateway removed).
- `sw.js` â€” pre-caches all 11 pages (html/css/js) + shared assets under `nexus-manager-v2`.

## Deleted from admin copy (admin-only)
- pages/settings, pages/gateway, pages/branding, pages/promotions
- gateway badge in badges.js/sidebar, "View All gateway" link on dashboard
- balance edit (users modal + saveBalance flow)
```
