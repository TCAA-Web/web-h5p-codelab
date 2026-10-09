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

Hvert kursus gemmer sit eget forløb (kode, fremskridt, badges) i `sessionStorage`. Der er også en kursusvælger i topbaren.

## Struktur

```
index.html                    Siden
css/styles.css                Design (dark/light via CSS-variabler)
assets/kat.svg                Billede brugt i HTML-opgaverne
js/registry.js                Registre: window.COURSES og window.ENGINES
js/courses/html.js            HTML-kursus (opgaver, starterkode, hints, krav)
js/courses/typescript.js      TypeScript-kursus
js/engines/html.js            HTML-motor (preview + validering)
js/engines/html-syntax.js     HTML-syntaksanalyse
js/engines/html-validators.js DOM-baserede validatorer
js/engines/typescript.js      TypeScript-motor (typefejl, kørsel i Web Worker, validering)
js/storage.js                 Autosave i sessionStorage
js/achievements.js            Generiske badges + kursusspecifikke badges
js/app.js                     UI, editor, progression (fælles for alle kurser)
```

Der er intet build-trin – filerne kan hostes direkte.

## Udgivelse på GitHub Pages

1. Push mappen til et repository.
2. *Settings → Pages* → vælg branch og mappen med `index.html`.
3. Siden er nu tilgængelig på `https://<bruger>.github.io/<repo>/`.

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

### Nyt kursus

1. Opret `js/courses/<id>.js`, der sætter `window.COURSES.<id> = { id, engine, title, subtitle, filename, finishText, challenges, badges }`.
2. Tilføj et `<script>` til filen i `index.html` (efter motorerne).
3. Åbn `index.html?course=<id>`.

Et kursus i et nyt sprog kræver en ny motor i `js/engines/` (se `ENGINES.html` for interfacet: `init`, `analyze`, `preview`, `run`).
