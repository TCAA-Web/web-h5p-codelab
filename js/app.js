/*
 * HTML Coding Lab – hovedlogik
 * Editor (Monaco), live preview, validering, progression, badges, tema og autosave.
 */
(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const TOTAL = CHALLENGES.length;
  const MONACO_BASE = "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.52.2/min";

  const state = LabStorage.load();
  state.current = Math.min(Math.max(0, state.current | 0), TOTAL - 1);

  let editor = null;
  let activeTab = "task";
  let lastResult = null;
  let suppressChange = false;
  let saveTimer, previewTimer, lintTimer;

  const challenge = () => CHALLENGES[state.current];
  const solvedCount = () => CHALLENGES.filter((c) => state.solved[c.id]).length;
  const firstOpen = () => {
    const i = CHALLENGES.findIndex((c) => !state.solved[c.id]);
    return i === -1 ? TOTAL - 1 : i;
  };

  /* ---------------------------------------------------------------- DOM helpers */

  function el(tag, props, children) {
    const node = document.createElement(tag);
    Object.entries(props || {}).forEach(([k, v]) => {
      if (k === "class") node.className = v;
      else if (k === "text") node.textContent = v;
      else if (k.startsWith("on")) node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v);
    });
    [].concat(children || []).forEach((c) => node.append(c));
    return node;
  }

  // **fed** og `kode` -> noder (aldrig innerHTML, så indhold kan ikke injicere HTML)
  function inline(text, parent) {
    text.split(/(`[^`]+`|\*\*[^*]+\*\*)/).forEach((part) => {
      if (!part) return;
      if (part.startsWith("`")) parent.append(el("code", { text: part.slice(1, -1) }));
      else if (part.startsWith("**")) parent.append(el("strong", { text: part.slice(2, -2) }));
      else parent.append(document.createTextNode(part));
    });
    return parent;
  }

  function richBlock(text) {
    const frag = document.createDocumentFragment();
    text.split(/\n\n/).forEach((block) => {
      let list = null;
      let para = [];
      const flush = () => {
        if (para.length) frag.append(inline(para.join(" "), el("p")));
        para = [];
      };
      block.split("\n").forEach((line) => {
        const ul = /^- (.*)/.exec(line);
        const ol = /^\d+\. (.*)/.exec(line);
        if (ul || ol) {
          flush();
          const type = ul ? "ul" : "ol";
          if (!list || list.tagName.toLowerCase() !== type) {
            list = el(type);
            frag.append(list);
          }
          list.append(inline((ul || ol)[1], el("li")));
        } else {
          list = null;
          para.push(line);
        }
      });
      flush();
    });
    return frag;
  }

  /* ---------------------------------------------------------------- Persistence */

  function persist() {
    LabStorage.save(state);
  }

  function persistSoon() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(persist, 250);
  }

  window.addEventListener("pagehide", persist);

  /* ---------------------------------------------------------------- Theme */

  function systemTheme() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }

  function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    $("themeIcon").textContent = theme === "dark" ? "🌙" : "☀️";
    if (editor) editor.setTheme(theme);
  }

  $("themeBtn").addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    state.theme = next;
    state.themeToggles += 1;
    applyTheme(next);
    afterProgress();
    persist();
  });

  /* ---------------------------------------------------------------- Editor adapters */

  function createMonaco(host, theme) {
    const name = (t) => (t === "dark" ? "lab-dark" : "lab-light");
    monaco.editor.defineTheme("lab-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [],
      colors: { "editor.background": "#0d1329", "editorLineNumber.foreground": "#4b5683" },
    });
    monaco.editor.defineTheme("lab-light", {
      base: "vs",
      inherit: true,
      rules: [],
      colors: { "editor.background": "#ffffff", "editorLineNumber.foreground": "#9aa3c7" },
    });
    const ed = monaco.editor.create(host, {
      value: "",
      language: "html",
      theme: name(theme),
      automaticLayout: true,
      minimap: { enabled: false },
      fontSize: 14,
      lineHeight: 22,
      fontFamily: "'JetBrains Mono', 'Fira Code', ui-monospace, Menlo, Consolas, monospace",
      tabSize: 2,
      wordWrap: "on",
      scrollBeyondLastLine: false,
      padding: { top: 12, bottom: 12 },
      renderLineHighlight: "all",
      bracketPairColorization: { enabled: true },
      smoothScrolling: true,
      "semanticHighlighting.enabled": false,
    });
    const model = ed.getModel();
    return {
      kind: "monaco",
      getValue: () => ed.getValue(),
      setValue: (v) => ed.setValue(v),
      onChange: (fn) => ed.onDidChangeModelContent(fn),
      onRun: (fn) => ed.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, fn),
      setTheme: (t) => monaco.editor.setTheme(name(t)),
      setMarkers: (issues) =>
        monaco.editor.setModelMarkers(
          model,
          "html-lab",
          issues.map((i) => ({
            severity: i.severity === "error" ? monaco.MarkerSeverity.Error : monaco.MarkerSeverity.Warning,
            message: i.message.replace(/`/g, ""),
            startLineNumber: i.line,
            startColumn: i.col,
            endLineNumber: i.endLine,
            endColumn: i.endCol,
          }))
        ),
      reveal: (line, col) => {
        ed.revealLineInCenter(line);
        ed.setPosition({ lineNumber: line, column: col });
        ed.focus();
      },
    };
  }

  // Reserveløsning hvis Monaco ikke kan hentes (fx blokeret CDN)
  function createTextarea(host) {
    const ta = el("textarea", { spellcheck: "false", "aria-label": "Kodeeditor", autocapitalize: "off" });
    host.append(ta);
    ta.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        e.preventDefault();
        const s = ta.selectionStart;
        ta.setRangeText("  ", s, ta.selectionEnd, "end");
        ta.dispatchEvent(new Event("input"));
      }
    });
    return {
      kind: "textarea",
      getValue: () => ta.value,
      setValue: (v) => {
        ta.value = v;
        ta.dispatchEvent(new Event("input"));
      },
      onChange: (fn) => ta.addEventListener("input", fn),
      onRun: (fn) =>
        ta.addEventListener("keydown", (e) => {
          if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
            e.preventDefault();
            fn();
          }
        }),
      setTheme: () => {},
      setMarkers: () => {},
      reveal: (line) => {
        const lines = ta.value.split("\n");
        const pos = lines.slice(0, line - 1).reduce((n, l) => n + l.length + 1, 0);
        ta.focus();
        ta.setSelectionRange(pos, pos + (lines[line - 1] || "").length);
      },
    };
  }

  function bootEditor(done) {
    const host = $("editor");
    host.append(el("div", { class: "editor-loading", text: "Indlæser editor…" }));
    let settled = false;

    function finish(adapter) {
      if (settled) return;
      settled = true;
      host.textContent = "";
      editor = adapter === "fallback" ? createTextarea(host) : adapter();
      done();
    }

    if (typeof require === "undefined" || typeof require.config !== "function") {
      finish("fallback");
      return;
    }

    // Workers skal ligge på samme oprindelse, så vi starter dem via en blob
    window.MonacoEnvironment = {
      getWorkerUrl: () =>
        URL.createObjectURL(
          new Blob([`self.MonacoEnvironment={baseUrl:"${MONACO_BASE}/"};importScripts("${MONACO_BASE}/vs/base/worker/workerMain.js");`], {
            type: "text/javascript",
          })
        ),
    };
    require.config({ paths: { vs: MONACO_BASE + "/vs" } });
    require.onError = () => finish("fallback");
    require(
      ["vs/editor/editor.main"],
      () => finish(() => createMonaco(host, document.documentElement.dataset.theme)),
      () => finish("fallback")
    );
    setTimeout(() => finish("fallback"), 15000);
  }

  /* ---------------------------------------------------------------- Preview & lint */

  function previewHtml(code) {
    const base = '<base target="_blank">';
    return /<head[^>]*>/i.test(code) ? code.replace(/<head[^>]*>/i, (m) => m + base) : code + base;
  }

  function updatePreview() {
    $("preview").srcdoc = previewHtml(editor.getValue());
  }

  function lint() {
    const result = HTMLSyntax.analyze(editor.getValue());
    editor.setMarkers(result.issues);
    renderSyntax(result);
    return result;
  }

  function renderSyntax(result) {
    const list = $("syntaxList");
    list.textContent = "";
    const badge = $("syntaxBadge");

    if (!result.issues.length) {
      badge.hidden = false;
      badge.textContent = "✓";
      badge.className = "tab-badge is-ok";
      list.append(
        el("div", { class: "empty" }, [el("span", { class: "big", text: "✅" }), "Ingen syntaksproblemer fundet. Flot!"])
      );
      return;
    }

    const e = result.errors.length;
    const w = result.warnings.length;
    badge.hidden = false;
    badge.textContent = e || w;
    badge.className = "tab-badge" + (e ? "" : " is-warn");

    const summary = el("p", { class: "check-msg" });
    summary.textContent = `${e} fejl · ${w} advarsler. Klik på et punkt for at springe til linjen.`;
    summary.style.marginBottom = "10px";
    const ul = el("ul", { class: "issues" });
    result.issues.forEach((issue) => {
      const text = el("div", {}, [
        inline(issue.message, el("span")),
        el("span", { class: "issue-meta", text: `Linje ${issue.line}, kol. ${issue.col} · ${issue.severity === "error" ? "fejl" : "advarsel"}` }),
      ]);
      const btn = el(
        "button",
        {
          class: "issue " + issue.severity,
          type: "button",
          onclick: () => editor.reveal(issue.line, issue.col),
        },
        [el("span", { class: "mark", text: issue.severity === "error" ? "!" : "?" }), text]
      );
      ul.append(el("li", {}, btn));
    });
    list.append(summary, ul);
  }

  /* ---------------------------------------------------------------- Feedback */

  function renderChecklist(result) {
    const wrap = $("feedback");
    wrap.textContent = "";
    const ch = challenge();

    if (!result) {
      wrap.append(
        el("div", { class: "empty" }, [el("span", { class: "big", text: "🧪" }), "Skriv din kode, og tryk på ", el("strong", { text: "Tjek kode" }), " for at få feedback på hvert krav."])
      );
      const ul = el("ul", { class: "checks", style: "margin-top:14px" });
      ch.checks.forEach((c) => ul.append(checkItem({ label: c.label }, "idle")));
      wrap.append(ul);
      return;
    }

    const percent = Math.round((result.okCount / result.total) * 100);
    const banner = el("div", { class: "banner " + (result.passed ? "success" : "fail") }, [
      el("div", { class: "banner-icon", text: result.passed ? "🎉" : "🔧" }),
      el("div", { style: "flex:1" }, [
        el("strong", {
          text: result.passed
            ? "Flot! Alle krav er opfyldt."
            : `${result.okCount} af ${result.total} krav er opfyldt`,
        }),
        el("small", {
          text: result.passed
            ? state.current < TOTAL - 1
              ? "Tryk på Næste for at fortsætte."
              : "Du har gennemført den sidste udfordring!"
            : "Ret fejlene herunder og tjek igen.",
        }),
        el("div", { class: "mini-bar" }, el("i", { style: `width:${percent}%` })),
      ]),
    ]);
    const stale = el("div", { class: "stale-note", id: "staleNote", hidden: "" }, "Koden er ændret siden sidste tjek.");
    const ul = el("ul", { class: "checks" });
    // Mislykkede krav først, så eleverne ser hvad der mangler
    const ordered = result.checks.slice().sort((a, b) => Number(a.ok) - Number(b.ok));
    ordered.forEach((c, i) => ul.append(checkItem(c, c.ok ? "ok" : "bad", i)));
    wrap.append(banner, stale, ul);
  }

  function checkItem(c, status, index) {
    const body = el("div", {}, [inline(c.label, el("div"))]);
    if (status === "bad" && c.message) body.append(inline(c.message, el("div", { class: "check-msg" })));
    const item = el("li", { class: "check " + status }, [
      el("span", { class: "mark", text: status === "ok" ? "✓" : status === "bad" ? "✕" : "" }),
      body,
    ]);
    item.style.animationDelay = (index || 0) * 40 + "ms";
    return item;
  }

  function markStale() {
    const note = $("staleNote");
    if (note && lastResult) note.hidden = false;
  }

  /* ---------------------------------------------------------------- Tabs */

  function showTab(name) {
    activeTab = name;
    document.querySelectorAll(".tab").forEach((t) => {
      const on = t.dataset.tab === name;
      t.classList.toggle("is-active", on);
      t.setAttribute("aria-selected", String(on));
    });
    document.querySelectorAll(".panel").forEach((p) => p.classList.toggle("is-active", p.id === "panel-" + name));
  }

  document.querySelectorAll(".tab").forEach((t) => t.addEventListener("click", () => showTab(t.dataset.tab)));

  /* ---------------------------------------------------------------- Challenge rendering */

  function renderStepper() {
    const nav = $("stepper");
    nav.textContent = "";
    const open = firstOpen();
    CHALLENGES.forEach((c, i) => {
      const locked = i > open;
      const cls = ["step", i === state.current ? "is-current" : "", state.solved[c.id] ? "is-done" : ""].join(" ").trim();
      const btn = el(
        "button",
        {
          class: cls,
          type: "button",
          title: locked ? "Løs de tidligere udfordringer først" : c.title,
          "aria-current": i === state.current ? "step" : "false",
          onclick: () => goTo(i),
        },
        [el("span", { class: "step-num", text: state.solved[c.id] ? "✓" : locked ? "🔒" : String(i + 1) }), c.topic]
      );
      btn.disabled = locked;
      nav.append(btn);
    });
    const current = nav.querySelector(".is-current");
    if (current && current.scrollIntoView) current.scrollIntoView({ block: "nearest", inline: "center" });
  }

  function renderProgress() {
    const n = solvedCount();
    const pct = Math.round((n / TOTAL) * 100);
    $("progressFill").style.width = pct + "%";
    $("progressLabel").textContent = `${n} / ${TOTAL} løst`;
    $("progressPct").textContent = pct + " %";
    $("progress").setAttribute("aria-valuenow", String(n));
    $("badgeCount").textContent = Object.keys(state.badges).length;
    const next = $("nextBtn");
    const last = state.current === TOTAL - 1;
    next.disabled = !state.solved[challenge().id];
    next.textContent = last ? "🏆 Afslut" : "Næste →";
  }

  function renderHints() {
    const ch = challenge();
    const shown = Math.min(state.hints[ch.id] || 0, ch.hints.length);
    const list = $("hintList");
    list.textContent = "";
    ch.hints.slice(0, shown).forEach((h) => list.append(inline(h, el("li"))));
    const btn = $("hintBtn");
    const left = ch.hints.length - shown;
    btn.disabled = left === 0;
    btn.textContent = left ? `💡 Vis hint (${left} tilbage)` : "Alle hints vist";
  }

  function loadChallenge() {
    const ch = challenge();
    $("chIcon").textContent = ch.icon;
    $("chTopic").textContent = `Udfordring ${state.current + 1} af ${TOTAL} · ${ch.topic}`;
    $("chTitle").textContent = ch.title;
    const desc = $("chDesc");
    desc.textContent = "";
    desc.append(richBlock(ch.description));

    lastResult = null;
    renderChecklist(null);
    $("feedbackBadge").hidden = true;
    renderHints();
    renderStepper();
    renderProgress();
    showTab("task");

    suppressChange = true;
    editor.setValue(state.code[ch.id] != null ? state.code[ch.id] : ch.starter);
    suppressChange = false;
    updatePreview();
    lint();
    persist();
  }

  function goTo(i) {
    if (i < 0 || i >= TOTAL || i > firstOpen()) return;
    state.current = i;
    loadChallenge();
  }

  /* ---------------------------------------------------------------- Run / check */

  function runCheck() {
    const ch = challenge();
    const code = editor.getValue();
    const result = Validators.run(ch, code);
    lastResult = result;
    state.code[ch.id] = code;
    state.attempts[ch.id] = (state.attempts[ch.id] || 0) + 1;
    updatePreview();
    lint();

    const wasSolved = !!state.solved[ch.id];
    if (result.passed) {
      if (!wasSolved) {
        state.solved[ch.id] = true;
        if (state.attempts[ch.id] === 1) state.firstTry[ch.id] = true;
      }
    } else {
      state.fails[ch.id] = (state.fails[ch.id] || 0) + 1;
    }

    renderChecklist(result);
    const fb = $("feedbackBadge");
    fb.hidden = false;
    fb.textContent = result.passed ? "✓" : `${result.okCount}/${result.total}`;
    fb.className = "tab-badge" + (result.passed ? " is-ok" : " is-warn");
    showTab("feedback");

    renderStepper();
    renderProgress();
    if (result.passed && !wasSolved) {
      toast("🎉", "Udfordring løst!", ch.title);
      if (solvedCount() === TOTAL) setTimeout(openFinish, 900);
    }
    afterProgress();
    persist();
  }

  function afterProgress() {
    Achievements.evaluate(state).forEach((b, i) => setTimeout(() => toast(b.icon, "Ny badge: " + b.title, b.desc, true), 500 + i * 600));
    renderProgress();
    persist();
  }

  /* ---------------------------------------------------------------- Toasts & modal */

  function toast(icon, title, text, isBadge) {
    const node = el("div", { class: "toast" + (isBadge ? " badge" : "") }, [
      el("div", { class: "toast-icon", text: icon }),
      el("div", {}, [el("strong", { text: title }), el("small", { text })]),
    ]);
    $("toasts").append(node);
    setTimeout(() => {
      node.classList.add("out");
      setTimeout(() => node.remove(), 320);
    }, 4200);
  }

  let lastFocus = null;

  function openModal(title, body, actions) {
    lastFocus = document.activeElement;
    $("modalTitle").textContent = title;
    const bodyEl = $("modalBody");
    bodyEl.textContent = "";
    bodyEl.append(body);
    const act = $("modalActions");
    act.textContent = "";
    (actions || []).forEach((a) =>
      act.append(
        el("button", {
          class: "btn " + (a.kind || ""),
          type: "button",
          text: a.label,
          onclick: () => {
            closeModal();
            if (a.run) a.run();
          },
        })
      )
    );
    $("modal").hidden = false;
    $("modalClose").focus();
  }

  function closeModal() {
    $("modal").hidden = true;
    $("modalBody").textContent = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  $("modalClose").addEventListener("click", closeModal);
  $("modal").addEventListener("click", (e) => {
    if (e.target === $("modal")) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !$("modal").hidden) closeModal();
  });

  function confirmDialog(title, text, confirmLabel, onConfirm) {
    openModal(title, el("p", { text }), [
      { label: "Annuller" },
      { label: confirmLabel, kind: "btn-danger", run: onConfirm },
    ]);
  }

  function openBadges() {
    const grid = el("div", { class: "badge-grid" });
    Achievements.BADGES.forEach((b) => {
      const earned = !!state.badges[b.id];
      grid.append(
        el("div", { class: "badge " + (earned ? "earned" : "locked") }, [
          el("span", { class: "badge-icon", text: earned ? b.icon : "🔒" }),
          el("strong", { text: b.title }),
          el("small", { text: b.desc }),
        ])
      );
    });
    const count = Object.keys(state.badges).length;
    openModal(`Badges (${count}/${Achievements.BADGES.length})`, grid, [{ label: "Luk", kind: "btn-primary" }]);
  }

  function openFinish() {
    const hints = Object.values(state.hints).reduce((a, b) => a + b, 0);
    const attempts = Object.values(state.attempts).reduce((a, b) => a + b, 0);
    const stat = (value, label) => el("div", { class: "stat" }, [el("b", { text: String(value) }), el("span", { text: label })]);
    const body = el("div", { class: "finish" }, [
      el("span", { class: "trophy", text: "🏆" }),
      el("p", { text: "Du har gennemført alle 9 udfordringer i begynder-HTML. Rigtig flot arbejde!" }),
      el("div", { class: "stats" }, [
        stat(`${solvedCount()}/${TOTAL}`, "udfordringer"),
        stat(`${Object.keys(state.badges).length}/${Achievements.BADGES.length}`, "badges"),
        stat(hints, "hints brugt"),
      ]),
      el("p", { style: "margin-top:12px", text: `Du tjekkede din kode ${attempts} gange i alt.` }),
    ]);
    const confetti = el("div", { class: "confetti" });
    const colors = ["#7c5cff", "#22d3ee", "#22c55e", "#f59e0b", "#f43f5e", "#4f8bff"];
    for (let i = 0; i < 60; i++) {
      const piece = el("i");
      piece.style.left = Math.random() * 100 + "%";
      piece.style.background = colors[i % colors.length];
      piece.style.animationDuration = 2.5 + Math.random() * 2.5 + "s";
      piece.style.animationDelay = Math.random() * 1.2 + "s";
      confetti.append(piece);
    }
    $("modal").append(confetti);
    openModal("HTML Expert!", body, [
      { label: "Se badges", run: openBadges },
      { label: "Fortsæt med at øve", kind: "btn-primary" },
    ]);
    setTimeout(() => confetti.remove(), 7000);
  }

  /* ---------------------------------------------------------------- Events */

  $("runBtn").addEventListener("click", runCheck);
  $("nextBtn").addEventListener("click", () => {
    if (state.current < TOTAL - 1) goTo(state.current + 1);
    else if (solvedCount() === TOTAL) openFinish();
  });
  $("badgesBtn").addEventListener("click", openBadges);

  $("hintBtn").addEventListener("click", () => {
    const ch = challenge();
    state.hints[ch.id] = Math.min((state.hints[ch.id] || 0) + 1, ch.hints.length);
    renderHints();
    afterProgress();
  });

  $("resetBtn").addEventListener("click", () =>
    confirmDialog("Nulstil opgaven?", "Din kode i denne opgave erstattes af den oprindelige startkode.", "Nulstil", () => {
      editor.setValue(challenge().starter);
      lastResult = null;
      renderChecklist(null);
      $("feedbackBadge").hidden = true;
      showTab("task");
    })
  );

  $("restartBtn").addEventListener("click", () =>
    confirmDialog("Start forfra?", "Al din kode, dine fremskridt og badges slettes, og du starter på udfordring 1.", "Slet og start forfra", () => {
      const theme = state.theme;
      LabStorage.clear();
      Object.assign(state, LabStorage.defaults(), { theme });
      loadChallenge();
      persist();
    })
  );

  function onEditorChange() {
    if (suppressChange) return;
    const ch = challenge();
    state.code[ch.id] = editor.getValue();
    persistSoon();
    markStale();
    clearTimeout(previewTimer);
    previewTimer = setTimeout(updatePreview, 350);
    clearTimeout(lintTimer);
    lintTimer = setTimeout(lint, 250);
  }

  /* ---------------------------------------------------------------- Boot */

  applyTheme(state.theme || systemTheme());
  bootEditor(() => {
    editor.onChange(onEditorChange);
    editor.onRun(runCheck);
    editor.setTheme(document.documentElement.dataset.theme);
    loadChallenge();
    afterProgress();
  });
})();
