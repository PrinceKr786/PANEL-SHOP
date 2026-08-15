import {
    db,
    ref,
    push,
    get
} from "../../assets/scripts/firebase.js";
import {
    assertManager,
    logAudit
} from "../../assets/scripts/auth-guard.js";
async function e() {
    const e = document.getElementById("panelCategory"),
        t = document.getElementById("cdropMenu"),
        n = document.getElementById("cdropTrigger");
    if (e && t) try {
        const a = (await get(ref(db, "categories"))).val(),
            l = a ? Object.values(a).map(e => e.name).filter(Boolean) : [];
        l.sort();
        let o = '<option value="">Select category...</option>',
            i = "";
        l.forEach(e => {
            const t = e.replace(/"/g, "&quot;");
            o += `<option value="${t}">${e}</option>`, i += `<div class="cdrop-item" data-value="${t}"><i class="fas fa-tag"></i> ${e}</div>`
        }), e.innerHTML = o, 0 === l.length && (i = '<div class="cdrop-empty">No categories yet</div>'), t.innerHTML = i, t.querySelectorAll(".cdrop-item").forEach(a => {
            a.addEventListener("click", () => {
                const l = a.dataset.value;
                e.value = l, n.querySelector(".cdrop-label").textContent = a.textContent.trim(), t.classList.remove("open"), e.dispatchEvent(new Event("change", {
                    bubbles: !0
                }))
            })
        })
    } catch (e) {
        console.error("cat dropdown err", e)
    }
}

function t(e) {
    if (!e) return null;
    if (11 === e.length && !e.includes("/")) return e;
    const t = e.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
    return t && 11 === t[2].length ? t[2] : null
}

function n() {
    const e = document.getElementById("plansContainer"),
        t = document.createElement("div");
    t.className = "plan-row", t.innerHTML = '<input class="p-label form-input plan-name-input" placeholder="Plan Name (e.g. 1 Day)" required type="text"/><input class="p-price form-input plan-price-input" placeholder="Price (₹)" required type="number"/><input class="p-keys form-input plan-keys-input" placeholder="Keys" value="1" type="number"/><button class="delete-plan-btn" onclick="this.parentElement.remove(); window.updateLivePreview();"><i class="fas fa-trash"></i></button>', e.appendChild(t)
}

function a() {
    const e = document.getElementById("panelName").value || "Panel Name",
        n = document.getElementById("panelLogo").value || "",
        a = document.getElementById("panelCategory").value || "Category",
        l = t(document.getElementById("panelYt").value) || "dQw4w9WgXcQ",
        o = (document.getElementById("panelDesc").value || "Premium injection tool").split(/\n|-/).filter(e => e.trim().length > 0).map(e => `<span class="feature-chip"><i class="fas fa-bolt"></i> ${e.trim()}</span>`).join("");
    let i = "",
        r = !1;
    document.querySelectorAll(".plan-row").forEach((e, t) => {
        const n = e.querySelector(".p-label").value || "Plan Name",
            a = e.querySelector(".p-price").value || "0";
        n && a && (i += `<div class="preview-popup-item" onclick="this.closest('.preview-plan-popup').classList.remove('show')"><span class="popup-label">${n}</span><span class="popup-price">₹${a}</span></div>`, r = !0)
    });
    const c = n ? `<img src="${n}" class="preview-logo">` : "",
        s = document.getElementById("livePreviewCard");
    s && (s.innerHTML = `\n        <div class="preview-video"><iframe src="https://www.youtube.com/embed/${l}?rel=0&modestbranding=1" allowfullscreen></iframe></div>\n        <div class="preview-info">\n            <div class="preview-header">\n                ${c}\n                <div style="flex:1;min-width:0;">\n                    <div class="preview-name">${e}</div>\n                    <span class="preview-category">${a}</span>\n                </div>\n                <span class="badge badge-success">Live</span>\n            </div>\n            <div class="preview-features">${o}</div>\n            ${r?`<div class="preview-buy-wrapper"><button class="preview-buy-btn" onclick="this.nextElementSibling.classList.toggle('show')"><i class="fas fa-shopping-cart"></i> PURCHASE KEY</button><div class="preview-plan-popup">${i}</div></div>`:'<div style="margin:10px 0 15px;"><span style="color:#ff3366;font-size:12px;font-weight:600;">No plans added</span></div><button class="preview-buy-btn" disabled><i class="fas fa-shopping-cart"></i> PURCHASE KEY</button>'}\n        </div>`)
}
async function l() {
    const e = document.getElementById("panelName").value.trim(),
        n = document.getElementById("panelLogo").value.trim(),
        l = document.getElementById("panelCategory").value.trim(),
        i = document.getElementById("panelYt").value.trim(),
        r = document.getElementById("panelLink").value.trim(),
        c = document.getElementById("panelFeedback").value.trim(),
        s = document.getElementById("panelDesc").value.trim();
    if (!e || !i || !r) return o("Name, YouTube, and Link are required", "error");
    const d = t(i);
    if (!d) return o("Invalid YouTube URL", "error");
    const p = {};
    let u = !1;
    if (document.querySelectorAll(".plan-row").forEach((e, t) => {
            const n = e.querySelector(".p-label").value.trim(),
                a = parseFloat(e.querySelector(".p-price").value),
                l = parseInt(e.querySelector(".p-keys").value) || 1;
            n && a >= 0 && (p[`plan_${t}`] = {
                label: n,
                price: a,
                keys: l
            }, u = !0)
        }), !u) return o("Add at least one valid pricing plan", "error");
    ! function() {
        const e = document.getElementById("panelLoader");
        e && e.classList.remove("hidden")
    }();
    try {
        await push(ref(db, "panels"), {
            name: e,
            logo: n,
            category: l,
            youtube: d,
            link: r,
            feedback: c,
            description: s,
            status: "active",
            plans: p
        }), await logAudit("add_panel", { name: e, category: l }), o("Panel added successfully!"), ["panelName", "panelLogo", "panelCategory", "panelYt", "panelLink", "panelFeedback", "panelDesc"].forEach(e => {
            document.getElementById(e).value = ""
        }), document.getElementById("plansContainer").innerHTML = '\n            <div class="plan-row">\n                <input class="p-label form-input plan-name-input" placeholder="Plan Name (e.g. 1 Day)" required type="text"/>\n                <input class="p-price form-input plan-price-input" placeholder="Price (₹)" required type="number"/>\n                <input class="p-keys form-input plan-keys-input" placeholder="Keys" value="1" type="number"/>\n                <button class="delete-plan-btn" onclick="this.parentElement.remove(); window.updateLivePreview();"><i class="fas fa-trash"></i></button>\n            </div>', a()
    } catch (e) {
        o("Database Error", "error")
    }! function() {
        const e = document.getElementById("panelLoader");
        e && e.classList.add("hidden")
    }()
}

function o(e, t = "success") {
    const n = document.getElementById("panelToastContainer");
    if (!n) return;
    const a = document.createElement("div");
    a.className = `toast ${t}`;
    const l = "success" === t ? "fa-check-circle" : "error" === t ? "fa-exclamation-circle" : "fa-exclamation-triangle";
    a.innerHTML = `<i class="fas ${l}"></i> <span>${e}</span>`, n.appendChild(a), setTimeout(() => {
        a.style.animation = "slideOutRight 0.3s forwards", setTimeout(() => a.remove(), 300)
    }, 3e3)
}
document.addEventListener("DOMContentLoaded", () => (function(){ if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",__boot);return;} function __boot(){
    assertManager(() => {
        document.getElementById("btnAddPlanRow")?.addEventListener("click", n), document.getElementById("btnSubmitPanel")?.addEventListener("click", l), ["panelName", "panelLogo", "panelYt", "panelDesc"].forEach(e => {
            document.getElementById(e)?.addEventListener("input", a)
        }), document.getElementById("panelCategory")?.addEventListener("change", a), document.getElementById("plansContainer")?.addEventListener("input", e => {
            "INPUT" === e.target.tagName && a()
        }), document.addEventListener("click", e => {
            e.target.closest(".preview-buy-wrapper") || document.querySelectorAll(".preview-plan-popup.show").forEach(e => e.classList.remove("show"))
        });
        const t = document.getElementById("cdropTrigger"),
            o = document.getElementById("cdropMenu");
        t && o && t.addEventListener("click", e => {
            e.stopPropagation(), o.classList.toggle("open")
        }), document.addEventListener("click", e => {
            e.target.closest(".cdrop") || document.querySelectorAll(".cdrop-menu.open").forEach(e => e.classList.remove("open"))
        }), e(), a(), document.addEventListener("visibilitychange", () => {
            document.hidden || e()
        }), window.addEventListener("focus", e)
    })
} __boot(); })), window.updateLivePreview = a;