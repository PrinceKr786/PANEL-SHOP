import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, signInWithEmailAndPassword, setPersistence, browserLocalPersistence, browserSessionPersistence } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { getDatabase, ref, onValue, get, push, set, update, remove, runTransaction, serverTimestamp, query, limitToLast } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js";

const app = initializeApp({
    apiKey: "AIzaSyD9hHDcTFh0a-3eSsXJ-sdD4_U78bsagYA",
    authDomain: "prince-hacks-test.firebaseapp.com",
    databaseURL: "https://prince-hacks-test-default-rtdb.firebaseio.com",
    projectId: "prince-hacks-test",
    storageBucket: "prince-hacks-test.firebasestorage.app",
    messagingSenderId: "1070897490445",
    appId: "1:1070897490445:web:17b1cb1461fd76bb888344"
});

const auth = getAuth(app);
const db = getDatabase(app);

const ADMIN_UID = "PmgO7qHYasOdgQfkmai0YnpQIWB3";

export async function isAdmin(uid) {
    if (uid === ADMIN_UID) return true;
    try {
        const snap = await get(ref(db, `admins/${uid}`));
        return snap.exists();
    } catch {
        return false;
    }
}

export async function isManager(uid) {
    if (uid === ADMIN_UID) return true;
    try {
        const snap = await get(ref(db, `managers/${uid}`));
        return snap.exists();
    } catch {
        return false;
    }
}

export { app, auth, db, ref, onValue, get, push, set, update, remove, runTransaction, serverTimestamp, query, limitToLast, signInWithEmailAndPassword, signOut, onAuthStateChanged, setPersistence, browserLocalPersistence, browserSessionPersistence, ADMIN_UID };
