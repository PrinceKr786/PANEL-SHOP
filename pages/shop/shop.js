import {
    auth,
    db,
    ref,
    onValue,
    get,
    set,
    push,
    runTransaction,
    onAuthStateChanged
} from "../../assets/scripts/core/firebase.js";
let e = [],
    t = "All",
    n = null,
    a = 0,
    s = null,
    i = null;
const o = document.getElementById("storeProductsGrid"),
    c = document.getElementById("categoryChipsContainer"),
    r = document.getElementById("searchInput"),
    l = document.getElementById("storeLoader");

function d() {
    o && onValue(ref(db, "panels"), t => {
        e = [], t.exists() && t.forEach(t => {
                const n = {
                    id: t.key,
                    ...t.val()
                };
                "active" !== n.status && !0 !== n.status || e.push(n)
            }), l && (l.style.display = "none"),
            function() {
                if (!c) return;
                const t = {};
                e.forEach(e => {
                    e.category && (t[e.category] = (t[e.category] || 0) + 1)
                });
                let n = `<button class="category-chip active" onclick="filterStore('All')" data-category="All"><i class="fas fa-layer-group"></i> All<span class="chip-count">${e.length}</span></button>`;
                Object.keys(t).sort().forEach((e, a) => {
                    n += `<button class="category-chip" style="animation-delay:${(.04*a).toFixed(2)}s" onclick="filterStore('${e.replace(/'/g,"\\'")}')" data-category="${e.replace(/'/g,"\\'")}"><i class="fas fa-tag"></i> ${e}<span class="chip-count">${t[e]}</span></button>`
                }), c.innerHTML = n
            }(), u()
    })
}

