/*
 * Kursus: React Events og brugerinteraktion (3 opgaver).
 *
 * Motor: js/engines/react.js
 */

(function (global) {
  "use strict";

  const challenges = [
    {
      id: "events-click",
      title: "Reagér på et klik",
      topic: "Events",
      icon: "👆",
      description:
        "En knap er allerede oprettet, og funktionen `handleClick` findes i koden. Lige nu er funktionen ikke forbundet med knappen.\n\n" +
        "Ret JSX-koden, så beskeden vises, når brugeren klikker på knappen – og ikke blot fordi komponentet vises.",
      starter: `function handleClick() {
  alert("Knappen blev klikket!");
}

function App() {
  return (
    <main>
      {/* Tilføj onClick til knappen */}
      <button>Klik her</button>
    </main>
  );
}

export default App;
`,
      hints: [
        "Find den funktion, der skal udføres, og det HTML-element, som brugeren skal interagere med.",
        "Event handlers skrives som props på JSX-elementer. Hvilken prop passer til et klik?",
        "Sammenlign navnet på funktionen med den værdi, du giver event handleren. Funktionen skal gives videre – ikke kaldes med det samme.",
      ],
      checks: [
        {
          label: "Knappen vises med den korrekte tekst",
          fail: "Der skal være en knap med teksten `Klik her`.",
          test: (c) => c.text(c.$("button")) === "Klik her",
        },
        {
          label: "Knappen er koblet til handleClick",
          fail: "Brug `onClick={handleClick}` på knappen.",
          test: (c) => c.has(/onClick\s*=\s*\{\s*handleClick\s*\}/),
        },
      ],
    },

    {
      id: "events-function-reference",
      title: "Find fejlen: Funktionen bliver kaldt med det samme",
      topic: "Events",
      icon: "🐞",
      description:
        "Når komponentet vises, bliver funktionen udført med det samme. Det er ikke den ønskede adfærd: beskeden skal først vises, når brugeren klikker på knappen.\n\n" +
        "Undersøg, hvordan funktionen er koblet til knappen, og ret fejlen uden at ændre funktionens formål eller knappens tekst.",
      starter: `function handleClick() {
  alert("Hej!");
}

function App() {
  return (
    <main>
      <button onClick={handleClick()}>Sig hej</button>
    </main>
  );
}

export default App;
`,
      hints: [
        "Se nøje på udtrykket inde i klammerne efter `onClick`.",
        "Der er forskel på at referere til en funktion og at udføre den. Hvilken af de to ting skal ske ved renderingen?",
        "Undersøg, hvad parenteserne efter funktionsnavnet gør, og fjern det, der får funktionen til at køre for tidligt.",
      ],
      checks: [
        {
          label: "Knappen vises med den korrekte tekst",
          fail: "Knappen skal have teksten `Sig hej`.",
          test: (c) => c.text(c.$("button")) === "Sig hej",
        },
        {
          label: "Funktionen kaldes ikke direkte i JSX",
          fail: "Brug `onClick={handleClick}` uden parenteser efter funktionsnavnet.",
          test: (c) => c.has(/onClick\s*=\s*\{\s*handleClick\s*\}/),
        },
      ],
    },

    {
      id: "events-multiple-handlers",
      title: "Flere handlinger på samme side",
      topic: "Events",
      icon: "🧩",
      description:
        "Byg en lille side med tre knapper, der hver udfører en forskellig handling.\n\n" +
        "Opret funktionerne `showMessage`, `showWarning` og `showGoodbye`. De skal hver vise en besked i en alert-boks: `Hej med dig!`, `Pas på!` og `Farvel!`.\n\n" +
        "Tilføj knapperne `Sig hej`, `Vis advarsel` og `Sig farvel`, og forbind hver knap med den funktion, der passer til dens tekst. Vælg selv, hvordan du vil strukturere koden.",
      starter: `// Skriv de tre funktioner her



function App() {
  return (
    <main>
      {/* Opret de tre knapper her */}
    </main>
  );
}

export default App;
`,
      hints: [
        "Start med at identificere de tre handlinger. Hver handling skal have sin egen funktion.",
        "Brug `alert()` til at vise en besked i en dialogboks. Hver funktion skal vise sin egen besked.",
        "Forbind hver knap med den funktion, der passer til den. Husk, at en event handler skal modtage en funktion – den skal ikke udføre funktionen under renderingen.",
      ],
      checks: [
        {
          label: "Alle tre knapper vises",
          fail: "Du skal oprette alle tre knapper med de korrekte tekster.",
          test: (c) =>
            ["Sig hej", "Vis advarsel", "Sig farvel"].every((label) =>
              c.texts(c.$$("button")).includes(label)
            ),
        },
        {
          label: "Alle tre funktioner er defineret",
          fail: "Kontrollér, at alle tre funktioner er defineret med de korrekte navne.",
          test: (c) =>
            c.has(/function\s+showMessage\s*\(/) &&
            c.has(/function\s+showWarning\s*\(/) &&
            c.has(/function\s+showGoodbye\s*\(/),
        },
        {
          label: "Knapperne bruger de korrekte event handlers",
          fail: "Hver knap skal have den korrekte funktion som sin onClick-handler.",
          test: (c) =>
            c.has(/onClick\s*=\s*\{\s*showMessage\s*\}/) &&
            c.has(/onClick\s*=\s*\{\s*showWarning\s*\}/) &&
            c.has(/onClick\s*=\s*\{\s*showGoodbye\s*\}/),
        },
        {
          label: "Funktionerne indeholder de korrekte beskeder",
          fail: "Kontrollér beskeden i hver af de tre funktioner.",
        test: (c) => {
          const code = c.code;
          console.log(code)

          return (
            /alert\s*\(\s*["']Hej med dig!["']\s*\)/.test(code) &&
            /alert\s*\(\s*["']Pas på!["']\s*\)/.test(code) &&
            /alert\s*\(\s*["']Farvel!["']\s*\)/.test(code)
          );
        },
        },
      ],
    },
  ];

  global.COURSES["react-events"] = {
    id: "react-events",
    engine: "react",
    title: "React Lab",
    subtitle: "React Events",
    filename: "App.tsx",
    finishText:
      "Du har gennemført React Events. Du ved nu, hvordan du kobler funktioner til brugerhandlinger i React.",
    challenges,
  };
})(window);
