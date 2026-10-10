# Zhengwei's portfolio studio

A walkable Three.js storybook island with eight project destinations, a project gallery, case study dialogs, résumé download and email contact.

## Run locally

```sh
cd "/Users/lumi/Desktop/项目/portfolio-studio"
npm install
npm run dev
```

Open http://127.0.0.1:5173/ in a browser. The `dev` script already binds Vite to `127.0.0.1`, so the equivalent explicit command is `npm run dev -- --host 127.0.0.1`.

## Build

```sh
npm run build
npm run preview
```

Edit project text and links in `src/main.js`, the island and movement in `src/island.js`, and the exploration interface in `src/island.css`. Base portfolio styling lives in `src/style.css` and `src/forest.css`. The previous scene is kept in `src/landscape.js` for reference. All 3D objects are procedural geometry; no external models are required. Fonts use Google Fonts with system fallbacks. Project labels and the project list are keyboard accessible. WebGL failure switches to the project gallery.

## Explore the island

- Drag to orbit and scroll or use + / − to zoom in the island view.
- Click a landmark or choose a destination to walk there along the paths.
- Select Start exploring, then use WASD, arrow keys, the on-screen pad, or click a path to walk. The camera follows the explorer; dragging still changes the viewing angle.
- Near a destination, use the Open project button or press E. Project dialogs pause movement.
- Switch Afternoon / Twilight for lighting, or enable the optional synthesized sea and bird sounds. Sound starts only when requested.
- Expand the scene for a screen-filling visit, and press Escape or Exit expanded view to return.
- Browse projects remains available for direct access without walking.

This is a local portfolio prototype, not a published website. Add verified live project links, personal contribution details and original internship samples before publishing. The included résumé is the existing draft; confirm official degree names, technical proficiency and availability before using it for applications. Sample dashboard graphics and editorial cover designs are portfolio illustrations, not screenshots or original published clippings.
