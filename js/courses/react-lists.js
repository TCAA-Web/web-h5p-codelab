/*
 * Kursus: React Lister og rendering (5 opgaver).
 * Motor: js/engines/react.js
 */
(function (global) {
  "use strict";

  const challenges = [
    {
      id: "lists-map-basics",
      title: "Vis en liste med map",
      topic: "Lister og rendering",
      icon: "🧾",
      description:
        "Arrayet `fruits` indeholder tre frugter. Vis alle frugterne som listeelementer på siden.\n\n" +
        "Brug `.map()` til at oprette ét `<li>`-element for hvert element i arrayet. Teksten i hvert listeelement skal være frugtens navn.\n\n" +
        "Det er vigtigt at hvert element der kommer fra et loop har en `key` på sig, i React. Du kan med fordel bruge navnet på frugten som `key`",
      starter: `function App() {
  const fruits = ["Æble", "Pære", "Banan"];

  return (
    <main>
      <ul>
        {/* Opret et listeelement for hver frugt */}
      </ul>
    </main>
  );
}

export default App;
`,
      hints: [
        "Du kan bruge `.map()` til at gennemløbe arrayet og oprette JSX for hvert element.",
        "Skriv et callback til `fruits.map(...)`, og brug den aktuelle frugt som tekst i et `<li>`-element.",
        "Listen skal indeholde ét `<li>` for hver frugt i `fruits`, og hvert element skal vise variablen for den aktuelle frugt."
      ],
      checks: [
        {
          label: "Alle frugter vises som listeelementer",
          fail: "Listen skal vise Æble, Pære og Banan i den rækkefølge, de står i arrayet.",
          test: (c) =>
            JSON.stringify(c.texts(c.$$("main li"))) ===
            JSON.stringify(["Æble", "Pære", "Banan"]),
        },
        {
          label: "Listen genereres med map",
          fail: "Brug `.map()` til at oprette listeelementerne ud fra arrayet `fruits`.",
          test: (c) => /\bfruits\s*\.\s*map\s*\(/.test(c.code),
        },
        {
          label: "Hvert element har en key",
          fail: "Tilføj `key={}` til hvert element.",
          test: (c) => /<li\b[^>]*\bkey\s*=\s*\{\s*[^}]+\s*\}[^>]*>/.test(c.code)
        }
      ],
    },

    {
      id: "lists-object-keys",
      title: "Vis data fra objekter",
      topic: "Lister og rendering",
      icon: "🗂️",
      description:
        "Arrayet `products` indeholder objekter med et `id` og et `name`. Vis hvert produkt som et `<li>`-element med produktets navn.\n\n" +
        "Brug `.map()` til at oprette elementerne, og giv hvert `<li>` en `key`-prop, der bruger produktets stabile id (`product.id`).",
      starter: `function App() {
  const products = [
    { id: 101, name: "Tastatur" },
    { id: 102, name: "Mus" },
    { id: 103, name: "Skærm" }
  ];

  return (
    <main>
      <ul>
        {/* Vis produktnavnene fra arrayet */}
      </ul>
    </main>
  );
}

export default App;
`,
      hints: [
        "Hvert element i arrayet er et objekt, så du skal læse navnet fra objektets `name`-egenskab.",
        "Brug `products.map((product) => ...)` til at oprette et `<li>` for hvert produkt.",
        "Sæt `key={product.id}` på hvert `<li>`, og vis `product.name` som indhold."
      ],
      checks: [
        {
          label: "Alle produktnavne vises",
          fail: "Listen skal vise Tastatur, Mus og Skærm i den angivne rækkefølge.",
          test: (c) =>
            JSON.stringify(c.texts(c.$$("main li"))) ===
            JSON.stringify(["Tastatur", "Mus", "Skærm"]),
        },
        {
          label: "Produkterne oprettes med map",
          fail: "Brug `.map()` til at oprette et listeelement for hvert produkt.",
          test: (c) => /\bproducts\s*\.\s*map\s*\(/.test(c.code),
        },
        {
          label: "Hvert listeelement bruger produktets id som key",
          fail: "Tilføj `key={YOUR_VARIABLE_NAME.id}` til hvert `<li>`-element.",
          test: (c) => /<li\b[^>]*\bkey\s*=\s*\{\s*[^}]+\s*\}/.test(c.code),
        },
      ],
    },

    {
      id: "lists-fix-map-return",
      title: "Find fejlen: Listen bliver ikke vist",
      topic: "Lister og rendering",
      icon: "🐞",
      description:
        "Arrayet `tasks` indeholder tre opgaver, men listen vises ikke. Callback-funktionen i `.map()` bruger en blok med krøllede parenteser, og JSX-elementet bliver ikke returneret.\n\n" +
        "Ret callback-funktionen, så alle tre opgaver bliver vist som `<li>`-elementer. Behold `key`-værdien for hvert element.",
      starter: `function App() {
  const tasks = ["Læs opgaven", "Skriv kode", "Test løsningen"];

  return (
    <main>
      <ul>
        {tasks.map((task) => {
          <li key={task}>{task}</li>
        })}
      </ul>
    </main>
  );
}

export default App;
`,
      hints: [
        "Når callback-funktionen bruger `{}` som funktionsblok, bliver resultatet ikke returneret automatisk.",
        "Du kan enten returnere JSX eksplicit eller ændre callback-funktionen til et implicit return.",
        "Sørg for, at callback-funktionen returnerer `<li>`-elementet for hver `task`."
      ],
      checks: [
        {
          label: "Alle tre opgaver vises",
          fail: "Listen skal vise Læs opgaven, Skriv kode og Test løsningen.",
          test: (c) =>
            JSON.stringify(c.texts(c.$$("main li"))) ===
            JSON.stringify(["Læs opgaven", "Skriv kode", "Test løsningen"]),
        },
        {
          label: "Listen bruger map",
          fail: "Behold `.map()` til at gennemløbe arrayet `tasks`.",
          test: (c) => /\btasks\s*\.\s*map\s*\(/.test(c.code),
        },
        {
          label: "Hvert listeelement har sin key",
          fail: "Hvert `<li>` skal fortsat have `key={task}`.",
          test: (c) => /<li\b[^>]*\bkey\s*=\s*\{\s*[^}]+\s*\}/.test(c.code),
        },
      ],
    },

    {
      id: "lists-filter-map",
      title: "Vis kun færdige opgaver",
      topic: "Lister og rendering",
      icon: "🔎",
      description:
        "Arrayet `tasks` indeholder både færdige og ufærdige opgaver. Vis kun de opgaver, hvor `completed` er `true`.\n\n" +
        "Filtrér arrayet, før du opretter listeelementerne med `.map()`. Hvert vist element skal vise opgavens titel og bruge `task.id` som sin `key`.",
      starter: `function App() {
  const tasks = [
    { id: 1, title: "Opsæt projektet", completed: true },
    { id: 2, title: "Byg komponenten", completed: false },
    { id: 3, title: "Test løsningen", completed: true }
  ];

  return (
    <main>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>{task.title}</li>
        ))}
      </ul>
    </main>
  );
}

export default App;
`,
      hints: [
        "`.filter()` opretter et nyt array med de elementer, der opfylder en betingelse.",
        "Brug `task.completed` som betingelse i `.filter()`.",
        "Kald `.map()` på det filtrerede array, og behold `key={task.id}` på hvert `<li>`."
      ],
      checks: [
        {
          label: "Kun færdige opgaver vises",
          fail: "Listen skal kun vise Opsæt projektet og Test løsningen. Byg komponenten skal ikke vises.",
          test: (c) =>
            JSON.stringify(c.texts(c.$$("main li"))) ===
            JSON.stringify(["Opsæt projektet", "Test løsningen"]),
        },
        {
          label: "Arrayet filtreres før listen oprettes",
          fail: "Brug `.filter()` med `task.completed` og derefter `.map()` til at oprette listeelementerne.",
          test: (c) =>
            /\btasks\s*\.\s*filter\s*\([\s\S]*?\.map\s*\(/.test(c.code) &&
            /\s*[^}]+\s*\.completed/.test(c.code),
        },
        {
          label: "Hvert element bruger opgavens id som key",
          fail: "Hvert `<li>` skal bruge `key={task.id}`.",
          test: (c) => /<li\b[^>]*\bkey\s*=\s*\{\s*task\.id\s*\}/.test(c.code),
        },
      ],
    },

    {
      id: "lists-empty-state",
      title: "Håndtér en tom liste",
      topic: "Lister og rendering",
      icon: "📭",
      description:
        "En notifikationsliste skal vise beskeder, når der findes notifikationer. Hvis arrayet `notifications` er tomt, skal siden i stedet vise teksten `Ingen nye beskeder` i et `<p>`-element.\n\n" +
        "Behold `.map()`-løsningen til at vise notifikationerne, når arrayet ikke er tomt, og tilføj en passende tom-tilstand.",
      starter: `function App() {
  const notifications:Array<any> = [];

  return (
    <main>
        <ul>
          {notifications.map((notification) => (
            <li key={notification.id}>{notification.message}</li>
          ))}
        </ul>
    </main>
  );
}

export default App;
`,
      hints: [
        "Du kan kontrollere, om arrayet indeholder elementer, ved at undersøge dets `length`.",
        "Den eksisterende ternary-betingelse har allerede en gren til den tomme liste.",
        "Erstat `null` med et `<p>`-element, der indeholder `Ingen nye beskeder`."
      ],
      checks: [
        {
          label: "Den tomme liste viser en besked",
          fail: "Når `notifications` er tomt, skal et `<p>`-element vise `Ingen nye beskeder`.",
          test: (c) => c.text(c.$("main p")) === "Ingen nye beskeder",
        },
        {
          label: "Notifikationerne kan stadig oprettes med map",
          fail: "Behold `.map()` over `notifications`, så hvert element kan vises, når listen indeholder data.",
          test: (c) => /\bnotifications\s*\.\s*map\s*\(/.test(c.code),
        },
        {
          label: "Tom-tilstanden afhænger af listens længde",
          fail: "Brug `notifications.length` til at vælge mellem listen og beskeden for en tom liste.",
          test: (c) =>
            /notifications\.length\s*>\s*0/.test(c.code) &&
            /Ingen nye beskeder/.test(c.code),
        },
      ],
    },
  ];

  global.COURSES["react-lists"] = {
    id: "react-lists",
    engine: "react",
    title: "React Lab",
    subtitle: "React Lists",
    filename: "App.tsx",
    finishText:
      "Du har gennemført React Lister og rendering af arrays. Du har arbejdet med at oprette lister fra arrays, vise data fra objekter, bruge keys, filtrere data og håndtere tomme lister.",
    challenges,
  };
})(window);
