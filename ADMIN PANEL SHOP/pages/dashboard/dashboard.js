import {
    auth,
    db,
    ref,
    onValue,
    get,
    query,
    limitToLast,
    onAuthStateChanged
} from "../../assets/scripts/firebase.js";
import {
    assertAdmin
} from "../../assets/scripts/auth-guard.js";
let t = null,
    e = !1;
document.addEventListener("DOMContentLoaded", () => (function(){ if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",__boot);return;} function __boot(){
    assertAdmin(() => async function() {
        if (!e) {
            e = !0;
            const t = (t, e) => {
                onValue(query(ref(db, t), limitToLast(200)), t => {
                    let a = 0;
                    t.forEach(t => {
                        "pending" === t.val().status && a++
                    });
                    const n = document.getElementById(e);
                    n && (n.innerText = a)
                })
            };
            t("gateway_payments", "statPendingGateway"), t("manual_deposits", "statPendingManual"), onValue(ref(db, "users"), t => {
                const e = document.getElementById("statUsers");
                e && (e.innerText = t.size || Object.keys(t.val() || {}).length)
            })
        }
        const [a, n] = await Promise.all([get(query(ref(db, "gateway_payments"), limitToLast(500))), get(query(ref(db, "manual_deposits"), limitToLast(500)))]);
        let o = [],
            i = [];
        a.forEach(t => {
                let e = t.val();
                e.id = t.key, o.push(e)
            }), n.forEach(t => {
                let e = t.val();
                e.id = t.key, i.push(e)
            }),
            function(e, a) {
                let n = 0;
                const o = [...e, ...a].sort((t, e) => (e.timestamp || 0) - (t.timestamp || 0));
                o.forEach(t => {
                    "approved" === t.status && (n += parseFloat(t.amount))
                });
                const i = document.getElementById("statRevenue");
                i && function(t, e, a) {
                        if (!t || e === a) return;
                        let n = null;
                        const o = i => {
                            n || (n = i);
                            const s = Math.min((i - n) / 1e3, 1);
                            let r = s * (a - e) + e;
                            t.innerHTML = "₹" + r.toFixed(2), s < 1 ? requestAnimationFrame(o) : t.innerHTML = "₹" + a.toFixed(2)
                        };
                        requestAnimationFrame(o)
                    }(i, parseFloat(i.innerText.replace("₹", "")) || 0, n),
                    function(t) {
                        const e = document.getElementById("recentPaymentsList");
                        if (!e) return;
                        if (0 === t.length) return void(e.innerHTML = '<div style="padding:20px;text-align:center;color:#888888;">No recent activity</div>');
                        let a = "";
                        t.forEach(t => {
                            const e = "approved" === t.status,
                                n = "rejected" === t.status,
                                o = e ? "#00ff66" : n ? "#ff3366" : "#ffaa00";
                            let i = '<i class="fas fa-hand-holding-usd" style="color:#00ff66;"></i>';
                            t.id && (t.id.startsWith("ORD") || t.id.length > 10) && (i = '<i class="fas fa-bolt" style="color:#ff3366;"></i>'), a += `\n            <div style="display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:10px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);margin-bottom:8px;">\n                <div style="width:40px;height:40px;border-radius:10px;background:rgba(255,255,255,0.05);display:flex;justify-content:center;align-items:center;font-size:16px;">${i}</div>\n                <div style="flex:1;min-width:0;"><strong style="display:block;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${t.email||t.uid||"Unknown"}</strong><span style="font-size:11px;color:#888888;">${t.timestamp?new Date(t.timestamp).toLocaleDateString():""}${t.id?" &bull; Ref: "+t.id.substring(0,8)+"...":""}</span></div>\n                <div style="font-weight:700;font-size:14px;color:${o};">₹${t.amount}</div>\n            </div>`
                        }), e.innerHTML = a
                    }(o.slice(0, 5)), async function(e) {
                        window.Chart || await new Promise(t => {
                            const e = document.createElement("script");
                            e.src = "https://cdn.jsdelivr.net/npm/chart.js", e.onload = t, document.head.appendChild(e)
                        });
                        const a = document.getElementById("revenueChart");
                        if (!a) return;
                        const n = a.getContext("2d"),
                            o = [...Array(7)].map((t, e) => {
                                const a = new Date;
                                return a.setDate(a.getDate() - e), a.toLocaleDateString()
                            }).reverse(),
                            i = {};
                        o.forEach(t => i[t] = 0), e.forEach(t => {
                            if ("approved" === t.status && t.timestamp) {
                                const e = new Date(t.timestamp).toLocaleDateString();
                                void 0 !== i[e] && (i[e] += parseFloat(t.amount))
                            }
                        });
                        const s = Object.values(i);
                        if (t) return t.data.datasets[0].data = s, void t.update();
                        Chart.defaults.color = "#888888", Chart.defaults.font.family = "'Poppins', sans-serif", t = new Chart(n, {
                            type: "line",
                            data: {
                                labels: o,
                                datasets: [{
                                    label: "Revenue (₹)",
                                    data: s,
                                    borderColor: "#bc13fe",
                                    backgroundColor: "rgba(188, 19, 254, 0.1)",
                                    borderWidth: 2,
                                    fill: !0,
                                    tension: .4,
                                    pointBackgroundColor: "#00f0ff",
                                    pointBorderColor: "#111",
                                    pointBorderWidth: 2,
                                    pointRadius: 4,
                                    pointHoverRadius: 6
                                }]
                            },
                            options: {
                                responsive: !0,
                                maintainAspectRatio: !1,
                                plugins: {
                                    legend: {
                                        display: !1
                                    },
                                    tooltip: {
                                        backgroundColor: "rgba(17,17,17,0.9)",
                                        titleColor: "#fff",
                                        bodyColor: "#00ff66",
                                        displayColors: !1,
                                        callbacks: {
                                            label: t => "₹ " + t.parsed.y
                                        }
                                    }
                                },
                                scales: {
                                    x: {
                                        grid: {
                                            color: "rgba(255,255,255,0.05)"
                                        }
                                    },
                                    y: {
                                        grid: {
                                            color: "rgba(255,255,255,0.05)"
                                        },
                                        ticks: {
                                            callback: t => "₹" + t
                                        }
                                    }
                                }
                            }
                        })
                    }(o)
            }(o, i)
    }())
} __boot(); }));