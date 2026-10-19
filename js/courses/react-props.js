/*
 * Kursus: React Props (5 opgaver).
 * Motor: js/engines/react.js
 */
(function (global) {
  "use strict";

  const challenges = [
    {
      id: "props-pass",
      title: "Send props til et komponent",
      topic: "Props",
      icon: "📦",
      description:
        "**Props** er input til et komponent – ligesom attributter på et HTML-tag. Du sender dem sådan: `<Hilsen navn=\"Sofie\" />`.\n\n" +
        "Komponentet `Hilsen` er allerede skrevet. Vis det to gange i `App`: først med navnet **Sofie**, derefter med navnet **Magnus**.",
      starter: `type HilsenProps = {
  navn: string;
};

function Hilsen({ navn }: HilsenProps) {
  return <p>Hej, {navn}!</p>;
}

function App() {
  return (
    <div>
      {/* Vis Hilsen to gange her */}
    </div>
  );
}

export default App;
`,
      hints: [
        "Props skrives som attributter: `<Hilsen navn=\"Sofie\" />`.",
        "Du skal bruge `<Hilsen />` to gange – én gang for hvert navn.",
        "Du skal ikke skrive `<p>` selv. Det gør `Hilsen`.",
      ],
      checks: [
        {
          label: "Siden viser \"Hej, Sofie!\" og \"Hej, Magnus!\"",
          fail: "Brug `<Hilsen navn=\"…\" />` to gange.",
          test: (c) => {
            const texts = c.texts(c.$$("p"));
            return texts.join("|") === "Hej, Sofie!|Hej, Magnus!" || `Siden viser: ${texts.join(" | ") || "ingenting"}.`;
          },
        },
        {
          label: "`Hilsen` bruges som komponent med `navn`-prop'en",
          fail: "Brug `<Hilsen navn=\"…\" />`.",
          test: (c) => (c.clean.match(/<Hilsen\s+navn\s*=/g) || []).length >= 2 || "Brug `<Hilsen navn=\"…\" />` to gange.",
        },
      ],
    },

    {
      id: "props-interface",
      title: "Definér props med et interface",
      topic: "Props + typer",
      icon: "🧾",
      description:
        "Props bør have en **type**. Det kan være en `type` eller et `interface`, som beskriver, hvilke props komponentet tager imod.\n\n" +
        "Komponentet `Profil` mangler typer (TypeScript klager over `any`). Lav interfacet `ProfilProps` med:\n" +
        "- `navn: string`\n" +
        "- `alder: number`\n" +
        "- `by` – en **valgfri** `string`\n\n" +
        "Brug det som type til `Profil`'s props.",
      starter: `// 1. Lav interfacet ProfilProps her

function Profil({ navn, alder, by }) {
  return (
    <div className="profil">
      <h2>{navn}</h2>
      <p>{alder} år</p>
      {by && <p>Bor i {by}</p>}
    </div>
  );
}

function App() {
  return (
    <div>
      <Profil navn="Sofie" alder={17} by="Aarhus" />
      <Profil navn="Magnus" alder={30} />
    </div>
  );
}

export default App;
`,
      hints: [
        "`interface ProfilProps { navn: string; … }`",
        "En valgfri prop har et spørgsmålstegn: `by?: string;`.",
        "Typen skrives efter de destrukturerede props: `function Profil({ navn, alder, by }: ProfilProps)`.",
      ],
      checks: [
        {
          label: "`interface ProfilProps` har `navn: string`, `alder: number` og `by?: string`",
          fail: "Lav interfacet `ProfilProps`.",
          test: (c) => {
            const m = /interface\s+ProfilProps\s*\{([^}]*)\}/.exec(c.clean);
            if (!m) return "Der er intet `interface ProfilProps { … }`.";
            if (!/\bnavn\s*:\s*string/.test(m[1])) return "Interfacet mangler `navn: string`.";
            if (!/\balder\s*:\s*number/.test(m[1])) return "Interfacet mangler `alder: number`.";
            return /\bby\s*\?\s*:\s*string/.test(m[1]) || "Interfacet mangler den valgfri prop `by?: string`.";
          },
        },
        {
          label: "`Profil` bruger `ProfilProps` som type til sine props",
          fail: "Skriv `: ProfilProps` efter de destrukturerede props.",
          test: (c) => c.has(/\}\s*:\s*ProfilProps\s*\)/) || "Brug `({ navn, alder, by }: ProfilProps)`.",
        },
        {
          label: "Begge profiler vises rigtigt (`by` vises kun, når den er sat)",
          fail: "Behold JSX'en i `Profil`.",
          test: (c) => {
            const profiles = c.$$(".profil");
            if (profiles.length !== 2) return `Der vises ${profiles.length} profiler – forventede 2.`;
            if (c.text(c.$("h2", profiles[0])) !== "Sofie" || !/Bor i Aarhus/.test(c.text(profiles[0]))) return "Første profil skal vise `Sofie` og `Bor i Aarhus`.";
            return (c.text(c.$("h2", profiles[1])) === "Magnus" && !/Bor i/.test(c.text(profiles[1]))) || "Anden profil skal vise `Magnus` uden by.";
          },
        },
      ],
    },

    {
      id: "props-errors",
      title: "Find fejlene: Forkerte props",
      topic: "Props + typer",
      icon: "🐞",
      description:
        "TypeScript hjælper dig med at bruge props rigtigt. I `App` er `Knap` brugt forkert **fire** steder. Læs fejlene i fanen **Typer & fejl**, og ret `App` – ikke typen.\n\n" +
        "Siden skal vise fire knapper:\n" +
        "- `Gem` – variant `primary`\n" +
        "- `Slet` – variant `secondary`\n" +
        "- `Annuller (3)` – variant `secondary` og `antal` er tallet 3\n" +
        "- `Ny` – variant `primary`",
      starter: `type KnapProps = {
  tekst: string;
  variant: "primary" | "secondary";
  antal?: number;
};

function Knap({ tekst, variant, antal }: KnapProps) {
  return (
    <button className={variant}>
      {tekst}
      {antal !== undefined && \` (\${antal})\`}
    </button>
  );
}

function App() {
  return (
    <div>
      <Knap tekts="Gem" variant="primary" />
      <Knap tekst="Slet" variant="danger" />
      <Knap tekst="Annuller" variant="secondary" antal="3" />
      <Knap variant="primary" />
    </div>
  );
}

export default App;
`,
      hints: [
        "Første knap: Der er en tastefejl i navnet på en prop.",
        "Anden knap: `variant` må kun være `\"primary\"` eller `\"secondary\"`.",
        "Tredje knap: `antal` er et tal, så skriv `antal={3}` (med tuborgklammer, uden anførselstegn).",
        "Fjerde knap: `tekst` er påkrævet.",
      ],
      checks: [
        {
          label: "Knapperne viser: Gem, Slet, Annuller (3) og Ny",
          fail: "Ret props på de fire knapper.",
          test: (c) => {
            const texts = c.texts(c.$$("button"));
            return texts.join("|") === "Gem|Slet|Annuller (3)|Ny" || `Knapperne viser: ${texts.join(" | ") || "ingenting"}.`;
          },
        },
        {
          label: "Varianterne er `primary`, `secondary`, `secondary` og `primary`",
          fail: "Ret `variant` på knapperne.",
          test: (c) => {
            const classes = c.$$("button").map((b) => b.className);
            return classes.join() === "primary,secondary,secondary,primary" || `Varianterne er: ${classes.join(", ")}.`;
          },
        },
        {
          label: "Typen `KnapProps` er ikke ændret eller gjort svagere",
          fail: "Ret `App` – ikke typen.",
          test: (c) =>
            (c.has(/variant\s*:\s*""\s*\|\s*""\s*;/) && c.has(/tekst\s*:\s*string\s*;/) && c.has(/antal\s*\?\s*:\s*number\s*;/) && !c.has(/\bany\b/)) ||
            "Du skal rette `App` og lade `KnapProps` stå uændret.",
        },
      ],
    },

    {
      id: "props-default",
      title: "Valgfrie props og standardværdier",
      topic: "Props + typer",
      icon: "🎚️",
      description:
        "En prop kan være **valgfri** (`farve?: …`) og have en **standardværdi**, som bruges, når den ikke sendes med: `{ farve = \"blaa\" }`.\n\n" +
        "Lige nu giver `<Badge tekst=\"Ny\" />` en fejl, fordi `farve` er påkrævet. Gør `farve` valgfri med standardværdien `\"blaa\"`.",
      starter: `type BadgeProps = {
  tekst: string;
  farve: "blaa" | "groen" | "roed";
};

function Badge({ tekst, farve }: BadgeProps) {
  return <span className={"badge " + farve}>{tekst}</span>;
}

function App() {
  return (
    <p>
      <Badge tekst="Ny" />
      <Badge tekst="Fuldført" farve="groen" />
    </p>
  );
}

export default App;
`,
      hints: [
        "Tilføj et spørgsmålstegn i typen: `farve?: …`.",
        "Standardværdien skrives, hvor props destruktureres: `{ tekst, farve = \"blaa\" }`.",
        "Den første badge skal få klassen `badge blaa`, og den anden `badge groen`.",
      ],
      checks: [
        {
          label: "`farve` er valgfri i typen (`farve?:`)",
          fail: "Skriv `farve?:` i `BadgeProps`.",
          test: (c) => c.has(/farve\s*\?\s*:/),
        },
        {
          label: "`farve` har standardværdien \"blaa\"",
          fail: "Skriv `farve = \"blaa\"` ved destruktureringen.",
          test: (c) => c.has(/farve\s*=\s*""/) || "Brug en standardværdi: `{ tekst, farve = \"blaa\" }`.",
        },
        {
          label: "Badgerne har klasserne `badge blaa` og `badge groen`",
          fail: "Første badge skal være blå, anden grøn.",
          test: (c) => {
            const classes = c.$$("span").map((s) => s.className);
            return classes.join("|") === "badge blaa|badge groen" || `Badgerne har klasserne: ${classes.join(" | ") || "ingen"}.`;
          },
        },
      ],
    },

    {
      id: "props-objects",
      title: "Props med lister og objekter",
      topic: "Props + typer",
      icon: "🛒",
      description:
        "Props kan også være arrays og objekter. Så skal typen beskrive dem.\n\n" +
        "1. Lav typen `Vare` med `navn: string` og `pris: number` (`type` eller `interface`)\n" +
        "2. Skriv komponentet `Varer`, der tager prop'en `varer: Vare[]` og viser en `<ul>` med ét `<li>` pr. vare. Teksten skal se sådan ud: `Mælk: 12 kr.`\n\n" +
        "`App` er allerede skrevet. Husk `key` på listeelementerne.",
      starter: `// 1. Lav typen Vare her

// 2. Skriv komponentet Varer her

function App() {
  const varer = [
    { navn: "Mælk", pris: 12 },
    { navn: "Brød", pris: 25 },
    { navn: "Æg", pris: 30 },
  ];

  return (
    <div>
      <h2>Indkøbsliste</h2>
      <Varer varer={varer} />
    </div>
  );
}

export default App;
`,
      hints: [
        "`type Vare = { navn: string; pris: number };`",
        "En liste af varer har typen `Vare[]`: `function Varer({ varer }: { varer: Vare[] })`.",
        "Brug `.map()` og `key`: `varer.map((vare) => <li key={vare.navn}>{vare.navn}: {vare.pris} kr.</li>)`.",
      ],
      checks: [
        {
          label: "`Vare` er en type med `navn: string` og `pris: number`",
          fail: "Lav typen `Vare`.",
          test: (c) => {
            const m = /(?:type\s+Vare\s*=|interface\s+Vare)\s*\{([^}]*)\}/.exec(c.clean);
            if (!m) return "Der er ingen type `Vare`.";
            return (/\bnavn\s*:\s*string/.test(m[1]) && /\bpris\s*:\s*number/.test(m[1])) || "`Vare` skal have `navn: string` og `pris: number`.";
          },
        },
        {
          label: "`Varer` tager `varer: Vare[]` som prop",
          fail: "Skriv `varer: Vare[]`.",
          test: (c) => c.has(/varer\s*:\s*(Vare\s*\[\s*\]|Array\s*<\s*Vare\s*>)/) || "Prop'en skal hedde `varer` og have typen `Vare[]`.",
        },
        {
          label: "Listen viser \"Mælk: 12 kr.\", \"Brød: 25 kr.\" og \"Æg: 30 kr.\"",
          fail: "Lav ét `<li>` pr. vare.",
          test: (c) => {
            const items = c.texts(c.$$("ul > li"));
            return items.join("|") === "Mælk: 12 kr.|Brød: 25 kr.|Æg: 30 kr." || `Listen viser: ${items.join(" | ") || "ingenting"}.`;
          },
        },
        {
          label: "`Varer` virker med andre data, og hvert element har en `key`",
          fail: "Brug `.map()` med `key`.",
          runtime: (t) => {
            const html = t.render("Varer", { varer: [{ navn: "Te", pris: 5 }] });
            if (t.text(html) !== "Te: 5 kr.") return `Varer gav teksten "${t.text(html)}" – forventede "Te: 5 kr.".`;
            return !t.logs.some((l) => /unique "key"/.test(l)) || "Hvert `<li>` skal have en unik `key`.";
          },
        },
      ],
    },
  ];

  global.COURSES["react-props"] = {
    id: "react-props",
    engine: "react",
    title: "React Lab",
    subtitle: "React Props",
    filename: "App.tsx",
    finishText: "Du har gennemført React Props. Du kan nu definere, sende og typebeskrive props!",
    challenges,
  };
})(window);
