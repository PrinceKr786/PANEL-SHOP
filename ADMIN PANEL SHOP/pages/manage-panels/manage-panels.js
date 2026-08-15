import {
    db,
    ref,
    get,
    update,
    remove
} from "../../assets/scripts/firebase.js";
import {
    assertAdmin,
    logAudit
} from "../../assets/scripts/auth-guard.js";
let e = {},
    t = '<option value="">Select category...</option>';
async function n() {
    try {
        const e = (await get(ref(db, "categories"))).val(),
            n = e ? Object.values(e).map(e => e.name).filter(Boolean) : [];
        n.sort();
        const a = document.getElementById("editPCategory"),
            l = document.getElementById("cdropEditMenu");
        if (a && (t = '<option value="">Select category...</option>', n.forEach(e => t += `<option value="${e.replace(/"/g,"&quot;")}">${e}</option>`), a.innerHTML = t), l) {
            let e = "";
            n.forEach(t => {
                const n = t.replace(/"/g, "&quot;");
                e += `<div class="cdrop-item" data-value="${n}"><i class="fas fa-tag"></i> ${t}</div>`
            }), l.innerHTML = e || '<div class="cdrop-empty">No categories yet</div>', l.querySelectorAll(".cdrop-item").forEach(e => {
                e.addEventListener("click", () => {
                    a.value = e.dataset.value;
                    const t = document.querySelector("#cdropEditTrigger .cdrop-label");
                    t && (t.textContent = e.textContent.trim()), l.classList.remove("open"), a.dispatchEvent(new Event("change", {
                        bubbles: !0
                    }))
                })
            })
        }
    } catch (e) {
        console.error("cat load err", e)
    }
}
async function a() {
    i();
    try {
        const t = await get(ref(db, "panels"));
        e = t.val() || {},
            function(e) {
                const t = document.getElementById("panelsContainer");
                if (!t) return;
                let n = "";
                for (let t in e) {
                    const a = e[t],
                        l = "active" === a.status;
                    let o = "";
                    if (a.plans && Object.keys(a.plans).length > 0) {
                        const e = Object.entries(a.plans).sort((e, t) => (e[1]?.price || 0) - (t[1]?.price || 0));
                        o = '<select class="card-plan-select">', e.forEach(([e, t]) => {
                            o += `<option>${t.label||"Plan"} - ₹${t.price}</option>`
                        }), o += "</select>"
                    } else o = '<p style="color:#ff3366;font-size:12px;text-align:center;font-weight:600;">No plans</p>';
                    const i = a.logo ? `<img src="${a.logo}" class="card-logo">` : "",
                        c = a.feedback ? `<a href="${a.feedback}" target="_blank" style="color:#00f0ff;">View Feedback</a>` : '<span style="color:#ff3366;">Hidden</span>';
                    n += `\n            <div class="panel-card">\n                <div class="card-video"><iframe src="https://www.youtube.com/embed/${a.youtube}?rel=0&modestbranding=1" allowfullscreen></iframe></div>\n                <div class="card-body">\n                    <div class="card-header-row">\n                        ${i}\n                        <div style="flex:1;min-width:0;">\n                            <div class="card-name">${a.name}</div>\n                            <span class="card-category">${a.category||"Uncategorized"}</span>\n                        </div>\n                        <span class="badge ${l?"badge-success":"badge-danger"}">${a.status}</span>\n                    </div>\n                    <div class="card-meta">\n                        <div><i class="fas fa-link"></i> File: <a href="${a.link}" target="_blank" style="color:#00f0ff;">Open Link</a></div>\n                        <div style="margin-top:4px;"><i class="fas fa-comment"></i> Feed: ${c}</div>\n                    </div>\n                    <div style="margin:12px 0;">${o}</div>\n                    <div class="card-actions">\n                        <button class="action-btn action-edit" style="flex:1;justify-content:center;" onclick="togglePanelStatus('${t}', '${a.status}')"><i class="fas ${l?"fa-eye-slash":"fa-eye"}"></i> ${l?"Disable":"Enable"}</button>\n                        <button class="action-btn action-approve" onclick="openEditPanel('${t}')" title="Edit"><i class="fas fa-edit"></i></button>\n                        <button class="action-btn action-reject" onclick="deletePanel('${t}')" title="Delete"><i class="fas fa-trash"></i></button>\n                    </div>\n                </div>\n            </div>`
                }
                t.innerHTML = n || '<div style="padding:40px;text-align:center;color:#888;width:100%;">No panels found. <a href="add-panel.html" style="color:#bc13fe;">Add one now</a></div>'
            }(e)
    } catch (e) {
        console.error(e), o("Failed to load panels", "error")
    }
    c()
}
window.initPanels = a;
async function l() {
    const e = document.getElementById("editPanelId").value,
        t = function(e) {
            if (!e) return null;
            if (11 === e.length && !e.includes("/")) return e;
            const t = e.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
            return t && 11 === t[2].length ? t[2] : null
        }(document.getElementById("editPYt").value.trim());
    if (!t) return o("Invalid YouTube Link", "error");
    const n = {};
    let l = !1;
    if (document.querySelectorAll("#editPlansContainer .edit-plan-row").forEach((e, t) => {
            const a = e.querySelector(".p-label").value.trim(),
                o = parseFloat(e.querySelector(".p-price").value),
                i = parseInt(e.querySelector(".p-keys").value) || 1;
            a && o >= 0 && (n[`plan_${t}`] = {
                label: a,
                price: o,
                keys: i
            }, l = !0)
        }), !l) return o("Add at least one valid pricing plan", "error");
    i();
    try {
        await update(ref(db, `panels/${e}`), {
            name: document.getElementById("editPName").value,
            logo: document.getElementById("editPLogo").value,
            category: document.getElementById("editPCategory").value,
            youtube: t,
            link: document.getElementById("editPLink").value,
            feedback: document.getElementById("editPFeedback").value,
            description: document.getElementById("editPDesc").value,
            plans: n
        }), await logAudit("update_panel", { id: e, name: document.getElementById("editPName").value }), o("Panel updated!"), closeEditModal(), await a()
    } catch (e) {
        o("Update failed", "error"), c()
    }
}

function o(e, t = "success") {
    const n = document.getElementById("panelMngToastContainer");
    if (!n) return;
    const a = document.createElement("div");
    a.className = `toast ${t}`;
    const l = "success" === t ? "fa-check-circle" : "error" === t ? "fa-exclamation-circle" : "fa-exclamation-triangle";
    a.innerHTML = `<i class="fas ${l}"></i> <span>${e}</span>`, n.appendChild(a), setTimeout(() => {
        a.style.animation = "slideOutRight 0.3s forwards", setTimeout(() => a.remove(), 300)
    }, 3e3)
}

function i() {
    const e = document.getElementById("panelMngLoader");
    e && e.classList.remove("hidden")
}

function c() {
    const e = document.getElementById("panelMngLoader");
    e && e.classList.add("hidden")
}
document.addEventListener("DOMContentLoaded", async () => {
    assertAdmin(async () => {
        await n(), a(), document.getElementById("btnSaveEditPanel")?.addEventListener("click", l), document.addEventListener("visibilitychange", () => {
            document.hidden || n()
        }), window.addEventListener("focus", n);
        const e = document.getElementById("cdropEditTrigger"),
            t = document.getElementById("cdropEditMenu");
        e && t && e.addEventListener("click", e => {
            e.stopPropagation(), t.classList.toggle("open")
        }), document.addEventListener("click", e => {
            e.target.closest(".cdrop") || document.querySelectorAll(".cdrop-menu.open").forEach(e => e.classList.remove("open"))
        })
    })
}), window.togglePanelStatus = async (e, t) => {
    i();
    try {
        await update(ref(db, `panels/${e}`), {
            status: "active" === t ? "inactive" : "active"
        }), await logAudit("toggle_panel_status", { id: e, status: "active" === t ? "inactive" : "active" }), o("active" === t ? "Panel disabled" : "Panel enabled"), await a()
    } catch (e) {
        o("Error updating status", "error"), c()
    }
}, window.deletePanel = async e => {
    if (confirm("Delete this panel permanently? This cannot be undone.")) {
        i();
        try {
            await remove(ref(db, `panels/${e}`)), await logAudit("delete_panel", { id: e }), o("Panel deleted"), await a()
        } catch (e) {
            o("Delete failed", "error"), c()
        }
    }
}, window.openEditPanel = async t => {
    const a = e[t];
    if (!a) return;
    await n(), document.getElementById("editPanelId").value = t, document.getElementById("editPName").value = a.name || "", document.getElementById("editPLogo").value = a.logo || "";
    const l = document.getElementById("editPCategory");
    if (a.category) {
        l.value = a.category;
        const e = document.querySelector("#cdropEditTrigger .cdrop-label");
        e && (e.textContent = a.category)
    } else {
        const e = document.querySelector("#cdropEditTrigger .cdrop-label");
        e && (e.textContent = "Select category...")
    }
    document.getElementById("editPYt").value = a.youtube ? `https://youtube.com/watch?v=${a.youtube}` : "", document.getElementById("editPLink").value = a.link || "", document.getElementById("editPFeedback").value = a.feedback || "", document.getElementById("editPDesc").value = a.description || "";
    const o = document.getElementById("editPlansContainer");
    let i = "";
    a.plans && Object.values(a.plans).forEach(e => {
        i += `<div class="edit-plan-row">\n                <input class="p-label form-input edit-name-input" placeholder="Plan Name (e.g. 1 Day)" value="${e.label||""}" required type="text"/>\n                <input class="p-price form-input edit-price-input" placeholder="Price (₹)" value="${e.price||""}" required type="number"/>\n                <input class="p-keys form-input edit-keys-input" placeholder="Keys" value="${e.keys||1}" type="number"/>\n                <button class="delete-plan-btn" onclick="this.parentElement.remove();"><i class="fas fa-trash"></i></button>\n            </div>`
    }), o.innerHTML = i, document.getElementById("editPanelModal").classList.remove("hidden")
}, window.closeEditModal = () => {
    document.getElementById("editPanelModal").classList.add("hidden")
}, window.addEditPlanRow = () => {
    const e = document.getElementById("editPlansContainer"),
        t = document.createElement("div");
    t.className = "edit-plan-row", t.innerHTML = '<input class="p-label form-input edit-name-input" placeholder="Plan Name (e.g. 1 Day)" required type="text"/><input class="p-price form-input edit-price-input" placeholder="Price (₹)" required type="number"/><input class="p-keys form-input edit-keys-input" placeholder="Keys" value="1" type="number"/><button class="delete-plan-btn" onclick="this.parentElement.remove();"><i class="fas fa-trash"></i></button>', e.appendChild(t)
};