# Contributing

We'd be glad to have you contribute to the development of this repository!

## Setup Workflow

```bash
npm install
```

Copy `.env.example` to `.env` and fill in:

- `GITHUB_TOKEN` — required; the wallpaper listing is fetched via GitHub's GraphQL API, which rejects unauthenticated requests. Generate a classic PAT with no scopes (public repo read access only).
- `PUBLIC_SITE_URL` — the public URL this deployment is served from, used for canonical links and Open Graph/Twitter metadata.

| Command             | Description                            |
| -------------------- | --------------------------------------- |
| `npm run dev`        | Start the dev server                    |
| `npm run build`      | Production build                        |
| `npm run generate`   | Static site generation                  |
| `npm run preview`    | Preview production build                |
| `npm run lint`       | Lint the codebase with ESLint           |
| `npm run format`     | Auto-fix lint issues with ESLint        |

## Schema Workflow

`app/` holds the Nuxt application: `components` for UI pieces, `composables` for shared reactive state (gallery, lightbox, theme, toasts), `utils` and `types` for shared helpers, and `pages` — which only set per-route SEO metadata, since the actual gallery UI lives in `layouts/default.vue` and stays mounted across navigations. `server/` exposes Nitro API routes that proxy and cache GitHub's GraphQL/REST APIs. `wallpapers/` holds the image assets themselves, organized into category subfolders that double as tags.

## Contribution Workflow

Branch off `main`, commit using [Conventional Commits](https://www.conventionalcommits.org), and open a pull request.

---

_Built with a hand from [Claude](https://claude.ai) — because good taste in wallpapers deserves equally good code._
