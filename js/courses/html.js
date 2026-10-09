/*
 * Kursus: HTML for begyndere (9 udfordringer).
 * Tekster understøtter `kode` (backticks) og **fed**. Afsnit adskilles med tomme linjer.
 */
(function (global) {
  "use strict";

  const R = Validators.rules;

  const challenges = [
    {
      id: "grundstruktur",
      title: "Dit første HTML-dokument",
      topic: "Grundstruktur",
      icon: "🧱",
      description:
        "Alle HTML-sider har det samme skelet. Udfyld de manglende dele (`___`), så dokumentet bliver en gyldig HTML5-side.\n\n" +
        "Se på preview'et til højre: Når du er færdig, skal din overskrift vises på siden, og fanen i browseren skal have en titel.",
      starter: `<!___ html>
<html ___="da">
  <head>
    <meta charset="UTF-8" />
    <___>Min første side</___>
  </head>
  <body>
    <___>Hej verden!</___>
  </body>
</html>
`,
      hints: [
        "Første linje fortæller browseren, at dokumentet er HTML5: `<!DOCTYPE html>`.",
        "Sproget angives som en attribut på `<html>`, fx `lang=\"da\"` for dansk.",
        "Titlen skrives i `<title>` og den vigtigste overskrift i `<h1>`.",
      ],
      checks: [
        {
          label: "Dokumentet starter med `<!DOCTYPE html>`",
          fail: "Første linje skal være `<!DOCTYPE html>`.",
          test: (c) => /^\s*<!doctype html>/i.test(c.code),
        },
        {
          label: "`<html>` har et sprog (`lang`)",
          fail: "Sæt `lang=\"da\"` på `<html>`.",
          test: (c) => /^[a-z]{2}(-[a-z]{2})?$/i.test(c.attr(c.doc.documentElement, "lang")) || "`lang` skal være en sprogkode som `da` eller `en`.",
        },
        {
          label: "Der er både `<head>` og `<body>` i koden",
          fail: "Dokumentet skal have `<head>` og `<body>`.",
          test: (c) => c.hasSourceTag("head") && c.hasSourceTag("body"),
        },
        {
          label: "`<meta charset=\"UTF-8\">` ligger i `<head>`",
          fail: "Behold `<meta charset=\"UTF-8\" />` i `<head>` – ellers vises æ, ø og å forkert.",
          test: (c) => /^utf-?8$/i.test(c.attr(c.$("head > meta[charset]"), "charset")),
        },
        {
          label: "`<title>` i `<head>` har en tekst",
          fail: "Skriv en titel i `<title>`.",
          test: (c) => c.text(c.$("head > title")).length > 0,
        },
        {
          label: "`<body>` indeholder en `<h1>` med tekst",
          fail: "Skriv en overskrift med `<h1>` i `<body>`.",
          test: (c) => c.text(c.$("body > h1")).length > 0,
        },
      ],
    },

    {
      id: "tekst",
      title: "Overskrifter og tekst",
      topic: "Almindelige tags",
      icon: "✍️",
      description:
        "Skriv en lille artikel om dit yndlingsdyr. Brug overskrifter til at give teksten struktur, og afsnit til selve teksten.\n\n" +
        "Husk: Der er kun **én** `<h1>` pr. side, og underoverskrifter hedder `<h2>`.",
      starter: `<!-- Skriv din artikel herunder -->

`,
      hints: [
        "Start med `<h1>Dyrets navn</h1>`, og lav derefter to `<h2>` med hvert deres `<p>`.",
        "`<strong>` gør tekst vigtig (fed), og `<em>` lægger vægt på et ord (kursiv).",
        "Brug `<hr>` eller `<br>` – de er tomme elementer og skal ikke lukkes.",
      ],
      checks: [
        {
          label: "Præcis én `<h1>` med tekst",
          fail: "Skriv én `<h1>` med en overskrift.",
          test: (c) => {
            const h1 = c.$$("h1");
            if (h1.length !== 1) return `Du har ${h1.length} \`<h1>\` – der skal være præcis én.`;
            return c.text(h1[0]).length >= 3 || "`<h1>` skal indeholde en overskrift på mindst 3 tegn.";
          },
        },
        {
          label: "Mindst to `<h2>` underoverskrifter",
          fail: "Tilføj mindst to `<h2>`.",
          test: (c) => {
            const n = c.$$("h2").filter((e) => c.text(e).length >= 2).length;
            return n >= 2 || `Du har ${n} udfyldt(e) \`<h2>\` – der skal være mindst to.`;
          },
        },
        {
          label: "Mindst tre afsnit (`<p>`) med rigtig tekst",
          fail: "Skriv mindst tre `<p>`-afsnit.",
          test: (c) => {
            const n = c.$$("p").filter((e) => c.text(e).length >= 15).length;
            return n >= 3 || `Du har ${n} afsnit med mindst 15 tegn – der skal være tre.`;
          },
        },
        {
          label: "Overskrifterne står i rigtig rækkefølge (`<h1>` før `<h2>`)",
          fail: "`<h1>` skal komme før den første `<h2>`.",
          test: (c) => c.isBefore(c.$("h1"), c.$("h2")),
        },
        {
          label: "Mindst ét ord er `<strong>` og mindst ét er `<em>`",
          fail: "Brug både `<strong>` og `<em>` i din tekst.",
          test: (c) => {
            if (!c.text(c.$("p strong"))) return "Mangler `<strong>` med tekst inde i et afsnit.";
            if (!c.text(c.$("p em"))) return "Mangler `<em>` med tekst inde i et afsnit.";
            return true;
          },
        },
        {
          label: "Der er en `<hr>` eller `<br>`",
          fail: "Tilføj en `<hr>` (vandret linje) eller en `<br>` (linjeskift).",
          test: (c) => !!c.$("hr, br"),
        },
      ],
    },

    {
      id: "links-billeder",
      title: "Links og billeder",
      topic: "Attributter",
      icon: "🔗",
      description:
        "Attributter giver et tag ekstra information. Indsæt billedet `assets/kat.svg` og lav et link til MDN.\n\n" +
        "1. Billedet skal have en beskrivende `alt`-tekst.\n" +
        "2. Linket skal gå til `https://developer.mozilla.org`, have teksten **Lær mere om HTML** og åbne i en ny fane.",
      starter: `<h1>Mit kæledyr</h1>

<!-- 1. Indsæt billedet assets/kat.svg med en alt-tekst -->

<!-- 2. Lav linket til MDN -->
`,
      hints: [
        "Billeder indsættes med `<img src=\"...\" alt=\"...\">`. Det er et tomt element uden lukketag.",
        "Links laves med `<a href=\"...\">Linktekst</a>`.",
        "Åbn i ny fane med `target=\"_blank\"`. Tilføj også `rel=\"noopener\"` af sikkerhedshensyn.",
      ],
      checks: [
        {
          label: "`<img>` bruger `assets/kat.svg` som `src`",
          fail: "Indsæt `<img src=\"assets/kat.svg\" ...>`.",
          test: (c) => /kat\.svg$/i.test(c.attr(c.$("img"), "src")) || "`src` skal pege på `assets/kat.svg`.",
        },
        R.imagesHaveAlt(),
        {
          label: "Linket peger på `https://developer.mozilla.org`",
          fail: "Lav et `<a href=\"https://developer.mozilla.org\">`.",
          test: (c) => {
            const a = c.$("a[href]");
            if (!a) return "Der er intet `<a>` med en `href`.";
            return /^https:\/\/developer\.mozilla\.org\/?/i.test(c.attr(a, "href")) || "`href` skal starte med `https://developer.mozilla.org`.";
          },
        },
        {
          label: "Linkteksten er \"Lær mere om HTML\"",
          fail: "Linkteksten skal være: Lær mere om HTML.",
          test: (c) => {
            const a = c.$("a[href]");
            return (a && /^lær mere om html$/i.test(c.text(a))) || "Skriv teksten `Lær mere om HTML` mellem `<a>` og `</a>`.";
          },
        },
        {
          label: "Linket åbner i en ny fane med `target=\"_blank\"` og `rel=\"noopener\"`",
          fail: "Tilføj `target=\"_blank\"` og `rel=\"noopener\"` til linket.",
          test: (c) => {
            const a = c.$("a[href]");
            if (c.attr(a, "target") !== "_blank") return "Linket mangler `target=\"_blank\"`.";
            return /(^|\s)noopener(\s|$)/i.test(c.attr(a, "rel")) || "Linket mangler `rel=\"noopener\"`.";
          },
        },
      ],
    },

    {
      id: "lister",
      title: "Lister",
      topic: "Almindelige tags",
      icon: "📋",
      description:
        "Lav to lister: En **uordnet** liste (`<ul>`) og en **ordnet** liste (`<ol>`). Hvert punkt skrives i et `<li>`.\n\n" +
        "- Den uordnede liste skal indeholde præcis disse tre punkter i rækkefølge: HTML, CSS og JavaScript.\n" +
        "- Den ordnede liste skal være en opskrift med mindst tre trin.",
      starter: `<h2>Webbens tre sprog</h2>
<!-- Lav den uordnede liste her -->

<h2>Sådan laver du en kop te</h2>
<!-- Lav den ordnede liste her -->
`,
      hints: [
        "En liste består af to niveauer: `<ul>` om hele listen og `<li>` om hvert punkt.",
        "`<li>` må kun ligge direkte inde i `<ul>` eller `<ol>`.",
        "Eksempel: `<ol><li>Kog vand</li><li>…</li></ol>`.",
      ],
      checks: [
        {
          label: "Der er en `<ul>`",
          fail: "Tilføj en `<ul>`.",
          test: (c) => !!c.$("ul"),
        },
        {
          label: "`<ul>` indeholder HTML, CSS og JavaScript (i den rækkefølge)",
          fail: "Punkterne skal være HTML, CSS, JavaScript.",
          test: (c) => {
            const items = c.$$("ul > li");
            if (!items.length) return "`<ul>` har ingen `<li>`.";
            return c.sameTexts(items, ["html", "css", "javascript"]) || `Punkterne er "${items.map((i) => c.text(i)).join(", ")}" – de skal være "HTML, CSS, JavaScript".`;
          },
        },
        {
          label: "Der er en `<ol>` med mindst tre trin",
          fail: "Tilføj en `<ol>` med mindst tre `<li>`.",
          test: (c) => {
            const items = c.$$("ol > li").filter((li) => c.text(li).length >= 3);
            return items.length >= 3 || `Din \`<ol>\` har ${items.length} udfyldte trin – der skal være mindst tre.`;
          },
        },
        {
          label: "Hver liste har en overskrift (`<h2>`) foran sig",
          fail: "Behold de to `<h2>`-overskrifter foran listerne.",
          test: (c) => c.$$("h2").length >= 2 && c.isBefore(c.$("h2"), c.$("ul")) && c.isBefore(c.$("ul"), c.$("ol")),
        },
      ],
    },

    {
      id: "fejlretning",
      title: "Find fejlene",
      topic: "Fejlretning",
      icon: "🐞",
      description:
        "Denne side er fuld af fejl, som browseren stille og roligt \"gætter sig til\". Brug fanen **Syntaks** og de røde markeringer i editoren til at finde og rette dem alle.\n\n" +
        "Der gemmer sig **syv** fejl. Teksten på siden må ikke ændres.",
      starter: `<!DOCTYPE html>
<html lang="da">
<head>
  <meta charset="UTF-8">
  <title>Dyr i Danmark<title>
</head>
<body>
  <h1>Dyr i Danmark</h2>
  <p>Rævene er aktive om natten.
  <p>Pindsvinet går i dvale om vinteren.</p>
  <img scr="assets/kat.svg">
  <ul>
    <li>Ræv</li>
    <li>Pindsvin
  </ul>
  <a href=https://www.dn.dk>Danmarks Naturfredningsforening</a>
</body>
</html>
`,
      hints: [
        "Ret fejlene oppefra og ned – én fejl kan skabe flere følgefejl.",
        "Tjek: lukketags (`</title>`, `</h1>`, `</p>`, `</li>`), en tastefejl i en attribut og manglende `alt`.",
        "Attributværdier skal stå i anførselstegn: `href=\"https://www.dn.dk\"`.",
      ],
      checks: [
        {
          label: "`<title>` er lukket og indeholder \"Dyr i Danmark\"",
          fail: "Ret `<title>`.",
          test: (c) => /^dyr i danmark$/i.test(c.text(c.$("head > title"))) || "`<title>` skal indeholde teksten `Dyr i Danmark` og lukkes med `</title>`.",
        },
        {
          label: "`<h1>` indeholder \"Dyr i Danmark\"",
          fail: "Ret `<h1>`.",
          test: (c) => /^dyr i danmark$/i.test(c.text(c.$("body > h1"))) || "`<h1>` skal indeholde `Dyr i Danmark` og lukkes med `</h1>`.",
        },
        {
          label: "Begge afsnit er lukkede og tekstens indhold er bevaret",
          fail: "Luk begge `<p>`.",
          test: (c) => {
            const p = c.$$("body > p");
            if (p.length !== 2) return `Der skal være to afsnit direkte i \`<body>\` – du har ${p.length}.`;
            return (/rævene/i.test(c.text(p[0])) && /pindsvinet/i.test(c.text(p[1]))) || "Afsnittenes tekst er ændret.";
          },
        },
        {
          label: "Billedet har rigtig `src` og en `alt`-tekst",
          fail: "Ret `scr` til `src` og tilføj `alt`.",
          test: (c) => {
            const img = c.$("img");
            if (!img || !img.getAttribute("src")) return "`<img>` mangler `src` (tastefejl?).";
            return c.attr(img, "alt").length >= 3 || "`<img>` mangler en `alt`-tekst.";
          },
        },
        {
          label: "Listen har to lukkede punkter: Ræv og Pindsvin",
          fail: "Luk begge `<li>`.",
          test: (c) => c.sameTexts(c.$$("ul > li"), ["ræv", "pindsvin"]) || "Listen skal have to `<li>`: Ræv og Pindsvin – husk `</li>`.",
        },
        {
          label: "Linket har sin `href` i anførselstegn",
          fail: "Skriv `href=\"https://www.dn.dk\"`.",
          test: (c) => {
            const tag = c.sourceTags("a")[0];
            const href = tag && tag.attrs.find((a) => a.name === "href");
            if (!href) return "`<a>` mangler `href`.";
            if (!href.quoted) return "Sæt værdien af `href` i anførselstegn.";
            return /^https:\/\/www\.dn\.dk\/?$/i.test(href.value.trim()) || "`href` skal være `https://www.dn.dk`.";
          },
        },
        {
          label: "Der er ingen syntaksadvarsler",
          fail: "Ret også advarslerne i fanen \"Syntaks\".",
          test: (c) => c.syntax.warnings.length === 0 || `Der er stadig ${c.syntax.warnings.length} advarsel(er). Første: ${c.syntax.warnings[0].message}`,
        },
      ],
    },

    {
      id: "semantik",
      title: "Semantiske tags",
      topic: "Semantisk HTML",
      icon: "🏛️",
      description:
        "Semantiske tags fortæller **hvad** indholdet er – ikke bare hvordan det ser ud. Det hjælper søgemaskiner og skærmlæsere.\n\n" +
        "Byg skelettet til en blog:\n" +
        "- `<header>` med en `<h1>` og en `<nav>` med mindst tre links\n" +
        "- `<main>` med en `<article>`, der har en `<h2>` og et afsnit\n" +
        "- `<footer>` med en tekst\n\n" +
        "Du må ikke bruge `<div>`.",
      starter: `<!-- Byg bloggens skelet herunder -->

`,
      hints: [
        "Rækkefølgen er `<header>`, `<main>`, `<footer>` – efter hinanden i `<body>`.",
        "En navigation er en liste af links: `<nav><ul><li><a href=\"#\">Hjem</a></li>…</ul></nav>`.",
        "Indholdet i `<main>` pakkes ind i `<article>` med en `<h2>` og mindst ét `<p>`.",
      ],
      checks: [
        {
          label: "`<header>` indeholder en `<h1>` med tekst",
          fail: "Lav en `<header>` med en `<h1>`.",
          test: (c) => !!c.text(c.$("header h1")),
        },
        {
          label: "`<nav>` har mindst tre links med tekst",
          fail: "Lav en `<nav>` med mindst tre `<a href>`.",
          test: (c) => {
            const n = c.$$("nav a[href]").filter((a) => c.text(a)).length;
            return n >= 3 || `Din \`<nav>\` har ${n} link(s) med tekst – der skal være mindst tre.`;
          },
        },
        {
          label: "Der er præcis én `<main>`",
          fail: "Brug én `<main>`.",
          test: (c) => c.$$("main").length === 1 || `Du har ${c.$$("main").length} \`<main>\` – der skal være præcis én.`,
        },
        {
          label: "`<main>` indeholder en `<article>` med `<h2>` og `<p>`",
          fail: "Lav en `<article>` i `<main>` med `<h2>` og `<p>`.",
          test: (c) => {
            const a = c.$("main article");
            if (!a) return "Der mangler en `<article>` inde i `<main>`.";
            if (!c.text(c.$("h2", a))) return "`<article>` mangler en `<h2>` med tekst.";
            return c.text(c.$("p", a)).length >= 10 || "`<article>` mangler et `<p>` med tekst.";
          },
        },
        {
          label: "`<footer>` indeholder tekst",
          fail: "Lav en `<footer>` med en tekst.",
          test: (c) => c.text(c.$("footer")).length > 2,
        },
        {
          label: "Rækkefølgen er header → main → footer",
          fail: "Ret rækkefølgen af `<header>`, `<main>` og `<footer>`.",
          test: (c) => c.isBefore(c.$("header"), c.$("main")) && c.isBefore(c.$("main"), c.$("footer")),
        },
        R.noDiv(),
      ],
    },

    {
      id: "konvertering",
      title: "Fra div-suppe til semantik",
      topic: "Semantisk HTML",
      icon: "🍜",
      description:
        "Her er en side, hvor alt er lavet af `<div>`. Omskriv den, så den bruger de rigtige tags, og **bevar al tekst og alle links**.\n\n" +
        "- Sidens titel → `<header>` med `<h1>`\n" +
        "- Menuen → `<nav>` med en `<ul>` og `<li>` om hvert link\n" +
        "- Indlægget → `<main>` med `<article>`, `<h2>` og `<p>`\n" +
        "- Til sidst → `<footer>`",
      starter: `<div class="header">
  <div class="title">Min rejseblog</div>
  <div class="menu">
    <div><a href="#hjem">Hjem</a></div>
    <div><a href="#rejser">Rejser</a></div>
    <div><a href="#kontakt">Kontakt</a></div>
  </div>
</div>

<div class="content">
  <div class="post">
    <div class="post-title">Tre dage i Rom</div>
    <div class="post-text">Vi spiste pasta, drak kaffe og gik hele dagen.</div>
  </div>
</div>

<div class="footer">© 2026 Min rejseblog</div>
`,
      hints: [
        "Start yderst: `.header` → `<header>`, `.content` → `<main>`, `.footer` → `<footer>`.",
        "Menuen bliver til `<nav><ul>…</ul></nav>`, og hver `<div>` omkring et link bliver til `<li>`.",
        "`.title` er sidens hovedoverskrift (`<h1>`), `.post-title` en underoverskrift (`<h2>`), og `.post-text` er et `<p>`.",
      ],
      checks: [
        R.noDiv(),
        {
          label: "`<header>` indeholder `<h1>` med \"Min rejseblog\"",
          fail: "Lav `<header><h1>Min rejseblog</h1>…</header>`.",
          test: (c) => /^min rejseblog$/i.test(c.text(c.$("header > h1"))) || "`<header>` skal have en `<h1>` med teksten `Min rejseblog`.",
        },
        {
          label: "`<nav>` har en `<ul>` med tre `<li>` med linkene Hjem, Rejser og Kontakt",
          fail: "Lav `<nav><ul><li><a>…</a></li>…</ul></nav>`.",
          test: (c) => {
            const items = c.$$("nav > ul > li");
            if (items.length !== 3) return `\`nav > ul\` har ${items.length} \`<li>\` – der skal være tre.`;
            const links = items.map((li) => c.$("a[href]", li));
            if (links.some((a) => !a)) return "Hvert `<li>` skal indeholde et link `<a href>`.";
            return c.sameTexts(links, ["hjem", "rejser", "kontakt"]) || "Linkene skal hedde Hjem, Rejser og Kontakt (i den rækkefølge).";
          },
        },
        {
          label: "Linkenes `href`-værdier er bevaret (`#hjem`, `#rejser`, `#kontakt`)",
          fail: "Bevar `href`-værdierne.",
          test: (c) => {
            const hrefs = c.$$("nav a").map((a) => c.attr(a, "href"));
            return hrefs.join() === "#hjem,#rejser,#kontakt" || "Linkenes `href` skal være `#hjem`, `#rejser` og `#kontakt`.";
          },
        },
        {
          label: "`<main>` indeholder `<article>` med `<h2>` \"Tre dage i Rom\"",
          fail: "Lav `<main><article><h2>…</h2>…</article></main>`.",
          test: (c) => {
            if (!c.$("main > article")) return "Du skal have `<main>` med en `<article>` indeni.";
            return /^tre dage i rom$/i.test(c.text(c.$("main article > h2"))) || "`<article>` skal have en `<h2>` med teksten `Tre dage i Rom`.";
          },
        },
        {
          label: "Indlæggets tekst står i et `<p>`",
          fail: "Brug `<p>` til indlæggets tekst.",
          test: (c) => /vi spiste pasta, drak kaffe og gik hele dagen\./i.test(c.text(c.$("main article > p"))) || "Et `<p>` i `<article>` skal indeholde: Vi spiste pasta, drak kaffe og gik hele dagen.",
        },
        {
          label: "`<footer>` indeholder \"© 2026 Min rejseblog\"",
          fail: "Lav en `<footer>` med copyright-teksten.",
          test: (c) => /© 2026 min rejseblog/i.test(c.text(c.$("body > footer"))) || "`<footer>` skal indeholde teksten `© 2026 Min rejseblog`.",
        },
      ],
    },

    {
      id: "formularer",
      title: "Formularer",
      topic: "Formularer og inputs",
      icon: "📝",
      description:
        "Byg en kontaktformular. Hvert felt skal have en `<label>`, som er koblet til feltet via `for` og `id`. Det gør formularen brugbar for alle og giver et større klikområde.\n\n" +
        "Formularen skal have: navn, e-mail, et emne (vælg fra en liste med mindst tre muligheder), en besked, et afkrydsningsfelt og en send-knap.",
      starter: `<h1>Kontakt os</h1>

<!-- Byg formularen herunder -->
`,
      hints: [
        "Start med `<form action=\"#\" method=\"post\">`. Alle felter skal ligge inde i formularen.",
        "Kobl label og felt: `<label for=\"navn\">Navn</label> <input type=\"text\" id=\"navn\" name=\"navn\">`.",
        "Brug `required` og `placeholder`, `<select>` med `<option>`, `<textarea>` og `<button type=\"submit\">`.",
      ],
      checks: [
        {
          label: "Der er en `<form>` med `action` og `method=\"post\"`",
          fail: "Lav `<form action=\"#\" method=\"post\">`.",
          test: (c) => {
            const f = c.$("form");
            if (!f) return "Der er ingen `<form>`.";
            if (!f.hasAttribute("action")) return "`<form>` mangler `action`.";
            return c.attr(f, "method").toLowerCase() === "post" || "`<form>` skal have `method=\"post\"`.";
          },
        },
        {
          label: "Navn: `<input type=\"text\">` med `name`, `required` og `placeholder`",
          fail: "Lav et tekstfelt til navn.",
          test: (c) => {
            const i = c.$("form input[type=text]");
            if (!i) return "Mangler `<input type=\"text\">` inde i formularen.";
            if (!c.attr(i, "name")) return "Tekstfeltet mangler `name`.";
            if (!i.hasAttribute("required")) return "Tekstfeltet mangler `required`.";
            return c.attr(i, "placeholder").length > 0 || "Tekstfeltet mangler en `placeholder`.";
          },
        },
        {
          label: "E-mail: `<input type=\"email\">` med `name` og `required`",
          fail: "Lav et e-mail-felt.",
          test: (c) => {
            const i = c.$("form input[type=email]");
            if (!i) return "Mangler `<input type=\"email\">` inde i formularen.";
            if (!c.attr(i, "name")) return "E-mail-feltet mangler `name`.";
            return i.hasAttribute("required") || "E-mail-feltet mangler `required`.";
          },
        },
        {
          label: "Emne: `<select>` med `name` og mindst tre `<option>`",
          fail: "Lav en `<select>` med tre valgmuligheder.",
          test: (c) => {
            const s = c.$("form select");
            if (!s) return "Mangler en `<select>` inde i formularen.";
            if (!c.attr(s, "name")) return "`<select>` mangler `name`.";
            const n = c.$$("option", s).filter((o) => c.text(o)).length;
            return n >= 3 || `\`<select>\` har ${n} \`<option>\` med tekst – der skal være mindst tre.`;
          },
        },
        {
          label: "Besked: `<textarea>` med `name`",
          fail: "Lav en `<textarea name=\"…\">`.",
          test: (c) => {
            const t = c.$("form textarea");
            if (!t) return "Mangler en `<textarea>` inde i formularen.";
            return !!c.attr(t, "name") || "`<textarea>` mangler `name`.";
          },
        },
        {
          label: "Afkrydsningsfelt: `<input type=\"checkbox\">`",
          fail: "Tilføj et afkrydsningsfelt, fx \"Send mig nyhedsbrev\".",
          test: (c) => !!c.$("form input[type=checkbox]"),
        },
        R.labelledControls(),
        {
          label: "Send-knap: `<button type=\"submit\">` med tekst",
          fail: "Tilføj `<button type=\"submit\">Send</button>`.",
          test: (c) => {
            const b = c.$("form button[type=submit]");
            return (b && c.text(b).length > 0) || "Mangler `<button type=\"submit\">` med tekst inde i formularen.";
          },
        },
      ],
    },

    {
      id: "afslutning",
      title: "Afsluttende projekt: Din portefølje",
      topic: "Alt sammen",
      icon: "🏆",
      description:
        "Nu skal du bruge alt, du har lært. Byg en lille personlig portefølje som et komplet HTML-dokument.\n\n" +
        "- Gyldigt skelet: doctype, `lang`, `charset` og `<title>`\n" +
        "- `<header>` med `<h1>` og `<nav>` med mindst tre interne links (`href=\"#id\"`)\n" +
        "- `<main>` med mindst to `<section>`-elementer. Hver har en `<h2>` og et `id`, som navigationen linker til\n" +
        "- Et billede med `alt` (brug `assets/kat.svg`) og en liste med mindst tre punkter\n" +
        "- En kontaktformular med mindst to felter med labels og en send-knap\n" +
        "- `<footer>`. Ingen `<div>`.",
      starter: `<!DOCTYPE html>
<html lang="da">
  <head>
    <meta charset="UTF-8" />
    <title></title>
  </head>
  <body>
    <!-- Byg din portefølje her -->
  </body>
</html>
`,
      hints: [
        "Tegn et skelet først: header, nav, main med sections, footer. Fyld derefter indhold i.",
        "Navigationen `<a href=\"#om-mig\">` linker til `<section id=\"om-mig\">`. Id'et skal passe præcis.",
        "Overskrifter springer ikke niveauer over: `h1` → `h2` → `h3`. Og kun én `h1`.",
      ],
      checks: [
        {
          label: "Skelettet er komplet (doctype, `lang`, `charset`, `<title>` med tekst)",
          fail: "Ret dokumentets skelet.",
          test: (c) => {
            if (!/^\s*<!doctype html>/i.test(c.code)) return "Mangler `<!DOCTYPE html>` som første linje.";
            if (!c.attr(c.doc.documentElement, "lang")) return "`<html>` mangler `lang`.";
            if (!c.$("head > meta[charset]")) return "`<head>` mangler `<meta charset=\"UTF-8\">`.";
            return c.text(c.$("head > title")).length >= 2 || "`<title>` skal have en tekst.";
          },
        },
        {
          label: "`<header>` har én `<h1>`, og siden har kun én `<h1>`",
          fail: "Lav én `<h1>` i `<header>`.",
          test: (c) => {
            if (c.$$("h1").length !== 1) return `Siden har ${c.$$("h1").length} \`<h1>\` – der skal være præcis én.`;
            return !!c.text(c.$("header h1")) || "`<h1>` skal stå inde i `<header>` og have en tekst.";
          },
        },
        {
          label: "`<nav>` har mindst tre interne links, og alle peger på et eksisterende `id`",
          fail: "Lav en `<nav>` med links som `#om-mig`.",
          test: (c) => {
            const links = c.$$("nav a[href]");
            if (links.length < 3) return `\`<nav>\` har ${links.length} link(s) – der skal være mindst tre.`;
            for (const a of links) {
              const href = c.attr(a, "href");
              if (!/^#.+/.test(href)) return `Linket "${c.text(a)}" har \`href="${href}"\` – brug et internt link som \`#om-mig\`.`;
              if (!c.doc.getElementById(href.slice(1))) return `Linket \`${href}\` peger på et \`id\`, som ikke findes. Giv en \`<section>\` \`id="${href.slice(1)}"\`.`;
            }
            return true;
          },
        },
        {
          label: "`<main>` har mindst to `<section>` med `id` og `<h2>`",
          fail: "Lav to `<section id=\"…\">` med `<h2>`.",
          test: (c) => {
            const ok = c.$$("main > section[id]").filter((s) => c.text(c.$("h2", s)));
            return ok.length >= 2 || `Fandt ${ok.length} \`<section>\` med \`id\` og \`<h2>\` direkte i \`<main>\` – der skal være mindst to.`;
          },
        },
        R.imagesHaveAlt(),
        {
          label: "Der er en liste med mindst tre punkter",
          fail: "Tilføj en `<ul>` eller `<ol>` med tre `<li>`.",
          test: (c) => c.$$("main li").filter((li) => c.text(li)).length >= 3 || "Brug en liste med mindst tre udfyldte `<li>` i `<main>`.",
        },
        {
          label: "Der er en formular med mindst to felter og en send-knap",
          fail: "Lav en kontaktformular.",
          test: (c) => {
            const f = c.$("main form");
            if (!f) return "Der mangler en `<form>` i `<main>`.";
            const fields = c.$$("input:not([type=submit]):not([type=button]), textarea, select", f);
            if (fields.length < 2) return `Formularen har ${fields.length} felt(er) – der skal være mindst to.`;
            return !!c.$("button[type=submit], input[type=submit]", f) || "Formularen mangler en send-knap `<button type=\"submit\">`.";
          },
        },
        R.labelledControls(),
        {
          label: "Der er en `<footer>` med tekst",
          fail: "Tilføj en `<footer>`.",
          test: (c) => c.text(c.$("body > footer")).length > 2,
        },
        R.noDiv(),
        {
          label: "Overskrifterne springer ingen niveauer over, og der er ingen syntaksadvarsler",
          fail: "Ret advarslerne i fanen \"Syntaks\".",
          test: (c) => c.syntax.warnings.length === 0 || `Der er ${c.syntax.warnings.length} advarsel(er). Første (linje ${c.syntax.warnings[0].line}): ${c.syntax.warnings[0].message}`,
        },
      ],
    },
  ];

  global.COURSES.html = {
    id: "html",
    engine: "html",
    title: "HTML Coding Lab",
    subtitle: "HTML for begyndere",
    filename: "index.html",
    finishText: "Du har gennemført alle udfordringerne i begynder-HTML. Rigtig flot arbejde!",
    challenges,
    // Ekstra badges, der kun hører til dette kursus
    badges: [
      { id: "bug", icon: "🐞", title: "Fejljæger", desc: "Find alle fejlene i \"Find fejlene\".", test: (s) => !!s.solved.fejlretning },
      { id: "semantic", icon: "🏛️", title: "Semantik-ninja", desc: "Løs begge semantik-udfordringer.", test: (s) => !!s.solved.semantik && !!s.solved.konvertering },
      { id: "forms", icon: "📝", title: "Formularbygger", desc: "Byg en tilgængelig formular.", test: (s) => !!s.solved.formularer },
    ],
  };
})(window);
