/*
 * Achievements / badges. Hver badge har en test, der kigger på hele forløbets tilstand.
 */
(function (global) {
  "use strict";

  const solvedCount = (s) => Object.keys(s.solved).length;
  const has = (s, id) => !!s.solved[id];
  const sum = (obj) => Object.values(obj).reduce((a, b) => a + b, 0);

  const BADGES = [
    { id: "first", icon: "🚀", title: "Første skridt", desc: "Løs din første udfordring.", test: (s) => solvedCount(s) >= 1 },
    { id: "half", icon: "⛰️", title: "Halvvejs", desc: "Løs 5 udfordringer.", test: (s) => solvedCount(s) >= 5 },
    { id: "master", icon: "👑", title: "HTML Expert", desc: "Løs alle 9 udfordringer.", test: (s) => solvedCount(s) >= 9 },
    { id: "firstTry", icon: "🎯", title: "Lige i øjet", desc: "Løs en udfordring i dit første forsøg.", test: (s) => Object.keys(s.firstTry).length >= 1 },
    { id: "hattrick", icon: "🎩", title: "Hat-trick", desc: "Løs tre udfordringer i første forsøg.", test: (s) => Object.keys(s.firstTry).length >= 3 },
    { id: "bug", icon: "🐞", title: "Fejljæger", desc: "Find alle fejlene i \"Find fejlene\".", test: (s) => has(s, "fejlretning") },
    { id: "semantic", icon: "🏛️", title: "Semantik-ninja", desc: "Løs begge semantik-udfordringer.", test: (s) => has(s, "semantik") && has(s, "konvertering") },
    { id: "forms", icon: "📝", title: "Formularbygger", desc: "Byg en tilgængelig formular.", test: (s) => has(s, "formularer") },
    {
      id: "persistent",
      icon: "💪",
      title: "Vedholdende",
      desc: "Løs en udfordring efter mindst 5 mislykkede forsøg.",
      test: (s) => Object.keys(s.solved).some((id) => (s.fails[id] || 0) >= 5),
    },
    { id: "noHints", icon: "🧠", title: "Selvkørende", desc: "Gennemfør hele forløbet uden at bruge hints.", test: (s) => solvedCount(s) >= 9 && sum(s.hints) === 0 },
    { id: "theme", icon: "🌗", title: "Mørk eller lys", desc: "Skift mellem dark og light mode.", test: (s) => s.themeToggles >= 1 },
  ];

  // Returnerer de badges, der netop er låst op
  function evaluate(state) {
    const unlocked = [];
    BADGES.forEach((b) => {
      if (!state.badges[b.id] && b.test(state)) {
        state.badges[b.id] = Date.now();
        unlocked.push(b);
      }
    });
    return unlocked;
  }

  global.Achievements = { BADGES, evaluate };
})(window);
