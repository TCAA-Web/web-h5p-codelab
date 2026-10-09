/*
 * HTML-syntaksanalyse.
 * Læser kildekoden tegn for tegn (browserens parser retter nemlig fejl i stilhed),
 * og finder: ulukkede/forkert nestede tags, ukendte tags og attributter, tastefejl,
 * dublerede attributter, ugyldig nesting m.m.
 *
 * HTMLSyntax.analyze(code) -> { issues, tags, errors, warnings, hasDoctype, toPos }
 * issue: { severity: "error"|"warning", message, start, end, line, col, endLine, endCol }
 */
(function (global) {
  "use strict";

  const VOID = new Set(
    "area base br col embed hr img input link meta param source track wbr".split(" ")
  );
  const RAW_TEXT = new Set(["script", "style", "textarea", "title"]);

  const KNOWN_TAGS = new Set(
    (
      "a abbr address area article aside audio b base bdi bdo blockquote body br button canvas caption cite code col colgroup " +
      "data datalist dd del details dfn dialog div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 " +
      "head header hgroup hr html i iframe img input ins kbd label legend li link main map mark menu meta meter nav noscript " +
      "object ol optgroup option output p param picture pre progress q rp rt ruby s samp script search section select slot " +
      "small source span strong style sub summary sup svg table tbody td template textarea tfoot th thead time title tr track " +
      "u ul var video wbr path circle rect g line polygon ellipse defs lineargradient stop"
    ).split(" ")
  );

  const KNOWN_ATTRS = new Set(
    (
      "accept action align alt async autocomplete autofocus autoplay border charset checked cite class cols colspan content " +
      "controls crossorigin dir disabled download draggable enctype for form height hidden href hreflang id integrity " +
      "lang list loading loop max maxlength media method min minlength multiple muted name novalidate open pattern " +
      "placeholder poster preload readonly referrerpolicy rel required reversed role rows rowspan scope selected size " +
      "sizes span spellcheck src srcdoc srcset start step style tabindex target title translate type value width wrap " +
      "viewbox xmlns fill stroke d cx cy r x y rx ry points offset"
    ).split(" ")
  );

  // Elementer, som ikke må ligge inde i et <p>
  const NOT_IN_P = new Set(
    (
      "address article aside blockquote details div dl fieldset figure footer form h1 h2 h3 h4 h5 h6 header hr " +
      "main menu nav ol p pre section table ul"
    ).split(" ")
  );

  // Damerau-Levenshtein (transposition tæller som 1 ændring, så scr -> src = 1)
  function distance(a, b) {
    const d = [];
    for (let i = 0; i <= a.length; i++) {
      d[i] = [i];
    }
    for (let j = 0; j <= b.length; j++) {
      d[0][j] = j;
    }
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
        if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
          d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
        }
      }
    }
    return d[a.length][b.length];
  }

  function closest(word, set, max) {
    let best = null;
    let bestDist = max + 1;
    set.forEach((candidate) => {
      const dist = distance(word, candidate);
      if (dist < bestDist) {
        best = candidate;
        bestDist = dist;
      }
    });
    return bestDist <= max ? best : null;
  }

  const isPlaceholder = (s) => s.includes("___") || s.startsWith("_");

  function analyze(code) {
    const issues = [];
    const tags = [];
    const stack = [];
    const n = code.length;
    let hasDoctype = false;
    const reportedRaw = new Set();

    const lineStarts = [0];
    for (let k = 0; k < n; k++) {
      if (code[k] === "\n") lineStarts.push(k + 1);
    }
    function toPos(offset) {
      let lo = 0;
      let hi = lineStarts.length - 1;
      while (lo < hi) {
        const mid = (lo + hi + 1) >> 1;
        if (lineStarts[mid] <= offset) lo = mid;
        else hi = mid - 1;
      }
      return { line: lo + 1, col: offset - lineStarts[lo] + 1 };
    }

    function add(severity, message, start, end) {
      const s = toPos(start);
      const e = toPos(Math.max(end, start + 1));
      issues.push({
        severity,
        message,
        start,
        end: Math.max(end, start + 1),
        line: s.line,
        col: s.col,
        endLine: e.line,
        endCol: e.col,
      });
    }

    const closeRe = /<\/([A-Za-z_][^\s>/]*)\s*>/y;
    const openRe = /<([A-Za-z_][^\s/>]*)/y;
    const attrNameRe = /[^\s"'<>/=]+/y;
    const unquotedRe = /[^\s>]+/y;

    let i = 0;
    while (i < n) {
      const lt = code.indexOf("<", i);
      if (lt === -1) break;
      i = lt;

      if (code.startsWith("<!--", i)) {
        const end = code.indexOf("-->", i + 4);
        if (end === -1) {
          add("error", "Kommentaren er ikke lukket – mangler `-->`.", i, i + 4);
          break;
        }
        i = end + 3;
        continue;
      }

      if (code[i + 1] === "!") {
        const end = code.indexOf(">", i);
        if (end === -1) {
          add("error", "Deklarationen er ikke afsluttet med `>`.", i, n);
          break;
        }
        const decl = code.slice(i, end + 1);
        if (/^<!doctype/i.test(decl)) {
          hasDoctype = true;
          if (!/^<!doctype\s+html\s*>$/i.test(decl) && !decl.includes("___")) {
            add("warning", "Brug den moderne doctype: `<!DOCTYPE html>`.", i, end + 1);
          }
        } else if (/^<!___/.test(decl)) {
          hasDoctype = true;
        } else {
          add("warning", "Ukendt deklaration – forventede `<!DOCTYPE html>` eller en kommentar `<!-- -->`.", i, end + 1);
        }
        i = end + 1;
        continue;
      }

      if (code[i + 1] === "/") {
        closeRe.lastIndex = i;
        const m = closeRe.exec(code);
        if (!m) {
          const gt = code.indexOf(">", i);
          add("error", "Ugyldigt lukketag – et lukketag ser sådan ud: `</navn>`.", i, gt === -1 ? i + 2 : gt + 1);
          i += 2;
          continue;
        }
        handleClose(m[1].toLowerCase(), i, i + m[0].length);
        i += m[0].length;
        continue;
      }

      openRe.lastIndex = i;
      const om = openRe.exec(code);
      if (!om) {
        add("warning", "Et enkeltstående `<` bør skrives som `&lt;`, ellers tror browseren, at et tag starter.", i, i + 1);
        i += 1;
        continue;
      }

      const rawName = om[1];
      const name = rawName.toLowerCase();
      let j = i + om[0].length;
      const attrs = [];
      let selfClose = false;
      let terminated = false;
      let typoFlag = false;

      while (j < n) {
        while (j < n && /\s/.test(code[j])) j++;
        if (j >= n) break;
        if (code[j] === ">") {
          terminated = true;
          j++;
          break;
        }
        if (code.startsWith("/>", j)) {
          selfClose = true;
          terminated = true;
          j += 2;
          break;
        }
        if (code[j] === "/") {
          j++;
          continue;
        }
        if (code[j] === "<") break;

        attrNameRe.lastIndex = j;
        const am = attrNameRe.exec(code);
        if (!am) {
          add("error", `Uventet tegn \`${code[j]}\` inde i tagget.`, j, j + 1);
          j++;
          continue;
        }
        const attr = { name: am[0].toLowerCase(), value: null, quoted: false, start: j, end: j + am[0].length };
        j += am[0].length;
        let k = j;
        while (k < n && /\s/.test(code[k])) k++;
        if (code[k] === "=") {
          k++;
          while (k < n && /\s/.test(code[k])) k++;
          const q = code[k];
          if (q === '"' || q === "'") {
            const close = code.indexOf(q, k + 1);
            if (close === -1) {
              add("error", `Attributværdien til \`${attr.name}\` mangler et afsluttende ${q}.`, k, Math.min(n, k + 20));
              attr.value = code.slice(k + 1);
              attrs.push(attr);
              j = n;
              break;
            }
            attr.value = code.slice(k + 1, close);
            attr.quoted = true;
            j = close + 1;
            attr.end = j;
            if (j < n && !/[\s>/]/.test(code[j])) {
              add("warning", "Der mangler et mellemrum mellem attributterne.", j - 1, j + 1);
            }
          } else {
            unquotedRe.lastIndex = k;
            const um = unquotedRe.exec(code);
            attr.value = um ? um[0].replace(/\/$/, "") : "";
            if (!attr.value.includes("___")) {
              add("warning", `Sæt værdien til \`${attr.name}\` i anførselstegn: \`${attr.name}="…"\`.`, attr.start, k + (um ? um[0].length : 0));
            }
            j = k + (um ? um[0].length : 0);
            attr.end = j;
            if (um && um[0].endsWith("/") && code[j] === ">") {
              selfClose = true;
            }
          }
        }
        attrs.push(attr);
      }

      if (!terminated) {
        add("error", `Tagget \`<${rawName}\` er ikke afsluttet med \`>\`.`, i, Math.min(n, i + om[0].length));
        i = code[j] === "<" ? j : n;
        continue;
      }

      const tag = { name, attrs, start: i, end: j, selfClose, line: toPos(i).line };
      tags.push(tag);

      const seen = new Set();
      attrs.forEach((attr) => {
        if (isPlaceholder(attr.name) || attr.name.includes("___")) return;
        if (seen.has(attr.name)) {
          add("error", `Attributten \`${attr.name}\` står to gange på \`<${name}>\`.`, attr.start, attr.end);
        }
        seen.add(attr.name);
        const isKnown =
          KNOWN_ATTRS.has(attr.name) ||
          attr.name.startsWith("data-") ||
          attr.name.startsWith("aria-") ||
          attr.name.includes(":");
        if (!isKnown) {
          const guess = attr.name.length >= 3 ? closest(attr.name, KNOWN_ATTRS, attr.name.length <= 4 ? 1 : 2) : null;
          if (guess) {
            typoFlag = true;
            add("error", `Ukendt attribut \`${attr.name}\` – mente du \`${guess}\`?`, attr.start, attr.end);
          } else {
            add("warning", `Ukendt attribut \`${attr.name}\` på \`<${name}>\`.`, attr.start, attr.end);
          }
        }
      });

      if (name === "img" && !typoFlag && !attrs.some((a) => a.name === "src")) {
        add("error", "`<img>` mangler `src` – browseren ved ikke, hvilket billede der skal vises.", i, j);
      }

      if (!isPlaceholder(name) && !name.includes("-") && !KNOWN_TAGS.has(name)) {
        const guess = closest(name, KNOWN_TAGS, name.length <= 3 ? 1 : 2);
        add(
          "error",
          guess ? `Ukendt tag \`<${name}>\` – mente du \`<${guess}>\`?` : `Ukendt tag \`<${name}>\`.`,
          i,
          i + om[0].length
        );
      }

      const parent = stack.length ? stack[stack.length - 1].name : null;
      if (name === "li" && parent !== "ul" && parent !== "ol" && parent !== "menu" && !(parent && isPlaceholder(parent))) {
        add("error", "`<li>` skal ligge direkte inde i en `<ul>` eller `<ol>`.", i, j);
      }
      if ((parent === "ul" || parent === "ol") && name !== "li" && name !== "script" && name !== "template") {
        add("error", `\`<${parent}>\` må kun indeholde \`<li>\` – \`<${name}>\` skal ligge inde i et \`<li>\`.`, i, i + om[0].length);
      }
      if (parent === "p" && NOT_IN_P.has(name)) {
        add("error", `\`<${name}>\` kan ikke ligge inde i et \`<p>\`. Luk afsnittet med \`</p>\` først.`, i, i + om[0].length);
      }
      if (name === "a" && stack.some((s) => s.name === "a")) {
        add("error", "Et `<a>`-link kan ikke ligge inde i et andet `<a>`-link.", i, i + om[0].length);
      }
      if (name === "form" && stack.some((s) => s.name === "form")) {
        add("error", "En `<form>` kan ikke ligge inde i en anden `<form>`.", i, i + om[0].length);
      }
      if ((name === "title" || name === "meta") && stack.some((s) => s.name === "body")) {
        add("warning", `\`<${name}>\` hører til i \`<head>\`, ikke i \`<body>\`.`, i, i + om[0].length);
      }

      if (VOID.has(name)) {
        i = j;
        continue;
      }
      if (selfClose) {
        if (!isPlaceholder(name) && !(name === "svg" || name === "path" || name === "circle" || name === "rect" || name === "line" || name === "polygon" || name === "ellipse" || name === "stop")) {
          add("error", `\`<${name} />\` virker ikke i HTML – skriv \`<${name}></${name}>\`.`, i, j);
        }
        i = j;
        continue;
      }

      if (RAW_TEXT.has(name)) {
        const closeIdx = code.toLowerCase().indexOf("</" + name, j);
        if (closeIdx === -1) {
          if (!reportedRaw.has(name)) {
            add("error", `\`<${name}>\` er ikke lukket – mangler \`</${name}>\`.`, i, i + om[0].length);
            reportedRaw.add(name);
          }
          i = j;
          continue;
        }
        stack.push({ name, start: i, end: i + om[0].length });
        i = closeIdx;
        continue;
      }

      stack.push({ name, start: i, end: i + om[0].length });
      i = j;
    }

    function handleClose(name, start, end) {
      if (VOID.has(name)) {
        add("error", `\`<${name}>\` er et tomt element og skal ikke have et lukketag.`, start, end);
        return;
      }
      let idx = -1;
      for (let s = stack.length - 1; s >= 0; s--) {
        if (stack[s].name === name) {
          idx = s;
          break;
        }
      }
      if (idx === -1) {
        const top = stack[stack.length - 1];
        if (top) {
          add("error", `Forkert lukketag: forventede \`</${top.name}>\` men fandt \`</${name}>\`.`, start, end);
          stack.pop();
        } else {
          add("error", `Uventet \`</${name}>\` – der er intet åbent \`<${name}>\` at lukke.`, start, end);
        }
        return;
      }
      while (stack.length - 1 > idx) {
        const open = stack.pop();
        add(
          "error",
          `\`<${open.name}>\` (linje ${toPos(open.start).line}) blev ikke lukket – mangler \`</${open.name}>\` før \`</${name}>\`.`,
          open.start,
          open.end
        );
      }
      stack.pop();
    }

    stack.forEach((open) => {
      add("error", `\`<${open.name}>\` er ikke lukket – mangler \`</${open.name}>\`.`, open.start, open.end);
    });

    // Placeholders fra opgaver med huller
    let p = code.indexOf("___");
    while (p !== -1) {
      add("warning", "Udfyld pladsholderen `___`.", p, p + 3);
      p = code.indexOf("___", p + 3);
    }

    // Dokument- og overskriftsråd (kun advarsler)
    const tagNames = tags.map((t) => t.name);
    if (tagNames.includes("html") && !code.includes("___")) {
      const htmlTag = tags.find((t) => t.name === "html");
      if (!hasDoctype) add("warning", "Dokumentet mangler `<!DOCTYPE html>` øverst.", htmlTag.start, htmlTag.end);
      if (!htmlTag.attrs.some((a) => a.name === "lang")) {
        add("warning", "Tilføj et sprog: `<html lang=\"da\">`.", htmlTag.start, htmlTag.end);
      }
      if (tagNames.includes("head") && !tagNames.includes("title")) {
        const head = tags.find((t) => t.name === "head");
        add("warning", "`<head>` mangler en `<title>`.", head.start, head.end);
      }
    }
    const h1s = tags.filter((t) => t.name === "h1");
    if (h1s.length > 1) {
      add("warning", "Siden bør kun have én `<h1>`.", h1s[1].start, h1s[1].end);
    }
    let lastLevel = 0;
    tags.forEach((t) => {
      const m = /^h([1-6])$/.exec(t.name);
      if (!m) return;
      const level = Number(m[1]);
      if (lastLevel && level > lastLevel + 1) {
        add("warning", `Overskriftsniveau springes over (\`h${lastLevel}\` → \`h${level}\`). Brug \`h${lastLevel + 1}\`.`, t.start, t.end);
      }
      lastLevel = level;
    });
    tags.forEach((t) => {
      if (t.name === "img" && !t.attrs.some((a) => a.name === "alt")) {
        add("warning", "`<img>` bør have en `alt`-tekst, der beskriver billedet.", t.start, t.end);
      }
    });

    issues.sort((a, b) => a.start - b.start);
    return {
      issues,
      tags,
      hasDoctype,
      toPos,
      errors: issues.filter((x) => x.severity === "error"),
      warnings: issues.filter((x) => x.severity === "warning"),
    };
  }

  global.HTMLSyntax = { analyze, distance };
})(window);
