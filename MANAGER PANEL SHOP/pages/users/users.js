import {
    auth,
    db,
    ref,
    get,
    update,
    query,
    limitToLast,
    onAuthStateChanged
} from "../../assets/scripts/firebase.js";
import {
    assertManager,
    logAudit
} from "../../assets/scripts/auth-guard.js";
async function e() {
    a();
    try {
        ! function(e) {
            const t = document.getElementById("usersTbody");
            let n = "";
            for (let t in e) {
                const a = e[t],
                    s = "banned" === a.status,
                    d = s ? '<span class="badge badge-danger">Banned</span>' : '<span class="badge badge-success">Active</span>',
                    o = s ? `<button class="action-btn action-approve" onclick="toggleBan('${t}', 'active')"><i class="fas fa-check"></i> Unban</button>` : `<button class="action-btn action-reject" onclick="toggleBan('${t}', 'banned')"><i class="fas fa-ban"></i> Ban</button>`;
                n += `<tr>\n            <td>${a.createdAt?new Date(a.createdAt).toLocaleDateString():"-"}</td>\n            <td><strong>${a.username||a.name||"Unknown"}</strong><br><span style="font-size:10px;color:#888;">${a.email||""}</span><br><span style="font-size:9px;color:#666;font-family:monospace;">${t}</span></td>\n            <td style="color:#00ff66;font-weight:700;font-size:14px;">₹${parseFloat(a.balance||0).toFixed(2)}</td>\n            <td>${d}</td>\n            <td style="display:flex;gap:5px;">\n                ${o}\n            </td>\n        </tr>`
            }
            t.innerHTML = n || '<tr><td colspan="5" style="text-align:center;color:#888;padding:30px;">No users found</td></tr>'
        }((await get(query(ref(db, "users"), limitToLast(500)))).val() || {})
    } catch (e) {
        console.error(e), n("Failed to load users", "error")
    }
    s()
}
window.initUsersTable = e;
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
document.addEventListener("DOMContentLoaded", () => {
    assertManager(() => e()), document.getElementById("searchUsersInput")?.addEventListener("input", e => {
        const t = e.target.value.toLowerCase();
        document.querySelectorAll("#usersTbody tr").forEach(e => {
            e.style.display = e.innerText.toLowerCase().includes(t) ? "" : "none"
        })
    })
}), window.toggleBan = async (t, d) => {
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
};