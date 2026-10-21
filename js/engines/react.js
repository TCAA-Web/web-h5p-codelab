/*
 * React-motor (TSX).
 *  - Typefejl fra Monacos TypeScript-compiler med forenklede React-typer (js/engines/react-types/).
 *  - Koden oversættes til JavaScript og køres i en Web Worker med timeout.
 *  - Komponenten (default export, `App` eller `challenge.entry`) vises med react-dom/server
 *    (statisk markup – ingen events eller tilstand efter første render). HTML'en vises i
 *    preview og tjekkes med DOM-baserede validatorer i forælderen.
 *
 * Krav (checks) i et React-kursus er enten
 *   - statiske:  test: (c) => ...      c.$, c.$$, c.text(el), c.texts(els), c.root, c.html,
 *                                      c.code, c.clean, c.has(regex), c.errors, c.logs, c.warnings
 *   - kørende:   runtime: (t) => ...   t.render(navnEllerFunktion, props, ...children) -> html-streng,
 *                                      t.text(html), t.get(navn), t.h (createElement), t.html, t.logs
 * Begge returnerer true (ok), false (brug `fail`) eller en streng (specifik fejlbesked).
 * `runtime` sendes som tekst til workeren – brug kun `t` og egne variabler (pilefunktion).
 *
 * Opgaver kan sætte `entry` (komponentnavn) og `entryProps` (props som JSON) for at styre,
 * hvad preview og `c.root` viser.
 */
