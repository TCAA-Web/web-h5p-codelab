/*
 * Achievements / badges. Hver badge har en test, der kigger på hele forløbets tilstand.
 * Generiske badges gælder alle kurser; kurser kan tilføje egne via `course.badges`.
 */
(function (global) {
  "use strict";

  const solvedCount = (s) => Object.keys(s.solved).length;
  const sum = (obj) => Object.values(obj).reduce((a, b) => a + b, 0);

  function forCourse(course) {
    const total = course.challenges.length;
    const half = Math.ceil(total / 2);
    const generic = [
      { id: "first", icon: "🚀", title: "Første skridt", desc: "Løs din første udfordring.", test: (s) => solvedCount(s) >= 1 },
      { id: "half", icon: "⛰️", title: "Halvvejs", desc: `Løs ${half} udfordringer.`, test: (s) => solvedCount(s) >= half },
      { id: "master", icon: "👑", title: "Mester", desc: `Løs alle ${total} udfordringer.`, test: (s) => solvedCount(s) >= total },
      { id: "firstTry", icon: "🎯", title: "Lige i øjet", desc: "Løs en udfordring i dit første forsøg.", test: (s) => Object.keys(s.firstTry).length >= 1 },
      { id: "hattrick", icon: "🎩", title: "Hat-trick", desc: "Løs tre udfordringer i første forsøg.", test: (s) => Object.keys(s.firstTry).length >= 3 },
      {
        id: "persistent",
        icon: "💪",
        title: "Vedholdende",
        desc: "Løs en udfordring efter mindst 5 mislykkede forsøg.",
        test: (s) => Object.keys(s.solved).some((id) => (s.fails[id] || 0) >= 5),
      },
      { id: "noHints", icon: "🧠", title: "Selvkørende", desc: "Gennemfør hele forløbet uden at bruge hints.", test: (s) => solvedCount(s) >= total && sum(s.hints) === 0 },
      { id: "theme", icon: "🌗", title: "Mørk eller lys", desc: "Skift mellem dark og light mode.", test: (s) => s.themeToggles >= 1 },
    ];
    return generic.concat(course.badges || []);
  }

  // Returnerer de badges, der netop er låst op
  function evaluate(state, badges) {
    const unlocked = [];
    badges.forEach((b) => {
      if (!state.badges[b.id] && b.test(state)) {
        state.badges[b.id] = Date.now();
        unlocked.push(b);
      }
    });
    return unlocked;
  }

  global.Achievements = { forCourse, evaluate };
})(window);
