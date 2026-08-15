import {
    auth,
    db,
    ref,
    get,
    query,
    limitToLast,
    onAuthStateChanged
} from "../../assets/scripts/firebase.js";
import {
    assertAdmin
} from "../../assets/scripts/auth-guard.js";
const e = {};
async function t(t) {
    if (e[t]) return e[t];
    try {
        const n = await get(ref(db, `users/${t}/username`));
        if (n.exists()) return e[t] = n.val(), n.val()
    } catch (e) {}
    return null
}
async function i() {
        ! function() {
            const e = document.getElementById("purchasesLoader");
            e && e.classList.remove("hidden")
        }();
        try {
            const n = (await get(query(ref(db, "purchases"), limitToLast(500)))).val() || {};
            let s = [];
            for (let e in n) {
                const t = n[e];
                if (t.panelId || t.plan) s.push({
                    uid: e,
                    pushId: e,
                    ...t
                });
                else
                    for (let n in t) {
                        const a = t[n];
                        "object" == typeof a && s.push({
                            uid: e,
                            pushId: n,
                            ...a
                        })
                    }
            }
            s.sort((e, t) => new Date(t.date || 0) - new Date(e.date || 0));
            const a = [...new Set(s.map(e => e.uid))];
            await Promise.all(a.map(t)),
                function(t) {
                    const n = document.getElementById("purchasesTbody");
                    let s = "";
                    t.forEach(t => {
                        const n = e[t.uid] || "",
                            a = t.email || t.uid || "Unknown",
                            o = t.panelName || t.panelId || "Unknown Panel";
                        s += `<tr>\n            <td style="font-size:12px;">${t.date?new Date(t.date).toLocaleString():"N/A"}</td>\n            <td><strong>${n||"Unknown"}</strong><br><span style="font-size:10px;color:#888;">${a}</span></td>\n            <td><strong>${o}</strong><br><span class="badge badge-success" style="margin-top:4px;">${t.label||t.plan||"N/A"}</span></td>\n            <td style="font-family:monospace;color:#bc13fe;font-weight:700;letter-spacing:1px;background:rgba(188,19,254,0.1);padding:5px 10px;border-radius:6px;">${t.key||"-"}</td>\n        </tr>`
                    }), n.innerHTML = s || '<tr><td colspan="4" style="text-align:center;color:#888;padding:30px;">No purchases found</td></tr>'
                }(s)
        } catch (e) {
            console.error(e),
                function(e, t = "success") {
                    const n = document.getElementById("purchasesToastContainer");
                    if (!n) return;
                    const s = document.createElement("div");
                    s.className = `toast ${t}`, s.innerHTML = `<i class="fas ${"success"===t?"fa-check-circle":"fa-exclamation-circle"}"></i> <span>${e}</span>`, n.appendChild(s), setTimeout(() => {
                        s.style.animation = "slideOutRight 0.3s forwards", setTimeout(() => s.remove(), 300)
                    }, 3e3)
                }("Failed to load purchases", "error")
        }! function() {
            const e = document.getElementById("purchasesLoader");
            e && e.classList.add("hidden")
        }()
}
window.initPurchases = i;
document.addEventListener("DOMContentLoaded", () => {
    assertAdmin(() => i()), document.getElementById("searchPurchasesInput")?.addEventListener("input", e => {
        const t = e.target.value.toLowerCase();
        document.querySelectorAll("#purchasesTbody tr").forEach(e => {
            e.style.display = e.innerText.toLowerCase().includes(t) ? "" : "none"
        })
    })
});