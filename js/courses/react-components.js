/*
 * Kursus: React Components (5 opgaver).
 * Motor: js/engines/react.js
 */
(function (global) {
  "use strict";

  const challenges = [
    {
      id: "comp-write",
      title: "Skriv dit første komponent",
      topic: "Komponenter",
      icon: "🧱",
      description:
        "Et React-komponent er en **funktion**, hvis navn starter med **stort bogstav**, og som **returnerer JSX**.\n\n" +
        "1. Skriv komponentet `Velkommen`, der returnerer `<h2>Velkommen til kurset</h2>`\n" +
        "2. Vis det inde i `<main>` i `App`, ved at bruge det som et tag: `<Velkommen />`",
      starter: `// 1. Skriv komponentet Velkommen her


function App() {
  return (
    <main>
      {/* 2. Vis Velkommen her */}
    </main>
  );
}

export default App;
`,
      hints: [
        "Et komponent kan skrives som en almindelig funktion: `function Velkommen() { return … }`.",
        "Navnet skal starte med stort bogstav – ellers tror React, at det er et almindeligt HTML-tag.",
        "Brug komponentet som et selv-lukkende tag: `<Velkommen />`.",
      ],
      checks: [
        {
          label: "Komponentet `Velkommen` er defineret",
          fail: "Skriv `function Velkommen() { … }`.",
          test: (c) => c.has(/function\s+Velkommen\s*\(|const\s+Velkommen\s*=/),
        },
        {
          label: "`Velkommen` returnerer `<h2>Velkommen til kurset</h2>`",
          fail: "Returnér `<h2>Velkommen til kurset</h2>`.",
          test: (c) => c.text(c.$("main h2")) === "Velkommen til kurset" || "Der skal vises en `<h2>` med teksten `Velkommen til kurset` inde i `<main>`.",
        },
        {
          label: "`App` bruger komponentet som `<Velkommen />`",
          fail: "Skriv `<Velkommen />` i `App`.",
          test: (c) => c.has(/<Velkommen\s*\/>|<Velkommen>\s*<\/Velkommen>/) || "Brug `<Velkommen />` i `App` – ikke en kopi af HTML'en.",
        },
      ],
    },

    {
      id: "comp-naming",
      title: "Find fejlene: Navne og return",
      topic: "Komponenter",
      icon: "🐞",
      description:
        "Her er to komponenter, der ikke virker. Find fejlene ved hjælp af fanen **Typer & fejl**.\n\n" +
        "Husk reglerne:\n" +
        "- Komponentnavne starter med **stort bogstav**\n" +
        "- Et komponent skal **returnere** sin JSX",
      starter: `function knap() {
  return <button>Tryk her</button>;
}

function Titel() {
  <h1>Min side</h1>;
}

function App() {
  return (
    <div>
      <Titel />
      <knap />
    </div>
  );
}

export default App;
`,
      hints: [
        "React behandler små bogstaver som HTML-tags. `<knap />` findes ikke i HTML.",
        "Funktionen `knap` skal omdøbes til `Knap` – og det samme skal bruges i `App`.",
        "`Titel` mangler `return`. Uden `return` returnerer funktionen ingenting.",
      ],
      checks: [
        {
          label: "Knap-komponentet hedder `Knap` og bruges som `<Knap />`",
          fail: "Omdøb `knap` til `Knap` begge steder.",
          test: (c) => (c.has(/function\s+Knap\b|const\s+Knap\s*=/) && c.has(/<Knap\s*\/>/)) || "Både funktionen og tagget i `App` skal hedde `Knap`.",
        },
        {
          label: "`Titel` returnerer sin `<h1>`",
          fail: "Tilføj `return`.",
          test: (c) => c.has(/return\s*\(?\s*<h1>/) || "`Titel` skal bruge `return`.",
        },
        {
          label: "Siden viser overskriften og knappen",
          fail: "Der skal vises en `<h1>` og en `<button>`.",
          test: (c) => {
            if (c.text(c.$("h1")) !== "Min side") return "Der mangler en `<h1>` med teksten `Min side`.";
            return c.text(c.$("button")) === "Tryk her" || "Der mangler en `<button>` med teksten `Tryk her`.";
          },
        },
      ],
    },

    {
      id: "comp-arrow",
      title: "Arrow function og export",
      topic: "Komponenter",
      icon: "➡️",
      description:
        "Komponenter kan også skrives som **arrow functions**: `const Navn = () => { … }`.\n\n" +
        "Skriv komponentet `Sidefod` som en arrow function. Det skal returnere:\n" +
        "`<footer><p>© 2026 Mit kursus</p></footer>`\n\n" +
        "Eksportér det til sidst som default: `export default Sidefod;`",
      entry: "Sidefod",
      starter: `// Skriv komponentet Sidefod som en arrow function her

`,
      hints: [
        "`const Sidefod = () => { return ( … ); };`",
        "Hvis funktionen kun returnerer JSX, kan du også skrive `const Sidefod = () => ( … );`.",
        "Sidst i filen: `export default Sidefod;`",
      ],
      checks: [
        {
          label: "`Sidefod` er skrevet som en arrow function",
          fail: "Skriv `const Sidefod = () => …`.",
          test: (c) => c.has(/const\s+Sidefod\s*=\s*\(\s*\)\s*(:[^=]+)?=>/) || "Brug en arrow function: `const Sidefod = () => …`.",
        },
        {
          label: "Komponentet viser `<footer><p>© 2026 Mit kursus</p></footer>`",
          fail: "Returnér en `<footer>` med et `<p>`.",
          test: (c) => c.text(c.$("body > footer > p")) === "© 2026 Mit kursus" || "Der skal vises `<footer><p>© 2026 Mit kursus</p></footer>`.",
        },
        {
          label: "`Sidefod` eksporteres som default",
          fail: "Skriv `export default Sidefod;`.",
          test: (c) => c.has(/export\s+default\s+Sidefod\b/),
        },
      ],
    },

    {
      id: "comp-compose",
      title: "Sæt komponenter sammen",
      topic: "Sammensætning",
      icon: "🏗️",
      description:
        "Komponenter kan bruges inde i andre komponenter. Sådan bygger man en hel side af små dele.\n\n" +
        "`App` skal returnere en `<div className=\"app\">`, som indeholder `Header`, `Indhold` og `Footer` – i den rækkefølge. Brug dem som tags (`<Header />`), og skriv ikke HTML'en igen.",
      starter: `function Header() {
  return (
    <header>
      <h1>Min blog</h1>
    </header>
  );
}

function Indhold() {
  return (
    <main>
      <p>Velkommen til min blog.</p>
    </main>
  );
}

function Footer() {
  return <footer>© 2026</footer>;
}

function App() {
  // Sæt de tre komponenter sammen her
  return null;
}

export default App;
`,
      hints: [
        "Returnér en `<div className=\"app\">` og sæt komponenterne ind som børn.",
        "Rækkefølgen i JSX er rækkefølgen på siden: Header, Indhold, Footer.",
        "`<Header />`, `<Indhold />` og `<Footer />`.",
      ],
      checks: [
        {
          label: "`App` returnerer en `<div>` med klassen `app`",
          fail: "Brug `<div className=\"app\">`.",
          test: (c) => !!c.$("body > div.app") || "Der skal returneres en `<div className=\"app\">`.",
        },
        {
          label: "Siden viser header, main og footer i den rækkefølge",
          fail: "Sæt `Header`, `Indhold` og `Footer` ind i `<div>`.",
          test: (c) => {
            const tags = c.$$("div.app > *").map((e) => e.tagName.toLowerCase());
            return tags.join() === "header,main,footer" || `Din \`<div>\` indeholder: ${tags.join(", ") || "ingenting"}.`;
          },
        },
        {
          label: "Komponenterne bruges som tags: `<Header />`, `<Indhold />` og `<Footer />`",
          fail: "Brug komponenterne som tags.",
          test: (c) => (c.has(/<Header\s*\/>/) && c.has(/<Indhold\s*\/>/) && c.has(/<Footer\s*\/>/)) || "Brug `<Header />`, `<Indhold />` og `<Footer />`.",
        },
      ],
    },

    {
      id: "comp-call",
      title: "Find fejlene: Tags, ikke funktionskald",
      topic: "Komponenter",
      icon: "🐞",
      description:
        "Komponentet `Kort` bruges to gange i `App`, men koden har to fejl:\n\n" +
        "1. `Kort` returnerer to elementer ved siden af hinanden. Pak dem ind i en `<article>`\n" +
        "2. `App` **kalder** `Kort` som en funktion (`{Kort()}`). Et komponent skal bruges som JSX-tag: `<Kort />`",
      starter: `function Kort() {
  return (
    <h3>Kort</h3>
    <p>Dette er et kort.</p>
  );
}

function App() {
  return (
    <div>
      {Kort()}
      {Kort()}
    </div>
  );
}

export default App;
`,
      hints: [
        "Et komponent må kun returnere ét rod-element. Her kan en `<article>` omslutte `<h3>` og `<p>`.",
        "Fjern `{Kort()}` og skriv `<Kort />` i stedet.",
        "Når du bruger et tag, kan React holde styr på komponentet. Det kan den ikke, hvis du kalder funktionen selv.",
      ],
      checks: [
        {
          label: "Siden viser to `<article>`, hver med en `<h3>` og et `<p>`",
          fail: "Pak indholdet i `Kort` ind i en `<article>`.",
          test: (c) => {
            const cards = c.$$("article");
            if (cards.length !== 2) return `Der vises ${cards.length} \`<article>\` – forventede 2.`;
            return cards.every((a) => c.text(c.$("h3", a)) === "Kort" && c.text(c.$("p", a)) === "Dette er et kort.") || "Hver `<article>` skal indeholde `<h3>Kort</h3>` og `<p>Dette er et kort.</p>`.";
          },
        },
        {
          label: "`Kort` kaldes ikke som en funktion (`Kort()`)",
          fail: "Fjern funktionskaldene.",
          test: (c) => !/\bKort\s*\(/.test(c.clean.replace(/function\s+Kort/, "")) || "Du kalder stadig `Kort()` som en funktion.",
        },
        {
          label: "`<Kort />` bruges som tag mindst to gange",
          fail: "Skriv `<Kort />` to gange i `App`.",
          test: (c) => (c.clean.match(/<Kort\s*\/>/g) || []).length >= 2 || "Brug `<Kort />` to gange i `App`.",
        },
      ],
    },
  ];

  global.COURSES["react-components"] = {
    id: "react-components",
    engine: "react",
    title: "React Lab",
    subtitle: "React Components",
    filename: "App.tsx",
    finishText: "Du har gennemført React Components. Du ved nu, hvad der skal til for at lave et komponent!",
    challenges,
  };
})(window);
