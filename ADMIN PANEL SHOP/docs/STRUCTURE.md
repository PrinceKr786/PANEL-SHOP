# 🛡️ ADMIN PANEL STORE — Project Structure

```
ADMIN PANEL STORE/
│
├── index.html                  # 🔐 ADMIN LOGIN (redirect → pages/index/index.html)
├── assets/
│   ├── scripts/                # 📜 SHARED ES-MODULE SCRIPTS (single source of truth)
│   │   ├── firebase.js         #   Firebase init + ADMIN_UID + isAdmin() — all pages import this
│   │   ├── auth-guard.js       #   assertAdmin() route guard + logAudit() audit logger
│   │   ├── security.js         #   Anti-copy / dev-tools protection (excluded from minify)
│   │   ├── sidebar-loader.js   #   Injects components/shell/sidebar.html into pages
│   │   └── badges.js           #   Live badge counters (gateway/crypto/manual/tickets/users)
│   ├── styles/
│   │   └── base.css            #   Global cyberpunk theme (tables, buttons, toasts, modals)
│   └── images/                 # 🖼️ Static images
│
├── components/
│   └── shell/
│       └── sidebar.html        # 🧩 Sidebar (inline CSS/JS, theme toggle, logout, badges)
│
├── pages/                      # 📄 ONE FOLDER PER PAGE (html + js + css live together)
│   ├── index/                  #   🔐 Login (index.html + index.css + index.js)
│   ├── dashboard/              #   📊 Stats, chart, recent payments (html + js, no css)
│   ├── add-panel/              #   ➕ Create panel with pricing plans + live preview
│   ├── manage-panels/          #   ✏️ Edit / enable-disable / delete panels
│   ├── categories/             #   🏷️ Category CRUD with panel counts
│   ├── gateway/                #   ⚡ Auto gateway payment approvals
│   ├── manual/                 #   📋 Manual UPI deposit approvals
│   ├── crypto/                 #   ₿ Crypto deposit approvals
│   ├── purchases/              #   📦 Purchase history
│   ├── users/                  #   👥 User control (balance, ban/unban)
│   ├── promotions/             #   🎉 Redirect page → branding (promotions live there)
│   ├── coupons/                #   🎫 Coupon code CRUD
│   ├── settings/               #   ⚙️ Payment config (ZapKey, UPI, QR, USDT, rate)
│   ├── branding/               #   🎨 Site branding + promotions management
│   └── contact/                #   📞 Support links + ticket reply/close
│
├── tools/
│   ├── build.js                # 🔨 Minifies page JS via Terser (skips security.js + firebase.js)
│   └── reorg.js                #   One-time migration script (page-per-folder layout)
│
├── docs/
│   ├── BLUEPRINT.md            # 📚 Full documentation (flows, DB structure, security)
│   ├── STRUCTURE.md            #   This file
│   └── firebase/
│       ├── Rules.md            # 🔥 RTDB security rules (copy → Firebase Console)
│       └── rules.json          #   Same rules as JSON (must stay in sync with Rules.md)
│
├── sw.js                       # ⚡ Service Worker (offline cache)
├── firebase.json               #   Firebase Hosting config
├── package.json                # 📦 NPM manifest
├── BLUEPRINT.md                #   Root overview + architecture
└── .gitignore                  # 🙈 Git ignore
```

## 🔑 Admin UID
`PmgO7qHYasOdgQfkmai0YnpQIWB3` — centralized in `assets/scripts/firebase.js` (exported as `ADMIN_UID`) and mirrored in `docs/firebase/Rules.md` / `rules.json`. To add an admin: add their UID to `/admins/` node (no code change) OR update `ADMIN_UID`.

## 🔄 Page Load Flow
```
Page opens → assertAdmin() (auth-guard.js)
   1. Wait for auth state (onAuthStateChanged)
   2. Not logged in → redirect to /pages/index/index.html
   3. Logged in → isAdmin(uid) → false → signOut + redirect to login
   4. Passes → populate #headerAdminEmail → run page's init (window.initX)
```
Sidebar is injected by `sidebar-loader.js` → `components/shell/sidebar.html`; it imports `badges.js` for live counters.

## 🔧 How to Edit
1. **Edit HTML/CSS** → directly in `pages/<name>/<name>.html` / `.css`
2. **Edit JS** → directly in `pages/<name>/<name>.js` (ES modules, source is the deployed file)
3. **Deploy** → `firebase deploy --only hosting`
4. **Update rules** → edit `docs/firebase/Rules.md`, then mirror the exact same JSON into `docs/firebase/rules.json` and paste into Firebase Console.

## 🛡️ Security
- `firebase.js` — `ADMIN_UID` central config + `isAdmin()` (hardcoded UID OR `/admins/{uid}` node)
- `auth-guard.js` — `assertAdmin()` route guard on every page + `logAudit()` for admin actions
- `security.js` — blocks F12, Ctrl+Shift+I/J, Ctrl+U, right-click, text selection
- All admin write actions log to `/audit_log/`
