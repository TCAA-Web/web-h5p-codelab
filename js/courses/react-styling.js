/*
 * Kursus: React Styling (6 opgaver).
 *
 * Motor: js/engines/react.js
 */

(function (global) {
  "use strict";

  const challenges = [
    {
      id: "styling-inline",
      title: "Ændre farven på teksten med en variabel",
      topic: "Styling",
      icon: "🔢",
      description:
        "Du kan inline style i React ved at bruge `style` attributten. Din opgave er at tilføje inline styling til overskriften så den får farven; `red` og font-størrelsen: `4rem`.\n\n" +
        "Inline styling i React kan skrives i et style objekt. Det vil sige at du skal skrive dine styles som key value pairs i et objekt og gemme det i en variabel der hedder `inlineStyle`.\n\n" +
        "Når du skriver styles direkte i React skal de skrives som camelCase; dvs. `fontSize`, istedet for `font-size`",
      starter: `function HeaderComponent() {

  return (
    <header>
      <h1>React is fun!</h1>
    </header>
  );
}

export default HeaderComponent;
`,
      hints: [
        "Style attributten tager kun imod objekter i key value pairs",
        "I React skrives styles som camelCase istedet for `-` imellem. Eks. `fontSize` istedet for `font-size`.",
        "Opret et style objekt inde i komponentet `HeaderComponent` og kald det: `inlineStyle`",
      ],
      checks: [
        {
          label: "Siden indeholder et style objekt ved navn `inlineStyle`",
          fail: "Style objektet skal hedde `inlineStyle`",
          test: (c) => /\b(?:const|let|var)\s+inlineStyle\s*=\s*\{/.test(c.code),
        },
        {
          label: "Style attributten findes på h1 elementet",
          fail: "Sæt en `style` attribut på h1 elementet",
          test: (c) => {
            const heading = c.$("h1");
            return !!heading && heading.hasAttribute("style");
          },
        },
        {
          label: "Overskriften har den ønskede farve og størrelse",
          fail: "Sæt farven til `red` og skriftstørrelsen til `4rem` i `inlineStyle`.",
          test: (c) => {
            const heading = c.$("h1");
            return !!heading && heading.style.color === "red" && heading.style.fontSize === "4rem";
          },
        },
      ],
    },

    {
      id: "styling-global-class",
      title: "Brug en klasse fra et almindeligt stylesheet",
      topic: "Styling",
      icon: "🎨",
      description:
        "Et almindeligt stylesheet importeres uden at gemme importen i en variabel. Klassenavnet skrives derefter som en tekststreng i `className`.\n\n" +
        "Importér `./styles.css`, og giv `<h1>` klassen `page-title`.",
      starter: `import "./styles.css";

function App() {
  return (
    <main>
      <h1>Min side</h1>
    </main>
  );
}
export default App;
`,
      hints: [
        "Et almindeligt stylesheet kan importeres med `import \"./styles.css\";`.",
        "I React hedder attributten `className` – ikke `class`.",
        "Sæt `className=\"page-title\"` på `<h1>`.",
      ],
      checks: [
        {
          label: "Det almindelige stylesheet importeres",
          fail: "Importér `./styles.css` uden at gemme importen i en variabel.",
          test: (c) => /import\s+["']\.\/styles\.css["']\s*;?/.test(c.code),
        },
        {
          label: "Overskriften bruger klassen page-title",
          fail: "Sæt `className=\"page-title\"` på `<h1>`.",
          test: (c) => c.attr(c.$("h1"), "class") === "page-title",
        },
      ],
    },

    {
      id: "styling-global-multiple-classes",
      title: "Brug flere klasser fra et stylesheet",
      topic: "Styling",
      icon: "🧩",
      description:
        "Et element kan bruge flere klasser fra et almindeligt stylesheet. Skriv klassenavnene som én streng med mellemrum imellem.\n\n" +
        "Importér `./buttons.css`, og giv knappen klasserne `button` og `primary`.",
      starter: `import "./buttons.css";

function App() {
  return (
    <main>
      <button>Gem</button>
    </main>
  );
}
export default App;
`,
      hints: [
        "Importér stylesheetet med `import \"./buttons.css\";`.",
        "Klasserne er en streng i `className`.",
        "Brug `className=\"button primary\"`.",
      ],
      checks: [
        {
          label: "Knappen bruger begge klasser",
          fail: "Sæt både `button` og `primary` i knappens `className`.",
          test: (c) => {
            const classes = (c.attr(c.$("button"), "class") || "").split(/\s+/);
            return classes.includes("button") && classes.includes("primary");
          },
        },
        {
          label: "Det almindelige stylesheet importeres",
          fail: "Importér `./buttons.css`.",
          test: (c) => /import\s+["']\.\/buttons\.css["']\s*;?/.test(c.code),
        },
      ],
    },

    {
      id: "styling-scss-module",
      title: "Brug en klasse fra et SCSS-modul",
      topic: "Styling",
      icon: "📦",
      description:
        "Et SCSS-modul importeres som et objekt. Brug en egenskab fra objektet i `className` i stedet for selv at skrive klassens tekst.\n\n" +
        "Importér `./Card.module.scss` som `styles`, og brug `styles.card` på `<article>`.",
      starter: `import styles from "./Card.module.scss";

function App() {
  return (
    <main>
      <article>
        <h2>Kort</h2>
      </article>
    </main>
  );
}
export default App;
`,
      hints: [
        "Importér modulet med `import styles from \"./Card.module.scss\";`.",
        "Brug klassen fra modulet som et JavaScript-udtryk i JSX.",
        "Skriv `className={styles.card}` på `<article>`.",
      ],
      checks: [
        {
          label: "SCSS-modulet importeres som styles",
          fail: "Importér `./Card.module.scss` som `styles`.",
          test: (c) => /import\s+styles\s+from\s+["']\.\/Card\.module\.scss["']\s*;?/.test(c.code),
        },
        {
          label: "Kortet bruger styles.card",
          fail: "Brug `className={styles.card}` på `<article>`.",
          test: (c) => {
            const card = c.$("article");
            return !!card && /^card__module$/.test(c.attr(card, "class"));
          },
        },
      ],
    },

    {
      id: "styling-scss-module-multiple",
      title: "Brug flere klasser fra et SCSS-modul",
      topic: "Styling",
      icon: "🪄",
      description:
        "Et SCSS-modul kan indeholde flere klasser. Sæt dem sammen i `className` med en template string.\n\n" +
        "Importér `./Button.module.scss` som `styles`, og brug både `styles.button` og `styles.primary` på knappen.",
      starter: `import styles from "./Button.module.scss";

function App() {
  return (
    <main>
      <button>Send</button>
    </main>
  );
}
export default App;
`,
      hints: [
        "Importér modulet som `styles`.",
        "Brug en template string til at sætte klassernes værdier sammen.",
        "Skriv `className={\`\${styles.button} \${styles.primary}\`}`.",
      ],
      checks: [
        {
          label: "Knappen bruger begge klasser fra modulet",
          fail: "Sæt både `styles.button` og `styles.primary` i knappens `className`.",
          test: (c) => {
            const classes = (c.attr(c.$("button"), "class") || "").split(/\s+/);
            return classes.includes("button__module") && classes.includes("primary__module");
          },
        },
        {
          label: "Klasserne hentes fra styles-objektet",
          fail: "Brug `styles.button` og `styles.primary` i knappens `className`.",
          test: (c) =>
            /className\s*=\s*\{\s*`[^`]*styles\.button[^`]*styles\.primary[^`]*`\s*\}/.test(c.code),
        },
      ],
    },

    {
      id: "styling-mix-global-and-module",
      title: "Kombinér global CSS og et SCSS-modul",
      topic: "Styling",
      icon: "🔗",
      description:
        "Du kan importere et almindeligt stylesheet og et SCSS-modul i samme komponent. Brug en tekststreng til den globale klasse og `styles`-objektet til modulklassen.\n\n" +
        "Importér `./layout.css` og `./Notice.module.scss`. Giv `<section>` den globale klasse `notice-area` og `<p>` modulklassen `message`.",
      starter: `import "./layout.css";
import styles from "./Notice.module.scss";

function App() {
  return (
    <main>
      <section>
        <p>Velkommen</p>
      </section>
    </main>
  );
}
export default App;
`,
      hints: [
        "Det globale stylesheet importeres uden en variabel.",
        "Importér modulet som `styles`.",
        "Brug `className=\"notice-area\"` på `<section>` og `className={styles.message}` på `<p>`.",
      ],
      checks: [
        {
          label: "Begge stylesheet-typer importeres",
          fail: "Importér både `./layout.css` og `./Notice.module.scss` som `styles`.",
          test: (c) =>
            /import\s+["']\.\/layout\.css["']\s*;?/.test(c.code) &&
            /import\s+styles\s+from\s+["']\.\/Notice\.module\.scss["']\s*;?/.test(c.code),
        },
        {
          label: "Den globale klasse og modulklassen bruges",
          fail: "Brug `notice-area` på `<section>` og `styles.message` på `<p>`.",
          test: (c) =>
            c.attr(c.$("section"), "class") === "notice-area" &&
            c.attr(c.$("p"), "class") === "message__module",
        },
      ],
    },
  ];

  global.COURSES["react-styling"] = {
    id: "react-styling",
    engine: "react",
    title: "React Lab",
    subtitle: "React Styling",
    filename: "App.tsx",
    finishText:
      "Du har gennemført React Styling. Du har arbejdet med inline styles, almindelige stylesheets og SCSS-moduler i React.",
    challenges,
  };
})(window);
