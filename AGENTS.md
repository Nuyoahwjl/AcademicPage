# Agent Guidelines

## What this repository is

A single-page Jekyll academic homepage template, derived from [academicpages.github.io](https://github.com/academicpages/academicpages.github.io) and reduced to one responsive page: a profile sidebar plus a main column whose sections are rendered entirely from data files. There are no per-item pages, no Sass compilation and no JavaScript bundling step.

## Repository layout

| Path | Purpose |
| --- | --- |
| `_config.yml` | Site metadata, URLs and the author block used by the sidebar. |
| `_data/homepage.yml` | All page content (biography text, dated entries, publication records, awards) in one file. |
| `_data/navigation.yml` | Labels and anchors for the in-page navigation. |
| `index.html` | Section templates that render the data file. |
| `_layouts/homepage.html` | The only layout: head assets, theme bootstrap, sidebar and main grid. |
| `_includes/` | Sidebar partial and inline SVG icons. |
| `assets/css/main.css` | The single stylesheet; the light and dark palettes are CSS variables at the top. |
| `assets/js/` | In-page navigation plus the deferred third-party visitor-map loader. |
| `images/`, `files/` | Published assets: portraits, icons, teaser figures and PDFs. |
| `.github/workflows/jekyll.yml` | GitHub Pages build and deploy workflow. |
| `scripts/` | Local preview tooling (see below). |
| `local/` | Generated preview mirror, logs, gem and npm caches, analysis artifacts. Gitignored: never commit it. |

## Editing content

- Change copy and entries in `_data/homepage.yml`; dates use `YYYY-MM-DD` and the templates sort them.
- Change identity, URLs and social links in `_config.yml`.
- Keep third-party brand assets under `images/icons/` or `_includes/icons/` with a source comment and, when the license requires it, a license file next to them.
- Do not hand-edit `local/preview-source`; it is a mirror regenerated on every preview start.

## Local preview

Requires Ruby with Bundler. A shared Windows install at `C:\Ruby33-x64` is picked up automatically when present.

- Start: `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\start-preview.ps1`, then open http://localhost:4000.
- Stop: `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\stop-preview.ps1`.
- Install or update gems only: `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\preview.ps1 -InstallOnly`.

The scripts mirror the repository into `local/preview-source` with `robocopy /MIR` (excluding `local/`, `.git`, caches and lockfiles) and run `bundle exec jekyll serve` from that mirror with a preview-only config. Stop and start again after editing sources so the mirror picks them up. Logs and the process record live in `local/`.

## Deploying to GitHub Pages

1. Push the repository to GitHub; the workflow triggers on `main` and `master`.
2. In the repository settings under **Pages → Source**, choose **GitHub Actions**.
3. `.github/workflows/jekyll.yml` builds with Jekyll and deploys on every push; it passes the base path reported by Pages, so the same build works both at a custom domain (empty base path) and at a project-pages path.
4. For a custom domain, keep `baseurl: ""`, set `url` to the domain, register the domain in the Pages settings and add the DNS records there. The workflow does not read the `CNAME` file.

Do not push, deploy or change DNS unless explicitly asked.

## Rules for agents

- Keep documentation, code comments and commit messages in English.
- Never commit or push unless explicitly instructed, and never commit anything under `local/`.
- Verify visual changes against the local preview with a headless browser before reporting them as done.
- Prefer editing the data files and the single stylesheet over adding new templates or build steps.
