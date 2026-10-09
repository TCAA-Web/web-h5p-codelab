/*
 * HTML-motor: syntaksanalyse + DOM-baserede validatorer + live preview i en sandboxed iframe.
 *
 * Motor-interface (bruges af app.js):
 *   language, syntaxLabel, previewLabel, previewKind ("frame" | "console"), emptyIssues, ownsMarkers
 *   init(editor)            -> Promise<true | string>  (streng = fejlbesked, motoren kan ikke bruges)
 *   analyze(code, editor)   -> Promise<{ issues }>
 *   preview(code, ui)       -> Promise<void>
 *   run(challenge, code)    -> Promise<{ passed, checks, okCount, total }>
 */
(function (global) {
  "use strict";

  // Links skal åbne i ny fane, ellers navigerer preview-iframen væk fra elevens kode
  function previewHtml(code) {
    const base = '<base target="_blank">';
    return /<head[^>]*>/i.test(code) ? code.replace(/<head[^>]*>/i, (m) => m + base) : code + base;
  }

  global.ENGINES.html = {
    language: "html",
    syntaxLabel: "Syntaks",
    previewLabel: "Live preview",
    previewKind: "frame",
    emptyIssues: "Ingen syntaksproblemer fundet. Flot!",
    ownsMarkers: false,

    async init() {
      return true;
    },
    async analyze(code) {
      return HTMLSyntax.analyze(code);
    },
    async preview(code, ui) {
      ui.frame.srcdoc = previewHtml(code);
    },
    async run(challenge, code) {
      return Validators.run(challenge, code);
    },
  };
})(window);
