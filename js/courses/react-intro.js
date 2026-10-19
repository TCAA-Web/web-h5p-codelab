/*
 * Kursus: React Intro – App.tsx (5 opgaver).
 * Motor: js/engines/react.js (se kommentaren øverst i den fil om `test` og `runtime`).
 */
(function (global) {
  "use strict";

  const challenges = [
    {
      id: "intro-app",
      title: "Din første App",
      topic: "Komponenter",
      icon: "⚛️",
      description:
        "En React-app er bygget af **komponenter**. Et komponent er en funktion, der returnerer **JSX** – en blanding af HTML og JavaScript.\n\n" +
        "I `App.tsx` ligger appens rod-komponent `App`. Lige nu returnerer den `null`, så der vises ikke noget.\n\n" +
        "Returnér et `<div>` med en `<h1>` med teksten **Hej React** og et `<p>` med en kort beskrivelse af dig selv (mindst 10 tegn).",
      starter: `function App() {
  // Returnér JSX her i stedet for null
  return null;
}

export default App;
`,
      hints: [
        "Skriv JSX efter `return`. Hvis det fylder flere linjer, så sæt det i parenteser: `return ( … );`.",
        "`<div>` omslutter de to andre elementer: `<div><h1>…</h1><p>…</p></div>`.",
        "Overskriften skal hedde præcis `Hej React`.",
      ],
      checks: [
        {
          label: "`App` returnerer en `<div>` med en `<h1>` og et `<p>`",
          fail: "Returnér en `<div>` med en `<h1>` og et `<p>`.",
          test: (c) => (c.$("body > div > h1") && c.$("body > div > p") ? true : "Der skal være en `<div>`, som indeholder både en `<h1>` og et `<p>`."),
        },
        {
          label: "Overskriften er \"Hej React\"",
          fail: "Skriv `Hej React` i `<h1>`.",
          test: (c) => /^hej react$/i.test(c.text(c.$("h1"))) || `Din \`<h1>\` indeholder "${c.text(c.$("h1"))}" – den skal indeholde \`Hej React\`.`,
        },
        {
          label: "Afsnittet er en rigtig beskrivelse (mindst 10 tegn)",
          fail: "Skriv en beskrivelse i `<p>`.",
          test: (c) => c.text(c.$("p")).length >= 10 || "Din `<p>` er for kort – skriv mindst 10 tegn.",
        },
        {
          label: "`App` eksporteres som default",
          fail: "Skriv `export default App;` nederst.",
          test: (c) => c.has(/export\s+default\s+(function\s+)?App\b/),
        },
      ],
    },

    {
      id: "intro-fragment",
      title: "Find fejlen: Ét rod-element",
      topic: "JSX-regler",
      icon: "🐞",
      description:
        "Et komponent må kun returnere **ét** element. Koden herunder returnerer to elementer ved siden af hinanden, og det giver en fejl.\n\n" +
        "Ret fejlen med et **fragment**: `<>` og `</>`. Så får du ét rod-element, uden at der kommer en ekstra `<div>` ind på siden.",
      starter: `function App() {
  return (
    <h1>Min app</h1>
    <p>Velkommen til min første React-app.</p>
  );
}

export default App;
`,
      hints: [
        "Se fanen **Typer & fejl**: TypeScript siger, at JSX-elementer skal have én forælder.",
        "Et fragment skrives som en tom tag: `<>` til at åbne og `</>` til at lukke.",
        "Sæt `<>` lige efter `return (` og `</>` lige før `);`.",
      ],
      checks: [
        {
          label: "Der bruges et fragment (`<>` … `</>`)",
          fail: "Brug `<>` og `</>` omkring de to elementer.",
          test: (c) => (c.has(/<>/) && c.has(/<\/>/)) || "Mangler et fragment: `<>` … `</>`.",
        },
        {
          label: "`<h1>` og `<p>` er stadig på siden med den oprindelige tekst",
          fail: "Behold teksten i `<h1>` og `<p>`.",
          test: (c) => {
            if (c.text(c.$("body > h1")) !== "Min app") return "`<h1>` skal indeholde teksten `Min app`.";
            return c.text(c.$("body > p")) === "Velkommen til min første React-app." || "`<p>` skal indeholde: Velkommen til min første React-app.";
          },
        },
        {
          label: "Der er ikke tilføjet en ekstra `<div>`",
          fail: "Brug et fragment i stedet for en `<div>`.",
          test: (c) => !c.$("div") || "Fjern `<div>` – brug et fragment, så der ikke kommer ekstra HTML på siden.",
        },
      ],
    },

    {
      id: "intro-expressions",
      title: "JSX og udtryk med { }",
      topic: "JSX",
      icon: "🧩",
      description:
        "I JSX kan du bruge JavaScript ved at sætte det i tuborgklammer: `{navn}` eller `{alder + 1}`.\n\n" +
        "Erstat de tre `…` i koden med udtryk, så siden viser:\n" +
        "- `Hej, Sofie!`\n" +
        "- `Du er 17 år gammel.`\n" +
        "- `Næste år er du 18 år.`\n\n" +
        "Du må **ikke** skrive navnet eller tallene direkte – brug variablerne `navn` og `alder`.",
      starter: `function App() {
  const navn = "Sofie";
  const alder = 17;

  return (
    <div>
      <h1>Hej, …!</h1>
      <p>Du er … år gammel.</p>
      <p>Næste år er du … år.</p>
    </div>
  );
}

export default App;
`,
      hints: [
        "Tekst og udtryk kan blandes: `<h1>Hej, {navn}!</h1>`.",
        "Inde i `{ }` kan du regne: `{alder + 1}`.",
        "Brug tre udtryk: `{navn}`, `{alder}` og `{alder + 1}`.",
      ],
      checks: [
        {
          label: "Overskriften viser \"Hej, Sofie!\"",
          fail: "Skriv `Hej, {navn}!` i `<h1>`.",
          test: (c) => c.text(c.$("h1")) === "Hej, Sofie!" || `\`<h1>\` viser "${c.text(c.$("h1"))}" – forventede "Hej, Sofie!".`,
        },
        {
          label: "Første afsnit viser \"Du er 17 år gammel.\"",
          fail: "Skriv `Du er {alder} år gammel.`",
          test: (c) => c.text(c.$$("p")[0]) === "Du er 17 år gammel." || `Første \`<p>\` viser "${c.text(c.$$("p")[0])}" – forventede "Du er 17 år gammel.".`,
        },
        {
          label: "Andet afsnit viser \"Næste år er du 18 år.\"",
          fail: "Skriv `Næste år er du {alder + 1} år.`",
          test: (c) => c.text(c.$$("p")[1]) === "Næste år er du 18 år." || `Andet \`<p>\` viser "${c.text(c.$$("p")[1])}" – forventede "Næste år er du 18 år.".`,
        },
        {
          label: "Værdierne kommer fra variablerne (`{navn}`, `{alder}` og `{alder + 1}`)",
          fail: "Brug variablerne i tuborgklammer i stedet for at skrive værdierne.",
          test: (c) =>
            (c.has(/\{\s*navn\s*\}/) && c.has(/\{\s*alder\s*\}/) && c.has(/\{\s*alder\s*\+\s*1\s*\}/)) ||
            "Brug `{navn}`, `{alder}` og `{alder + 1}` i JSX'en.",
        },
      ],
    },

    {
      id: "intro-jsx-rules",
      title: "Find fejlene: HTML og JSX",
      topic: "JSX-regler",
      icon: "🐞",
      description:
        "JSX ligner HTML, men har nogle andre regler. Koden herunder er skrevet som almindelig HTML og har **fem** fejl.\n\n" +
        "Ret dem alle. Hold øje med fanen **Typer & fejl**.\n\n" +
        "- Alle tags skal lukkes, også tomme tags som `<img />` og `<input />`\n" +
        "- Nogle attributter hedder noget andet i JSX\n" +
        "- `style` er et **objekt**, ikke en streng",
      starter: `function App() {
  return (
    <div class="kort" style="color: darkblue">
      <img src="assets/kat.svg" alt="En kat">
      <label for="navn">Navn</label>
      <input id="navn" type="text">
    </div>
  );
}

export default App;
`,
      hints: [
        "`class` hedder `className` i JSX, og `for` hedder `htmlFor`.",
        "Tomme tags skal selv-lukkes: `<img … />` og `<input … />`.",
        "Style skrives som et objekt i dobbelte tuborgklammer: `style={{ color: \"darkblue\" }}`.",
      ],
      checks: [
        {
          label: "`<div>` har klassen `kort` (via `className`)",
          fail: "Brug `className=\"kort\"`.",
          test: (c) => (c.has(/className\s*=/) && !!c.$("div.kort")) || "`<div>` skal have `className=\"kort\"`.",
        },
        {
          label: "Farven er `darkblue`, skrevet som et style-objekt",
          fail: "Brug `style={{ color: \"darkblue\" }}`.",
          test: (c) => (c.has(/style\s*=\s*\{\s*\{/) && /color:\s*darkblue/.test(c.$("div")?.getAttribute("style") || "") ? true : "Brug `style={{ color: \"darkblue\" }}`."),
        },
        {
          label: "Billedet er lukket og har `src` og `alt`",
          fail: "Skriv `<img src=\"…\" alt=\"…\" />`.",
          test: (c) => {
            const img = c.$("img");
            if (!img) return "Billedet mangler.";
            return (img.getAttribute("src") === "assets/kat.svg" && img.getAttribute("alt") === "En kat") || "Behold `src` og `alt` på billedet.";
          },
        },
        {
          label: "`<label>` er koblet til feltet med `htmlFor`",
          fail: "Brug `htmlFor=\"navn\"`.",
          test: (c) => (c.has(/htmlFor\s*=/) && !!c.$("label[for=navn]") && !!c.$("input#navn") ? true : "`<label>` skal have `htmlFor=\"navn\"`, og `<input>` skal have `id=\"navn\"`."),
        },
      ],
    },

    {
      id: "intro-list",
      title: "Vis en liste med .map()",
      topic: "Lister",
      icon: "📋",
      description:
        "I React laver du lister ved at gå et array igennem med `.map()` og returnere ét element pr. punkt.\n\n" +
        "Lav ét `<li>` pr. frugt i arrayet `frugter`. Husk, at hvert listeelement skal have en unik **`key`** – ellers advarer React dig.\n\n" +
        "Du må ikke skrive frugterne direkte i JSX'en.",
      starter: `const frugter = ["Æble", "Banan", "Kirsebær"];

function App() {
  return (
    <div>
      <h2>Frugter</h2>
      <ul>
        {/* Lav ét <li> pr. frugt med .map() */}
      </ul>
    </div>
  );
}

export default App;
`,
      hints: [
        "`.map()` returnerer et nyt array: `{frugter.map((frugt) => <li>{frugt}</li>)}`.",
        "Tilføj `key` til elementet, der returneres fra `.map()`: `<li key={frugt}>`.",
        "`key` skal være unik for hvert element. Her kan selve frugten bruges.",
      ],
      checks: [
        {
          label: "Listen viser Æble, Banan og Kirsebær i den rigtige rækkefølge",
          fail: "Lav tre `<li>`.",
          test: (c) => {
            const items = c.texts(c.$$("ul > li"));
            return items.join("|") === "Æble|Banan|Kirsebær" || `Din liste viser: ${items.join(", ") || "ingenting"}.`;
          },
        },
        {
          label: "Listen laves med `frugter.map(…)`",
          fail: "Brug `frugter.map(…)`.",
          test: (c) => c.has(/frugter\s*\.\s*map\s*\(/),
        },
        {
          label: "Hvert element har en `key`",
          fail: "Tilføj `key={…}` til `<li>`.",
          test: (c) => (c.has(/key\s*=\s*\{/) && !c.warnings.some((w) => /unique "key"/.test(w))) || "Hvert `<li>` skal have en `key`, fx `key={frugt}`.",
        },
      ],
    },
  ];

  global.COURSES["react-intro"] = {
    id: "react-intro",
    engine: "react",
    title: "React Lab",
    subtitle: "React Intro",
    filename: "App.tsx",
    finishText: "Du har gennemført React Intro. Nu kender du de grundlæggende regler for komponenter og JSX!",
    challenges,
  };
})(window);
