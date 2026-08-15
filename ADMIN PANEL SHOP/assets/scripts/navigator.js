(function () {
    'use strict';
    if (window.__nexusPanelNav) return;
    window.__nexusPanelNav = true;

    var MIN_LOADER_MS = 480;
    var loader = null;

    function injectLoader() {
        if (loader) return;
        var st = document.createElement('style');
        st.textContent =
            '#nexusPanelLoader{position:fixed;inset:0;z-index:99999;display:none;align-items:center;justify-content:center;flex-direction:column;gap:28px;background:rgba(2,3,6,0.94);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px)}' +
            '#nexusPanelLoader.show{display:flex}' +
            '.nexus-loader-stage{position:relative;width:260px;height:260px}' +
            '.nexus-loader-ring{position:absolute;border-radius:50%;border:4px solid transparent}' +
            '.nexus-loader-ring.r1{inset:0;border-top-color:#bc13fe;border-right-color:#bc13fe;box-shadow:0 0 24px rgba(188,19,254,0.35);animation:nexusSpin 1.1s linear infinite}' +
            '.nexus-loader-ring.r2{inset:26px;border-bottom-color:#00f0ff;border-left-color:#00f0ff;box-shadow:0 0 24px rgba(0,240,255,0.3);animation:nexusSpin 1.7s linear infinite reverse}' +
            '.nexus-loader-ring.r3{inset:52px;border-top-color:#00ff66;box-shadow:0 0 24px rgba(0,255,102,0.3);animation:nexusSpin 0.9s linear infinite}' +
            '.nexus-loader-ring.core{inset:86px;display:flex;align-items:center;justify-content:center;border:none;color:#fff;font-size:40px;text-shadow:0 0 24px #bc13fe,0 0 48px #bc13fe}' +
            '.nexus-loader-text{font-family:\'Space Mono\',monospace;font-size:12px;letter-spacing:6px;color:#9ca3af;font-weight:700}' +
            '.nexus-loader-text b{color:#fff;text-shadow:0 0 12px rgba(188,19,254,0.8)}' +
            '.nexus-loader-bar{width:240px;height:3px;background:rgba(255,255,255,0.08);border-radius:3px;overflow:hidden}' +
            '.nexus-loader-bar i{display:block;height:100%;width:40%;background:linear-gradient(90deg,transparent,#bc13fe,#00f0ff,transparent);animation:nexusSlide 1.1s ease-in-out infinite}' +
            '@keyframes nexusSpin{to{transform:rotate(360deg)}}' +
            '@keyframes nexusSlide{0%{transform:translateX(-110%)}100%{transform:translateX(280%)}}' +
            '.pjax-enter{animation:nexusFade .18s ease}' +
            '@keyframes nexusFade{from{opacity:.3}to{opacity:1}}';
        document.head.appendChild(st);
        loader = document.createElement('div');
        loader.id = 'nexusPanelLoader';
        loader.innerHTML = '<div class="nexus-loader-stage"><div class="nexus-loader-ring r1"></div><div class="nexus-loader-ring r2"></div><div class="nexus-loader-ring r3"></div><div class="nexus-loader-ring core"><i class="fas fa-bolt"></i></div></div><div class="nexus-loader-text">LOADING <b>NEXUS</b> SYSTEM</div><div class="nexus-loader-bar"><i></i></div>';
        document.body.appendChild(loader);
    }

    function showLoader() { injectLoader(); loader.classList.add('show'); }
    function hideLoader() { if (loader) loader.classList.remove('show'); }

    function isRoutable(url) {
        try {
            var u = new URL(url, location.href);
            if (u.origin !== location.origin) return false;
            if (!/\/pages\/([\w-]+)\/([\w-]+)\.html$/.test(u.pathname)) return false;
            if (/(^|\/)pages\/index\/index\.html$/.test(u.pathname)) return false;
            return true;
        } catch (e) { return false; }
    }

    function markActive() {
        var current = (location.pathname.split('/').pop() || '').toLowerCase();
        var links = document.querySelectorAll('#nexusSidebar .nav-item');
        Array.prototype.forEach.call(links, function (link) {
            var href = (link.getAttribute('href') || '').split('/').pop().toLowerCase();
            link.classList.toggle('active', !!href && href === current);
        });
    }

    function closeSidebar() {
        var sb = document.getElementById('nexusSidebar');
        var ov = document.getElementById('sidebar-overlay');
        if (sb) sb.classList.remove('open');
        if (ov) ov.classList.remove('open');
    }

    function swapPageCss(clean, doc) {
        var head = document.head;
        var links = head.querySelectorAll('link[rel="stylesheet"]');
        Array.prototype.forEach.call(links, function (l) {
            var h = l.getAttribute('href') || '';
            if (h.indexOf('http') === 0) return;
            if (h.indexOf('base.css') !== -1) return;
            l.parentNode && l.parentNode.removeChild(l);
        });
        Array.prototype.forEach.call(doc.head.querySelectorAll('link[rel="stylesheet"]'), function (l) {
            var h = l.getAttribute('href') || '';
            if (h.indexOf('http') === 0) return;
            if (h.indexOf('base.css') !== -1) return;
            var nl = document.createElement('link');
            nl.rel = 'stylesheet';
            nl.href = new URL(h, clean).href;
            head.appendChild(nl);
        });
    }

    function swap(url, doPush) {
        var clean = url;
        showLoader();
        var t0 = Date.now();
        var min = setTimeout(hideLoader, MIN_LOADER_MS);
        var busted = url + (url.indexOf('?') === -1 ? '?' : '&') + 'pjax=' + Date.now();
        fetch(busted, { credentials: 'same-origin' })
            .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
            .then(function (html) {
                var doc = new DOMParser().parseFromString(html, 'text/html');
                if (doc.querySelector('parsererror')) throw new Error('parse error');
                if (!doc.querySelector('main.main-content-wrapper')) { window.location.href = clean; return; }
                var scripts = Array.prototype.slice.call(doc.body.querySelectorAll('script'));
                scripts.forEach(function (s) { s.parentNode && s.parentNode.removeChild(s); });

                if (doPush) history.pushState({ url: clean }, '', clean);
                document.title = doc.title || document.title;
                swapPageCss(clean, doc);

                var body = document.body;
                var preserve = ['sidebarContainer', 'nexusPanelLoader', 'dash-bg-engine'];
                var children = Array.prototype.slice.call(body.children);
                children.forEach(function (ch) {
                    if (preserve.indexOf(ch.id) !== -1) return;
                    if (ch.classList && ch.classList.contains('dash-bg-engine')) return;
                    body.removeChild(ch);
                });
                var frag = document.createDocumentFragment();
                Array.prototype.forEach.call(doc.body.children, function (ch) {
                    if (ch.id === 'sidebarContainer') return;
                    if (ch.classList && ch.classList.contains('dash-bg-engine')) return;
                    frag.appendChild(ch);
                });
                body.appendChild(frag);

                scripts.forEach(function (old) {
                    var s = document.createElement('script');
                    Array.prototype.forEach.call(old.attributes, function (a) {
                        if (a.name === 'src' && old.type === 'module') {
                            s.src = a.value + (a.value.indexOf('?') === -1 ? '?' : '&') + 'pjax=' + Date.now();
                        } else {
                            s.setAttribute(a.name, a.value);
                        }
                    });
                    s.textContent = old.textContent;
                    document.body.appendChild(s);
                });

                var mainEl = document.querySelector('main.main-content-wrapper');
                if (mainEl) mainEl.classList.add('pjax-enter');
                document.dispatchEvent(new CustomEvent('nexusSidebarRebind'));
                markActive();
                closeSidebar();
                window.scrollTo(0, 0);
            })
            .catch(function () { window.location.href = clean; })
            .then(function () {
                clearTimeout(min);
                var remain = MIN_LOADER_MS - (Date.now() - t0);
                setTimeout(hideLoader, Math.max(0, remain));
            });
    }

    function navigate(url, doPush) {
        try {
            var u = new URL(url, location.href);
            if (!isRoutable(u.href)) { window.location.href = url; return; }
            var target = u.href;
            if (target === location.href) { closeSidebar(); return; }
            swap(target, doPush);
        } catch (e) { window.location.href = url; }
    }

    document.addEventListener('click', function (e) {
        if (e.defaultPrevented) return;
        if (e.button && e.button !== 0) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        var t = e.target;
        var a = t && t.closest ? t.closest('a[href]') : null;
        if (a) {
            var href = a.getAttribute('href');
            if (href && href.charAt(0) !== '#' && a.target !== '_blank' && !/^(https?:)?\/\//.test(href) && !/^mailto:/.test(href)) {
                try {
                    var u = new URL(href, location.href);
                    if (isRoutable(u.href)) { e.preventDefault(); e.stopImmediatePropagation(); navigate(u.href, true); return; }
                } catch (err) {}
            }
        }
        var oc = t && t.closest ? t.closest('[onclick]') : null;
        if (oc && !a) {
            var m = (oc.getAttribute('onclick') || '').match(/location\.(?:href|replace)\s*=\s*['"]([^'"]+)['"]/);
            if (m) {
                try {
                    var uo = new URL(m[1], location.href);
                    if (isRoutable(uo.href)) { e.preventDefault(); e.stopImmediatePropagation(); navigate(uo.href, true); }
                } catch (err) {}
            }
        }
    }, true);

    window.addEventListener('popstate', function (e) {
        if (e.state && e.state.url) navigate(e.state.url, false);
    });

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', markActive); else markActive();
})();
