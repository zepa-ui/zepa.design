# Registry

**Only edit `meta.ts` (and component source files) inside each component folder.**

After adding or updating a component, run:

```bash
npm run build:registry
```

This generates:

- `content/registry/items.ts`
- `content/registry/loaders.ts`
- `content/registry/index.ts`
- `content/registry/registry.json`
- `lib/registry/code-paths.ts`
- `public/r/[slug].json` (shadcn install URLs)

## Add a component

1. Create folder: `content/registry/<category>/<slug>/`
2. Add `meta.ts`, `demo.tsx`, and `ui/` (or other `.tsx` files)
3. Add preview video: `public/previews/<category>/<slug>/preview.mov`
4. Run `npm run build:registry`

## Install via shadcn CLI

```bash
npx shadcn@latest add https://zepa.design/r/<slug>.json
```

Example:

```bash
npx shadcn@latest add https://zepa.design/r/glsl-hills-hero.json
```
