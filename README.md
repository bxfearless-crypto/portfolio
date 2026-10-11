# Zhengwei — Story Island

The active portfolio is the restored walkable storybook island with seven project destinations. Project descriptions, original internship images and existing live links are preserved.

## Run locally

Always enter the project folder first:

```sh
cd "/Users/lumi/Desktop/项目/portfolio-studio"
npm install
npm run dev -- --host 127.0.0.1
```

Open http://127.0.0.1:5173/. Local service must be running; a Git commit does not keep the server running. Even the old ?preview=castle URL now loads the island.

## Edit

- Project descriptions and links: src/main.js
- Island scene and exploration: src/island.js
- Island layout styling: src/island.css
- Project images: public/assets/

Click paths to walk, select destinations, or use the project list. Live links open from project case studies. Unused castle, expedition and earlier scene experiments have been removed from the project.

## Build and deploy

```sh
npm run build
npx vercel --prod
```

Vercel project: portfolio. Git stores source versions; Vercel hosts a public version that does not depend on the local development server. Deploy again after changing the source.
