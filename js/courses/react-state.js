/*
 * Kursus: React State og rendering (4 opgaver).
 *
 * Motor: js/engines/react.js
 */

(function (global) {
  "use strict";

  const challenges = [
    {
      id: "state-display",
      title: "Vis data fra state",
      topic: "State",
      icon: "🔢",
      description:
        "Komponenten har allerede en state-værdi. Din opgave er at vise den i sidens JSX, så indholdet af siden afspejler værdien fra state.\n\n" +
        "Siden skal vise tallet, der er gemt i `count`, inde i et `<p>` tag.",
      starter: `import { useState } from "react";

function App() {
  const [count] = useState(3);

  return (
    <main>
      {/* Vis værdien fra count her */}
    </main>
  );
}

export default App;
`,
      hints: [
        "State er data, som et komponent kan holde styr på. Her er variablen `count` den aktuelle værdi.",
        "Du kan indsætte en JavaScript-værdi i JSX ved at bruge krøllede parenteser.",
        "Opret et `p`-element, og indsæt variablen `count` i det.",
      ],
      checks: [
        {
          label: "Siden viser den aktuelle værdi fra state",
          fail: "Vis værdien fra `count` i et HTML-element.",
          test: (c) => c.text(c.$("main p")) === "3",
        },
        {
          label: "JSX bruger variablen `count`",
          fail: "Brug state-variablen `count` i JSX i stedet for at skrive tallet direkte.",
          test: (c) => /\{\s*count\s*\}/.test(c.code),
        },
      ],
    },

    {
      id: "state-increment",
      title: "Opdatér state med et klik",
      topic: "State",
      icon: "➕",
      description:
        "Du har en tæller, der starter på 0. Knappen er allerede koblet til funktionen `handleClick`, men funktionen opdaterer ikke tælleren endnu.\n\n" +
        "Ret funktionen, så den øger tællerens værdi med 1, når den bliver kaldt.",
      starter: `import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  function handleClick() {
    // Opdatér count her
  }

  return (
    <main>
      <p>{count}</p>
      <button onClick={handleClick}>Tæl op</button>
    </main>
  );
}

export default App;
`,
      hints: [
        "Når state skal ændres, skal du bruge den setter-funktion, der kommer fra `useState`.",
        "Her hedder setter-funktionen `setCount`. Den skal bruges til at give tælleren en ny værdi.",
        "Den nye værdi skal være den aktuelle `count`-værdi plus 1.",
      ],
      checks: [
        {
          label: "Tælleren starter med 0",
          fail: "Tælleren skal vise startværdien 0.",
          test: (c) => c.text(c.$("main p")) === "0",
        },
        {
          label: "Knappen er koblet til handleClick",
          fail: "Knappen skal bruge `handleClick` som sin event handler.",
          test: (c) => /onClick\s*=\s*\{\s*handleClick\s*\}/.test(c.code),
        },
        {
          label: "handleClick opdaterer state med den nye værdi",
          fail: "Brug `setCount` til at sætte værdien til den aktuelle `count` plus 1.",
          test: (c) => /setCount\s*\(\s*count\s*\+\s*1\s*\)/.test(c.code),
        },
      ],
    },

    {
      id: "state-increment-decrement",
      title: "To knapper, én state-værdi",
      topic: "State",
      icon: "↕️",
      description:
        "Udvid tælleren, så brugeren både kan øge og mindske værdien. Begge knapper skal arbejde med den samme state-værdi.\n\n" +
        "Opret funktionerne `increase` og `decrease`, og forbind dem med de to knapper. Tælleren skal starte på 5.",
      starter: `import { useState } from "react";

function App() {
  const [count, setCount] = useState(5);

  // Skriv funktionerne increase og decrease her

  return (
    <main>
      <p>{count}</p>
      <button onClick={increase}>Øg</button>
      <button onClick={decrease}>Mindsk</button>
    </main>
  );
}

export default App;
`,
      hints: [
        "Du skal bruge én state-værdi, men to forskellige handlinger.",
        "Begge funktioner skal bruge `setCount`, men beregne en ny værdi på hver sin måde.",
        "Den ene funktion skal lægge 1 til `count`, og den anden skal trække 1 fra `count`.",
      ],
      checks: [
        {
          label: "Tælleren starter på 5",
          fail: "Tælleren skal vise startværdien 5.",
          test: (c) => c.text(c.$("main p")) === "5",
        },
        {
          label: "Begge knapper vises",
          fail: "Opret knapperne `Øg` og `Mindsk`.",
          test: (c) => {
            const labels = c.texts(c.$$("button"));
            return labels.includes("Øg") && labels.includes("Mindsk");
          },
        },
        {
          label: "Funktionerne opdaterer state i hver sin retning",
          fail: "`increase` skal øge `count` med 1, og `decrease` skal mindske `count` med 1.",
          test: (c) => {
            const code = c.code;

            const increaseMatches =
              /(?:function\s+increase\s*\([^)]*\)|(?:const|let|var)\s+increase\s*=\s*\([^)]*\)\s*=>)\s*\{[\s\S]*?setCount\s*\(\s*count\s*\+\s*1\s*\)/.test(code);

            const decreaseMatches =
              /(?:function\s+decrease\s*\([^)]*\)|(?:const|let|var)\s+decrease\s*=\s*\([^)]*\)\s*=>)\s*\{[\s\S]*?setCount\s*\(\s*count\s*-\s*1\s*\)/.test(code);

            return increaseMatches && decreaseMatches;
          }},
        {
          label: "Knapperne bruger de rigtige funktioner",
          fail: "Forbind `Øg` med `increase` og `Mindsk` med `decrease`.",
          test: (c) =>
            /onClick\s*=\s*\{\s*increase\s*\}/.test(c.code) &&
            /onClick\s*=\s*\{\s*decrease\s*\}/.test(c.code),
        },
      ],
    },

    {
      id: "state-derived-value",
      title: "Beregn en værdi ud fra state",
      topic: "Rendering",
      icon: "🧮",
      description:
        "En side skal vise både en værdi og det dobbelte af værdien. Den oprindelige værdi ligger allerede i state som `points`.\n\n" +
        "Vis `points` i det første afsnit, og vis det dobbelte af `points` i det andet. Beregn resultatet direkte i JSX i stedet for at oprette endnu en state-værdi.",
      starter: `import { useState } from "react";

function App() {
  const [points] = useState(4);

  return (
    <main>
      <p>Point: {/* Vis points her */}</p>
      <p>Dobbelt: {/* Beregn det dobbelte her */}</p>
    </main>
  );
}

export default App;
`,
      hints: [
        "Den første linje skal vise den værdi, der allerede er gemt i state.",
        "I JSX kan du skrive et JavaScript-udtryk mellem krøllede parenteser.",
        "Det dobbelte af et tal kan beregnes ved at gange værdien med 2.",
      ],
      checks: [
        {
          label: "Begge resultater vises korrekt",
          fail: "Det første afsnit skal vise `Point: 4`, og det andet skal vise `Dobbelt: 8`.",
          test: (c) => {
            const paragraphs = c.texts(c.$$("main p"));
            return paragraphs.includes("Point: 4") && paragraphs.includes("Dobbelt: 8");
          },
        },
        {
          label: "Resultaterne beregnes ud fra points i JSX",
          fail: "Brug `points` i begge udtryk, og beregn det dobbelte direkte i JSX.",
          test: (c) =>
            /Point:\s*\{\s*points\s*\}/.test(c.code) &&
            /Dobbelt:\s*\{\s*points\s*\*\s*2\s*\}/.test(c.code),
        },
      ],
    },
  ];

  global.COURSES["react-state"] = {
    id: "react-state",
    engine: "react",
    title: "React Lab",
    subtitle: "React State",
    filename: "App.tsx",
    finishText:
      "Du har gennemført React State. Du har arbejdet med at vise state, opdatere værdier og beregne indhold ud fra state.",
    challenges,
  };
})(window);