(function (global) {
  "use strict";

  const SCRIPT_SRC = document.currentScript ? document.currentScript.src : "";
  const VERSION_QUERY = SCRIPT_SRC.includes("?") ? SCRIPT_SRC.slice(SCRIPT_SRC.indexOf("?")) : "";
  const CDN = "https://cdnjs.cloudflare.com/ajax/libs/";
  const REACT_URL = CDN + "react/18.3.1/umd/react.development.js";
  const SERVER_URL = CDN + "react-dom/18.3.1/umd/react-dom-server-legacy.browser.development.js";

  // Køres i workeren. Skal være selvstændig (bruger ikke noget udefra).
  function workerMain(loadError) {
    const fmt = (v) => {
      if (typeof v === "string") return v;
      if (typeof v === "function") return "[Function" + (v.name ? ": " + v.name : "") + "]";
      if (v === null || typeof v !== "object") return String(v);
      try {
        return JSON.stringify(v);
      } catch (err) {
        return String(v);
      }
    };
    // React bruger printf-lignende advarsler ("Warning: %s ...")
    const formatArgs = (args) => {
      const rest = args.slice(1);
      let first = args[0];
      if (typeof first === "string" && /%[sdifoOj]/.test(first)) {
        first = first.replace(/%[sdifoOj]/g, () => (rest.length ? fmt(rest.shift()) : "%s"));
      }
      return [first].concat(rest).map(fmt).join(" ");
    };

    const logs = [];
    const make = (level) => (...args) => {
      if (logs.length < 100) logs.push({ level, text: formatArgs(args) });
    };
    const fakeConsole = { log: make("log"), info: make("info"), warn: make("warn"), error: make("error") };
    self.console = fakeConsole;

    self.onmessage = (e) => {
      const { js, checks, entry, entryProps, assets } = e.data;
      logs.length = 0;
      if (loadError) {
        self.postMessage({ logs: [], error: loadError, html: null, results: [] });
        return;
      }
      const R = self.React;
      const S = self.ReactDOMServer;

      const createJsx = (type, props, key) => {
        const config = key === undefined ? props : Object.assign({}, props, { key });
        return R.createElement(type, config);
      };
      const jsxRuntime = {
        Fragment: R.Fragment,
        jsx: (type, props, key) => {
          const children = props && props.children;
          if (Array.isArray(children)) {
            // Lister fra .map() kontrolleres for `key`, som i rigtig React
            const rest = Object.assign({}, props);
            delete rest.children;
            return R.createElement(type, key === undefined ? rest : Object.assign(rest, { key }), children);
          }
          return createJsx(type, props, key);
        },
        jsxs: (type, props, key) => {
          const rest = Object.assign({}, props);
          const children = rest.children;
          delete rest.children;
          return R.createElement(type, key === undefined ? rest : Object.assign(rest, { key }), ...children);
        },
      };
      jsxRuntime.jsxDEV = jsxRuntime.jsx;
      const modules = { react: R, "react/jsx-runtime": jsxRuntime, "react/jsx-dev-runtime": jsxRuntime };
      const requireShim = (name) => {
        if (name in modules) return modules[name];
        // Billeder: filerne ligger i mappen assets ved siden af App.tsx. Importen giver stien (som i Vite).
        if (/\.(jpe?g|png|gif|svg|webp|mp4)$/i.test(name)) {
          const available = Object.keys(assets);
          const file = name.split("/").pop();
          if (!name.startsWith("./assets/")) {
            throw new Error('Kan ikke finde "' + name + '". Billederne ligger i mappen assets, så stien skal starte med "./assets/", fx "./assets/' + (available[0] || "billede.jpg") + '".');
          }
          if (!(file in assets)) {
            throw new Error('Kan ikke finde billedet "' + name + '". Tilgængelige billeder: ' + available.map((f) => "./assets/" + f).join(", ") + ".");
          }
          return assets[file];
        }
        throw new Error('Kan ikke importere "' + name + '". I dette kursus kan du kun importere fra "react" og assets fra "./assets/".');
      };

      let get = null;
      let error = null;
      let html = null;
      let Entry = null;
      const safeGet = (n) => {
        try {
          return get(n);
        } catch (err) {
          return undefined;
        }
      };
      try {
        const module = { exports: {} };
        // Funktionen til sidst ligger i samme scope som elevens kode og kan derfor læse top-level navne
        const factory = new Function("exports", "module", "require", "console", js + "\n;return function (__expr) { return eval(__expr); };");
        get = factory(module.exports, module, requireShim, fakeConsole);
        Entry = entry ? safeGet(entry) : module.exports.default || safeGet("App");
        if (typeof Entry !== "function") {
          error = entry
            ? "Komponenten " + entry + " findes ikke."
            : "Der er intet komponent at vise. Skriv `export default App;` nederst i filen.";
        }
      } catch (err) {
        error = err && err.message ? err.name + ": " + err.message : String(err);
      }

      if (!error) {
        try {
          html = S.renderToStaticMarkup(R.createElement(Entry, entryProps || null));
        } catch (err) {
          error = "Fejl under visning: " + (err && err.message ? err.message : String(err));
        }
      }

      const text = (h) =>
        String(h)
          .replace(/<[^>]*>/g, "")
          .replace(/&quot;/g, '"')
          .replace(/&#x27;/g, "'")
          .replace(/&lt;/g, "<")
          .replace(/&gt;/g, ">")
          .replace(/&amp;/g, "&");
      const render = (c, props, ...children) => {
        const comp = typeof c === "string" ? safeGet(c) : c;
        if (typeof comp !== "function") throw new Error("Kan ikke finde komponenten " + c);
        return S.renderToStaticMarkup(R.createElement(comp, props || null, ...children));
      };
      const t = { get, render, text, h: R.createElement, html };
      Object.defineProperty(t, "logs", { get: () => logs.map((l) => l.text) });

      const results = [];
      for (const c of checks) {
        if (!get) {
          results.push({ skipped: true });
          continue;
        }
        try {
          const fn = (0, eval)("(" + c.src + ")");
          const value = fn(t);
          results.push({ value: value === undefined ? false : value });
        } catch (err) {
          results.push({ value: "Kaldet til din komponent fejlede: " + (err && err.message ? err.message : String(err)) });
        }
      }
      self.postMessage({ logs, error, html, results });
    };
  }

  const WORKER_SRC =
    "let __loadError = null;\n" +
    "try { importScripts(" + JSON.stringify(REACT_URL) + ", " + JSON.stringify(SERVER_URL) + "); }\n" +
    'catch (e) { __loadError = "React kunne ikke indlæses fra CDN (" + (e && e.message) + "). Tjek din internetforbindelse."; }\n' +
    "(" + workerMain.toString() + ")(__loadError);";

  const escapeHtml = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));

  const PREVIEW_CSS =
    "body{font-family:system-ui,-apple-system,'Segoe UI',sans-serif;margin:16px;line-height:1.5;color:#1b2140}" +
    "img{max-width:100%}.lab-error{background:#fff1f2;border:1px solid #f43f5e;color:#9f1239;padding:12px;border-radius:8px;white-space:pre-wrap;font-family:ui-monospace,Menlo,monospace;font-size:13px}" +
    ".lab-warn{margin-top:24px;background:#fffbeb;border:1px solid #f59e0b;color:#92400e;padding:10px 12px;border-radius:8px;font-size:12px}" +
    ".lab-warn pre{margin:6px 0 0;white-space:pre-wrap;font-family:ui-monospace,Menlo,monospace}";

  function previewDoc(out) {
    const warnings = out.logs.filter((l) => l.level === "warn" || l.level === "error");
    let body = out.error ? `<div class="lab-error">${escapeHtml(out.error)}</div>` : out.html || "";
    if (warnings.length) {
      body += `<details class="lab-warn" open><summary>React-advarsler (${warnings.length})</summary><pre>${escapeHtml(
        warnings.map((l) => l.text).join("\n\n")
      )}</pre></details>`;
    }
    return `<!doctype html><html><head><meta charset="utf-8"><base target="_blank"><style>${PREVIEW_CSS}</style></head><body>${body}</body></html>`;
  }

  let model = null;

  // Filer i assets/ som kan importeres i opgaverne. Fuld URL, så billedet også findes inde i preview-iframen.
  const ASSET_FILES = ["kat.svg", "mouse.jpg", "skyline.mp4"];
  function assetUrls() {
    const urls = {};
    ASSET_FILES.forEach((f) => {
      urls[f] = new URL("assets/" + f, document.baseURI).href;
    });
    return urls;
  }

  function execute(js, challenge, checks) {
    return TSCore.runWorker(WORKER_SRC, {
      js,
      checks,
      entry: challenge.entry || null,
      entryProps: challenge.entryProps || null,
      assets: assetUrls(),
    });
  }

  async function loadTypes() {
    const fetchText = async (file) => {
      const res = await fetch(new URL("react-types/" + file + VERSION_QUERY, SCRIPT_SRC));
      if (!res.ok) throw new Error(file + ": " + res.status);
      return res.text();
    };
    const [index, jsx, assets] = await Promise.all([fetchText("index.d.ts"), fetchText("jsx-runtime.d.ts"), fetchText("assets.d.ts")]);
    return { index, jsx, assets };
  }

  function evaluateStatic(check, ctx) {
    try {
      const res = check.test(ctx);
      return res === true ? { ok: true, label: check.label } : { ok: false, label: check.label, message: typeof res === "string" ? res : check.fail };
    } catch (err) {
      return { ok: false, label: check.label, message: check.fail };
    }
  }

  global.ENGINES.react = {
    language: "typescript",
    syntaxLabel: "Typer & fejl",
    previewLabel: "Preview",
    previewKind: "frame",
    emptyIssues: "Ingen typefejl. Flot!",
    ownsMarkers: true,

    async init(editor, course) {
      if (editor.kind !== "monaco") {
        return "Editoren (Monaco) kunne ikke indlæses. Tjek din internetforbindelse, og genindlæs siden.";
      }
      let types;
      try {
        types = await loadTypes();
      } catch (err) {
        return "React-typerne kunne ikke hentes (" + err.message + "). Genindlæs siden.";
      }
      const ts = monaco.languages.typescript;
      ts.typescriptDefaults.setCompilerOptions(
        Object.assign(
          {
            target: ts.ScriptTarget.ES2020,
            module: ts.ModuleKind.CommonJS,
            moduleResolution: ts.ModuleResolutionKind.NodeJs,
            moduleDetection: 3,
            jsx: ts.JsxEmit.ReactJSX,
            esModuleInterop: true,
            strict: true,
            lib: ["es2020", "dom", "dom.iterable"],
            allowNonTsExtensions: true,
          },
          course.compilerOptions || {}
        )
      );
      ts.typescriptDefaults.addExtraLib(types.index, "file:///node_modules/@types/react/index.d.ts");
      ts.typescriptDefaults.addExtraLib(types.jsx, "file:///node_modules/@types/react/jsx-runtime.d.ts");
      ts.typescriptDefaults.addExtraLib(types.assets, "file:///lab/assets.d.ts");
      ts.typescriptDefaults.setEagerModelSync(true);
      model = editor.model;
      return true;
    },

    analyze: () => TSCore.analyze(model),

    async preview(code, ui, isStale, challenge) {
      const out = await execute(await TSCore.emit(model), challenge, []);
      if (isStale()) return;
      // Safari bygger videokontrollerne med script, så de virker kun med allow-scripts. Uden allow-same-origin er koden stadig isoleret fra siden.
      ui.frame.setAttribute("sandbox", "allow-scripts allow-popups allow-popups-to-escape-sandbox");
      ui.frame.srcdoc = previewDoc(out);
    },

    async run(challenge, code) {
      const diag = await TSCore.analyze(model);
      const js = await TSCore.emit(model);
      const clean = TSCore.stripCode(code);
      const blank = clean.trim() === "";

      const runtimeIndexes = [];
      const runtimeChecks = [];
      challenge.checks.forEach((c, i) => {
        if (c.runtime) {
          runtimeIndexes.push(i);
          runtimeChecks.push({ src: c.runtime.toString() });
        }
      });
      const out = await execute(js, challenge, runtimeChecks);

      const doc = new DOMParser().parseFromString("<!doctype html><body>" + (out.html || ""), "text/html");
      const norm = (s) => (s || "").replace(/\s+/g, " ").trim();
      const logTexts = out.logs.map((l) => l.text);
      const ctx = {
        code,
        clean,
        js,
        html: out.html || "",
        root: doc.body,
        $: (sel, root) => (root || doc).querySelector(sel),
        $$: (sel, root) => Array.from((root || doc).querySelectorAll(sel)),
        text: (el) => (el ? norm(el.textContent) : ""),
        attr: (el, name) => (el ? norm(el.getAttribute(name)) : ""),
        texts: (els) => els.map((e) => norm(e.textContent)),
        logs: logTexts,
        warnings: out.logs.filter((l) => l.level === "warn" || l.level === "error").map((l) => l.text),
        errors: diag.errors,
        has: (re) => re.test(clean),
      };

      const first = diag.errors[0];
      const checks = [
        {
          ok: !blank && diag.errors.length === 0,
          label: "Koden har ingen typefejl",
          message: blank
            ? "Du har ikke skrevet nogen kode endnu."
            : first
            ? `TypeScript fandt ${diag.errors.length} fejl. Første (linje ${first.line}): ${first.message} Se fanen "Typer & fejl".`
            : "",
        },
        { ok: !blank && !out.error, label: "Komponenten kan vises uden fejl", message: out.error || "Du har ikke skrevet nogen kode endnu." },
      ];

      challenge.checks.forEach((c, i) => {
        if (blank) {
          checks.push({ ok: false, label: c.label, message: c.fail });
        } else if (c.runtime) {
          const res = out.results[runtimeIndexes.indexOf(i)];
          if (!res || res.skipped) {
            checks.push({ ok: false, label: c.label, message: "Koden kunne ikke køre, så dette krav kunne ikke tjekkes. Ret først fejlen ovenfor." });
          } else if (res.value === true) {
            checks.push({ ok: true, label: c.label });
          } else {
            checks.push({ ok: false, label: c.label, message: typeof res.value === "string" ? res.value : c.fail });
          }
        } else {
          checks.push(evaluateStatic(c, ctx));
        }
      });

      return {
        passed: checks.every((c) => c.ok),
        checks,
        okCount: checks.filter((c) => c.ok).length,
        total: checks.length,
      };
    },
  };
})(window);
