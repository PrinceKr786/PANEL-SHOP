import {
    auth,
    db,
    ref,
    onValue,
    get,
    onAuthStateChanged,
    serverTimestamp
} from "../../assets/scripts/core/firebase.js";
document.addEventListener("DOMContentLoaded", () => {
    function e(e, t, n = 0, s = 600, a = !1) {
        const o = document.getElementById(e);
        if (!o) return;
        const r = t % 1 != 0,
            i = performance.now();
        requestAnimationFrame(function update(e) {
            const c = e - i,
                l = Math.min(c / s, 1),
                d = 1 - Math.pow(1 - l, 3),
                p = n + (t - n) * d;
            o.innerText = a && window.formatPriceShort ? window.formatPriceShort(p) : r ? p.toFixed(2) : Math.floor(p).toString(), l < 1 && requestAnimationFrame(update)
        })
    }

    function t(e, t = "success") {
        let n = document.getElementById("homeToastContainer");
        n || (n = document.createElement("div"), n.id = "homeToastContainer", n.style.cssText = "position:fixed;top:80px;right:15px;z-index:99999;display:flex;flex-direction:column;gap:8px;pointer-events:none;", document.body.appendChild(n));
        const s = document.createElement("div");
        s.className = `home-toast ${t}`;
        const a = "success" === t ? "fa-check-circle" : "error" === t ? "fa-exclamation-circle" : "fa-exclamation-triangle";
        s.innerHTML = `<i class="fas ${a}"></i> <span>${e}</span>`, n.appendChild(s), setTimeout(() => {
            s.style.opacity = "0", s.style.transform = "translateX(30px)", setTimeout(() => s.remove(), 300)
        }, 2500)
    }! function() {
        const e = document.querySelectorAll(".animate-on-view"),
            t = new IntersectionObserver(e => {
                e.forEach(e => {
                    if (e.isIntersecting) {
                        const n = parseFloat(e.target.dataset.delay || 0);
                        setTimeout(() => {
                            e.target.classList.add("visible")
                        }, 1e3 * n), t.unobserve(e.target)
                    }
                })
            }, {
                threshold: .1
            });
        e.forEach(e => t.observe(e)), document.querySelectorAll(".stat-card").forEach((e, t) => {
            e.classList.add("animate-fade-up");
            const n = parseFloat(e.dataset.delay || .1);
            e.style.animationDelay = .1 * t + n + "s"
        })
    }(),
    function() {
        const e = document.getElementById("featuredPanelContainer");
        e && onValue(ref(db, "panels"), t => {
            if (e.innerHTML = "", !t.exists()) return void(e.innerHTML = '\n                    <div class="snap-center shrink-0 w-full h-36 bg-gradient-to-br from-[#0a0c12] to-[#05070a] border border-white/5 rounded-2xl flex flex-col justify-center items-center">\n                        <i class="fas fa-box-open text-2xl text-gray-600 mb-2"></i>\n                        <p class="text-[9px] font-mono tracking-widest text-gray-500">No panels yet</p>\n                    </div>');
            let n = [];
            if (t.forEach(e => {
                    const t = {
                        id: e.key,
                        ...e.val()
                    };
                    "active" !== t.status && !0 !== t.status || n.push(t)
                }), 0 === n.length) return void(e.innerHTML = '\n                    <div class="snap-center shrink-0 w-full h-36 bg-gradient-to-br from-[#0a0c12] to-[#05070a] border border-white/5 rounded-2xl flex flex-col justify-center items-center">\n                        <i class="fas fa-box-open text-2xl text-gray-600 mb-2"></i>\n                        <p class="text-[9px] font-mono tracking-widest text-gray-500">No panels available</p>\n                    </div>');
            n = n.slice(0, 8), n.forEach((t, n) => {
                const s = t.plans ? Object.values(t.plans) : [],
                    a = s.length > 0 ? Math.min(...s.map(e => parseFloat(e.price || 0))) : 0,
                    o = s.length > 0 ? Math.max(...s.map(e => parseFloat(e.price || 0))) : 0,
                    r = a === o ? `₹${a}` : `₹${a} - ₹${o}`,
                    i = t.logo ? `<img src="${t.logo}" class="fp-logo">` : '<div class="fp-logo-placeholder"><i class="fas fa-cube"></i></div>';
                e.innerHTML += `\n                    <div class="snap-center shrink-0 w-[75%] md:w-[30%] featured-panel-card" onclick="window.location.href='../shop/shop.html'" style="animation-delay:${.08*n}s">\n                        <div class="fp-top">\n                            ${i}\n                            <div class="fp-info">\n                                <p class="fp-name">${t.name||"Panel"}</p>\n                                <p class="fp-category">${t.category||"General"}</p>\n                            </div>\n                            <span class="fp-badge">${s.length} Plans</span>\n                        </div>\n                        <div class="fp-bottom">\n                            <span class="fp-price-label">Starting from</span>\n                            <span class="fp-price">${r}</span>\n                        </div>\n                    </div>`
            });
            let s = setInterval(() => {
                if (e.isConnected) {
                    if (e.scrollWidth > e.clientWidth)
                        if (e.scrollLeft + e.clientWidth >= e.scrollWidth - 10) e.scrollTo({
                            left: 0,
                            behavior: "smooth"
                        });
                        else {
                            const t = e.querySelector(".featured-panel-card")?.offsetWidth || 200;
                            e.scrollBy({
                                left: t + 16,
                                behavior: "smooth"
                            })
                        }
                } else clearInterval(s)
            }, 4e3)
        })
    }(),
    function() {
        const e = document.getElementById("announcementContainer");
        e && get(ref(db, "settings/branding")).then(t => {
            const n = t.val() || {};
            n.announcement && (e.style.display = "", e.querySelector("#announcementText").textContent = n.announcement)
        }).catch(() => {})
    }(),
    function() {
        const e = document.getElementById("promotionsContainer");
        e && onValue(ref(db, "promotions"), t => {
            e.innerHTML = "";
            let n = [];
            if (t.exists() && t.forEach(e => {
                    const t = {
                        id: e.key,
                        ...e.val()
                    };
                    !0 !== t.status && "true" !== t.status || n.push(t)
                }), 0 === n.length) return void(e.innerHTML = '\n                    <div class="flex items-center justify-center h-36 bg-gradient-to-br from-[#0a0c12] to-[#05070a] border border-white/5 rounded-2xl">\n                        <div class="flex flex-col items-center opacity-60">\n                            <i class="fas fa-tags text-2xl text-gray-600 mb-2"></i>\n                            <p class="text-[9px] font-mono tracking-widest text-gray-500">No promotions active</p>\n                        </div>\n                    </div>');
            n = n.slice(0, 8);
            let s = '<div class="flex overflow-x-auto gap-4 pb-5 no-scrollbar snap-x snap-mandatory" id="promoScrollContainer">';
            n.forEach((e, t) => {
                const n = (e.image || "").replace(/['"]/g, ""),
                    a = e.discount || 0,
                    o = (e.link || "#").replace(/['"]/g, ""),
                    r = n ? `background-image:url('${n}');background-size:cover;background-position:center;` : "";
                s += `\n                    <div class="snap-center shrink-0 w-[75%] md:w-[30%] promo-carousel-card" onclick="window.open('${o.replace(/'/g,"")}','_blank')" style="animation-delay:${.08*t}s">\n                        <div class="promo-carousel-bg ${n?"has-img":"no-img"}" style="${r}">\n                            ${n?"":'<div class="promo-carousel-icon"><i class="fas fa-tags"></i></div>'}\n                            ${n?'<div class="promo-carousel-overlay"></div>':""}\n                        </div>\n                        <div class="promo-carousel-content">\n                            <div class="flex items-center gap-2 mb-1">\n                                <span class="promo-carousel-badge">${a>0?a+"% OFF":"LIVE"}</span>\n                            </div>\n                            <h4 class="promo-carousel-title">${e.title||"Promotion"}</h4>\n                            ${e.description?`<p class="promo-carousel-desc">${e.description}</p>`:""}\n                        </div>\n                    </div>`
            }), s += "</div>", e.innerHTML = s, setTimeout(() => {
                const e = document.getElementById("promoScrollContainer");
                if (!e) return;
                let t = setInterval(() => {
                    if (e.isConnected) {
                        if (e.scrollWidth > e.clientWidth)
                            if (e.scrollLeft + e.clientWidth >= e.scrollWidth - 10) e.scrollTo({
                                left: 0,
                                behavior: "smooth"
                            });
                            else {
                                const t = e.querySelector(".promo-carousel-card")?.offsetWidth || 200;
                                e.scrollBy({
                                    left: t + 16,
                                    behavior: "smooth"
                                })
                            }
                    } else clearInterval(t)
                }, 4e3)
            }, 500)
        })
    }(), onAuthStateChanged(auth, async t => {
        if (!t) return document.getElementById("homeUserName").innerText = "Guest", document.getElementById("homeUserEmail").innerText = "Login to access your dashboard", document.getElementById("homeAvatar").innerText = "G", document.getElementById("homeBalance").innerText = window.formatPriceShort ? window.formatPriceShort(0) : "0.00", document.getElementById("statPurchases").innerText = "-", document.getElementById("statSpent").innerText = "-", document.getElementById("statKeys").innerText = "-", document.getElementById("statMemberSince").innerText = "-", void(document.getElementById("recentPurchasesContainer").innerHTML = '\n                <div class="premium-glass-card p-8 flex flex-col items-center justify-center opacity-60">\n                    <div class="w-14 h-14 rounded-2xl bg-rose-500/5 border border-rose-500/10 flex items-center justify-center text-rose-500/30 text-2xl mb-3">\n                        <i class="fas fa-lock"></i>\n                    </div>\n                    <p class="text-[10px] font-mono tracking-widest text-gray-500">Login to see your purchases</p>\n                    <button onclick="window.location.href=\'../index/index.html?tab=login\'" class="mt-3 px-5 py-2.5 bg-gradient-to-r from-rose-600 to-rose-500 rounded-xl font-black text-[10px] uppercase tracking-wider text-white shadow-[0_0_15px rgba(225,29,72,0.4)] cursor-pointer">LOGIN NOW</button>\n                </div>');
        const n = t.uid,
            s = await get(ref(db, `users/${n}`)),
            a = s.exists() ? s.val() : {},
            o = parseFloat(a.balance || 0),
            r = a.createdAt || a.created || null,
            i = document.getElementById("homeUserName"),
            c = document.getElementById("homeUserEmail"),
            l = document.getElementById("homeAvatar"),
            d = t.email || "client@nexus.io",
            p = a.name || a.username || d.split("@")[0].toUpperCase();
        i && (i.innerText = p), c && (c.innerText = d), l && (l.innerText = p.charAt(0).toUpperCase()), e("homeBalance", o, 0, 800, !0);
        const m = document.getElementById("statMemberSince");
        if (m)
            if (r) {
                const e = new Date(r);
                m.innerText = e.toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric"
                })
            } else m.innerText = "N/A";
        const u = await get(ref(db, `purchases/${n}`)),
            f = u.exists() ? u.val() : {},
            h = Object.values(f).sort((e, t) => new Date(t.date || 0) - new Date(e.date || 0)),
            g = h.length,
            x = h.reduce((e, t) => e + parseFloat(t.price || 0), 0),
            y = new Set(h.map(e => e.panelId)).size;
        e("statPurchases", g, 0, 600), e("statSpent", x, 0, 800, !0), e("statKeys", y, 0, 600),
            function(e) {
                const t = document.getElementById("recentPurchasesContainer");
                if (!t) return;
                if (0 === e.length) return void(t.innerHTML = '\n                <div class="premium-glass-card p-8 flex flex-col items-center justify-center opacity-60">\n                    <div class="w-14 h-14 rounded-2xl bg-rose-500/5 border border-rose-500/10 flex items-center justify-center text-rose-500/30 text-2xl mb-3">\n                        <i class="fas fa-store"></i>\n                    </div>\n                    <p class="text-[10px] font-mono tracking-widest text-gray-500">No purchases yet</p>\n                    <a href="../shop/shop.html" class="mt-4 px-6 py-3 bg-gradient-to-r from-rose-600 to-purple-600 rounded-xl text-[10px] font-black text-white uppercase tracking-wider shadow-[0_0_20px_rgba(225,29,72,0.4)] hover:shadow-[0_0_30px_rgba(225,29,72,0.6)] transition-all duration-300 cursor-pointer inline-flex items-center gap-2">BUY NOW <i class="fas fa-arrow-right"></i></a>\n                </div>');
                const n = e.slice(0, 1);
                let s = '<div class="flex flex-col gap-3">';
                n.forEach((e, t) => {
                    const n = e.date ? new Date(e.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short"
                        }) : "N/A",
                        a = "purchaseKey_" + t;
                    s += `\n                <div class="purchase-row" style="animation-delay:${.1*t}s">\n                    <div class="purchase-left">\n                        <div class="purchase-icon"><i class="fas fa-cube"></i></div>\n                        <div class="purchase-info">\n                            <p class="purchase-name">${e.panelName||"Panel"}</p>\n                            <p class="purchase-meta">${e.label||"Plan"} <span class="mx-1.5 text-gray-700">|</span> ${n}</p>\n                            <div class="purchase-key-row">\n                                <span class="key-blurred" id="${a}" onclick="revealKey('${a}')">${(e.key||"N/A").replace(/'/g,"\\'")}</span>\n                                <button class="key-copy-btn" onclick="copyKey('${(e.key||"").replace(/'/g,"\\'")}')" title="Copy Key"><i class="fas fa-copy"></i></button>\n                                ${e.link?`<button class="key-access-btn" onclick="window.open('${e.link.replace(/'/g,"\\'")}','_blank')" title="Access"><i class="fas fa-external-link-alt"></i></button>`:""}\n                            </div>\n                        </div>\n                    </div>\n                    <div class="purchase-right">\n                        <span class="purchase-price">₹${parseFloat(e.price||0).toFixed(2)}</span>\n                    </div>\n                </div>`
                }), s += "</div>", t.innerHTML = s
            }(h)
    }),     window.revealKey = e => {
        const t = document.getElementById(e);
        t && t.classList.toggle("key-revealed")
    }, window.copyKey = e => {
        e && navigator.clipboard.writeText(e).then(() => {
            t("Key copied!", "success")
        }).catch(() => {
            const n = document.createElement("textarea");
            n.value = e, n.style.position = "fixed", n.style.opacity = "0", document.body.appendChild(n), n.select(), document.execCommand("copy"), n.remove(), t("Key copied!", "success")
        })
    }, document.getElementById('supportBtn')?.addEventListener('click', function() {
        auth.currentUser ? window.location.href = '../../components/pages/helpdesk.html' : window.location.href = '../index/index.html?tab=login'
    }), document.getElementById('homeAddFundsBtn')?.addEventListener('click', function() {
        auth.currentUser ? window.location.href = '../wallet/wallet.html' : window.location.href = '../index/index.html?tab=login'
    })
});