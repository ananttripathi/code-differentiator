# DiffTool

A fast, fully **client-side** code and text diff tool. Paste snippets or upload files, pick a view, and compare — nothing leaves your browser.

**Live app → [ananttripathi.github.io/code-differentiator](https://ananttripathi.github.io/code-differentiator/)**

---

## Screenshots

### Light mode
![DiffTool light mode](docs/screenshot-light.png)

### Dark mode
![DiffTool dark mode](docs/screenshot-dark.png)

### Char Diff view
![Char Diff — character-level highlights](docs/screenshot-char-diff.gif)

---

## Features

- **Three diff views**
  - **Side by Side** — classic two-column diff
  - **Unified** — single-column unified patch view
  - **Char Diff** — shows every line; changed characters highlighted inline
- **Paste or upload** — each pane has a paste tab and a drag-and-drop upload tab, independently
- **Jupyter notebook support** — `.ipynb` files are parsed into readable cell blocks before diffing
- **Swap sides** — one click to flip left ↔ right
- **Live stats badge** — shows `+N / -N` lines changed after each compare
- **Dark / light mode** — toggle in the header, zero flash
- **Zero backend** — runs entirely in the browser; no data is sent anywhere

---

## Tech stack

| Tool | Version | Purpose |
|---|---|---|
| React | 18 | UI |
| Vite | 5 | Build tool |
| [diff (jsdiff)](https://github.com/kpdecker/jsdiff) | 5 | Line & character diff engine |
| [diff2html](https://diff2html.xyz) | 3 | Renders unified/side-by-side diff HTML |

No CSS framework, no router, no state management library.

---

## Local development

```bash
git clone https://github.com/ananttripathi/code-differentiator.git
cd code-differentiator
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

```bash
npm run build    # production build → dist/
npm run preview  # preview the production build locally
```

---

## Deployment

The app auto-deploys to GitHub Pages on every push to `main` via GitHub Actions.

To enable on a fresh fork:  
**Repo → Settings → Pages → Build and deployment → Source → GitHub Actions**

---

## License

MIT
