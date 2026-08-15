import {
    auth,
    db,
    ref,
    get,
    push,
    serverTimestamp,
    onAuthStateChanged,
    signOut,
    isManager,
    ADMIN_UID
} from "./firebase.js";
export function assertManager(callback) {
    onAuthStateChanged(auth, async user => {
        if (user) {
            const authorized = await isManager(user.uid);
            if (!authorized) {
                await signOut(auth);
                window.location.href = '../../pages/index/index.html';
                return;
            }
            const emailEl = document.getElementById('headerAdminEmail');
            if (emailEl) emailEl.textContent = user.email;
            callback && callback(user);
        } else {
            window.location.href = '../../pages/index/index.html';
        }
    })
}
export async function logAudit(action, details = {}) {
    try {
        const user = auth.currentUser;
        await push(ref(db, "audit_log"), {
            action,
            details,
            adminUID: user ? user.uid : ADMIN_UID,
            timestamp: serverTimestamp()
        })
    } catch (e) {
        console.warn("[AUDIT] Log failed:", e);
    }
}