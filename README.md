# HTML Coding Lab

Interaktivt læringsmodul i begynder-HTML. Designet til at blive hostet på **GitHub Pages** og indlejret i Moodle via H5P's *Iframe Embedder*.

## Funktioner

- Monaco Editor (med automatisk reserveløsning til en almindelig textarea, hvis CDN'en er blokeret)
- 9 udfordringer i begynder-HTML (grundstruktur → tekst → links/billeder → lister → fejlretning → semantik → konvertering → formularer → afsluttende projekt)
- DOM-baserede validatorer med detaljeret feedback pr. krav
- Syntaksanalyse (ulukkede/forkert nestede tags, ukendte tags og attributter, tastefejl som `scr` → `src`, dublerede attributter m.m.) med markeringer direkte i editoren
- Live preview (sandboxed iframe)
- Synlig progressionsbar og trin-navigation (næste udfordring låses op, når den forrige er løst)
- Hints og achievements/badges
- Autosave af hele forløbet i `sessionStorage` (kode, fremskridt, hints, badges, tema)
- Dark/light mode (følger som standard systemets indstilling)

## Kurser

Samme UI bruges til flere kurser. Kurset vælges med en URL-parameter, så hver H5P-indlejring kan pege på sit eget kursus:

| Kursus | URL |
|---|---|
| HTML for begyndere (standard) | `index.html` eller `index.html?course=html` |
| TypeScript for begyndere | `index.html?course=typescript` |
| React Intro (`App.tsx`) | `index.html?course=react-intro` |
| React Components | `index.html?course=react-components` |
| React Children | `index.html?course=react-children` |
| React Props | `index.html?course=react-props` |

Hvert kursus gemmer sit eget forløb (kode, fremskridt, badges) i `sessionStorage`. Der er også en kursusvælger i topbaren.

## Struktur

```
index.html                    Siden
css/styles.css                Design (dark/light via CSS-variabler)
assets/kat.svg                Billede brugt i HTML-opgaverne
js/registry.js                Registre: window.COURSES og window.ENGINES
js/courses/html.js            HTML-kursus (opgaver, starterkode, hints, krav)
js/courses/typescript.js      TypeScript-kursus
js/courses/react-*.js         React-kurser (intro, components, children, props)
js/engines/html.js            HTML-motor (preview + validering)
js/engines/html-syntax.js     HTML-syntaksanalyse
js/engines/html-validators.js DOM-baserede validatorer
js/engines/ts-core.js         Fælles TypeScript-hjælpere (typefejl, JS-udskrift, worker-kørsel)
js/engines/typescript.js      TypeScript-motor (typefejl, kørsel i Web Worker, validering)
js/engines/react.js           React/TSX-motor (typefejl, visning med react-dom/server, validering)
js/engines/react-types/       Forenklede React-typer (index.d.ts, jsx-runtime.d.ts)
js/storage.js                 Autosave i sessionStorage
js/achievements.js            Generiske badges + kursusspecifikke badges
js/app.js                     UI, editor, progression (fælles for alle kurser)
```

Der er intet build-trin – filerne kan hostes direkte.

## Udgivelse på GitHub Pages

1. Push mappen til et repository.
2. *Settings → Pages* → vælg branch og mappen med `index.html`.
3. Siden er nu tilgængelig på `https://<bruger>.github.io/<repo>/`.

GitHub Pages lader browsere cache filer i 10 minutter. Derfor har alle `<script>`- og `<link>`-tags i `index.html` et versionsnummer (`?v=0.4`). **Skift versionsnummeret, hver gang du udgiver en ny version**, så en cachet fil aldrig blandes med en ny `index.html`. Efter en udgivelse kan det tage et par minutter, før siden er opdateret.

## Indlejring i Moodle (H5P)

Brug indholdstypen **Iframe Embedder** med GitHub Pages-URL'en. Sæt en højde på mindst **800 px** (layoutet fylder hele iframen; under 1000 px bredde stables panelerne).

> `sessionStorage` bevares, så længe fanen er åben (også ved genindlæsning). Lukkes fanen, starter forløbet forfra.

## Tilføj eller ret en udfordring

Rediger kursusfilen i `js/courses/`. Hver udfordring har `id`, `title`, `topic`, `icon`, `description`, `starter`, `hints` og en liste af `checks`. Tekst understøtter `` `kode` `` og `**fed**`. Et krav har altid `label` og `fail` (standardfejlbesked) og returnerer `true` (ok), `false` (brug `fail`) eller en streng (specifik fejlbesked).

### HTML (`js/courses/html.js`)

```js
{
  label: "Linket peger på MDN",
  fail: "Lav et <a href=\"…\">.",
  test: (c) => c.$("a[href^='https://']") ? true : "Specifik fejlbesked",
}
```

`c` har bl.a. `c.$`, `c.$$` (querySelector), `c.text(el)`, `c.attr(el, navn)`, `c.sourceTags(navn)` og `c.syntax`.

### TypeScript (`js/courses/typescript.js`)

Et krav er enten **statisk** eller **kørende**:

```js
// Statisk: ser på koden, typefejl og konsol-output
{ label: "Bruger number", fail: "…", test: (c) => c.has(/a\s*:\s*number/) }

// Kørende: køres i en Web Worker og kan kalde elevens funktioner
{ label: "laegSammen(2, 3) giver 5", fail: "…",
  runtime: (get, logs) => get("laegSammen")(2, 3) === 5 || "Forkert svar" }
```

`c` har `c.code`, `c.clean` (uden kommentarer og strenge), `c.logs` (console.log-output), `c.errors` (typefejl), `c.has(regex)`. `runtime`-funktioner sendes som tekst til workeren – brug **kun** `get`, `logs` og egne variabler, og skriv dem som pilefunktioner. Koden køres med `strict: true`; ændr det med `compilerOptions` i kursusobjektet.

### React (`js/courses/react-*.js`)

Elevens kode er en `App.tsx`. Komponenten (`export default`, `App` eller `entry`) vises med `react-dom/server` i en Web Worker og tjekkes som HTML. Kurset kan derfor vise komponenter, JSX, props og children – men ikke events eller tilstand efter første render.

```js
// Statisk: DOM-baseret tjek af det viste resultat og af koden
{ label: "Listen viser tre frugter", fail: "…",
  test: (c) => c.texts(c.$$("ul > li")).join("|") === "Æble|Banan|Kirsebær" || "Forkert liste" }

// Kørende: render et komponent med andre props, inde i workeren
{ label: "Sektion viser sine children", fail: "…",
  runtime: (t) => t.text(t.render("Sektion", { titel: "A" }, "B")) === "AB" }
```

`c` har `c.$`, `c.$$`, `c.text(el)`, `c.texts(els)`, `c.root`, `c.html`, `c.code`, `c.clean`, `c.has(regex)`, `c.errors`, `c.logs` og `c.warnings` (React-advarsler, fx manglende `key`). `t` har `t.render(navn, props, ...children)`, `t.text(html)`, `t.get(navn)`, `t.h` (createElement) og `t.logs`. En opgave kan sætte `entry: "Navn"` og `entryProps: {…}` for at vise et andet komponent end `App`.

Kurset kræver adgang til cdnjs (Monaco og React hentes derfra). Typerne i `js/engines/react-types/` er forenklede – tilføj flere HTML-tags eller hooks der, hvis dine opgaver har brug for dem.

### Nyt kursus

1. Opret `js/courses/<id>.js`, der sætter `window.COURSES.<id> = { id, engine, title, subtitle, filename, finishText, challenges, badges }`. `engine` er `html`, `typescript` eller `react`.
2. Tilføj et `<script>` til filen i `index.html` (efter motorerne).
3. Åbn `index.html?course=<id>`.

Et kursus i et nyt sprog kræver en ny motor i `js/engines/` (se `ENGINES.html` for interfacet: `init`, `analyze`, `preview`, `run`).
