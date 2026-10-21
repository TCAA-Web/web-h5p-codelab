/*
 * Kursus: React Assets (5 opgaver).
 * Motor: js/engines/react.js
 */
(function (global) {
  "use strict";

  const challenges = [
    {
      id: "assets-import",
      title: "Importer billedet",
      topic: "assets",
      icon: "🖼️",
      description:
        "Når du skal indsætte et billede i React (Vite) importerer man billedet først med import keywordet.\n\n" +
        "Importer billedet under navnet `mouse` og indsæt det i et `<img>` tag, som du placerer inde i `<article>` tagget. \n\n" +
        "Billedet ligger i mappen `assets`, så stien du skal importere fra er `./assets/mouse.jpg`.",
      starter: `import type { ReactNode } from "react";

function App() {
  return (
    <article>
    </article>
  );
}

export default App;
`,
      hints: [
        "Tilføj et img tag inde i article. Tilføj herefter `src` til dit img tag.",
        "Importer billedet med `import mouse from './assets/mouse.jpg'`",
        "Skriv i dit img tag: src={mouse}",
      ],
      checks: [
        {
          label: "Img tagget findes inde i article tagget",
          fail: "Placer dit img tag mellem de to article tags",
          test: (c) => (c.$("body > article > img") ? true : "Der skal være en `<article>`, som indeholder et `<img>`."),

        },
        {
          label: "Img tagget har den korrekte src",
          fail: "Sørg for at img taggets src peger på billedet",
          test: (c) => /\/assets\/mouse\.jpg$/.test(c.attr(c.$("img"), "src")) || "`<img>` skal have `src={mouse}`, hvor `mouse` er importeret fra `./assets/mouse.jpg`.",
        },
        {
          label: "Billedet er importeret under navnet `mouse`",
          fail: "Du skal importere billedet i toppen af koden med keywordet `import`",
          test: (c) => /import mouse from ['"]\.\/assets\/mouse\.jpg['"]/.test(c.code)
        }
      ],
    },
{
      id: "assets-video",
      title: "Importer en video",
      topic: "assets",
      icon: "🖼️",
      description:
        "Når du skal indsætte en video i React (Vite) fungerer det meget på samme måde som før.\n\n" +
        "Importer videoen under navnet `skyline` og indsæt det i et `<source>` tag, som du placerer inde i et nyt `<video>` tag. \n\n" +
        "Begge tags skal skrives inde i `div` tagget. \n\n "+
        "Til sidst skal du tilføje `controls` til dit `video` tag, så videon kan afspilles. \n\n" +
        "Videoen ligger i mappen `assets`, så stien du skal importere fra er `./assets/skyline.mp4`.",
      starter: `import type { ReactNode } from "react";

function App() {
  return (
    <div>
    </div>
  );
}

export default App;
`,
      hints: [
        "Tilføj et nyt `video` tag inde i `div` tagget. Tilføj herefter et `source` tag til dit video tag.",
        "Importer videoen med `import skyline from './assets/skyline.mp4'`",
        "Skriv i dit source tag: `src={skyline}`",
      ],
      checks: [
        {
          label: "Video tagget findes inde i source tagget",
          fail: "Placer dit video tag mellem de to div tags",
          test: (c) => (c.$("body > div > video > source") ? true : "Der skal være en `<div>`, som indeholder et `<video>`, med et `<source>` tag indeni."),

        },
        {
          label: "Source tagget har den korrekte src",
          fail: "Sørg for at source taggets src peger på videoen",
          test: (c) => /\/assets\/skyline\.mp4$/.test(c.attr(c.$("source"), "src")) || "`<source>` skal have `src={skyline}`, hvor `skyline` er importeret fra `./assets/skyline.mp4`.",
        },
        {
          label: "Videoen er importeret under navnet `skyline`",
          fail: "Du skal importere videoen i toppen af koden med keywordet `import`",
          test: (c) => /import skyline from ['"]\.\/assets\/skyline\.mp4['"]/.test(c.code)
        },
        {
          label: "Videon kan afspilles ved at tilføje controls",
          fail: "Du skal tilføje `controls` på dit `video` tag",
          test: (c) =>
          {
            const videoEl = c.$("video")
            return (videoEl && videoEl.hasAttribute('controls')) || "Der er ingen controls på dit `video` tag"
          }
        }
      ],
    },
    /* {
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
    }, */
  ];

  global.COURSES["react-assets"] = {
    id: "react-assets",
    engine: "react",
    title: "React Lab",
    subtitle: "React Assets",
    filename: "App.tsx",
    finishText: "Du har gennemført React Assets. Nu forstår du, hvordan man kan importere assets i React!",
    challenges,
  };
})(window);
