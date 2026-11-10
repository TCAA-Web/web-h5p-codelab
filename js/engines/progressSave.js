/*
 * Varig progression på tværs af sessioner (localStorage).
 * Gemmer { kursus-id: [id'er på gennemførte opgaver] }. Selve forløbet (kode, hints m.m.) gemmes af js/storage.js.
 */
(function (global) {
  "use strict";

  const KEY = "codeLab.progress.v1";
  const memory = {};

  function backend() {
    try {
      const probe = "__codeLab_progress_probe__";
      global.localStorage.setItem(probe, "1");
      global.localStorage.removeItem(probe);
      return global.localStorage;
    } catch (e) {
      return {
        getItem: (k) => (k in memory ? memory[k] : null),
        setItem: (k, v) => {
          memory[k] = String(v);
        },
      };
    }
  }

  const store = backend();

  function read() {
    try {
      const parsed = JSON.parse(store.getItem(KEY));
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch (e) {
      return {};
    }
  }

  function write(data) {
    try {
      store.setItem(KEY, JSON.stringify(data));
    } catch (e) {
      /* fuld lagerplads – ignorer */
    }
  }

  // Løber alle kurser igennem og gemmer de gennemførte opgaver.
  // Kurser uden fremskridt i denne session (fx ny fane) beholder deres gemte værdi.
  function progressSave() {
    const data = read();
    Object.keys(global.COURSES).forEach((id) => {
      const solved = global.LabStorage.load(id).solved;
      const done = global.COURSES[id].challenges.map((c) => c.id).filter((cid) => solved[cid]);
      if (done.length > 0) data[id] = done;
    });
    write(data);
  }

  function progressClear(courseId) {
    const data = read();
    delete data[courseId];
    write(data);
  }

  // { done, total } for ét kursus. Ukendte id'er (fx omdøbte opgaver) tælles ikke med.
  function progressOf(courseId) {
    const course = global.COURSES[courseId];
    const saved = read()[courseId];
    const ids = course.challenges.map((c) => c.id);
    const done = Array.isArray(saved) ? ids.filter((id) => saved.includes(id)).length : 0;
    return { done, total: ids.length };
  }

  global.progressSave = progressSave;
  global.progressClear = progressClear;
  global.progressOf = progressOf;
})(window);
