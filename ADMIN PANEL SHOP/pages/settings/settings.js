import {
    db,
    ref,
    get,
    set,
    onValue
} from "../../assets/scripts/firebase.js";
import {
    assertAdmin,
    logAudit
} from "../../assets/scripts/auth-guard.js";

function e(e, t = "success") {
    const n = document.getElementById("settingsToastContainer");
    if (!n) return;
    const a = document.createElement("div");
    a.className = `toast ${t}`, a.innerHTML = `<i class="fas ${"success"===t?"fa-check-circle":"fa-exclamation-circle"}"></i> <span>${e}</span>`, n.appendChild(a), setTimeout(() => {
        a.style.animation = "slideOutRight 0.3s forwards", setTimeout(() => a.remove(), 300)
    }, 3e3)
}

function t() {
    const e = document.getElementById("settingsLoader");
    e && e.classList.remove("hidden")
}

function n() {
    const e = document.getElementById("settingsLoader");
    e && e.classList.add("hidden")
}
document.addEventListener("DOMContentLoaded", () => {
    assertAdmin(() => {
        !async function() {
            t();
            try {
                const [e, t] = await Promise.all([get(ref(db, "payment_config")), get(ref(db, "zap_config"))]), n = e.val() || {}, a = t.val() || {};
                document.getElementById("setZapKey").value = a.api_key || "", document.getElementById("setUpi").value = n.upiId || "";
                const r = n.qrImage || "";
                document.getElementById("setQr").value = r, document.getElementById("qrPreview").innerHTML = r ? `<img src="${r}" style="max-width:180px;border-radius:12px;border:1px solid rgba(255,255,255,0.06);margin-top:10px;">` : "", document.getElementById("setCryptoPayid").value = n.binance_pay_id || "", document.getElementById("setCryptoAddress").value = n.usdt_address || "", document.getElementById("setCryptoRate").value = n.crypto_rate || "", document.getElementById("currentRateDisplay").innerText = n.crypto_rate || "88.00";
                const o = n.crypto_qr || "";
                document.getElementById("setCryptoQr").value = o, document.getElementById("cryptoQrPreview").innerHTML = o ? `<img src="${o}" style="max-width:180px;border-radius:12px;border:1px solid rgba(255,255,255,0.06);margin-top:10px;">` : ""
            } catch (t) {
                e("Failed to load settings", "error")
            }
            n()
        }(), document.getElementById("setQr")?.addEventListener("input", e => {
            document.getElementById("qrPreview").innerHTML = e.target.value ? `<img src="${e.target.value}" style="max-width:180px;border-radius:12px;border:1px solid rgba(255,255,255,0.06);margin-top:10px;">` : ""
        }), document.getElementById("setCryptoQr")?.addEventListener("input", e => {
            document.getElementById("cryptoQrPreview").innerHTML = e.target.value ? `<img src="${e.target.value}" style="max-width:180px;border-radius:12px;border:1px solid rgba(255,255,255,0.06);margin-top:10px;">` : ""
        })
    })
}), window.saveAutoPayment = async function() {
    const a = document.getElementById("setZapKey").value.trim();
    if (!a) return e("Enter API Key", "error");
    t();
    try {
        await set(ref(db, "zap_config/api_key"), a), window.ZAP_KEY = a, await logAudit("update_zap_config"), e("Auto payment API saved")
    } catch (t) {
        e("Failed to save", "error")
    }
    n()
}, window.saveManualPayment = async function() {
    t();
    try {
        const t = document.getElementById("setUpi").value.trim(),
            n = document.getElementById("setQr").value.trim(),
            a = (await get(ref(db, "payment_config"))).val() || {};
        await set(ref(db, "payment_config"), {
            ...a,
            upiId: t,
            qrImage: n
        }), await logAudit("update_upi_config"), e("UPI settings saved")
    } catch (t) {
        e("Failed to save", "error")
    }
    n()
}, window.saveCryptoSettings = async function() {
    t();
    try {
        const t = document.getElementById("setCryptoPayid").value.trim(),
            n = document.getElementById("setCryptoAddress").value.trim(),
            a = document.getElementById("setCryptoQr").value.trim(),
            r = (await get(ref(db, "payment_config"))).val() || {};
        await set(ref(db, "payment_config"), {
            ...r,
            binance_pay_id: t,
            usdt_address: n,
            crypto_qr: a
        }), await logAudit("update_crypto_config"), e("Crypto settings saved")
    } catch (t) {
        e("Failed to save", "error")
    }
    n()
}, window.saveCryptoRate = async function() {
    const a = parseFloat(document.getElementById("setCryptoRate").value);
    if (!a || a <= 0) return e("Enter a valid rate", "error");
    t();
    try {
        await set(ref(db, "payment_config/crypto_rate"), a.toString()), await logAudit("update_crypto_rate", { rate: a }), document.getElementById("currentRateDisplay").innerText = a.toString();
        try {
            localStorage.setItem("nexus_usdt_rate", a.toString())
        } catch (e) {}
        e("Global rate updated: 1 USDT = ₹" + a)
    } catch (t) {
        e("Failed to save", "error")
    }
    n()
}, onValue(ref(db, "payment_config/crypto_rate"), e => {
    const t = e.val() || "88.00",
        n = document.getElementById("currentRateDisplay");
    n && (n.innerText = t)
});