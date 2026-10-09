/*
 * Kursus: TypeScript for begyndere.
 * Motor: js/engines/typescript.js (se kommentaren øverst i den fil om `test` og `runtime`).
 *
 * Et krav er enten
 *   - statisk:  test: (c) => ...        c.code, c.clean (uden kommentarer/strenge), c.logs, c.has(regex), c.errors
 *   - kørende:  runtime: (get, logs) => ...   get("funktionsnavn") henter fra elevens kode
 * Begge returnerer true (ok), false (brug `fail`) eller en streng (specifik fejlbesked).
 * `runtime`-funktioner sendes som tekst til en Web Worker – brug kun `get`, `logs` og egne variabler.
 */
(function (global) {
  "use strict";

  const challenges = [
    {
      id: "typer",
      title: "Grundlæggende typer",
      topic: "Typer",
      icon: "🏷️",
      description:
        "TypeScript er JavaScript med typer. En type fortæller, hvilken slags værdi en variabel må indeholde, fx `string`, `number` eller `boolean`.\n\n" +
        "Koden herunder har to **typefejl**. Ret **værdierne**, så de passer til typerne (lad typerne stå). `alder` skal være `17`, og `erStuderende` skal være `true`.\n\n" +
        "Se fanen **Typer & fejl** eller de røde streger i editoren.",
      starter: `let navn: string = "Sofie";
let alder: number = "sytten";
let erStuderende: boolean = "ja";

console.log(\`\${navn} er \${alder} år gammel\`);
`,
      hints: [
        "En `number` skrives uden anførselstegn: `17`.",
        "En `boolean` er enten `true` eller `false` – uden anførselstegn.",
        "Konsollen skal skrive: `Sofie er 17 år gammel`.",
      ],
      checks: [
        {
          label: "Typerne `string`, `number` og `boolean` er bevaret",
          fail: "Ret værdierne – ikke typerne.",
          test: (c) =>
            (c.has(/let\s+navn\s*:\s*string/) && c.has(/let\s+alder\s*:\s*number/) && c.has(/let\s+erStuderende\s*:\s*boolean/)) ||
            "Typeannotationerne `: string`, `: number` og `: boolean` skal blive stående.",
        },
        {
          label: "`alder` er 17 og `erStuderende` er `true`",
          fail: "Sæt `alder` til 17 og `erStuderende` til true.",
          runtime: (get) => {
            if (get("alder") !== 17) return "`alder` skal være tallet 17.";
            return get("erStuderende") === true || "`erStuderende` skal være `true`.";
          },
        },
        {
          label: "Konsollen skriver \"Sofie er 17 år gammel\"",
          fail: "Behold `console.log`-linjen.",
          test: (c) => c.logs.includes("Sofie er 17 år gammel") || `Konsollen skrev: ${JSON.stringify(c.logs)}`,
        },
      ],
    },

    {
      id: "funktioner",
      title: "Funktioner med typer",
      topic: "Funktioner",
      icon: "⚙️",
      description:
        "Funktioner bør have typer på både **parametre** og **returværdi**. Så fanger TypeScript fejl, før koden kører.\n\n" +
        "Funktionen `laegSammen` mangler typer. Tilføj dem, så begge parametre og returværdien er `number`. Undgå `any`.",
      starter: `function laegSammen(a, b) {
  return a + b;
}

console.log(laegSammen(2, 3));
`,
      hints: [
        "Typen på en parameter skrives efter navnet: `a: number`.",
        "Returtypen skrives efter parameterlisten: `function f(a: number): number { … }`.",
        "Det færdige hoved ser sådan ud: `function laegSammen(a: number, b: number): number`.",
      ],
      checks: [
        {
          label: "Parametrene og returværdien har typen `number`",
          fail: "Skriv `function laegSammen(a: number, b: number): number`.",
          test: (c) => c.has(/function\s+laegSammen\s*\(\s*a\s*:\s*number\s*,\s*b\s*:\s*number\s*\)\s*:\s*number/),
        },
        {
          label: "`any` bruges ikke",
          fail: "Fjern `any`.",
          test: (c) => !c.has(/:\s*any\b|<any>|\bas\s+any\b/),
        },
        {
          label: "`laegSammen(2, 3)` giver 5, og `laegSammen(10, -4)` giver 6",
          fail: "Funktionen giver ikke de rigtige svar.",
          runtime: (get) => {
            const f = get("laegSammen");
            if (f(2, 3) !== 5) return `laegSammen(2, 3) gav ${f(2, 3)} – forventede 5.`;
            return f(10, -4) === 6 || `laegSammen(10, -4) gav ${f(10, -4)} – forventede 6.`;
          },
        },
      ],
    },

    {
      id: "arrays",
      title: "Arrays og gennemsnit",
      topic: "Arrays",
      icon: "📚",
      description:
        "En liste af tal har typen `number[]`. Skriv funktionen `gennemsnit`, der tager en liste af tal og returnerer gennemsnittet.\n\n" +
        "- `gennemsnit([2, 4, 6])` skal give `4`\n" +
        "- En **tom** liste skal give `0` (ikke `NaN`)\n" +
        "- Parameteren hedder `tal`, og både parameter og returværdi skal have typer.",
      starter: `function gennemsnit(tal) {
  // din kode her
}

console.log(gennemsnit([2, 4, 6]));
`,
      hints: [
        "Typen skrives sådan: `tal: number[]`.",
        "Summen kan findes med `tal.reduce((sum, x) => sum + x, 0)`.",
        "Tjek først `if (tal.length === 0) return 0;`.",
      ],
      checks: [
        {
          label: "`tal` har typen `number[]` og returtypen er `number`",
          fail: "Skriv `function gennemsnit(tal: number[]): number`.",
          test: (c) => c.has(/function\s+gennemsnit\s*\(\s*tal\s*:\s*(number\s*\[\s*\]|Array\s*<\s*number\s*>)\s*\)\s*:\s*number/),
        },
        {
          label: "Gennemsnittet beregnes rigtigt",
          fail: "Funktionen giver ikke de rigtige svar.",
          runtime: (get) => {
            const f = get("gennemsnit");
            const cases = [[[2, 4, 6], 4], [[5], 5], [[1, 2], 1.5], [[10, 20, 30, 40], 25]];
            for (const [input, expected] of cases) {
              const actual = f(input);
              if (actual !== expected) return `gennemsnit([${input}]) gav ${actual} – forventede ${expected}.`;
            }
            return true;
          },
        },
        {
          label: "En tom liste giver 0",
          fail: "Håndtér den tomme liste.",
          runtime: (get) => get("gennemsnit")([]) === 0 || `gennemsnit([]) gav ${get("gennemsnit")([])} – forventede 0.`,
        },
      ],
    },

    {
      id: "interfaces",
      title: "Interfaces",
      topic: "Objekter",
      icon: "🧩",
      description:
        "Et **interface** beskriver, hvordan et objekt ser ud.\n\n" +
        "1. Lav et interface `Bruger` med `navn` (string), `alder` (number) og en **valgfri** `email` (string).\n" +
        "2. Skriv funktionen `hilsen(bruger: Bruger): string`, der returnerer teksten `Hej Sofie (17)` – altså `Hej <navn> (<alder>)`.",
      starter: `// 1. Lav interfacet Bruger her

// 2. Skriv funktionen hilsen her

const sofie = { navn: "Sofie", alder: 17 };
console.log(hilsen(sofie));
`,
      hints: [
        "`interface Bruger { navn: string; … }`",
        "Et valgfrit felt har et spørgsmålstegn: `email?: string;`.",
        "Brug en skabelonstreng: `Hej ${bruger.navn} (${bruger.alder})`.",
      ],
      checks: [
        {
          label: "`interface Bruger` har `navn: string`, `alder: number` og `email?: string`",
          fail: "Lav interfacet `Bruger` med de tre felter.",
          test: (c) => {
            const m = /interface\s+Bruger\s*\{([^}]*)\}/.exec(c.clean);
            if (!m) return "Der er intet `interface Bruger { … }`.";
            const body = m[1];
            if (!/\bnavn\s*:\s*string/.test(body)) return "Interfacet mangler `navn: string`.";
            if (!/\balder\s*:\s*number/.test(body)) return "Interfacet mangler `alder: number`.";
            return /\bemail\s*\?\s*:\s*string/.test(body) || "Interfacet mangler det valgfrie felt `email?: string`.";
          },
        },
        {
          label: "`hilsen` tager en `Bruger` og returnerer en `string`",
          fail: "Skriv `function hilsen(bruger: Bruger): string`.",
          test: (c) => c.has(/function\s+hilsen\s*\(\s*\w+\s*:\s*Bruger\s*\)\s*:\s*string/),
        },
        {
          label: "`hilsen` returnerer den rigtige tekst",
          fail: "Funktionen giver ikke de rigtige svar.",
          runtime: (get) => {
            const f = get("hilsen");
            const a = f({ navn: "Sofie", alder: 17 });
            if (a !== "Hej Sofie (17)") return `hilsen({ navn: "Sofie", alder: 17 }) gav ${JSON.stringify(a)} – forventede "Hej Sofie (17)".`;
            const b = f({ navn: "Magnus", alder: 30, email: "m@example.dk" });
            return b === "Hej Magnus (30)" || `hilsen med email gav ${JSON.stringify(b)} – forventede "Hej Magnus (30)".`;
          },
        },
      ],
    },

    {
      id: "union",
      title: "Union types og narrowing",
      topic: "Union types",
      icon: "🔀",
      description:
        "En **union type** tillader flere typer: `string | number`. For at bruge værdien skal du først finde ud af, hvilken type den har. Det kaldes **narrowing** og gøres med `typeof`.\n\n" +
        "Skriv `formater(vaerdi: string | number): string`:\n" +
        "- en **string** returneres med store bogstaver (`\"hej\"` → `\"HEJ\"`)\n" +
        "- et **number** returneres med to decimaler (`3.14159` → `\"3.14\"`)",
      starter: `function formater(vaerdi) {
  // din kode her
}

console.log(formater("hej"));
console.log(formater(3.14159));
`,
      hints: [
        "Parameteren skal have typen `string | number`, og returtypen er `string`.",
        "`if (typeof vaerdi === \"string\") { … }` – inde i blokken ved TypeScript, at `vaerdi` er en string.",
        "Tal kan formateres med `vaerdi.toFixed(2)`, og tekst med `vaerdi.toUpperCase()`.",
      ],
      checks: [
        {
          label: "`vaerdi` har typen `string | number`, og returtypen er `string`",
          fail: "Skriv `function formater(vaerdi: string | number): string`.",
          test: (c) => c.has(/function\s+formater\s*\(\s*vaerdi\s*:\s*(string\s*\|\s*number|number\s*\|\s*string)\s*\)\s*:\s*string/),
        },
        {
          label: "Funktionen bruger `typeof` til at afgøre typen",
          fail: "Brug `typeof vaerdi === \"string\"`.",
          test: (c) => c.has(/typeof\s+vaerdi/),
        },
        {
          label: "Tekst bliver til store bogstaver",
          fail: "formater(\"hej\") skal give \"HEJ\".",
          runtime: (get) => {
            const r = get("formater")("hej");
            return r === "HEJ" || `formater("hej") gav ${JSON.stringify(r)} – forventede "HEJ".`;
          },
        },
        {
          label: "Tal får to decimaler",
          fail: "formater(3.14159) skal give \"3.14\".",
          runtime: (get) => {
            const f = get("formater");
            if (f(3.14159) !== "3.14") return `formater(3.14159) gav ${JSON.stringify(f(3.14159))} – forventede "3.14".`;
            return f(2) === "2.00" || `formater(2) gav ${JSON.stringify(f(2))} – forventede "2.00".`;
          },
        },
      ],
    },

    {
      id: "generics",
      title: "Generics",
      topic: "Generics",
      icon: "🧬",
      description:
        "Med **generics** kan en funktion virke på mange typer og stadig være typesikker. `T` er en pladsholder for en type, som TypeScript finder ud af.\n\n" +
        "Skriv `foerste<T>(liste: T[]): T | undefined`, der returnerer det første element i listen – eller `undefined`, hvis listen er tom.\n\n" +
        "Bemærk, hvordan `tal` og `ord` får forskellige typer, når du holder musen over dem.",
      starter: `function foerste(liste) {
  // din kode her
}

const tal = foerste([10, 20, 30]);
const ord = foerste(["a", "b"]);
console.log(tal, ord);
`,
      hints: [
        "Typeparameteren skrives lige efter funktionsnavnet: `function foerste<T>(…)`.",
        "Listen har typen `T[]`, og returtypen er `T | undefined`.",
        "`return liste[0];` returnerer `undefined` på en tom liste – men kun hvis returtypen tillader det.",
      ],
      checks: [
        {
          label: "Funktionen er generisk: `foerste<T>(liste: T[]): T | undefined`",
          fail: "Skriv `function foerste<T>(liste: T[]): T | undefined`.",
          test: (c) => c.has(/function\s+foerste\s*<\s*T\s*>\s*\(\s*liste\s*:\s*T\s*\[\s*\]\s*\)\s*:\s*T\s*\|\s*undefined/),
        },
        {
          label: "`foerste` virker på tal og tekst",
          fail: "Funktionen giver ikke de rigtige svar.",
          runtime: (get) => {
            const f = get("foerste");
            if (f([1, 2, 3]) !== 1) return `foerste([1, 2, 3]) gav ${f([1, 2, 3])} – forventede 1.`;
            return f(["a", "b"]) === "a" || `foerste(["a", "b"]) gav ${JSON.stringify(f(["a", "b"]))} – forventede "a".`;
          },
        },
        {
          label: "En tom liste giver `undefined`",
          fail: "foerste([]) skal give undefined.",
          runtime: (get) => get("foerste")([]) === undefined || "`foerste([])` skal give `undefined`.",
        },
        {
          label: "Konsollen skriver \"10 a\"",
          fail: "Behold `console.log(tal, ord)`.",
          test: (c) => c.logs.includes("10 a") || `Konsollen skrev: ${JSON.stringify(c.logs)}`,
        },
      ],
    },
  ];

  global.COURSES.typescript = {
    id: "typescript",
    engine: "typescript",
    title: "TypeScript Lab",
    subtitle: "TypeScript for begyndere",
    filename: "main.ts",
    finishText: "Du har gennemført alle udfordringerne i begynder-TypeScript. Rigtig flot arbejde!",
    challenges,
    badges: [
      { id: "types", icon: "🏷️", title: "Typedetektiv", desc: "Ret dine første typefejl.", test: (s) => !!s.solved.typer },
      { id: "interface", icon: "🧩", title: "Interface-arkitekt", desc: "Beskriv et objekt med et interface.", test: (s) => !!s.solved.interfaces },
      { id: "generic", icon: "🧬", title: "Generisk geni", desc: "Skriv din første generiske funktion.", test: (s) => !!s.solved.generics },
    ],
  };
})(window);
