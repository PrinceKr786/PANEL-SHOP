import {
    db,
    ref,
    get,
    set,
    push,
    update,
    remove,
    serverTimestamp
} from "../../assets/scripts/firebase.js";
import {
    assertAdmin,
    logAudit
} from "../../assets/scripts/auth-guard.js";
let e = {};
async function t() {
    r();
    try {
        const e = (await get(ref(db, "settings/branding"))).val() || {};
        document.getElementById("brandName").value = e.name || "", document.getElementById("brandTagline").value = e.tagline || "", document.getElementById("brandAnnouncement").value = e.announcement || "", document.getElementById("brandFooter").value = e.footer || "";
        const t = document.getElementById("sidebarBrandText"),
            n = document.getElementById("sidebarBrandLogo"),
            o = document.getElementById("sidebarBrandIcon");
        t && e.name && (t.innerText = e.name.toUpperCase()), e.logo && e.logo.length > 5 && (n && (n.src = e.logo, n.style.display = "inline-block"), o && (o.style.display = "none"))
    } catch (e) {
        d("Failed to load branding", "error")
    }
    s(), async function() {
        try {
            const e = (await get(ref(db, "announcement_history"))).val() || {},
                t = document.getElementById("announcementHistory");
            if (!t) return;
            const n = Object.entries(e).map(([e, t]) => ({
                id: e,
                ...t
            }));
            if (n.sort((e, t) => (t.createdAt || 0) - (e.createdAt || 0)), !n.length) return void(t.innerHTML = '<div style="color:#888;font-size:12px;text-align:center;padding:12px;">No announcement history</div>');
            t.innerHTML = n.map((e, t) => {
                const n = e.createdAt ? new Date(e.createdAt).toLocaleString() : "Just now";
                return `<div style="display:flex;align-items:flex-start;gap:10px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.04);${0===t?"background:rgba(245,158,11,0.05);margin:-4px -8px 0;padding:14px 8px;border-radius:8px;border-bottom-color:rgba(245,158,11,0.15);":""}">\n                <div style="width:28px;height:28px;border-radius:8px;background:${0===t?"rgba(245,158,11,0.15)":"rgba(255,255,255,0.04)"};display:flex;align-items:center;justify-content:center;font-size:12px;color:${0===t?"#f59e0b":"#666"};flex-shrink:0;"><i class="fas fa-bullhorn"></i></div>\n                <div style="flex:1;min-width:0;">\n                    <div style="font-size:12px;color:${0===t?"#fef3c7":"#ccc"};font-weight:${0===t?"600":"400"};line-height:1.3;">${e.text}</div>\n                    <div style="font-size:9px;color:#666;margin-top:3px;">${n}</div>\n                </div>\n            </div>`
            }).join("")
        } catch (e) {}
    }()
}
async function n() {
    r();
    try {
        const e = document.getElementById("brandName").value.trim(),
            n = document.getElementById("brandTagline").value.trim(),
            o = document.getElementById("brandAnnouncement").value.trim(),
            i = document.getElementById("brandFooter").value.trim(),
            a = ((await get(ref(db, "settings/branding"))).val() || {}).logo || "";
        await set(ref(db, "settings/branding"), {
            name: e,
            tagline: n,
            logo: a,
            announcement: o,
            footer: i
        }), o && await push(ref(db, "announcement_history"), {
            text: o,
            createdAt: serverTimestamp()
        }), await logAudit("update_branding"), d("Branding Updated!"), await t()
    } catch (e) {
        d("Failed to save", "error")
    }
    s()
}
async function o() {
    r();
    try {
        const t = await get(ref(db, "promotions"));
        e = t.val() || {},
            function(e) {
                const t = document.getElementById("promotionsList"),
                    n = Object.entries(e).map(([e, t]) => ({
                        id: e,
                        ...t
                    }));
                if (n.sort((e, t) => (t.createdAt || 0) - (e.createdAt || 0)), !n.length) return void(t.innerHTML = '<div style="color:#888;font-size:13px;text-align:center;padding:20px;">No promotions available</div>');
                let o = "";
                n.forEach(e => {
                    const t = !0 === e.status || "true" === e.status,
                        n = (e.image || "").replace(/['"]/g, ""),
                        i = n ? `<img src="${n}" onerror="this.style.display='none'" style="width:100%;height:120px;object-fit:cover;border-radius:12px;border:1px solid rgba(255,255,255,0.06);">` : '<div style="width:100%;height:120px;background:rgba(255,255,255,0.03);display:flex;align-items:center;justify-content:center;border-radius:12px;color:#888;font-size:12px;"><i class="fas fa-image-slash" style="margin-right:5px;"></i> No Image</div>',
                        a = (e.link || "").replace(/['"]/g, ""),
                        d = a ? `<a href="${a}" target="_blank" style="color:#00f0ff;font-size:12px;"><i class="fas fa-external-link-alt"></i> ${a}</a>` : '<span style="font-size:12px;color:#888;">No Link</span>';
                    o += `\n            <div class="promo-item">\n                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">\n                    <div>\n                        <strong style="font-size:15px;">${e.title}</strong>\n                        ${e.discount?`<span style="background:rgba(255,42,95,0.15);color:#ff2a5f;font-size:10px;font-weight:800;padding:2px 8px;border-radius:50px;margin-left:6px;">${e.discount}% OFF</span>`:""}\n                    </div>\n                    <span class="badge ${t?"badge-success":"badge-danger"}">${t?"Active":"Disabled"}</span>\n                </div>\n                ${e.description?`<div style="font-size:12px;color:#94a3b8;">${e.description}</div>`:""}\n                ${i}\n                ${d}\n                <div style="display:flex;gap:10px;">\n                    <button class="action-btn action-edit" style="flex:1;justify-content:center;" onclick="togglePromo('${e.id}', ${t})">${t?'<i class="fas fa-ban"></i> Disable':'<i class="fas fa-check"></i> Enable'}</button>\n                    <button class="action-btn action-approve" onclick="openEditPromo('${e.id}')"><i class="fas fa-edit"></i> Edit</button>\n                    <button class="action-btn action-reject" onclick="deletePromo('${e.id}')"><i class="fas fa-trash"></i> Delete</button>\n                </div>\n            </div>`
                }), t.innerHTML = o
            }(e)
    } catch (e) {
        d("Failed to load promotions", "error")
    }
    s()
}
async function i() {
    const e = document.getElementById("promoTitle").value.trim(),
        t = document.getElementById("promoDesc").value.trim(),
        n = document.getElementById("promoDiscount").value.trim(),
        i = document.getElementById("promoImg").value.trim(),
        a = document.getElementById("promoLink").value.trim();
    if (!e) return d("Promotion Title is required", "error");
    r();
    try {
        await push(ref(db, "promotions"), {
            title: e,
            description: t,
            discount: n ? parseInt(n) : 0,
            image: i,
            link: a,
            status: !0,
            createdAt: serverTimestamp()
        });
        try {
            await push(ref(db, "global_alerts/promotions"), {
                type: "promotion",
                title: "New Promotion: " + e,
                message: t || "Check out our latest offer!",
                link: a || "home.html",
                createdAt: serverTimestamp()
            })
        } catch (e) {}
        await logAudit("add_promotion", { title: e, link: a }), d("Promotion added!"), document.getElementById("promoTitle").value = "", document.getElementById("promoDesc").value = "", document.getElementById("promoDiscount").value = "", document.getElementById("promoImg").value = "", document.getElementById("promoLink").value = "", await o()
    } catch (e) {
        d("Failed to add promotion", "error"), s()
    }
}
async function a() {
    const e = document.getElementById("editPromoId").value,
        t = document.getElementById("editPromoTitle").value.trim(),
        n = document.getElementById("editPromoDesc").value.trim(),
        i = document.getElementById("editPromoDiscount").value.trim(),
        a = document.getElementById("editPromoImg").value.trim(),
        l = document.getElementById("editPromoLink").value.trim();
    if (!t) return d("Title cannot be empty", "error");
    r();
    try {
        await update(ref(db, `promotions/${e}`), {
            title: t,
            description: n,
            discount: i ? parseInt(i) : 0,
            image: a,
            link: l
        }), await logAudit("update_promotion", { id: e, title: t }), d("Promotion updated!"), closeEditPromo(), await o()
    } catch (e) {
        d("Update failed", "error"), s()
    }
}

function d(e, t = "success") {
    const n = document.getElementById("brandingToastContainer");
    if (!n) return;
    const o = document.createElement("div");
    o.className = `toast ${t}`, o.innerHTML = `<i class="fas ${"success"===t?"fa-check-circle":"fa-exclamation-circle"}"></i> <span>${e}</span>`, n.appendChild(o), setTimeout(() => {
        o.style.animation = "slideOutRight 0.3s forwards", setTimeout(() => o.remove(), 300)
    }, 3e3)
}

function r() {
    const e = document.getElementById("brandingLoader");
    e && e.classList.remove("hidden")
}

function s() {
    const e = document.getElementById("brandingLoader");
    e && e.classList.add("hidden")
}
document.addEventListener("DOMContentLoaded", () => (function(){ if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",__boot);return;} function __boot(){
    assertAdmin(() => {
        t(), async function() {
            try {
                const e = Date.now() - 6048e5,
                    t = await get(ref(db, "global_alerts/promotions"));
                if (!t.exists()) return;
                const n = {};
                Object.entries(t.val()).forEach(([t, o]) => {
                    const i = o.createdAt || 0;
                    i > 0 && i < e && (n[`global_alerts/promotions/${t}`] = null)
                }), Object.keys(n).length && await update(ref(db), n)
            } catch (e) {}
        }(), document.getElementById("btnSaveBranding")?.addEventListener("click", n), document.getElementById("btnAddPromo")?.addEventListener("click", i), document.getElementById("btnSaveEditPromo")?.addEventListener("click", a);
        const e = document.getElementById("editPromoModal");
        e && e.addEventListener("click", t => {
            t.target === e && closeEditPromo()
        }), document.getElementById("tabContentPromotions")?.classList.contains("active") && o()
    })
} __boot(); })), window.loadPromotions = o, window.togglePromo = async (e, t) => {
    r();
    try {
        await update(ref(db, `promotions/${e}`), {
            status: !t
        }), await logAudit("toggle_promotion", { id: e, status: !t }), d("Promotion " + (t ? "Disabled" : "Activated")), await o()
    } catch (e) {
        d("Status update failed", "error"), s()
    }
}, window.deletePromo = async e => {
    if (confirm("Delete this promotion?")) {
        r();
        try {
            await remove(ref(db, `promotions/${e}`)), await logAudit("delete_promotion", { id: e }), d("Promotion deleted"), await o()
        } catch (e) {
            d("Delete failed", "error"), s()
        }
    }
}, window.openEditPromo = t => {
    const n = e[t];
    n && (document.getElementById("editPromoId").value = t, document.getElementById("editPromoTitle").value = n.title || "", document.getElementById("editPromoDesc").value = n.description || "", document.getElementById("editPromoDiscount").value = n.discount || "", document.getElementById("editPromoImg").value = n.image || "", document.getElementById("editPromoLink").value = n.link || "", document.getElementById("editPromoModal").classList.remove("hidden"))
}, window.closeEditPromo = () => document.getElementById("editPromoModal").classList.add("hidden");