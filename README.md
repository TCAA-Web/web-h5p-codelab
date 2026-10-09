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

## Struktur

```
index.html          Siden
css/styles.css      Design (dark/light via CSS-variabler)
assets/kat.svg      Billede brugt i opgaverne
js/syntax.js        Syntaksanalyse (HTMLSyntax.analyze)
js/validators.js    Validator-motor + genbrugelige regler
js/challenges.js    De 9 udfordringer (tekst, starterkode, hints, krav)
js/storage.js       Autosave i sessionStorage
js/achievements.js  Badges
js/app.js           UI, editor, preview, progression
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

Rediger `js/challenges.js`. Hver udfordring har `title`, `topic`, `description`, `starter`, `hints` og en liste af `checks`:

```js
{
  label: "Linket peger på MDN",           // vises som krav
  fail: "Lav et <a href=\"…\">.",         // standardfejlbesked
  test: (c) => c.$("a[href^='https://']") ? true : "Specifik fejlbesked",
}
```

`test` får en kontekst `c` med `c.$`, `c.$$` (querySelector), `c.text(el)`, `c.attr(el, navn)`, `c.sourceTags(navn)`, `c.syntax` m.fl. Returnér `true` (ok), `false` (brug `fail`) eller en streng (specifik fejl). Tekst understøtter `` `kode` `` og `**fed**`.
