/*
 * Kursus: React Assets (5 opgaver).
 * Motor: js/engines/react.js
 */
(function (global) {
  "use strict";

  const challenges = [
    {
      id: "assets-import",
      title: "Importer billedet",
      topic: "assets",
      icon: "🖼️",
      description:
        "Når du skal indsætte et billede i React (Vite) importerer man billedet først med import keywordet.\n\n" +
        "Importer billedet under navnet `mouse` og indsæt det i et `<img>` tag, som du placerer inde i `<article>` tagget. \n\n" +
        "Billedet ligger i mappen `assets`, så stien du skal importere fra er `./assets/mouse.jpg`.",
      starter: `import type { ReactNode } from "react";

function App() {
  return (
    <article>
    </article>
  );
}

export default App;
`,
      hints: [
        "Tilføj et img tag inde i article. Tilføj herefter `src` til dit img tag.",
        "Importer billedet med `import mouse from './assets/mouse.jpg'`",
        "Skriv i dit img tag: src={mouse}",
      ],
      checks: [
        {
          label: "Img tagget findes inde i article tagget",
          fail: "Placer dit img tag mellem de to article tags",
          test: (c) => (c.$("body > article > img") ? true : "Der skal være en `<article>`, som indeholder et `<img>`."),

        },
        {
          label: "Img tagget har den korrekte src",
          fail: "Sørg for at img taggets src peger på billedet",
          test: (c) => /\/assets\/mouse\.jpg$/.test(c.attr(c.$("img"), "src")) || "`<img>` skal have `src={mouse}`, hvor `mouse` er importeret fra `./assets/mouse.jpg`.",
        },
        {
          label: "Billedet er importeret under navnet `mouse`",
          fail: "Du skal importere billedet i toppen af koden med keywordet `import`",
          test: (c) => /import mouse from ['"]\.\/assets\/mouse\.jpg['"]/.test(c.code)
        }
      ],
    },
{
      id: "assets-video",
      title: "Importer en video",
      topic: "assets",
      icon: "🖼️",
      description:
        "Når du skal indsætte en video i React (Vite) fungerer det meget på samme måde som før.\n\n" +
        "Importer videoen under navnet `skyline` og indsæt det i et `<source>` tag, som du placerer inde i et nyt `<video>` tag. \n\n" +
        "Begge tags skal skrives inde i `div` tagget. \n\n "+
        "Til sidst skal du tilføje `controls` til dit `video` tag, så videon kan afspilles. \n\n" +
        "Videoen ligger i mappen `assets`, så stien du skal importere fra er `./assets/skyline.mp4`.",
      starter: `import type { ReactNode } from "react";

function App() {
  return (
    <div>
    </div>
  );
}

export default App;
`,
      hints: [
        "Tilføj et nyt `video` tag inde i `div` tagget. Tilføj herefter et `source` tag til dit video tag.",
        "Importer videoen med `import skyline from './assets/skyline.mp4'`",
        "Skriv i dit source tag: `src={skyline}`",
      ],
      checks: [
        {
          label: "Video tagget findes inde i source tagget",
          fail: "Placer dit video tag mellem de to div tags",
          test: (c) => (c.$("body > div > video > source") ? true : "Der skal være en `<div>`, som indeholder et `<video>`, med et `<source>` tag indeni."),

        },
        {
          label: "Source tagget har den korrekte src",
          fail: "Sørg for at source taggets src peger på videoen",
          test: (c) => /\/assets\/skyline\.mp4$/.test(c.attr(c.$("source"), "src")) || "`<source>` skal have `src={skyline}`, hvor `skyline` er importeret fra `./assets/skyline.mp4`.",
        },
        {
          label: "Videoen er importeret under navnet `skyline`",
          fail: "Du skal importere videoen i toppen af koden med keywordet `import`",
          test: (c) => /import skyline from ['"]\.\/assets\/skyline\.mp4['"]/.test(c.code)
        },
        {
          label: "Videon kan afspilles ved at tilføje controls",
          fail: "Du skal tilføje `controls` på dit `video` tag",
          test: (c) =>
          {
            const videoEl = c.$("video")
            return (videoEl && videoEl.hasAttribute('controls')) || "Der er ingen controls på dit `video` tag"
          }
        }
      ],
    },
   {
    
   }
  ];

  global.COURSES["react-assets"] = {
    id: "react-assets",
    engine: "react",
    title: "React Lab",
    subtitle: "React Assets",
    filename: "App.tsx",
    finishText: "Du har gennemført React Assets. Nu forstår du, hvordan man kan importere assets i React!",
    challenges,
  };
})(window);
