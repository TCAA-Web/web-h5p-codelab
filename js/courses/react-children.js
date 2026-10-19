/*
 * Kursus: React Children (5 opgaver).
 * Motor: js/engines/react.js
 */
(function (global) {
  "use strict";

  const challenges = [
    {
      id: "children-render",
      title: "Vis children",
      topic: "children",
      icon: "👶",
      description:
        "Alt, du skriver **mellem** et komponents åbne- og lukketag, sendes til komponentet som prop'en `children`.\n\n" +
        "`Kort` bruges i `App` med en overskrift og et afsnit indeni – men `Kort` viser dem ikke endnu. Indsæt `{children}`, så indholdet vises inde i `<div className=\"kort\">`.",
      starter: `import type { ReactNode } from "react";

type KortProps = {
  children: ReactNode;
};

function Kort({ children }: KortProps) {
  return <div className="kort">{/* Vis children her */}</div>;
}

function App() {
  return (
    <Kort>
      <h2>Dagens opskrift</h2>
      <p>Pandekager med hindbærsyltetøj.</p>
    </Kort>
  );
}

export default App;
`,
      hints: [
        "`children` er allerede hentet ud af props. Du skal bare bruge den i JSX'en.",
        "Skriv `{children}` inde i `<div>`.",
        "Kommentaren `{/* … */}` kan erstattes af `{children}`.",
      ],
      checks: [
        {
          label: "Kortet viser overskriften \"Dagens opskrift\"",
          fail: "Vis `{children}` i `Kort`.",
          test: (c) => c.text(c.$(".kort h2")) === "Dagens opskrift" || "Der vises ingen `<h2>` med `Dagens opskrift` inde i `.kort`.",
        },
        {
          label: "Kortet viser afsnittet",
          fail: "Vis `{children}` i `Kort`.",
          test: (c) => c.text(c.$(".kort p")) === "Pandekager med hindbærsyltetøj." || "Der vises intet afsnit inde i `.kort`.",
        },
        {
          label: "`Kort` bruger `{children}`",
          fail: "Skriv `{children}` i JSX'en.",
          test: (c) => c.has(/\{\s*children\s*\}/),
        },
      ],
    },

    {
      id: "children-type",
      title: "Find fejlen: children mangler i typen",
      topic: "children + typer",
      icon: "🐞",
      description:
        "I TypeScript skal `children` med i komponentets prop-type, ellers får du en fejl. Typen for \"alt, React kan vise\" hedder `ReactNode`.\n\n" +
        "Ret koden, så `Boks` kan tage imod `children`. Husk at importere typen.",
      starter: `type BoksProps = {
  titel: string;
};

function Boks({ titel, children }: BoksProps) {
  return (
    <section className="boks">
      <h2>{titel}</h2>
      {children}
    </section>
  );
}

function App() {
  return (
    <Boks titel="Om mig">
      Jeg elsker React!
    </Boks>
  );
}

export default App;
`,
      hints: [
        "Tilføj `children: ReactNode;` til `BoksProps`.",
        "`ReactNode` skal importeres: `import type { ReactNode } from \"react\";` øverst i filen.",
        "Alternativ: `PropsWithChildren<BoksProps>` tilføjer `children` for dig.",
      ],
      checks: [
        {
          label: "`children` er med i typen (`ReactNode` eller `PropsWithChildren`)",
          fail: "Tilføj `children: ReactNode` til `BoksProps`.",
          test: (c) => c.has(/children\s*\??\s*:\s*(React\s*\.\s*)?ReactNode|PropsWithChildren/) || "Typen mangler `children: ReactNode`.",
        },
        {
          label: "Boksen viser titlen og indholdet",
          fail: "Boksen skal vise \"Om mig\" og \"Jeg elsker React!\".",
          test: (c) => {
            if (c.text(c.$(".boks h2")) !== "Om mig") return "`.boks` skal have en `<h2>` med `Om mig`.";
            return /Jeg elsker React!/.test(c.text(c.$(".boks"))) || "Indholdet `Jeg elsker React!` vises ikke i boksen.";
          },
        },
      ],
    },

    {
      id: "children-layout",
      title: "Layout-komponent med children",
      topic: "children",
      icon: "🧱",
      description:
        "Komponenter, der pakker andet indhold ind, kaldes **layout-komponenter**. Skriv komponentet `Sektion`, som har to props:\n\n" +
        "- `titel: string`\n" +
        "- `children: ReactNode`\n\n" +
        "Det skal returnere `<section><h2>{titel}</h2>{children}</section>`. `App` er allerede skrevet og bruger `Sektion` to gange.",
      starter: `import type { ReactNode } from "react";

// Skriv komponentet Sektion her

function App() {
  return (
    <main>
      <Sektion titel="Om mig">
        <p>Jeg læser React.</p>
      </Sektion>
      <Sektion titel="Mine hobbyer">
        <ul>
          <li>Programmering</li>
          <li>Musik</li>
        </ul>
      </Sektion>
    </main>
  );
}

export default App;
`,
      hints: [
        "Start med en type: `type SektionProps = { titel: string; children: ReactNode };`.",
        "`function Sektion({ titel, children }: SektionProps) { … }`",
        "Returnér `<section><h2>{titel}</h2>{children}</section>`.",
      ],
      checks: [
        {
          label: "Props har typerne `titel: string` og `children: ReactNode`",
          fail: "Definér typen til props.",
          test: (c) => (c.has(/titel\s*:\s*string/) && c.has(/children\s*:\s*ReactNode/)) || "Typen skal have `titel: string` og `children: ReactNode`.",
        },
        {
          label: "Siden viser to sektioner med den rigtige titel og det rigtige indhold",
          fail: "Skriv komponentet `Sektion`.",
          test: (c) => {
            const sections = c.$$("main > section");
            if (sections.length !== 2) return `Der vises ${sections.length} \`<section>\` – forventede 2.`;
            if (c.texts(sections.map((s) => c.$("h2", s))).join("|") !== "Om mig|Mine hobbyer") return "Sektionernes `<h2>` skal være `Om mig` og `Mine hobbyer`.";
            return (c.$("p", sections[0]) && c.$$("li", sections[1]).length === 2) || "Sektionerne viser ikke deres children.";
          },
        },
        {
          label: "`Sektion` returnerer præcis `<section><h2>titel</h2>children</section>`",
          fail: "Returnér `<section><h2>{titel}</h2>{children}</section>`.",
          runtime: (t) => {
            const html = t.render("Sektion", { titel: "Test" }, "Indhold").replace(/\s+/g, "");
            return html === "<section><h2>Test</h2>Indhold</section>" || `Sektion gav: ${html}`;
          },
        },
      ],
    },

    {
      id: "children-optional",
      title: "Valgfri children og standardindhold",
      topic: "children",
      icon: "🎛️",
      description:
        "Nogle komponenter kan bruges både med og uden `children`. Så skal `children` være **valgfri**: `children?: ReactNode`.\n\n" +
        "Lige nu giver `<Boks />` uden indhold en typefejl. Gør `children` valgfri, og vis `<p>Intet indhold</p>`, når der ikke er nogen children.",
      starter: `import type { ReactNode } from "react";

type BoksProps = {
  children: ReactNode;
};

function Boks({ children }: BoksProps) {
  return <div className="boks">{children}</div>;
}

function App() {
  return (
    <div>
      <Boks>Her er noget indhold</Boks>
      <Boks />
    </div>
  );
}

export default App;
`,
      hints: [
        "Et spørgsmålstegn gør en prop valgfri: `children?: ReactNode`.",
        "Hvis `children` ikke er sendt med, er den `undefined`.",
        "`{children ?? <p>Intet indhold</p>}` viser `children`, hvis den findes, ellers afsnittet.",
      ],
      checks: [
        {
          label: "`children` er valgfri i typen (`children?: ReactNode`)",
          fail: "Skriv `children?: ReactNode`.",
          test: (c) => c.has(/children\s*\?\s*:/),
        },
        {
          label: "Den første boks viser sit indhold",
          fail: "Behold `{children}`.",
          test: (c) => c.text(c.$$(".boks")[0]) === "Her er noget indhold" || "Første boks skal vise `Her er noget indhold`.",
        },
        {
          label: "Den anden boks viser `<p>Intet indhold</p>`",
          fail: "Vis standardindhold, når der ingen children er.",
          test: (c) => c.text(c.$("p", c.$$(".boks")[1])) === "Intet indhold" || "Anden boks skal vise `<p>Intet indhold</p>`.",
        },
      ],
    },

    {
      id: "children-nesting",
      title: "Find fejlene: Lukketags og nesting",
      topic: "children",
      icon: "🐞",
      description:
        "Når komponenter bruges inden i hinanden, er det vigtigt at åbne og lukke dem rigtigt. Her er `Side` og `Kort` sat forkert sammen, så `<h2>` og `<p>` ikke bliver børn af `Kort`.\n\n" +
        "Ret koden, så siden viser `.side` med et `.kort` indeni, og at kortet indeholder overskriften og afsnittet.",
      starter: `import type { ReactNode } from "react";

function Side({ children }: { children: ReactNode }) {
  return <div className="side">{children}</div>;
}

function Kort({ children }: { children: ReactNode }) {
  return <article className="kort">{children}</article>;
}

function App() {
  return (
    <Side>
      <Kort />
        <h2>Titel</h2>
        <p>Tekst</p>
      </Kort>
    </Side>
  );
}

export default App;
`,
      hints: [
        "`<Kort />` er et selv-lukkende tag. Det har ingen children.",
        "Skriv `<Kort>` i stedet, så det passer til `</Kort>` længere nede.",
        "Hver åbne-tag skal have præcis ét lukketag med samme navn.",
      ],
      checks: [
        {
          label: "`.kort` ligger inde i `.side`",
          fail: "Ret `<Kort />` til `<Kort>`.",
          test: (c) => !!c.$(".side > .kort") || "`.kort` skal ligge direkte inde i `.side`.",
        },
        {
          label: "`.kort` indeholder `<h2>Titel</h2>` og `<p>Tekst</p>`",
          fail: "Indholdet skal være children til `Kort`.",
          test: (c) => (c.text(c.$(".kort > h2")) === "Titel" && c.text(c.$(".kort > p")) === "Tekst") || "`<h2>Titel</h2>` og `<p>Tekst</p>` skal ligge inde i `.kort`.",
        },
        {
          label: "`<Kort />` er ikke selv-lukkende",
          fail: "Brug `<Kort>` … `</Kort>`.",
          test: (c) => !c.has(/<Kort\s*\/>/),
        },
      ],
    },
  ];

  global.COURSES["react-children"] = {
    id: "react-children",
    engine: "react",
    title: "React Lab",
    subtitle: "React Children",
    filename: "App.tsx",
    finishText: "Du har gennemført React Children. Nu forstår du, hvordan komponenter kan pakke indhold ind!",
    challenges,
  };
})(window);
