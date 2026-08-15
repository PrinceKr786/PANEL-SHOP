export async function loadSidebar() {
    if ("true" === document.body.dataset.adminSidebarBooted) return;
    document.body.dataset.adminSidebarBooted = "true";
    const container = document.getElementById("sidebarContainer");
    if (!container) return;
    try {
        const res = await fetch('../../components/shell/sidebar.html');
        if (!res.ok) throw new Error('Sidebar fetch failed: ' + res.status);
        const html = await res.text();
        const frag = document.createRange().createContextualFragment(html);
        container.appendChild(frag)
    } catch (e) {
        console.error("[SIDEBAR] Failed to load:", e);
        container.innerHTML = '<div style="padding:20px;color:#ff3366;text-align:center;font-size:12px;">Sidebar failed to load</div>'
    }
}