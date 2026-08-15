(function () {
    'use strict';
    if (window.__nexusNav) return;
    window.__nexusNav = true;

    var ROUTE_PAGES = ['home', 'shop', 'wallet', 'profile'];
    var SCROLL_GUARD_MS = 400;
    var lastInput = 0;
    var cache = {};

    function onInput() { lastInput = Date.now(); }
    window.addEventListener('scroll', onInput, { passive: true, capture: true });
    document.addEventListener('touchmove', onInput, { passive: true, capture: true });

    function isRoutable(href) {
        try {
            var u = new URL(href, location.href);
            if (u.origin !== location.origin) return false;
            return /^\/(home|shop|wallet|profile)\/([\w-]+)\.html/.test(u.pathname);
        } catch (e) { return false; }
    }

    function onClickTarget(text) {
        if (!text) return null;
        var m = text.match(/location\.(?:href|replace)\s*=\s*['"]([^'"]+)['"]/);
        return m ? m[1] : null;
    }

    function swap(url, doPush) {
        var html = cache[url];
        if (!html) return false;
        var doc = new DOMParser().parseFromString(html, 'text/html');
        if (doc.querySelector('parsererror')) return false;
        if (!doc.body) return false;

        if (doPush) history.pushState({ url: url }, '', url);

        var head = document.head;
        Array.prototype.slice.call(head.querySelectorAll('style')).forEach(function (s) { s.parentNode && s.parentNode.removeChild(s); });
        Array.prototype.slice.call(head.querySelectorAll('link[rel="stylesheet"]')).forEach(function (l) {
            var h = l.href || '';
            if (h.indexOf('tailwind') === -1 && h.indexOf('font-awesome') === -1 && h.indexOf('cdnjs') === -1) {
                l.parentNode && l.parentNode.removeChild(l);
            }
        });
        Array.prototype.slice.call(doc.head.querySelectorAll('style')).forEach(function (s) {
            var ns = document.createElement('style');
            ns.textContent = s.textContent;
            head.appendChild(ns);
        });
        Array.prototype.slice.call(doc.head.querySelectorAll('link[rel="stylesheet"]')).forEach(function (l) {
            var h = l.href || '';
            if (h.indexOf('tailwind') === -1 && h.indexOf('font-awesome') === -1 && h.indexOf('cdnjs') === -1) {
                var nl = document.createElement('link');
                nl.rel = 'stylesheet';
                nl.href = l.href;
                head.appendChild(nl);
            }
        });

        document.title = doc.title;

        var newBody = doc.body;
        var scripts = Array.prototype.slice.call(newBody.querySelectorAll('script'));
        scripts.forEach(function (s) { s.parentNode && s.parentNode.removeChild(s); });

        var oldBody = document.body;
        oldBody.parentNode.replaceChild(newBody, oldBody);

        scripts.forEach(function (old) {
            var s = document.createElement('script');
            Array.prototype.slice.call(old.attributes).forEach(function (a) {
                if (a.name === 'src' && old.type === 'module') {
                    s.src = a.value + (a.value.indexOf('?') === -1 ? '?' : '&') + 'pjax=' + Date.now() + (Math.random() * 1e4 | 0);
                } else {
                    s.setAttribute(a.name, a.value);
                }
            });
            s.textContent = old.textContent;
            newBody.appendChild(s);
        });

        window.scrollTo(0, 0);
        return true;
    }

    function navigate(url, doPush) {
        try {
            var u = new URL(url, location.href);
            if (!isRoutable(u.href)) { location.href = url; return; }
            var target = u.href;
            if (cache[target]) { swap(target, doPush); return; }
            fetch(target, { credentials: 'same-origin' }).then(function (r) {
                if (!r.ok) throw new Error('bad response');
                return r.text();
            }).then(function (html) {
                cache[target] = html;
                if (!swap(target, doPush)) { location.href = target; }
            }).catch(function () {
                location.href = target;
            });
        } catch (e) {
            location.href = url;
        }
    }

    document.addEventListener('click', function (e) {
        if (e.defaultPrevented) return;
        if (e.button && e.button !== 0) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

        var inNav = !!(e.target && e.target.closest && e.target.closest('#bottomNav, .nexus-header-container'));
        if (inNav && (Date.now() - lastInput) < SCROLL_GUARD_MS) {
            e.preventDefault();
            e.stopImmediatePropagation();
            return;
        }

        var a = e.target.closest && e.target.closest('a[href]');
        if (a && a.target !== '_blank') {
            var href = a.getAttribute('href');
            if (href && href.charAt(0) !== '#' && !/^(https?:)?\/\//.test(href) && !/^mailto:/.test(href)) {
                var ua = new URL(href, location.href);
                if (isRoutable(ua.href)) { e.preventDefault(); navigate(ua.href, true); return; }
            }
        }

        var oc = e.target.closest && e.target.closest('[onclick]');
        if (oc && !oc.closest('a[href]')) {
            var t = onClickTarget(oc.getAttribute('onclick'));
            if (t) {
                var uo = new URL(t, location.href);
                if (isRoutable(uo.href)) { e.preventDefault(); e.stopImmediatePropagation(); navigate(uo.href, true); }
            }
        }
    }, true);

    window.addEventListener('popstate', function (e) {
        if (e.state && e.state.url) navigate(e.state.url, false);
    });

    if ('requestIdleCallback' in window) {
        window.requestIdleCallback(function () {
            var base = location.pathname.replace(/\/(home|shop|wallet|profile)\/([\w-]+)\.html/, '/');
            ROUTE_PAGES.forEach(function (p) {
                var u = location.origin + base + p + '/' + p + '.html';
                if (u !== location.href && !cache[u]) {
                    fetch(u, { credentials: 'same-origin' }).then(function (r) {
                        if (r.ok) return r.text();
                        throw new Error('bad');
                    }).then(function (h) { cache[u] = h; }).catch(function () {});
                }
            });
        });
    }
})();
