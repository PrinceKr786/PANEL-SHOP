import {
    auth,
    db,
    ref,
    get,
    signInWithEmailAndPassword,
    signOut,
    isManager
} from "../../assets/scripts/firebase.js";
const e = document.getElementById("adminLoginForm"),
    t = document.getElementById("adminEmail"),
    n = document.getElementById("adminPassword"),
    a = document.getElementById("rememberMe"),
    o = document.getElementById("adminLoginBtn"),
    s = o.querySelector(".btn-text"),
    i = o.querySelector(".btn-icon"),
    r = document.getElementById("toggleEye"),
    c = document.getElementById("toast-container");

function l(e, t) {
    let n = 0;
    const a = setInterval(() => {
        e.innerText = t.split("").map((e, t) => t < n ? e : "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*!" [Math.floor(43 * Math.random())]).join(""), n >= t.length && clearInterval(a), n += 1 / 3
    }, 30)
}

function d(e, t = "success") {
    const n = document.createElement("div");
    n.className = `toast ${t}`;
    let a = "fa-unlock-keyhole";
    "error" === t && (a = "fa-skull-crossbones"), "warning" === t && (a = "fa-triangle-exclamation"), n.innerHTML = `<i class="fas ${a}"></i> <span>${e}</span>`, c && c.appendChild(n), setTimeout(() => {
        n.style.animation = "fadeOut 0.4s forwards", setTimeout(() => n.remove(), 400)
    }, 3e3)
}

function m() {
    o.disabled = !1, i.className = "fas fa-shield-halved btn-icon", s.innerText = "SECURE_LOGIN"
}
r && n && r.addEventListener("click", () => {
    "password" === n.type ? (n.type = "text", r.innerHTML = '<i class="fas fa-eye-slash" style="color: #00f0ff;"></i>') : (n.type = "password", r.innerHTML = '<i class="fas fa-eye"></i>')
}), document.addEventListener("DOMContentLoaded", () => (function(){ if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",__boot);return;} function __boot(){
    const e = localStorage.getItem("nexus_manager_id"),
        s = localStorage.getItem("nexus_manager_pass");
    e && (t.value = e, n.value = s || "", a.checked = !0)
} __boot(); }), e && e.addEventListener("submit", async e => {
    e.preventDefault();
    const r = t.value.trim(),
        c = n.value;
    if (!r || !c) return d("DATA INCOMPLETE", "warning");
    try {
        o.disabled = !0, i.className = "fas fa-circle-notch fa-spin btn-icon", l(s, "DECRYPTING_HASH...");
        const userCred = await signInWithEmailAndPassword(auth, r, c);
        const uid = userCred.user.uid;
        if (l(s, "VERIFYING_CLEARANCE..."), !(await isManager(uid))) return await signOut(auth), d("ACCESS_DENIED: UNAUTHORIZED_UID", "error"), void m();
        a.checked ? (localStorage.setItem("nexus_manager_id", r), localStorage.setItem("nexus_manager_pass", c)) : (localStorage.removeItem("nexus_manager_id"), localStorage.removeItem("nexus_manager_pass")), localStorage.removeItem("nexus_manager_key"), l(s, "ACCESS_GRANTED"), i.className = "fas fa-check btn-icon", i.style.color = "#00ff66", d("WELCOME MANAGER", "success"), setTimeout(() => {
            window.location.href = '../../pages/dashboard/dashboard.html'
        }, 1200)
    } catch (e) {
        console.error("Auth Fail:", e), d("INVALID_IDENTITY_MARKER", "error"), m()
    }
});