/*
 * TypeScript-motor.
 *  - Typefejl kommer fra Monacos indbyggede TypeScript-compiler (samme som i VS Code).
 *  - Koden oversættes til JavaScript og køres i en Web Worker med timeout, så et uendeligt
 *    loop aldrig fryser siden. console.log vises i preview-feltet (konsol).
 *  - Krav (checks) kan være statiske (`test(c)` – ser på kode, typefejl og output) eller
 *    kørende (`runtime(get, logs)` – kører inde i workeren og kan kalde elevens funktioner).
 *
 * VIGTIGT: `runtime`-funktioner sendes til workeren som tekst (toString), så de må ikke
 * bruge variabler uden for sig selv. Eksempel:
 *   runtime: (get) => get("laegSammen")(2, 3) === 5 || "laegSammen(2, 3) skal give 5"
 *   - get("navn") læser en top-level funktion/variabel fra elevens kode
 *   - logs er en liste af de tekster, koden har skrevet med console.log
 */
(function (global) {
  "use strict";

  const TIMEOUT_MS = 3000;
  const CONSOLE_DTS =
    "declare const console: { log(...data: any[]): void; info(...data: any[]): void; warn(...data: any[]): void; error(...data: any[]): void; };";

  // Køres i workeren. Skal være selvstændig (bruger ikke noget udefra).
  function workerMain() {
    const fmt = (v) => {
      if (typeof v === "string") return v;
      if (typeof v === "function") return "[Function" + (v.name ? ": " + v.name : "") + "]";
      if (typeof v === "bigint") return v + "n";
      if (v === null || typeof v !== "object") return String(v);
      try {
        const seen = new WeakSet();
        return JSON.stringify(v, (k, x) => {
          if (typeof x === "bigint") return x + "n";
          if (typeof x === "object" && x !== null) {
            if (seen.has(x)) return "[Circular]";
            seen.add(x);
          }
          return x;
        });
      } catch (err) {
        return String(v);
      }
    };

    self.onmessage = async (e) => {
      const { js, checks } = e.data;
      const logs = [];
      const make = (level) => (...args) => {
        if (logs.length < 300) logs.push({ level, text: args.map(fmt).join(" ") });
      };
      const fakeConsole = { log: make("log"), info: make("info"), warn: make("warn"), error: make("error") };

      let get = null;
      let error = null;
      try {
        const module = { exports: {} };
        // Funktionen til sidst ligger i samme scope som elevens kode og kan derfor læse top-level navne
        const factory = new Function("exports", "module", "console", js + "\n;return function (__expr) { return eval(__expr); };");
        get = factory(module.exports, module, fakeConsole);
      } catch (err) {
        error = err && err.message ? err.name + ": " + err.message : String(err);
      }

      const results = [];
      for (const c of checks) {
        if (!get) {
          results.push({ skipped: true });
          continue;
        }
        try {
          const fn = (0, eval)("(" + c.src + ")");
          const value = await fn(get, logs.map((l) => l.text));
          results.push({ value: value === undefined ? false : value });
        } catch (err) {
          results.push({ value: "Kaldet til din funktion fejlede: " + (err && err.message ? err.message : String(err)) });
        }
      }
      self.postMessage({ logs, error, results });
    };
  }
  const WORKER_SRC = "(" + workerMain.toString() + ")()";

  function execute(js, checks) {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(new Blob([WORKER_SRC], { type: "text/javascript" }));
      let worker;
      let timer;
      const finish = (res) => {
        clearTimeout(timer);
        if (worker) worker.terminate();
        URL.revokeObjectURL(url);
        resolve(Object.assign({ logs: [], error: null, results: [] }, res));
      };
      try {
        worker = new Worker(url);
      } catch (err) {
        finish({ error: "Koden kunne ikke startes: " + err.message });
        return;
      }
      timer = setTimeout(
        () => finish({ error: "Koden kørte i mere end 3 sekunder og blev stoppet. Har du et uendeligt loop?" }),
        TIMEOUT_MS
      );
      worker.onmessage = (e) => finish(e.data);
      worker.onerror = (e) => finish({ error: e.message || "Ukendt fejl i koden." });
      worker.postMessage({ js, checks });
    });
  }

  // Fjerner kommentarer og indholdet af strenge, så regex-tjek ikke snydes af tekst
  function stripCode(code) {
    const re = /\/\*[\s\S]*?\*\/|\/\/[^\n]*|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\[\s\S]|[^\\`])*`/g;
    return code.replace(re, (m) => (m.startsWith("/") ? " " : '""'));
  }

  function flatten(msg) {
    if (typeof msg === "string") return msg;
    return msg.messageText + (msg.next ? " " + msg.next.map(flatten).join(" ") : "");
  }

  let model = null;

  async function getWorker() {
    const factory = await monaco.languages.typescript.getTypeScriptWorker();
    return factory(model.uri);
  }

  async function emit() {
    const worker = await getWorker();
    const out = await worker.getEmitOutput(model.uri.toString());
    const file = out.outputFiles.find((f) => /\.js$/.test(f.name));
    return file ? file.text : "";
  }

  async function analyze() {
    const worker = await getWorker();
    const uri = model.uri.toString();
    const [syntactic, semantic] = await Promise.all([worker.getSyntacticDiagnostics(uri), worker.getSemanticDiagnostics(uri)]);
    const issues = syntactic
      .concat(semantic)
      .filter((d) => d.category === 0 || d.category === 1)
      .map((d) => {
        const start = model.getPositionAt(d.start || 0);
        const end = model.getPositionAt((d.start || 0) + (d.length || 1));
        return {
          severity: d.category === 1 ? "error" : "warning",
          message: `${flatten(d.messageText)} (TS${d.code})`,
          line: start.lineNumber,
          col: start.column,
          endLine: end.lineNumber,
          endCol: end.column,
        };
      });
    return {
      issues,
      errors: issues.filter((i) => i.severity === "error"),
      warnings: issues.filter((i) => i.severity === "warning"),
    };
  }

  function renderConsole(box, out) {
    box.textContent = "";
    const add = (cls, text) => {
      const line = document.createElement("div");
      line.className = "console-line " + cls;
      line.textContent = text;
      box.append(line);
    };
    out.logs.forEach((l) => add(l.level, l.text));
    if (out.error) add("error", out.error);
    if (!out.logs.length && !out.error) add("hint", "Ingen output endnu. Brug console.log(…) til at skrive til konsollen.");
  }

  function evaluateStatic(check, ctx) {
    try {
      const res = check.test(ctx);
      return res === true ? { ok: true, label: check.label } : { ok: false, label: check.label, message: typeof res === "string" ? res : check.fail };
    } catch (err) {
      return { ok: false, label: check.label, message: check.fail };
    }
  }

  global.ENGINES.typescript = {
    language: "typescript",
    syntaxLabel: "Typer & fejl",
    previewLabel: "Konsol",
    previewKind: "console",
    emptyIssues: "Ingen typefejl. Flot!",
    ownsMarkers: true, // Monaco viser selv TypeScript-fejl i editoren

    async init(editor, course) {
      if (editor.kind !== "monaco") {
        return "TypeScript-editoren (Monaco) kunne ikke indlæses. Tjek din internetforbindelse, og genindlæs siden.";
      }
      const ts = monaco.languages.typescript;
      const options = Object.assign(
        {
          target: ts.ScriptTarget.ES2020,
          module: ts.ModuleKind.CommonJS,
          moduleDetection: 3, // hver fil er et modul, så navne som `name` ikke støder ind i globale typer
          strict: true,
          lib: ["es2020"],
          allowNonTsExtensions: true,
        },
        course.compilerOptions || {}
      );
      ts.typescriptDefaults.setCompilerOptions(options);
      if (!options.lib.includes("dom")) ts.typescriptDefaults.addExtraLib(CONSOLE_DTS, "file:///lab/console.d.ts");
      ts.typescriptDefaults.setEagerModelSync(true);
      model = editor.model;
      return true;
    },

    analyze,

    async preview(code, ui, isStale) {
      const out = await execute(await emit(), []);
      if (!isStale()) renderConsole(ui.console, out);
    },

    async run(challenge, code) {
      const diag = await analyze();
      const js = await emit();
      const clean = stripCode(code);
      const blank = clean.trim() === "";

      const runtimeIndexes = [];
      const runtimeChecks = [];
      challenge.checks.forEach((c, i) => {
        if (c.runtime) {
          runtimeIndexes.push(i);
          runtimeChecks.push({ src: c.runtime.toString() });
        }
      });
      const out = await execute(js, runtimeChecks);

      const ctx = {
        code,
        clean,
        js,
        logs: out.logs.map((l) => l.text),
        errors: diag.errors,
        warnings: diag.warnings,
        runtimeError: out.error,
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
        { ok: !blank && !out.error, label: "Koden kører uden fejl", message: out.error || "Du har ikke skrevet nogen kode endnu." },
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