function u() {
    if (!o) return;
    o.innerHTML = "";
    const query = r ? r.value.toLowerCase().trim() : "";
    let n = 0;
    e.forEach((e, a) => {
        const s = "All" === t || e.category && e.category.toLowerCase() === t.toLowerCase(),
            i = !query || (e.name || "").toLowerCase().includes(query) || (e.description || "").toLowerCase().includes(query);
        if (!s || !i) return;
        n++;
        const c = function(e) {
                if (!e) return null;
                if (e = String(e).trim(), /^[a-zA-Z0-9_-]{11}$/.test(e)) return e;
                const t = e.match(/^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
                return t && 11 === t[2].length ? t[2] : null
            }(e.youtube),
            r = (e.description || "Premium tool").split("\n").filter(e => e.trim()).map(e => `<div class="card-feature"><i class="fas fa-bolt"></i> ${e.trim()}</div>`).join(""),
            l = e.plans && Object.keys(e.plans).length > 0,
            d = l ? Object.entries(e.plans).sort((e, t) => e[1].price - t[1].price) : [];
        let u = "";
        l ? d.forEach(([t, n]) => {
            const a = encodeURIComponent(JSON.stringify({
                key: t,
                label: n.label,
                price: n.price
            }));
            u += `<div class="popup-item" onclick="selectPlan('${e.id}', '${a}', '${(e.name||"").replace(/'/g,"\\'")}', '${(e.link||"").replace(/'/g,"\\'")}')">\n                    <span class="popup-label"><i class="fas fa-crown"></i> ${n.label}</span>\n                    <span class="popup-price">₹${n.price}</span>\n                </div>`
        }) : u = '<div class="popup-item disabled"><span>No plans available</span></div>';
        const m = c ? `<div class="card-media"><iframe src="https://www.youtube.com/embed/${c}?rel=0&modestbranding=1&iv_load_policy=3" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>` : '<div class="card-media"><div class="card-media-fallback"><i class="fas fa-video-slash"></i><span>No Preview</span></div></div>';
        o.innerHTML += `\n            <div class="product-card" style="animation-delay:${(.06*a).toFixed(2)}s" data-tilt>\n                <div class="product-card-inner">\n                    ${m}\n                    <div class="card-content">\n                        <div class="card-header">\n                            <h3 class="card-title">${e.name||"Panel"}</h3>\n                            <span class="card-badge">${e.category||"General"}</span>\n                        </div>\n                        <div class="card-features">${r}</div>\n                        <div class="card-trust">\n                            <span><i class="fas fa-shield-alt"></i> Safe</span>\n                            <span><i class="fas fa-medal"></i> Verified</span>\n                        </div>\n                        <div class="card-actions">\n                            <button class="btn-sm" onclick="window.open('${e.link||"#"}', '_blank')"><i class="fas fa-download"></i> UPDATE</button>\n                            ${e.feedback?`<button class="btn-sm btn-sm-fb" onclick="window.open('${e.feedback}', '_blank')"><i class="fas fa-star"></i> FEEDBACK</button>`:""}\n                        </div>\n                        <button class="btn-buy" onclick="togglePlanPopup('${e.id}')">\n                            <i class="fas fa-shopping-cart"></i> <span>PURCHASE KEY</span>\n                        </button>\n                        <div class="plan-popup" id="popup-${e.id}">${u}</div>\n                    </div>\n                </div>\n            </div>`
    }), 0 === n && (o.innerHTML = '\n            <div class="empty-state">\n                <i class="fas fa-ghost"></i>\n                <h3>No Panels Found</h3>\n                <p>Try adjusting your search or filters.</p>\n            </div>'), requestAnimationFrame(() => requestAnimationFrame(m))
}

function m() {
    document.querySelectorAll("[data-tilt]").forEach(e => {
        const t = e.querySelector(".product-card-inner");
        if (!t) return;
        let n = !1;
        e.addEventListener("mousemove", a => {
            n || (n = !0, requestAnimationFrame(() => {
                const s = e.getBoundingClientRect(),
                    i = (a.clientX - s.left) / s.width,
                    o = (a.clientY - s.top) / s.height;
                t.style.transform = `perspective(800px) rotateX(${-12*(o-.5)}deg) rotateY(${12*(i-.5)}deg) translateZ(10px)`, t.style.setProperty("--mx", 100 * i + "%"), t.style.setProperty("--my", 100 * o + "%"), n = !1
            }))
        }), e.addEventListener("mouseleave", () => {
            t.style.transition = "transform 0.4s cubic-bezier(0.34,1.56,0.64,1)", t.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0)", t.style.removeProperty("--mx"), t.style.removeProperty("--my"), setTimeout(() => {
                t.style.transition = ""
            }, 500)
        })
    })
}

