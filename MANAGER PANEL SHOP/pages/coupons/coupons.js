import {
    db,
    ref,
    get,
    push,
    update,
    remove,
    serverTimestamp
} from "../../assets/scripts/firebase.js";
import {
    assertManager,
    logAudit
} from "../../assets/scripts/auth-guard.js";
async function e() {
    n();
    try {
        const e = await get(ref(db, "coupons")),
            t = [];
        e.forEach(e => t.push({
                id: e.key,
                ...e.val()
            })),
            function(e) {
                const t = document.getElementById("couponsTbody");
                if (!e.length) return void(t.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#888;padding:30px;">No coupon codes available</td></tr>');
                let o = "";
                e.forEach(e => {
                    const t = e.maxUse ? `${e.used||0} / ${e.maxUse}` : `${e.used||0} / âˆž`;
                    o += `<tr>\n            <td><strong style="color:#bc13fe;font-family:monospace;font-size:14px;background:rgba(188,19,254,0.1);padding:4px 8px;border-radius:4px;">${e.code}</strong></td>\n            <td style="font-weight:700;color:#00ff66;">${e.discount}%</td>\n            <td style="color:#888;">${t}</td>\n            <td><span class="badge ${e.status?"badge-success":"badge-danger"}">${e.status?"Active":"Disabled"}</span></td>\n            <td style="display:flex;gap:5px;">\n                <button class="action-btn action-edit" onclick="toggleCoupon('${e.id}', ${e.status})" title="${e.status?"Disable":"Enable"}">${e.status?'<i class="fas fa-ban"></i>':'<i class="fas fa-check"></i>'}</button>\n                <button class="action-btn action-reject" onclick="deleteCoupon('${e.id}')" title="Delete"><i class="fas fa-trash"></i></button>\n            </td>\n        </tr>`
                }), t.innerHTML = o
            }(t)
    } catch (e) {
        o("Failed to load coupons", "error")
    }
    a()
}
window.initCoupons = e;
async function t() {
    const t = document.getElementById("couponCode").value.trim().toUpperCase(),
        c = parseInt(document.getElementById("couponDiscount").value),
        s = document.getElementById("couponMax").value ? parseInt(document.getElementById("couponMax").value) : null;
    if (!t || isNaN(c)) return o("Valid Code and Discount are required", "error");
    if (c <= 0 || c > 100) return o("Discount must be between 1% and 100%", "error");
    n();
    try {
        const n = await get(ref(db, "coupons"));
        let d = !1;
        if (n.exists() && n.forEach(e => {
                e.val().code === t && (d = !0)
            }), d) return a(), o("This coupon code already exists", "error");
        await push(ref(db, "coupons"), {
            code: t,
            discount: c,
            maxUse: s,
            used: 0,
            status: !0,
            createdAt: serverTimestamp()
        }), await logAudit("add_coupon", { code: t, discount: c }), o("Coupon created!"), document.getElementById("couponCode").value = "", document.getElementById("couponDiscount").value = "", document.getElementById("couponMax").value = "", await e()
    } catch (e) {
        o("Failed to create coupon", "error"), a()
    }
}

function o(e, t = "success") {
    const o = document.getElementById("couponToastContainer");
    if (!o) return;
    const n = document.createElement("div");
    n.className = `toast ${t}`, n.innerHTML = `<i class="fas ${"success"===t?"fa-check-circle":"fa-exclamation-circle"}"></i> <span>${e}</span>`, o.appendChild(n), setTimeout(() => {
        n.style.animation = "slideOutRight 0.3s forwards", setTimeout(() => n.remove(), 300)
    }, 3e3)
}

function n() {
    const e = document.getElementById("couponLoader");
    e && e.classList.remove("hidden")
}

function a() {
    const e = document.getElementById("couponLoader");
    e && e.classList.add("hidden")
}
document.addEventListener("DOMContentLoaded", () => {
    assertManager(() => {
        e(), document.getElementById("btnAddCoupon")?.addEventListener("click", t)
    })
}), window.toggleCoupon = async (t, c) => {
    n();
    try {
        await update(ref(db, `coupons/${t}`), {
            status: !c
        }), await logAudit("toggle_coupon", { id: t, status: !c }), o("Coupon " + (c ? "disabled" : "activated")), await e()
    } catch (e) {
        o("Status update failed", "error"), a()
    }
}, window.deleteCoupon = async t => {
    if (confirm("Delete this coupon?")) {
        n();
        try {
            await remove(ref(db, `coupons/${t}`)), await logAudit("delete_coupon", { id: t }), o("Coupon deleted"), await e()
        } catch (e) {
            o("Delete failed", "error"), a()
        }
    }
};