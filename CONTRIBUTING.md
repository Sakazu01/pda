# Contributing to PDA

Thanks for helping. PDA is small on purpose, so read [AGENTS.md](AGENTS.md) first: it is short and it is the rulebook.

## Setup

```bash
git clone https://github.com/Sakazu01/pda.git
cd pda
npm install
npm run build
npm run test:quick
```

Open `dist/index.html` in a browser to try your change.

## Workflow

1. Branch from `dev`: `git switch dev && git switch -c feat/my-change`.
2. Change files in `src/`, then `npm run build`.
3. Add or update a test in `tests/` (see [docs/testing.md](docs/testing.md)).
4. `npm run check` (type check + quick tests), and `npm test` if you touched rendering, routing or import.
5. Open a pull request into `dev` and fill in the template.

## Good first contributions

- A new diagram type or framework (see `src/diagrams/business.ts` for the pattern).
- Missing tech logos: add an MIT/ISC-licensed SVG to `src/vendor/tech-stack-icons.ts`.
- Translations and UX copy fixes in `src/i18n/` (see [docs/i18n.md](docs/i18n.md)).
- Accessibility issues reported by `tests/axe2.cjs`.

## Reporting bugs

Use the issue template. Attach the `.json` export of a diagram that shows the bug, if you can.

Security issues: **do not open a public issue**. See [SECURITY.md](SECURITY.md).
