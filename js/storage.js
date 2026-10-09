/*
 * Autosave af hele forløbet i sessionStorage.
 * Falder tilbage til hukommelsen, hvis sessionStorage er blokeret (fx i nogle iframes).
 */
(function (global) {
  "use strict";

  const KEY_PREFIX = "codeLab.v3.";
  const memory = {};

  function backend() {
    try {
      const probe = "__htmlLab_probe__";
      global.sessionStorage.setItem(probe, "1");
      global.sessionStorage.removeItem(probe);
      return global.sessionStorage;
    } catch (e) {
      return {
        getItem: (k) => (k in memory ? memory[k] : null),
        setItem: (k, v) => {
          memory[k] = String(v);
        },
        removeItem: (k) => {
          delete memory[k];
        },
      };
    }
  }

  const store = backend();

  function defaults() {
    return {
      version: 3,
      current: 0,
      solved: {}, // id -> true
      code: {}, // id -> kode
      attempts: {}, // id -> antal tjek
      fails: {}, // id -> antal mislykkede tjek
      hints: {}, // id -> antal viste hints
      firstTry: {}, // id -> true hvis løst i første tjek
      badges: {}, // id -> tidsstempel
      themeToggles: 0,
      startedAt: Date.now(),
    };
  }

  function load(courseId) {
    try {
      const raw = store.getItem(KEY_PREFIX + courseId);
      if (!raw) return defaults();
      const parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== 3) return defaults();
      return Object.assign(defaults(), parsed);
    } catch (e) {
      return defaults();
    }
  }

  function save(courseId, state) {
    try {
      store.setItem(KEY_PREFIX + courseId, JSON.stringify(state));
    } catch (e) {
      /* fuld lagerplads – ignorer */
    }
  }

  function clear(courseId) {
    try {
      store.removeItem(KEY_PREFIX + courseId);
    } catch (e) {
      /* ignorer */
    }
  }

  // Temaet deles mellem kurserne
  function getTheme() {
    try {
      return store.getItem("codeLab.theme");
    } catch (e) {
      return null;
    }
  }

  function setTheme(theme) {
    try {
      store.setItem("codeLab.theme", theme);
    } catch (e) {
      /* ignorer */
    }
  }

  global.LabStorage = { load, save, clear, defaults, getTheme, setTheme };
})(window);
