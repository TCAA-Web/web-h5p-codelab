/*
 * Fælles hjælpefunktioner til TypeScript-baserede motorer (typescript.js og react.js):
 * typefejl og JavaScript-udskrift fra Monacos TypeScript-compiler, kørsel i en Web Worker
 * med timeout, og oprydning af kode til regex-tjek.
 */
(function (global) {
  "use strict";

  const TIMEOUT_MS = 3000;

  // Fjerner kommentarer og indholdet af strenge, så regex-tjek ikke snydes af tekst
  function stripCode(code) {
    const re = /\/\*[\s\S]*?\*\/|\/\/[^\n]*|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\[\s\S]|[^\\`])*`/g;
    return code.replace(re, (m) => (m.startsWith("/") ? " " : '""'));
  }

  function flatten(msg) {
    if (typeof msg === "string") return msg;
    return msg.messageText + (msg.next ? " " + msg.next.map(flatten).join(" ") : "");
  }

  async function getWorker(model) {
    const factory = await monaco.languages.typescript.getTypeScriptWorker();
    return factory(model.uri);
  }

  async function emit(model) {
    const worker = await getWorker(model);
    const out = await worker.getEmitOutput(model.uri.toString());
    const file = out.outputFiles.find((f) => /\.js$/.test(f.name));
    return file ? file.text : "";
  }

  async function analyze(model) {
    const worker = await getWorker(model);
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

  // Kører `src` (kildekode til en worker) og sender `message`. Workeren svarer med ét postMessage.
  function runWorker(src, message) {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(new Blob([src], { type: "text/javascript" }));
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
      worker.postMessage(message);
    });
  }

  global.TSCore = { stripCode, analyze, emit, runWorker };
})(window);
