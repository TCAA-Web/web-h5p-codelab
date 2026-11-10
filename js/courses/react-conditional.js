/*
 * Kursus: React Betinget rendering (3 opgaver).
 * Motor: js/engines/react.js
 */
(function (global) {
  "use strict";

  const challenges = [
    {
      id: "conditional-ternary",
      title: "Vis indhold ud fra en betingelse",
      topic: "Betinget rendering",
      icon: "🔀",
      description:
        "En side skal vise forskelligt indhold afhængigt af, om brugeren er medlem. Variablen `isMember` er allerede sat til `true`.\n\n" +
        "Tilføj indhold i `<main>`, så siden viser `Du har adgang`, når `isMember` er `true`, og `Bliv medlem`, når den er `false`.\n\n" + 
        "Indholdet på siden skal vises i `<p>` tags.",
      starter: `function App() {
  const isMember = true;

  return (
    <main>
      {/* Vis den relevante besked ud fra isMember */}
    </main>
  );
}

export default App;
`,
      hints: [
        "Du kan vælge mellem to udtryk, afhængigt af om en betingelse er sand eller falsk.",
        "JSX kan indeholde et JavaScript-udtryk mellem krøllede parenteser.",
        "Brug en ternary-betingelse med `isMember`, `?` og `:` til at vælge mellem to `<p>`-elementer."
      ],
      checks: [
        {
          label: "Siden viser beskeden for et medlem",
          fail: "Når `isMember` er `true`, skal siden vise `Du har adgang`.",
          test: (c) => c.text(c.$("main")) === "Du har adgang",
        },
        {
          label: "Begge muligheder er skrevet i en betingelse",
          fail: "Brug `isMember` i en ternary-betingelse, der vælger mellem `Du har adgang` og `Bliv medlem`.",
          test: (c) =>
            /\bisMember\b[\s\S]*\?[\s\S]*Du har adgang[\s\S]*:[\s\S]*Bliv medlem/.test(c.code)}
          ],
      },
    {
      id: "conditional-toggle",
      title: "Vis og skjul detaljer",
      topic: "Betinget rendering",
      icon: "👁️",
      description:
        "Du har en knap og en state-værdi, der skal styre, om ekstra detaljer vises. Lige nu er detaljerne skjult.\n\n" +
        "1. Gør funktionen `toggleDetails` i stand til at skifte værdien i state.\n" +
        "2. Behold detaljerne skjult, indtil brugeren aktiverer knappen.\n" +
        "3. Når værdien er `true`, skal teksten `Her er de ekstra detaljer.` vises.",
      starter: `import { useState } from "react";

function App() {
  const [showDetails, setShowDetails] = useState(false);

  function toggleDetails() {
    // Skift værdien i state
  }

  return (
    <main>
      <button onClick={toggleDetails}>Vis/skjul detaljer</button>
      {showDetails && <p>Her er de ekstra detaljer.</p>}
    </main>
  );
}

export default App;
`,
      hints: [
        "Brug setter-funktionen fra `useState` for at ændre værdien.",
        "Funktionen skal skifte `showDetails` fra `false` til `true` og tilbage igen.",
        "Du kan sætte værdien til det modsatte af den aktuelle værdi med `setShowDetails(!showDetails)`."
      ],
      checks: [
        {
          label: "Knappen vises",
          fail: "Siden skal have knappen `Vis/skjul detaljer`.",
          test: (c) => c.text(c.$("button")) === "Vis/skjul detaljer",
        },
        {
          label: "Detaljerne er skjult fra start",
          fail: "Da `showDetails` starter som `false`, skal detaljeteksten ikke vises ved første rendering.",
          test: (c) => !c.text(c.$("main")).includes("Her er de ekstra detaljer."),
        },
        {
          label: "Detaljerne vises betinget",
          fail: "Brug `showDetails` til at styre, om detaljeafsnittet skal vises.",
          test: (c) =>
            /showDetails\s*&&\s*<p>\s*Her er de ekstra detaljer\.\s*<\/p>/.test(c.code),
        },
        {
          label: "Funktionen skifter state-værdien",
          fail: "Funktionen `toggleDetails` skal bruge `setShowDetails` til at skifte værdien mellem sand og falsk.",
          test: (c) =>
            /function\s+toggleDetails\s*\([^)]*\)\s*\{[\s\S]*?setShowDetails\s*\(\s*(?:!\s*showDetails|\(\s*\w+\s*\)\s*=>\s*!\s*\w+|\w+\s*=>\s*!\s*\w+)\s*\)/.test(c.code),
        },
        {
          label: "Knappen er forbundet med funktionen",
          fail: "Knappen skal bruge `toggleDetails` som sin event handler.",
          test: (c) => /onClick\s*=\s*\{\s*toggleDetails\s*\}/.test(c.code),
        },
      ],
    },
    {
      id: "conditional-debug",
      title: "Find fejlen i betingelsen",
      topic: "Betinget rendering",
      icon: "🐞",
      description:
        "Komponenten skal vise en besked, der passer til værdien af `showDetails`. Men de to beskeder er blevet placeret forkert i betingelsen.\n\n" +
        "Ret betingelsen, så `Detaljer vises` vises, når `showDetails` er `true`, og `Detaljer er skjult` vises, når værdien er `false`.",
      starter: `import { useState } from "react";

function App() {
  const [showDetails] = useState(false);

  return (
    <main>
      <p>{showDetails ? "Detaljer er skjult" : "Detaljer vises"}</p>
    </main>
  );
}

export default App;
`,
      hints: [
        "Læs betingelsen fra venstre mod højre: udtrykket før `?` afgør, hvilken besked der vælges.",
        "Den første besked efter `?` vises, når betingelsen er `true`. Beskeden efter `:` vises, når den er `false`.",
        "Byt rundt på de to beskeder, så `Detaljer vises` hører til `true`, og `Detaljer er skjult` hører til `false`."
      ],
      checks: [
        {
          label: "Den korrekte besked vises ved start",
          fail: "Da `showDetails` starter som `false`, skal siden vise `Detaljer er skjult`.",
          test: (c) => c.text(c.$("main p")) === "Detaljer er skjult",
        },
        {
          label: "Beskederne er placeret i den rigtige rækkefølge",
          fail: "Når `showDetails` er `true`, skal betingelsen vælge `Detaljer vises`; ellers skal den vælge `Detaljer er skjult`.",
          test: (c) =>
            /\{\s*showDetails\s*\?\s*["']Detaljer vises["']\s*:\s*["']Detaljer er skjult["']\s*\}/.test(c.code),
        },
      ],
    },
    {
      id: "conditional-fallback",
      title: "Vis en standardbesked",
      topic: "Betinget rendering",
      icon: "↩️",
      description:
        "En besked skal kun vises, hvis der findes en personlig velkomst. Variablen `welcomeMessage` er tom lige nu.\n\n" +
        "Ret JSX'en, så siden viser indholdet af `welcomeMessage`, når der er en besked, og ellers viser teksten `Velkommen!`.",
      starter: `function App() {
  const welcomeMessage = "";

  return (
    <main>
      <p>{/* Vis velkomstbesked eller standardbesked */}</p>
    </main>
  );
}

export default App;
`,
      hints: [
        "Du kan bruge en logisk OR-operator (`||`) til at vælge en standardværdi, når den første værdi er tom.",
        "Skriv et JavaScript-udtryk mellem JSX-krøllede parenteser.",
        "Brug `welcomeMessage || 'Velkommen!'` som udtryk inde i `<p>`."
      ],
      checks: [
        {
          label: "Standardbeskeden vises, når beskeden er tom",
          fail: "Når `welcomeMessage` er tom, skal siden vise `Velkommen!`.",
          test: (c) => c.text(c.$("main p")) === "Velkommen!",
        },
        {
          label: "Velkomstbeskeden bruges med en standardværdi",
          fail: "Brug `welcomeMessage || 'Velkommen!'` i JSX, så standardbeskeden kun bruges, når den første værdi er tom.",
          test: (c) =>
            /welcomeMessage\s*\|\|\s*["']Velkommen!["']/.test(c.code),
        },
      ],
    },
    {
      id: "conditional-early-return",
      title: "Vis en side afhængigt af adgang",
      topic: "Betinget rendering",
      icon: "🚪",
      description:
        "Komponenten skal vise forskelligt indhold afhængigt af, om brugeren er logget ind. Variablen `isLoggedIn` er sat til `false`.\n\n" +
        "Brug en `if`-betingelse til at vise `<p>Log ind for at fortsætte</p>`, når brugeren ikke er logget ind. Når brugeren er logget ind, skal den eksisterende side med teksten `Du er logget ind` vises.",
      starter: `function App() {
  const isLoggedIn = false;

  if (!isLoggedIn) {
    // Returnér en besked til brugeren
  }

  return (
    <main>
      <p>Du er logget ind</p>
    </main>
  );
}

export default App;
`,
      hints: [
        "En React-komponent må gerne have et `return` inde i en `if`-betingelse.",
        "Betingelsen skal være sand, når `isLoggedIn` er `false`.",
        "Brug `if (!isLoggedIn) { return <main><p>Log ind for at fortsætte</p></main>; }` før det eksisterende `return`."
      ],
      checks: [
        {
          label: "Den korrekte besked vises, når brugeren ikke er logget ind",
          fail: "Når `isLoggedIn` er `false`, skal siden vise `Log ind for at fortsætte`.",
          test: (c) => c.text(c.$("main")) === "Log ind for at fortsætte",
        },
        {
          label: "Adgang kontrolleres med en if-betingelse",
          fail: "Brug `if (!isLoggedIn)` før det eksisterende return, og returnér beskeden `Log ind for at fortsætte` fra betingelsen.",
          test: (c) =>
            /if\s*\(\s*!\s*isLoggedIn\s*\)\s*\{[\s\S]*?return\s*\(?\s*<main>[\s\S]*?Log ind for at fortsætte[\s\S]*?<\/main>\s*\)?\s*;?[\s\S]*?\}/.test(c.code),
        },
        {
          label: "Den indloggede side er stadig til stede",
          fail: "Behold den eksisterende side med teksten `Du er logget ind`, som vises, når brugeren er logget ind.",
          test: (c) => /Du er logget ind/.test(c.code),
        },
      ],
    },
  ];

  global.COURSES["react-conditional"] = {
    id: "react-conditional",
    engine: "react",
    title: "React Lab",
    subtitle: "React Conditional Rendering",
    filename: "App.tsx",
    finishText:
      "Du har gennemført React Conditional rendering. Du har arbejdet med at vælge indhold ud fra betingelser, vise og skjule indhold og fejlfinde betinget JSX.",
    challenges,
  };
})(window);
