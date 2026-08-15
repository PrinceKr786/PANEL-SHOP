(function () {
    'use strict';
    var NS = 'nx_';

    function get(key) {
        try {
            var s = localStorage.getItem(NS + key);
            return s ? JSON.parse(s) : null;
        } catch (e) { return null; }
    }

    function set(key, val) {
        try { localStorage.setItem(NS + key, JSON.stringify(val)); } catch (e) {}
    }

    function clear(key) {
        try { localStorage.removeItem(NS + key); } catch (e) {}
    }

    function snap(v) {
        return {
            exists: function () { return v != null; },
            val: function () { return v; },
            forEach: function (fn) {
                if (!v) return;
                Object.keys(v).forEach(function (k) {
                    fn({ key: k, val: function () { return v[k]; } });
                });
            }
        };
    }

    window.NX = { get: get, set: set, clear: clear, snap: snap };
})();
