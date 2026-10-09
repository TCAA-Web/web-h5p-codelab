/*
 * Validator-motor.
 * Hver opgave har en liste af krav (checks). Et krav er { label, fail, test(ctx) }.
 * test returnerer true (ok), false (brug `fail`) eller en streng (specifik fejlbesked).
 *
 * Validatorerne arbejder på DOM'en (DOMParser) og på kildekoden/syntaksanalysen,
 * så både struktur, indhold og attributter kontrolleres – ikke bare om et tag "findes".
 */
(function (global) {
  "use strict";

  const norm = (s) => (s || "").replace(/\s+/g, " ").trim();
  const lower = (s) => norm(s).toLowerCase();

  function createContext(code) {
    const doc = new DOMParser().parseFromString(code, "text/html");
    const syntax = HTMLSyntax.analyze(code);
    return {
      code,
      doc,
      syntax,
      body: doc.body,
      $: (sel, root) => (root || doc).querySelector(sel),
      $$: (sel, root) => Array.from((root || doc).querySelectorAll(sel)),
      text: (el) => (el ? norm(el.textContent) : ""),
      // Tags der faktisk står i kildekoden (DOM'en tilføjer selv html/head/body)
      sourceTags: (name) => syntax.tags.filter((t) => t.name === name),
      hasSourceTag: (name) => syntax.tags.some((t) => t.name === name),
      attr: (el, name) => (el ? norm(el.getAttribute(name)) : ""),
      isBefore: (a, b) => !!(a && b && a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING),
      sameTexts: (els, expected) => {
        const actual = els.map((e) => lower(e.textContent));
        return actual.length === expected.length && expected.every((t, k) => actual[k] === t.toLowerCase());
      },
      // Er kontrollen mærket med en label (for/id eller omsluttende label)?
      hasLabel: (control) => {
        const wrapping = control.closest("label");
        if (wrapping && norm(wrapping.textContent)) return true;
        const id = control.getAttribute("id");
        if (!id) return false;
        const label = Array.from(control.ownerDocument.querySelectorAll("label")).find((l) => l.getAttribute("for") === id);
        return !!(label && norm(label.textContent));
      },
    };
  }

  function evaluate(check, ctx) {
    try {
      const res = check.test(ctx);
      if (res === true) return { ok: true, label: check.label };
      return { ok: false, label: check.label, message: typeof res === "string" ? res : check.fail };
    } catch (err) {
      return { ok: false, label: check.label, message: check.fail || "Kunne ikke kontrollere dette krav." };
    }
  }

  function run(challenge, code) {
    const ctx = createContext(code);
    const syntax = ctx.syntax;
    const checks = [];

    const blank = norm(code.replace(/<!--[\s\S]*?-->/g, "")) === "";
    const placeholders = (code.match(/___/g) || []).length;

    if (placeholders) {
      checks.push({
        ok: false,
        label: "Alle pladsholdere (`___`) er udfyldt",
        message: `Der er stadig ${placeholders} pladsholder${placeholders > 1 ? "e" : ""} (\`___\`) tilbage i koden.`,
      });
    }

    const errCount = syntax.errors.length;
    const first = syntax.errors[0];
    let syntaxMessage = "";
    if (blank) syntaxMessage = "Du har ikke skrevet noget kode endnu.";
    else if (first) syntaxMessage = `Syntaksanalysen fandt ${errCount} fejl. Første fejl (linje ${first.line}): ${first.message} Se fanen "Syntaks".`;
    checks.push({ ok: errCount === 0 && !blank, label: "Koden har ingen syntaksfejl", message: syntaxMessage });

    challenge.checks.forEach((c) => checks.push(blank ? { ok: false, label: c.label, message: c.fail } : evaluate(c, ctx)));

    return {
      passed: checks.every((c) => c.ok),
      checks,
      syntax,
      okCount: checks.filter((c) => c.ok).length,
      total: checks.length,
    };
  }

  // Genbrugelige krav, så opgaverne er korte og ensartede
  const rules = {
    noDiv() {
      return {
        label: "Der bruges ingen `<div>`-elementer",
        fail: "Erstat alle `<div>` med semantiske tags.",
        test: (c) => c.$$("div").length === 0 || `Du har stadig ${c.$$("div").length} \`<div>\` – brug semantiske tags i stedet.`,
      };
    },
    imagesHaveAlt() {
      return {
        label: "Alle billeder har en beskrivende `alt`-tekst",
        fail: "Billeder skal have en `alt`-tekst.",
        test: (c) => {
          const imgs = c.$$("img");
          if (!imgs.length) return "Der er ingen billeder i koden.";
          const bad = imgs.find((i) => {
            const alt = c.attr(i, "alt");
            return alt.length < 3 || /\.(svg|png|jpe?g|gif|webp)$/i.test(alt) || /^(billede|image|img|foto)$/i.test(alt);
          });
          return bad ? "Et billede mangler en beskrivende `alt`-tekst (mindst 3 tegn, ikke blot et filnavn)." : true;
        },
      };
    },
    labelledControls() {
      return {
        label: "Alle felter har en tilhørende `<label>`",
        fail: "Hvert felt skal have en label.",
        test: (c) => {
          const controls = c.$$("input:not([type=submit]):not([type=button]):not([type=hidden]), select, textarea");
          if (!controls.length) return "Der er ingen formularfelter.";
          const bad = controls.find((el) => !c.hasLabel(el));
          if (!bad) return true;
          const kind = bad.tagName.toLowerCase() + (bad.getAttribute("type") ? `[type=${bad.getAttribute("type")}]` : "");
          return `Feltet \`${kind}\` har ingen label. Giv feltet et \`id\` og skriv \`<label for="id">Tekst</label>\`.`;
        },
      };
    },
  };

  global.Validators = { run, createContext, rules, norm, lower };
})(window);
