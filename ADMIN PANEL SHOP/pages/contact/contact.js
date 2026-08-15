import {
    db,
    ref,
    get,
    set,
    onValue,
    push,
    update,
    serverTimestamp
} from "../../assets/scripts/firebase.js";
import {
    assertAdmin,
    logAudit
} from "../../assets/scripts/auth-guard.js";

function e(e) {
    document.querySelectorAll(".page-section").forEach(e => e.classList.remove("active-section")), "links" === e ? (document.getElementById("sectionLinks").classList.add("active-section"), document.getElementById("tabLinks").style.background = "rgba(188,19,254,0.15)", document.getElementById("tabLinks").style.borderColor = "#bc13fe", document.getElementById("tabTickets").style.background = "", document.getElementById("tabTickets").style.borderColor = "") : (document.getElementById("sectionTickets").classList.add("active-section"), document.getElementById("tabTickets").style.background = "rgba(188,19,254,0.15)", document.getElementById("tabTickets").style.borderColor = "#bc13fe", document.getElementById("tabLinks").style.background = "", document.getElementById("tabLinks").style.borderColor = "")
}
async function t() {
    s();
    try {
        await set(ref(db, "support_links"), {
            whatsapp: document.getElementById("setWa").value.trim(),
            whatsapp_display: document.getElementById("setWaDisplay").value.trim(),
            email: document.getElementById("setEmail").value.trim(),
            telegram: document.getElementById("setTgLogin").value.trim(),
            telegram_display: document.getElementById("setTgDisplay").value.trim(),
            discord: document.getElementById("setDiscord").value.trim(),
            discord_display: document.getElementById("setDiscordDisplay").value.trim()
        }), await logAudit("update_support_links"), n("Support Links Saved!")
    } catch (e) {
        n("Failed to save", "error")
    }
    i()
}

function a(e) {
    if (!e) return "";
    const t = document.createElement("div");
    return t.textContent = e, t.innerHTML
}

function n(e, t = "success") {
    const a = document.getElementById("contactToastContainer");
    if (!a) return;
    const n = document.createElement("div");
    n.className = `toast ${t}`, n.innerHTML = `<i class="fas ${"success"===t?"fa-check-circle":"fa-exclamation-circle"}"></i> <span>${e}</span>`, a.appendChild(n), setTimeout(() => {
        n.style.animation = "slideOutRight 0.3s forwards", setTimeout(() => n.remove(), 300)
    }, 3e3)
}

function s() {
    const e = document.getElementById("contactLoader");
    e && e.classList.remove("hidden")
}

