# Zhengwei's portfolio studio

An interactive Three.js studio with seven accessible project entries, a project gallery, case study dialogs, résumé download and email contact.

## Run locally

```sh
npm install
npm run dev
```

Open http://127.0.0.1:5173/ in a browser. The `dev` script already binds Vite to `127.0.0.1`, so the equivalent explicit command is `npm run dev -- --host 127.0.0.1`.

## Build

```sh
npm run build
npm run preview
```

Edit project text in `src/main.js`, the studio in `src/studio.js`, and styling in `src/style.css`. All 3D objects are procedural geometry; no external models are required. Fonts use Google Fonts with system fallbacks. Project labels and the project list are keyboard accessible. WebGL failure switches to the project gallery.

This is a local portfolio prototype, not a published website. Add verified live project links, personal contribution details and original internship samples before publishing. The included résumé is the existing draft; confirm official degree names, technical proficiency and availability before using it for applications. Sample dashboard graphics and editorial cover designs are portfolio illustrations, not screenshots or original published clippings.
