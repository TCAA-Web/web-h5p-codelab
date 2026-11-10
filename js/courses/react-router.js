/*
 * Kursus: React Router (6 opgaver).
 * Motor: js/engines/react.js
 */
(function (global) {
  "use strict";

  // Finder <Route> uanset attributrækkefølge og mellemrum
  const hasRoute = (code, path, component) =>
    code.split(/(?=<Route\b)/).filter((part) => part.startsWith("<Route")).some((tag) => {
      const p = /\bpath\s*=\s*(["'])(.*?)\1/.exec(tag);
      const e = /\belement\s*=\s*\{\s*<(\w+)\s*\/>\s*\}/.exec(tag);
      return !!p && !!e && p[2] === path && e[1] === component;
    });

  const challenges = [
    {
      id: "router-setup",
      title: "Sæt routeren op",
      topic: "Routes",
      icon: "🧭",
      description:
        "React Router gør det muligt at vise forskellige sider ud fra adressen i browseren. I et rigtigt projekt importerer du komponenterne fra `react-router-dom`.\n\n" +
        "Pak `Routes` og de tre `Route`-elementer ind i `BrowserRouter`. Opret routes for `/`, `/om` og `/kontakt`, og vis det matchende sidekomponent med `element`.",
      starter: `import { BrowserRouter, Routes, Route } from "react-router-dom";

function Forside() {
  return <h1>Forside</h1>;
}

function Om() {
  return <h1>Om os</h1>;
}

function Kontakt() {
  return <h1>Kontakt</h1>;
}

function App() {
  return (
    <BrowserRouter>
      {/* Opret Routes og Route-elementerne her */}
    </BrowserRouter>
  );
}

export default App;
`,
      hints: [
        "`Routes` omslutter alle dine `Route`-elementer.",
        "En route har både en `path` og et `element`, fx `<Route path=\"/\" element={<Forside />} />`.",
        "Opret én route pr. side: `/`, `/om` og `/kontakt`.",
      ],
      checks: [
        {
          label: "`BrowserRouter` omslutter `Routes`",
          fail: "Sæt `<Routes>` ind mellem `<BrowserRouter>` og `</BrowserRouter>`.",
          test: (c) => /<BrowserRouter>[\s\S]*<Routes>[\s\S]*<\/Routes>[\s\S]*<\/BrowserRouter>/.test(c.code),
        },
        {
          label: "De tre routes bruger de rigtige paths og sidekomponenter",
          fail: "Opret routes for `/`, `/om` og `/kontakt` med det matchende komponent i `element`.",
          test: (c) =>
            hasRoute(c.code, "/", "Forside") &&
            hasRoute(c.code, "/om", "Om") &&
            hasRoute(c.code, "/kontakt", "Kontakt"),
        },
        {
          label: "Forsiden vises på `/`",
          fail: "Forsiden skal være elementet på route `/`.",
          test: (c) => c.text(c.$("h1")) === "Forside" || "Route `/` skal vise overskriften `Forside`.",
        },
      ],
    },

    {
      id: "router-find-element-error",
      title: "Find fejlen: Forkert route-element",
      topic: "Fejlfinding",
      icon: "🐞",
      description:
        "Begge routes findes, men forsiden viser den forkerte komponent. Find fejlen i `element`-værdien for route `/`, så forsiden viser `Forside` og `/om` fortsat viser `Om os`.",
      starter: `import { BrowserRouter, Routes, Route } from "react-router-dom";

function Forside() {
  return <h1>Forside</h1>;
}

function Om() {
  return <h1>Om os</h1>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Om />} />
        <Route path="/om" element={<Om />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
`,
      hints: [
        "Sammenlign `path` og `element` på hver route.",
        "Route `/` skal vise forsiden, ikke siden `Om`.",
        "Skift kun elementet på route `/` til `<Forside />`.",
      ],
      checks: [
        {
          label: "Route `/` viser `Forside`",
          fail: "Brug `<Forside />` som element på route `/`.",
          test: (c) => hasRoute(c.code, "/", "Forside"),
        },
        {
          label: "Route `/om` viser stadig `Om`",
          fail: "Behold `<Om />` som element på route `/om`.",
          test: (c) => hasRoute(c.code, "/om", "Om"),
        },
        {
          label: "Previewet viser forsiden",
          fail: "Forsiden skal vise overskriften `Forside`.",
          test: (c) => c.text(c.$("h1")) === "Forside" || "Previewet viser ikke `Forside` på route `/`.",
        },
      ],
    },

    {
      id: "router-nav-link",
      title: "Kobl et menupunkt til en route",
      topic: "Navigation",
      icon: "🔗",
      description:
        "Navigationsmenuer bruger `Link` fra `react-router-dom` i stedet for almindelige `<a>`-links. Et `Link` bruger `to` til at pege på en routes `path`.\n\n" +
        "Tilføj et menupunkt i `<nav>`, der linker til `/om`. Opret også route `/om`, så den viser komponentet `Om`.",
      starter: `import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

function Om() {
  return <h1>Om os</h1>;
}

function App() {
  return (
    <BrowserRouter>
      <nav>
        {/* Tilføj et Link til /om */}
      </nav>
      <Routes>
        {/* Tilføj route /om */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
`,
      hints: [
        "Skriv et Link som `<Link to=\"/om\">Om os</Link>`.",
        "Placér `Link` inde i `<nav>`.",
        "Inde i `Routes` skal route have `path=\"/om\"` og `element={<Om />}`.",
      ],
      checks: [
        {
          label: "Menuen indeholder et `Link` til `/om`",
          fail: "Tilføj `<Link to=\"/om\">Om os</Link>` inde i `<nav>`.",
          test: (c) => /<nav>[\s\S]*<Link\s+to=["']\/om["']>Om os<\/Link>[\s\S]*<\/nav>/.test(c.code),
        },
        {
          label: "Linket peger på en route med samme path",
          fail: "Opret en route med `path=\"/om\"`.",
          test: (c) => hasRoute(c.code, "/om", "Om"),
        },
        {
          label: "Linket vises som et internt navigationslink",
          fail: "Brug React Routers `<Link>`-komponent.",
          test: (c) => c.attr(c.$("nav a"), "href") === "/om" || "Menuen skal vise et link med adressen `/om`.",
        },
      ],
    },

    {
      id: "router-nav-menu",
      title: "Byg en menu til flere sider",
      topic: "Navigation",
      icon: "🧭",
      description:
        "En menu kan indeholde flere `Link`-elementer. Forbind menupunkterne `Forside` og `Kontakt` med de tilsvarende routes.\n\n" +
        "Brug `to=\"/\"` og `to=\"/kontakt\"` i menuen. Opret de to routes inde i `Routes`.",
      starter: `import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

function Forside() {
  return <h1>Forside</h1>;
}

function Kontakt() {
  return <h1>Kontakt</h1>;
}

function App() {
  return (
    <BrowserRouter>
      <nav>
        {/* Tilføj links til Forside og Kontakt */}
      </nav>
      <Routes>
        {/* Tilføj routes til Forside og Kontakt */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
`,
      hints: [
        "Sæt begge menupunkter ind i `<nav>`: ét Link for hver side.",
        "Linkets `to` skal være præcis det samme som routens `path`.",
        "Brug `path=\"/\"` med `<Forside />` og `path=\"/kontakt\"` med `<Kontakt />`.",
      ],
      checks: [
        {
          label: "Menuen linker til både `/` og `/kontakt`",
          fail: "Tilføj Link-elementer med `to=\"/\"` og `to=\"/kontakt\"` i `<nav>`.",
          test: (c) =>
            /<nav>[\s\S]*<Link\s+to=["']\/["']>Forside<\/Link>[\s\S]*<Link\s+to=["']\/kontakt["']>Kontakt<\/Link>[\s\S]*<\/nav>/.test(c.code),
        },
        {
          label: "Begge links har en route med samme path",
          fail: "Opret routes for `/` og `/kontakt` med de rigtige sidekomponenter.",
          test: (c) =>
            hasRoute(c.code, "/", "Forside") &&
            hasRoute(c.code, "/kontakt", "Kontakt"),
        },
        {
          label: "Previewet viser begge menupunkter",
          fail: "Menuen skal vise `Forside` og `Kontakt`.",
          test: (c) => c.texts(c.$$("nav a")).join("|") === "Forside|Kontakt" || "Begge links skal vises i navigationen i den rigtige rækkefølge.",
        },
      ],
    },

    {
      id: "router-find-link-error",
      title: "Find fejlen: Link og route passer ikke sammen",
      topic: "Fejlfinding",
      icon: "🐞",
      description:
        "Menuens link til kontaktsiden peger på `/kontakt`, men der findes ingen route med den adresse. Find fejlen, og sørg for, at linkets `to` og routens `path` matcher.",
      starter: `import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

function Kontakt() {
  return <h1>Kontakt</h1>;
}

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/kontakt">Kontakt</Link>
      </nav>
      <Routes>
        <Route path="/om" element={<Kontakt />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
`,
      hints: [
        "Sammenlign adressen i `Link` med adressen i `Route`.",
        "`to` og `path` skal være identiske.",
        "Ret route-adressen til `/kontakt`.",
      ],
      checks: [
        {
          label: "Route-path matcher menuens link",
          fail: "Skift routens path til `/kontakt`.",
          test: (c) => hasRoute(c.code, "/kontakt", "Kontakt"),
        },
        {
          label: "Menuen linker fortsat til `/kontakt`",
          fail: "Behold `<Link to=\"/kontakt\">` i navigationen.",
          test: (c) => /<Link\s+to=["']\/kontakt["']>Kontakt<\/Link>/.test(c.code),
        },
        {
          label: "Routeren omslutter menuen og routes",
          fail: "Placér både menuen og `Routes` inden i `BrowserRouter`.",
          test: (c) => /<BrowserRouter>[\s\S]*<nav>[\s\S]*<\/nav>[\s\S]*<Routes>[\s\S]*<\/Routes>[\s\S]*<\/BrowserRouter>/.test(c.code),
        },
      ],
    },

    {
      id: "router-not-found",
      title: "Tilføj en fallback-route",
      topic: "Routes",
      icon: "🧩",
      description:
        "Hvis ingen route matcher adressen, kan en route med `path=\"*\"` vise en side, der fortæller, at siden ikke findes.\n\n" +
        "Opret komponentet `IkkeFundet`, og tilføj en fallback-route efter de kendte routes. Brug `path=\"*\"` og vis `<IkkeFundet />`.",
      starter: `import { BrowserRouter, Routes, Route } from "react-router-dom";

function Forside() {
  return <h1>Forside</h1>;
}

function IkkeFundet() {
  return <h1>Siden blev ikke fundet</h1>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Forside />} />
        {/* Tilføj fallback-route her */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
`,
      hints: [
        "Fallback-routen skal være inden i `Routes`.",
        "Stjerne-pathen matcher adresser, som ikke har deres egen route.",
        "Brug `<Route path=\"*\" element={<IkkeFundet />} />`.",
      ],
      checks: [
        {
          label: "Fallback-routen matcher med `path=\"*\"`",
          fail: "Tilføj en route med `path=\"*\"`.",
          test: (c) => hasRoute(c.code, "*", "IkkeFundet"),
        },
        {
          label: "`IkkeFundet` viser en tydelig besked",
          fail: "Komponentet skal vise `Siden blev ikke fundet`.",
          test: (c) => /function\s+IkkeFundet\s*\(\)\s*\{[\s\S]*?<h1>Siden blev ikke fundet<\/h1>/.test(c.code),
        },
        {
          label: "Forsiderouten er stadig på plads",
          fail: "Behold route `/` med `<Forside />`.",
          test: (c) => hasRoute(c.code, "/", "Forside"),
        },
      ],
    },
  ];

  global.COURSES["react-router"] = {
    id: "react-router",
    engine: "react",
    title: "React Lab",
    subtitle: "React Router",
    filename: "App.tsx",
    finishText:
      "Du har gennemført React Router. Du kan nu sætte routes op og forbinde dem med links i en navigationsmenu.",
    challenges,
  };
})(window);
