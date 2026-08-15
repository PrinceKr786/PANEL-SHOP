import {
    auth,
    db,
    ref,
    get,
    set,
    remove,
    serverTimestamp,
    onAuthStateChanged
} from "../../assets/scripts/firebase.js";
import {
    assertAdmin,
    logAudit
} from "../../assets/scripts/auth-guard.js";

async function loadManagers() {
    showLoader();
    try {
        const mgrSnap = await get(ref(db, "managers"));
        const mgrs = mgrSnap.val() || {};
        const uids = Object.keys(mgrs);
        const tbody = document.getElementById("managersTbody");
        if (!uids.length) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:#888;padding:30px;">No managers assigned yet</td></tr>';
            return;
        }
        const usersSnap = await get(ref(db, "users"));
        const users = usersSnap.val() || {};
        let html = "";
        for (const uid of uids) {
            const u = users[uid] || {};
            html += `<tr>
                <td><strong>${escapeHtml(u.username || u.name || "Unknown")}</strong><br><span style="font-size:10px;color:#888;">${escapeHtml(u.email || "")}</span></td>
                <td style="font-family:monospace;font-size:11px;color:#888;">${uid}</td>
                <td>${mgrs[uid].addedAt ? new Date(mgrs[uid].addedAt).toLocaleDateString() + " " + new Date(mgrs[uid].addedAt).toLocaleTimeString() : "-"}</td>
                <td style="display:flex;gap:5px;flex-wrap:wrap;">
                    <button class="action-btn action-reject" onclick="removeManager('${uid}')"><i class="fas fa-user-slash"></i> Remove</button>
                </td>
            </tr>`;
        }
        tbody.innerHTML = html;
    } catch (e) {
        console.error(e);
        toast("Failed to load managers", "error");
    } finally {
        hideLoader();
    }
}
window.loadManagers = loadManagers;

async function addManager() {
    const uid = document.getElementById("managerUidInput").value.trim();
    if (!uid) return toast("Paste a user UID first", "error");
    if (!/^[A-Za-z0-9_-]{20,}$/.test(uid)) return toast("Invalid UID format", "error");
    showLoader();
    try {
        const userSnap = await get(ref(db, `users/${uid}`));
        if (!userSnap.exists()) return toast("No user found with this UID", "error");
        await set(ref(db, `managers/${uid}`), { addedAt: serverTimestamp() });
        logAudit("manager_added", { uid });
        toast("User promoted to Manager");
        document.getElementById("managerUidInput").value = "";
        await loadManagers();
    } catch (e) {
        console.error(e);
        toast("Failed to add manager", "error");
    } finally {
        hideLoader();
    }
}
window.addManager = addManager;

async function removeManager(uid) {
    showLoader();
    try {
        await remove(ref(db, `managers/${uid}`));
        logAudit("manager_removed", { uid });
        toast("Manager access removed");
        await loadManagers();
    } catch (e) {
        console.error(e);
        toast("Failed to remove manager", "error");
    } finally {
        hideLoader();
    }
}
window.removeManager = removeManager;

function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function toast(msg, type = "success") {
    const c = document.getElementById("managersToastContainer");
    if (!c) return;
    const el = document.createElement("div");
    el.className = `toast ${type}`;
    const icon = type === "success" ? "fa-check-circle" : type === "error" ? "fa-exclamation-circle" : "fa-exclamation-triangle";
    el.innerHTML = `<i class="fas ${icon}"></i> <span>${msg}</span>`;
    c.appendChild(el);
    setTimeout(() => { el.style.animation = "slideOutRight 0.3s forwards"; setTimeout(() => el.remove(), 300); }, 3000);
}

function showLoader() {
    const el = document.getElementById("managersLoader");
    el && el.classList.remove("hidden");
}

function hideLoader() {
    const el = document.getElementById("managersLoader");
    el && el.classList.add("hidden");
}

document.addEventListener("DOMContentLoaded", () => (function(){ if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",__boot);return;} function __boot(){
    assertAdmin(() => loadManagers());
    document.getElementById("managerUidInput")?.addEventListener("keydown", e => { if (e.key === "Enter") addManager(); });
} __boot(); }));
