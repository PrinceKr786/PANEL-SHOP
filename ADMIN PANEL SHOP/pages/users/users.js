import {
    auth,
    db,
    ref,
    get,
    update,
    set,
    push,
    remove,
    query,
    limitToLast,
    serverTimestamp,
    onAuthStateChanged
} from "../../assets/scripts/firebase.js";
import {
    assertAdmin,
    logAudit
} from "../../assets/scripts/auth-guard.js";
async function e() {
    a();
    try {
        const mgrSnap = await get(ref(db, "managers"));
        const mgrs = new Set(Object.keys(mgrSnap.val() || {}));
        ! function(e) {
            const t = document.getElementById("usersTbody");
            let n = "";
            for (let t in e) {
                const a = e[t],
                    s = "banned" === a.status,
                    d = s ? '<span class="badge badge-danger">Banned</span>' : '<span class="badge badge-success">Active</span>',
                    o = s ? `<button class="action-btn action-approve" onclick="toggleBan('${t}', 'active')"><i class="fas fa-check"></i> Unban</button>` : `<button class="action-btn action-reject" onclick="toggleBan('${t}', 'banned')"><i class="fas fa-ban"></i> Ban</button>`,
                    b = mgrs.has(t) ? '<span class="badge badge-warning">Manager</span>' : '',
                    m = mgrs.has(t) ? '<button class="action-btn action-reject" onclick="toggleManager(\'' + t + '\', false)"><i class="fas fa-user-cog"></i> RM MGR</button>' : '<button class="action-btn action-edit" onclick="toggleManager(\'' + t + '\', true)"><i class="fas fa-user-cog"></i> MGR</button>';
                n += `<tr>\n            <td>${a.createdAt?new Date(a.createdAt).toLocaleDateString():"-"}</td>\n            <td><strong>${a.username||a.name||"Unknown"}</strong><br><span style="font-size:10px;color:#888;">${a.email||""}</span><br><span style="font-size:9px;color:#666;font-family:monospace;">${t}</span></td>\n            <td style="color:#00ff66;font-weight:700;font-size:14px;">₹${parseFloat(a.balance||0).toFixed(2)}</td>\n            <td>${d} ${b}</td>\n            <td style="display:flex;gap:5px;flex-wrap:wrap;">\n                <button class="action-btn action-edit" onclick="openBalanceModal('${t}', ${a.balance||0})"><i class="fas fa-wallet"></i> Bal</button>\n                ${m}\n                ${o}\n            </td>\n        </tr>`
            }
            t.innerHTML = n || '<tr><td colspan="5" style="text-align:center;color:#888;padding:30px;">No users found</td></tr>'
        }((await get(query(ref(db, "users"), limitToLast(500)))).val() || {})
    } catch (e) {
        console.error(e), n("Failed to load users", "error")
    }
    s()
}
window.initUsersTable = e;
async function t() {
    const t = document.getElementById("editBalUid").value,
        d = parseFloat(document.getElementById("editBalCurrent").value),
        o = parseFloat(document.getElementById("editBalAmount").value),
        c = document.getElementById("editBalType").value;
    if (isNaN(o) || o < 0) return n("Enter a valid number", "error");
    let l = d,
        i = o,
        r = "";
    "add" === c ? (l += o, r = "Admin Added Funds") : "deduct" === c ? (l = Math.max(0, d - o), r = "Admin Deducted Funds", i = -o) : "set" === c && (l = o, r = "Admin Set Exact Balance", i = l - d), a();
    try {
        await update(ref(db, `users/${t}`), {
            balance: l
        });
        const a = "ADM" + Date.now();
        await set(ref(db, `transactions/${t}/${a}`), {
            id: a,
            type: "admin_edit",
            amount: i,
            status: "success",
            desc: r,
            date: (new Date).toISOString()
        }), logAudit("balance_edit", {
            uid: t,
            type: c,
            amount: o,
            newBal: l,
            diff: i
        }), n("Balance updated"), closeBalanceModal(), await e()
    } catch (e) {
        n("Update failed", "error"), s()
    }
}

function n(e, t = "success") {
    const n = document.getElementById("usersToastContainer");
    if (!n) return;
    const a = document.createElement("div");
    a.className = `toast ${t}`;
    const s = "success" === t ? "fa-check-circle" : "error" === t ? "fa-exclamation-circle" : "fa-exclamation-triangle";
    a.innerHTML = `<i class="fas ${s}"></i> <span>${e}</span>`, n.appendChild(a), setTimeout(() => {
        a.style.animation = "slideOutRight 0.3s forwards", setTimeout(() => a.remove(), 300)
    }, 3e3)
}

function a() {
    const e = document.getElementById("usersLoader");
    e && e.classList.remove("hidden")
}

function s() {
    const e = document.getElementById("usersLoader");
    e && e.classList.add("hidden")
}
document.addEventListener("DOMContentLoaded", () => (function(){ if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",__boot);return;} function __boot(){
    assertAdmin(() => e()), document.getElementById("searchUsersInput")?.addEventListener("input", e => {
        const t = e.target.value.toLowerCase();
        document.querySelectorAll("#usersTbody tr").forEach(e => {
            e.style.display = e.innerText.toLowerCase().includes(t) ? "" : "none"
        })
    }), document.getElementById("btnSaveBalance")?.addEventListener("click", t)
} __boot(); })), window.toggleBan = async (t, d) => {
    a();
    try {
        await update(ref(db, `users/${t}`), {
            status: d
        }), logAudit("user_status_change", {
            uid: t,
            status: d
        }), n("banned" === d ? "User Banned" : "User Unbanned"), await e()
    } catch (e) {
        n("Error updating status", "error"), s()
    }
}, window.toggleManager = async (t, make) => {
    a();
    try {
        if (make) {
            await set(ref(db, `managers/${t}`), { addedAt: Date.now() });
            logAudit("manager_added", { uid: t });
            n("User promoted to Manager");
        } else {
            await remove(ref(db, `managers/${t}`));
            logAudit("manager_removed", { uid: t });
            n("Manager access removed");
        }
        await e()
    } catch (e) {
        n("Error updating manager role", "error"), s()
    }
}, window.openBalanceModal = (e, t) => {
    document.getElementById("editBalUid").value = e, document.getElementById("editBalCurrent").value = t.toFixed(2), document.getElementById("editBalAmount").value = "", document.getElementById("balanceModal").classList.remove("hidden")
}, window.closeBalanceModal = () => {
    document.getElementById("balanceModal").classList.add("hidden")
};