function p(e, t = "success") {
    const n = document.getElementById("toast-container");
    if (!n) return;
    const a = document.createElement("div");
    a.className = `toast ${t}`;
    const s = "success" === t ? "fa-check-circle" : "error" === t ? "fa-exclamation-circle" : "fa-exclamation-triangle";
    a.innerHTML = `<i class="fas ${s}"></i> <span>${e}</span>`, n.appendChild(a), setTimeout(() => {
        a.classList.add("out"), setTimeout(() => a.remove(), 400)
    }, 3e3)
}
function __shopInit() {
    ! function() {
        const e = document.createElement("canvas");
        e.id = "particleCanvas", document.querySelector(".premium-bg-container").after(e);
        const t = e.getContext("2d");
        let n, a, s = [];

        function i() {
            n = e.width = window.innerWidth, a = e.height = window.innerHeight
        }
        i(), window.addEventListener("resize", i);
        class o {
            constructor() {
                this.reset()
            }
            reset() {
                this.x = Math.random() * n, this.y = Math.random() * a, this.size = 2 * Math.random() + .5, this.speedX = .3 * (Math.random() - .5), this.speedY = .3 * (Math.random() - .5), this.opacity = .5 * Math.random() + .1
            }
            update() {
                this.x += this.speedX, this.y += this.speedY, (this.x < 0 || this.x > n || this.y < 0 || this.y > a) && this.reset()
            }
            draw() {
                t.beginPath(), t.arc(this.x, this.y, this.size, 0, 2 * Math.PI), t.fillStyle = `rgba(255,255,255,${this.opacity})`, t.fill()
            }
        }
        const P = Math.min(120, window.innerWidth < 768 ? 40 : 120); for (let e = 0; e < P; e++) s.push(new o);
        ! function e() {
            t.clearRect(0, 0, n, a), s.forEach(e => {
                e.update(), e.draw()
            });
            for (let e = 0; e < s.length; e++)
                for (let n = e + 1; n < s.length; n++) {
                    const a = s[e].x - s[n].x,
                        i = s[e].y - s[n].y,
                        o = Math.sqrt(a * a + i * i);
                    o < 120 && (t.beginPath(), t.moveTo(s[e].x, s[e].y), t.lineTo(s[n].x, s[n].y), t.strokeStyle = `rgba(225,29,72,${.06*(1-o/120)})`, t.lineWidth = .5, t.stroke())
                }
            if (!document.getElementById("particleCanvas")) return;
            requestAnimationFrame(e)
        }()
    }(),
    function() {
        const e = document.getElementById("bgFollowLight");
        if (!e) return;
        let t = !1;
        document.addEventListener("mousemove", n => {
            t || (t = !0, requestAnimationFrame(() => {
                const a = n.clientX / window.innerWidth * 100,
                    s = n.clientY / window.innerHeight * 100;
                e.style.setProperty("--mx", a + "%"), e.style.setProperty("--my", s + "%"), t = !1
            }))
        })
    }(),
    function() {
        const e = onAuthStateChanged(auth, e => {
            e ? (n = e, onValue(ref(db, `users/${e.uid}/balance`), e => {
                a = e.val() || 0
            }), d()) : (n = null, a = 0, d())
        });
        auth.currentUser && (n = auth.currentUser, onValue(ref(db, `users/${auth.currentUser.uid}/balance`), e => {
            a = e.val() || 0
        }), d(), e())
    }()
} document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', __shopInit) : __shopInit(), window.filterStore = function(e) {
    t = e, document.querySelectorAll(".category-chip").forEach(t => {
        t.classList.remove("active");
        (t.dataset.category === e) && t.classList.add("active")
    }), u(), navigator.vibrate && navigator.vibrate(10)
}, r && r.addEventListener("input", () => u()), document.addEventListener("click", e => {
    e.target.closest(".plan-popup") || e.target.closest(".btn-buy") || document.querySelectorAll(".plan-popup.show").forEach(e => e.classList.remove("show"))
}), window.togglePlanPopup = e => {
    const t = document.getElementById(`popup-${e}`);
    if (!t) return;
    const n = t.classList.contains("show");
    document.querySelectorAll(".plan-popup.show").forEach(e => e.classList.remove("show")), n || t.classList.add("show")
}, window.selectPlan = (e, t, a, o) => {
    if (!n) return void(window.location.href = "../index/index.html?tab=login");
    const c = JSON.parse(decodeURIComponent(t));
    s = {
        panelId: e,
        panelName: a,
        link: o,
        planKey: c.key,
        label: c.label,
        originalPrice: parseFloat(c.price),
        finalPrice: parseFloat(c.price)
    }, i = null, document.getElementById("chkPanelName").innerText = a, document.getElementById("chkPlanLabel").innerText = c.label, document.getElementById("chkPrice").innerText = c.price, document.getElementById("chkFinalPrice").innerText = c.price, document.getElementById("couponInput").value = "", document.getElementById("chkStrike").classList.add("hidden"), document.getElementById("chkBadge").classList.add("hidden"), document.querySelectorAll(".plan-popup.show").forEach(e => e.classList.remove("show")), document.getElementById("modalCheckout").classList.remove("hidden")
}, window.closeCheckoutModal = () => document.getElementById("modalCheckout").classList.add("hidden"), window.closeModalSuccess = () => document.getElementById("modalSuccess").classList.add("hidden"), document.getElementById("btnApplyCoupon").addEventListener("click", async () => {
    const e = document.getElementById("couponInput").value.trim().toUpperCase();
    if (!e) return p("Enter a coupon code", "warning");
    const t = document.getElementById("btnApplyCoupon");
    t.innerHTML = '<i class="fas fa-spinner fa-spin"></i>', t.disabled = !0;
    try {
        const t = await get(ref(db, "coupons"));
        let n = null;
        if (t.exists() && t.forEach(t => {
                t.val().code === e && (n = {
                    id: t.key,
                    ...t.val()
                })
            }), n && !0 === n.status)
            if (n.maxUse && n.used >= n.maxUse) p("Coupon limit reached", "error");
            else {
                const e = s.originalPrice,
                    t = e * n.discount / 100,
                    a = Math.max(0, e - t);
                i = n, s.finalPrice = a, document.getElementById("chkFinalPrice").innerText = window.formatPrice ? window.formatPrice(a) : "₹" + a.toFixed(2), document.getElementById("chkStrike").innerText = window.formatPrice ? window.formatPrice(e) : "₹" + e.toFixed(2), document.getElementById("chkStrike").classList.remove("hidden"), document.getElementById("chkBadge").innerText = n.discount + "% OFF", document.getElementById("chkBadge").classList.remove("hidden"), p(`Coupon applied! ${n.discount}% OFF`, "success")
            }
        else p("Invalid or expired coupon", "error")
    } catch (e) {
        p("Error validating coupon", "error")
    } finally {
        t.innerHTML = "APPLY", t.disabled = !1
    }
}), window.executePurchase = async () => {
    if (!n) return void(window.location.href = "../index/index.html?tab=login");
    const e = s,
        t = e.finalPrice,
        o = document.getElementById("btnConfirmPay");
    if (a < t) return p(`Insufficient balance. Need ₹${t.toFixed(2)}`, "error");
    ! function() {
        const e = document.getElementById("storeLoaderOverlay");
        e && e.classList.remove("hidden")
    }(), o.disabled = !0, o.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    try {
        if ((await runTransaction(ref(db, `users/${n.uid}/balance`), e => null === e ? 0 : e >= t ? e - t : void 0)).committed) {
            const a = function(e = 8) {
                    let t = "";
                    const n = new Uint8Array(e);
                    crypto.getRandomValues(n);
                    for (let a = 0; a < e; a++) t += "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789" [n[a] % 36];
                    return t
                }(8),
                s = "PUR" + Date.now(),
                o = push(ref(db, `purchases/${n.uid}`));
            await set(o, {
                panelId: e.panelId,
                panelName: e.panelName,
                plan: e.planKey,
                label: e.label,
                price: t,
                key: a,
                link: e.link,
                date: (new Date).toISOString()
            }), await set(ref(db, `transactions/${n.uid}/${s}`), {
                id: s,
                type: "purchase",
                amount: t,
                status: "success",
                desc: `Purchased ${e.panelName}`,
                date: (new Date).toISOString()
            }), i && i.id && await runTransaction(ref(db, `coupons/${i.id}/used`), e => (e || 0) + 1), closeCheckoutModal(), document.getElementById("successKey").innerText = a, document.getElementById("btnAccessTool").onclick = () => window.open(e.link || "https://t.me/", "_blank"), document.getElementById("modalSuccess").classList.remove("hidden")
        } else p("Transaction failed. Insufficient funds.", "error")
    } catch (e) {
        p("System Error. Try again.", "error")
    } finally {
        ! function() {
            const e = document.getElementById("storeLoaderOverlay");
            e && e.classList.add("hidden")
        }(), o.disabled = !1, o.innerHTML = "CONFIRM PAY"
    }
}, window.copySuccessKey = () => {
    const e = document.getElementById("successKey");
    if (!e) return;
    const t = e.innerText;
    navigator.clipboard.writeText(t).catch(() => {
        const e = document.createElement("textarea");
        e.value = t, e.style.position = "fixed", e.style.opacity = "0", document.body.appendChild(e), e.select(), document.execCommand("copy"), e.remove()
    });
    const n = e.closest(".key-box");
    n && (n.classList.remove("flash"), n.offsetWidth, n.classList.add("flash"))
};