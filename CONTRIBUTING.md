# Contributing

## Setup

```bash
npm install
```

Copy `.env.example` to `.env` and fill in:

- `GITHUB_TOKEN` — required; the wallpaper listing is fetched via GitHub's GraphQL API, which rejects unauthenticated requests. Generate a classic PAT with no scopes (public repo read access only).
- `PUBLIC_SITE_URL` — the public URL this deployment is served from, used for canonical links and Open Graph/Twitter metadata.

## Commands

| Command                | Description                                                           |
| ---------------------- | ---------------------------------------------------------------------|
| `npm run dev`          | Start the dev server                                                  |
| `npm run build`        | Production build                                                      |
| `npm run generate`     | Static site generation                                                |
| `npm run preview`      | Preview production build                                              |
| `npm run lint`         | Lint the codebase with ESLint                                         |
| `npm run format`       | Auto-fix lint issues with ESLint                                      |
| `npm run postinstall`  | Regenerate Nuxt's build types; runs automatically after `npm install` |

## Contribution Workflow

1. Branch off `main`.
2. Commit using [Conventional Commits](https://www.conventionalcommits.org): `type(scope): summary`. Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`. No body, imperative present tense, summary around 50 characters or under, no trailing period.
3. Open a pull request.

---

_Built with a hand from [Claude](https://claude.ai) — because good taste in wallpapers deserves equally good code._