function i() {
    const e = document.getElementById("contactLoader");
    e && e.classList.add("hidden")
}
document.addEventListener("DOMContentLoaded", () => {
    assertAdmin(() => {
        !async function() {
                s();
                try {
                    const e = (await get(ref(db, "support_links"))).val() || {};
                    document.getElementById("setWa").value = e.whatsapp || "", document.getElementById("setWaDisplay").value = e.whatsapp_display || "", document.getElementById("setEmail").value = e.email || "", document.getElementById("setTgLogin").value = e.telegram || "", document.getElementById("setTgDisplay").value = e.telegram_display || "", document.getElementById("setDiscord").value = e.discord || "", document.getElementById("setDiscordDisplay").value = e.discord_display || ""
                } catch (e) {
                    n("Failed to load support links", "error")
                }
                i()
            }(),
            function() {
                const e = ref(db, "tickets");
                onValue(e, e => {
                    const t = e.val() || {},
                        n = Object.entries(t).map(([e, t]) => ({
                            id: e,
                            ...t
                        }));
                    ! function(e) {
                        const t = e.filter(e => "open" === e.status || "pending" === e.status).length,
                            a = document.getElementById("ticketBadge");
                        a && (a.innerText = t)
                    }(n),
                    function(e) {
                        const t = document.getElementById("sectionTickets");
                        if (!e.length) return void(t.innerHTML = '<div class="dash-box glass-panel" style="text-align:center;padding:60px 20px;"><div style="font-size:40px;color:rgba(255,255,255,0.1);margin-bottom:15px;"><i class="fas fa-ticket"></i></div><h3 style="color:rgba(255,255,255,0.3);font-weight:600;">No Tickets Yet</h3></div>');
                        const n = e.sort((e, t) => "open" === e.status && "open" !== t.status ? -1 : "open" !== e.status && "open" === t.status ? 1 : (t.createdAt || 0) - (e.createdAt || 0));
                        t.innerHTML = `<div class="dash-box glass-panel"><div class="box-header"><h2><i class="fas fa-ticket" style="color:#bc13fe;margin-right:8px;"></i> Support Tickets (${n.length})</h2></div><div style="display:flex;flex-direction:column;gap:12px;" id="ticketList"></div></div>`;
                        const s = document.getElementById("ticketList");
                        n.forEach(e => {
                            const t = e.createdAt ? new Date(e.createdAt).toLocaleString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit"
                                }) : "N/A",
                                n = "open" === e.status,
                                i = {
                                    low: "#888",
                                    medium: "#00f0ff",
                                    high: "#ffaa00",
                                    urgent: "#ff2a5f"
                                } [e.priority] || "#888",
                                o = {
                                    payment: "fa-credit-card",
                                    product: "fa-key",
                                    hwid: "fa-microchip",
                                    account: "fa-user",
                                    other: "fa-circle-question"
                                } [e.category] || "fa-circle-question",
                                d = document.createElement("div");
                            d.style.cssText = "background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:14px;padding:18px;transition:0.3s;", d.innerHTML = `\n            <div style="display:flex;justify-content:space-between;align-items:start;gap:12px;flex-wrap:wrap;margin-bottom:10px;">\n                <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">\n                    <span style="background:${n?"rgba(0,255,102,0.15)":"rgba(255,255,255,0.05)"};color:${n?"#00ff66":"#888"};font-size:9px;font-weight:800;padding:3px 10px;border-radius:50px;text-transform:uppercase;letter-spacing:0.5px;">${e.status}</span>\n                    <span style="background:rgba(255,255,255,0.05);color:${i};font-size:9px;font-weight:700;padding:3px 10px;border-radius:50px;text-transform:uppercase;border:1px solid ${i}30;">${e.priority}</span>\n                    <span style="color:#888;font-size:10px;"><i class="fas ${o}" style="margin-right:4px;"></i>${e.category}</span>\n                </div>\n                <span style="color:#666;font-size:10px;font-family:'Space Mono',monospace;">${t}</span>\n            </div>\n            <div style="font-size:13px;font-weight:700;color:#fff;margin-bottom:6px;">${a(e.subject)}</div>\n            <div style="display:flex;gap:16px;flex-wrap:wrap;font-size:11px;color:#888;margin-bottom:8px;">\n                <span><i class="fas fa-user" style="color:#00f0ff;width:14px;"></i> ${a(e.username||"N/A")}</span>\n                <span><i class="fas fa-envelope" style="color:#bc13fe;width:14px;"></i> ${a(e.email)}</span>\n                <span><i class="fas fa-wallet" style="color:#00ff66;width:14px;"></i> ₹${parseFloat(e.balance||0).toFixed(2)}</span>\n                ${e.txnId?`<span><i class="fas fa-hashtag" style="color:#ffaa00;width:14px;"></i> ${a(e.txnId)}</span>`:""}\n            </div>\n            <div style="font-size:12px;color:#b0b5c5;background:rgba(0,0,0,0.3);border-radius:10px;padding:12px;margin-bottom:10px;line-height:1.6;white-space:pre-wrap;">${a(e.message)}</div>\n            ${e.adminReply?`<div style="font-size:12px;color:#00f0ff;background:rgba(0,240,255,0.06);border:1px solid rgba(0,240,255,0.12);border-radius:10px;padding:12px;margin-bottom:10px;line-height:1.6;"><i class="fas fa-reply" style="margin-right:6px;"></i> <b>Admin Reply:</b> ${a(e.adminReply)}</div>`:""}\n            <div style="display:flex;gap:8px;flex-wrap:wrap;${n?"":"display:none;"}">\n                <input type="text" id="replyInput_${e.id}" class="form-input" placeholder="Type your reply..." style="flex:1;min-width:140px;padding:10px 14px;font-size:12px;" />\n                <button class="qa-btn ticket-reply-btn" data-id="${e.id}" data-email="${e.email}" data-username="${a(e.username||"N/A")}" style="padding:10px 18px;white-space:nowrap;font-size:10px;"><i class="fas fa-reply"></i> REPLY</button>\n                <button class="qa-btn ticket-close-btn" data-id="${e.id}" style="padding:10px 18px;white-space:nowrap;font-size:10px;background:rgba(255,42,95,0.1);border-color:#ff2a5f;"><i class="fas fa-check"></i> CLOSE</button>\n            </div>\n        `, s.appendChild(d)
                        })
                    }(n)
                })
            }(), document.getElementById("btnSaveContact")?.addEventListener("click", t), document.getElementById("tabLinks")?.addEventListener("click", () => e("links")), document.getElementById("tabTickets")?.addEventListener("click", () => e("tickets")), document.getElementById("sectionTickets").addEventListener("click", e => {
                if (e.target.closest(".ticket-reply-btn")) {
                    const t = e.target.closest(".ticket-reply-btn");
                    !async function(e, t, a) {
                        const o = document.getElementById(`replyInput_${e}`),
                            d = o?.value.trim();
                        if (d) {
                            s();
                            try {
                                const s = (await get(ref(db, `tickets/${e}`))).val() || {};
                                await update(ref(db, `tickets/${e}`), {
                                    adminReply: d,
                                    status: "open",
                                    repliedAt: serverTimestamp()
                                }), await logAudit("reply_ticket", { ticketId: e, uid: s.uid }), s.uid && await push(ref(db, `notifications/${s.uid}`), {
                                    type: "reply",
                                    title: "Ticket Reply",
                                    message: `Admin replied to "${s.subject||"your ticket"}"`,
                                    link: "components/menubar/support.html",
                                    read: !1,
                                    createdAt: serverTimestamp()
                                }), n(`Reply sent to ${a||t}`), o.value = ""
                            } catch (e) {
                                n("Failed to send reply", "error")
                            }
                            i()
                        } else n("Please type a reply", "error")
                    }(t.dataset.id, t.dataset.email, t.dataset.username)
                }
                e.target.closest(".ticket-close-btn") && async function(e) {
                    s();
                    try {
                        await update(ref(db, `tickets/${e}`), {
                            status: "closed",
                            closedAt: serverTimestamp()
                        }), await logAudit("close_ticket", { ticketId: e }), n("Ticket closed")
                    } catch (e) {
                        n("Failed to close ticket", "error")
                    }
                    i()
                }(e.target.closest(".ticket-close-btn").dataset.id)
            })
    })
});