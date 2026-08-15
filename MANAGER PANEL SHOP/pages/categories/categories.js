import {
    db,
    ref,
    push,
    set,
    get,
    remove,
    onValue,
    update
} from "../../assets/scripts/firebase.js";
import {
    assertManager,
    logAudit
} from "../../assets/scripts/auth-guard.js";

function e(e, t = "success") {
    const a = document.getElementById("panelToastContainer");
    if (!a) return;
    const n = document.createElement("div");
    n.className = `toast ${t}`;
    const r = "success" === t ? "fa-check-circle" : "error" === t ? "fa-exclamation-circle" : "fa-exclamation-triangle";
    n.innerHTML = `<i class="fas ${r}"></i> <span>${e}</span>`, a.appendChild(n), setTimeout(() => {
        n.style.opacity = "0", n.style.transform = "translateX(40px)", setTimeout(() => n.remove(), 400)
    }, 3e3)
}
document.addEventListener("DOMContentLoaded", () => {
    assertManager(() => {
        document.getElementById("btnAddCategory")?.addEventListener("click", () => window.addCategory()), document.getElementById("catNameInput")?.addEventListener("keydown", e => {
                "Enter" === e.key && window.addCategory()
            }),
            function() {
                const e = document.getElementById("catsListContainer");
                onValue(ref(db, "categories"), async t => {
                    const a = [];
                    t.exists() && t.forEach(e => {
                        a.push({
                            id: e.key,
                            ...e.val()
                        })
                    });
                    let n = {};
                    try {
                        const e = await get(ref(db, "panels"));
                        e.exists() && e.forEach(e => {
                            const t = e.val().category || "Uncategorized";
                            n[t] = (n[t] || 0) + 1
                        })
                    } catch (e) {}
                    if (0 === a.length) return void(e.innerHTML = '<div class="cat-empty"><i class="fas fa-tags"></i><span>No categories yet. Create one above.</span></div>');
                    let r = "";
                    a.sort((e, t) => (e.createdAt || 0) - (t.createdAt || 0)), a.forEach(e => {
                        const t = n[e.name] || 0;
                        r += `\n                <div class="cat-item" data-id="${e.id}">\n                    <div class="cat-item-left">\n                        <div class="cat-item-icon"><i class="fas fa-tag"></i></div>\n                        <div>\n                            <div class="cat-item-name">${e.name}</div>\n                            <span class="cat-item-count">${t} panel${1!==t?"s":""}</span>\n                        </div>\n                    </div>\n                    <div class="cat-item-actions">\n                        <button class="cat-edit-btn" onclick="editCategory('${e.id}','${e.name.replace(/'/g,"\\'")}')" title="Edit"><i class="fas fa-pen"></i></button>\n                        <button class="cat-del-btn" onclick="deleteCategory('${e.id}','${e.name.replace(/'/g,"\\'")}')" title="Delete"><i class="fas fa-trash"></i></button>\n                    </div>\n                </div>`
                    }), e.innerHTML = r
                })
            }()
    })
}), window.addCategory = async function() {
    const t = document.getElementById("catNameInput"),
        a = t.value.trim();
    if (!a) return e("Enter a category name", "error");
    if (a.length > 30) return e("Name too long (max 30 chars)", "error");
    const n = document.getElementById("btnAddCategory");
    n.disabled = !0, n.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    try {
        const n = await get(ref(db, "categories"));
        let r = !1;
        if (n.exists() && n.forEach(e => {
                e.val().name.toLowerCase() === a.toLowerCase() && (r = !0)
            }), r) return e("Category already exists", "error");
        await push(ref(db, "categories"), {
            name: a,
            createdAt: Date.now()
        }), await logAudit("add_category", { name: a }), t.value = "", e("Category added!")
    } catch (t) {
        e("Error adding category", "error")
    } finally {
        n.disabled = !1, n.innerHTML = '<i class="fas fa-plus"></i> ADD'
    }
}, window.editCategory = async function(t, a) {
    const n = document.querySelector(`.cat-item[data-id="${t}"]`);
    if (!n) return;
    const r = n.querySelector(".cat-item-name");
    r.innerHTML = `<input class="cat-edit-input" value="${a.replace(/"/g,"&quot;")}" maxlength="30" style="width:160px;padding:6px 10px;background:rgba(0,0,0,0.3);border:1px solid rgba(0,240,255,0.3);border-radius:8px;color:#fff;font-size:13px;font-weight:600;font-family:'Poppins',sans-serif;outline:none;">`;
    const i = r.querySelector("input");
    i.focus(), i.select(), i.addEventListener("blur", () => {
        const n = i.value.trim();
        if (n && n !== a) {
            if (n.length > 30) return e("Name too long (max 30 chars)", "error");
            update(ref(db, `categories/${t}`), {
                name: n
            }).then(() => {
                logAudit("edit_category", { id: t, name: n }), e("Category updated!")
            }).catch(() => {
                e("Error updating category", "error")
            }), r.textContent = n
        } else r.textContent = a
    }), i.addEventListener("keydown", e => {
        "Enter" === e.key && i.blur(), "Escape" === e.key && (r.textContent = a)
    })
}, window.deleteCategory = async function(t, a) {
    if (confirm(`Delete "${a}"? Panels using this category will show "General".`)) try {
        await remove(ref(db, `categories/${t}`)), await logAudit("delete_category", { id: t, name: a }), e("Category deleted!")
    } catch (t) {
        e("Error deleting category", "error")
    }
};