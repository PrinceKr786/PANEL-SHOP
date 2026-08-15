# MANAGER PANEL — DOCUMENTATION

## Overview

The **Manager Panel** (`MANAGER PANEL SHOP/`) is the day-to-day operations console for the Nexus store.
It reuses the same Firebase project (`prince-hacks-test`), database and authentication as the
**Admin Panel** (`ADMIN PANEL SHOP/`) and the user store (**PANEL SHOP/**).

Managers are trusted operations staff. They run the store but do **not** control payment
configuration, branding, gateway payments or balances directly.

---

## Roles

| Role     | Identified by            | Can                                              | Cannot                                     |
|----------|--------------------------|--------------------------------------------------|--------------------------------------------|
| Admin    | `ADMIN_UID` or `admins/{uid}` | Everything (both panels)                      | —                                          |
| Manager  | `managers/{uid}` node    | Products, categories, coupons, deposits, users, tickets | Payment config, branding, balances, gateway |

- The admin is always a manager too (`isManager()` returns true for `ADMIN_UID`).
- A user must be registered under `managers/{uid}` by the admin to log into this panel.

---

## Page Map

| Page            | Purpose                                                     | Access (rules)                              |
|-----------------|-------------------------------------------------------------|---------------------------------------------|
| `index`         | Login via email/password; checks `isManager(uid)`           | public                                      |
| `dashboard`     | Revenue (last 7 days), users, pending manual/crypto, recent deposits | read users/manual/crypto        |
| `add-panel`     | Create panel + plans                                        | write `panels`                              |
| `manage-panels` | Edit / enable / delete panels + plans                       | write `panels`                              |
| `categories`    | Create / rename / delete categories                         | write `categories`                          |
| `coupons`       | Create / delete coupons                                     | write `coupons`                             |
| `manual`        | Approve / reject manual UTR deposits (credits balance + referral) | read `manual_deposits`, write status/balance |
| `crypto`        | Approve / reject crypto deposits (credits balance + referral) | read `crypto_deposits`, write status/balance |
| `purchases`     | View purchase logs (read-only)                              | read `purchases`                            |
| `users`         | View users, ban / unban                                     | read `users`, write `users/{uid}/status`    |
| `contact`       | Support tickets (open/close) + support links                | read `tickets`/`contact_messages`, write ticket status/`support_links` |

### Excluded pages (admin-only)
`settings`, `gateway`, `branding`, `promotions` — the manager panel does not ship these.

---

## Authentication & Guard Flow

1. `pages/index/index.js` calls `signInWithEmailAndPassword`, then `isManager(uid)`.
2. `assets/scripts/firebase.js`:
   ```js
   export async function isManager(uid) {
       if (uid === ADMIN_UID) return true;
       const snap = await get(ref(db, `managers/${uid}`));
       return snap.exists();
   }
   ```
3. Every protected page runs `assertManager(callback)` (`assets/scripts/auth-guard.js`), which:
   - listens to `onAuthStateChanged`
   - verifies `isManager(user.uid)`
   - on failure signs out and redirects to `pages/index/index.html`
   - on success injects the user email into `#headerAdminEmail` and runs the page callback
4. `logAudit(action, details)` writes an entry to `audit_log` (`managerUID` = current uid).

---

## Sidebar

- Injected by `sidebar-loader.js` → fetches `components/shell/sidebar.html`.
- Nav groups: **Core Operations**, **Finance & Users**, **Marketing & Support**.
- Live badges (from `badges.js`): pending crypto, pending manual, users, open tickets.
- All links are page-relative (`../dashboard/dashboard.html`, etc.).

---

## Data Writes Per Page (DB nodes)

- add-panel / manage-panels → `panels/{panelId}`
- categories → `categories`
- coupons → `coupons/{code}`
- manual → `manual_deposits/{txId}/status`, `users/{uid}/balance`, `users/{uid}/referralClaimable`, `referrals/{refUid}/{txId}`, `transactions/{uid}/{txId}/status`
- crypto → same shape on `crypto_deposits`
- users → `users/{uid}/status` (banned/active)
- contact → `tickets/{uid}/{ticketId}/status`, `notifications/{uid}`, `support_links`
- every action → `audit_log` via `logAudit()`

---

## Security Rules

Canonical copy: `docs/firebase/Rules.md` (and `rules.json`). Paste the JSON into
**Firebase Console → Realtime Database → Rules**.

Key changes vs the old admin-only rules:
- new `managers` node (admin writes; manager reads own entry)
- scoped manager writes + reads listed in `BLUEPRINT.md`
- everything else (payment config, branding, gateway, admins) stays admin-only

---

## Deploy

```bash
firebase deploy --only hosting
```
