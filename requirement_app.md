# DiffTool — Requirements & Rebuild Specification

A fully client-side React web app for comparing two code files or text snippets.
No backend. Deployable as a static site on GitHub Pages.

---

## 1. Goals

- User can paste two blocks of text/code and compare them.
- User can upload two files and compare them.
- Both sides can mix paste and upload independently.
- Supports any plain-text format including `.ipynb` Jupyter notebooks.
- Diff renders with line numbers, added/removed highlighting, and a change summary.
- Zero server dependency — everything runs in the browser.

---

## 2. Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| React | ^18.3.1 | UI framework |
| Vite | ^5.4.10 | Build tool + dev server |
| @vitejs/plugin-react | ^4.3.1 | JSX support in Vite |
| diff (jsdiff) | ^5.2.0 | Compute unified diff patches and line-level stats |
| diff2html | ^3.4.48 | Render unified diff as HTML (side-by-side or unified) |

No CSS framework, no router, no state management library.

---

## 3. Directory Structure

```
project-root/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions: build + deploy to Pages
├── src/
│   ├── components/
│   │   ├── InputPane.jsx       # One input panel (paste tab + upload tab)
│   │   └── DiffViewer.jsx      # Renders the diff output
│   ├── utils/
│   │   └── parseFile.js        # Reads File objects → plain text string
│   ├── App.jsx                 # Root component, all state lives here
│   ├── App.css                 # All styles (single CSS file, no modules)
│   └── main.jsx                # React entry point
├── index.html
├── package.json
└── vite.config.js
```

---

## 4. Feature Requirements

### 4.1 Input Panes

There are two input panes side by side: **Original** (left) and **Modified** (right).

Each pane has two tabs:

**Paste tab**
- Monospace `<textarea>` with `spellCheck={false}`.
- Placeholder: `"Paste original code here..."` / `"Paste modified code here..."`.
- User can type or paste any text.

**Upload tab**
- A dashed-border drop zone that accepts drag-and-drop or click-to-browse.
- Clicking the zone opens a hidden `<input type="file">`.
- Dragging a file over the zone changes its border and background color (visual feedback).
- After a file is loaded:
  - Show the file name and a file icon.
  - Show two buttons: **Change** (re-opens file picker) and **Remove** (clears the pane).
  - Do NOT switch back to the Paste tab — stay on Upload tab showing the loaded file.
- The parsed file text is fed into the same state as the paste textarea (shared `value`).

### 4.2 Swap Button

A narrow vertical button between the two panes with a swap/arrows icon.
- Clicking it swaps left content ↔ right content AND left filename ↔ right filename.
- Resets `compared` state to `false` (hides the old diff output).

### 4.3 Controls Bar

A horizontal bar below the input section containing:

**Left side:**
- **Compare** button — primary action, indigo/purple, disabled when both sides are empty.
- **Clear** button — ghost style, disabled when both sides are empty. Resets all state.

**Right side:**
- **Diff stats badge** — shown only after Compare is clicked. Displays `+N` (green) and `-N` (red) line counts. Label: "lines changed".
- **View toggle** — two buttons: "Side by Side" and "Unified". Switching is instant; does NOT require re-clicking Compare.

### 4.4 Diff Output

Shown only after Compare is clicked. Hidden (replaced by empty state) before first Compare.

- Uses `diff2html` to render the diff.
- `drawFileList: false` — do not show the file list header.
- `matching: 'lines'` — match lines for better diff quality.
- `outputFormat`: `'side-by-side'` or `'line-by-line'` based on the view toggle.
- The diff is computed from a **snapshot** taken at the moment Compare is clicked, not live. Editing the textarea after Compare does not update the diff until Compare is clicked again.
- The `fileName` passed to `createPatch` is the uploaded file name if one exists, otherwise `'file'`.

### 4.5 Empty State

When no diff has been run yet, show a centered placeholder with:
- A faint SVG icon (diff-like visual).
- Text: `Paste code or upload files above, then click Compare`.

### 4.6 Footer

Full-width footer at the bottom:
> "Runs entirely in your browser — no data is sent to any server"

---

## 5. File Parsing Logic (`src/utils/parseFile.js`)

```
parseFile(file: File) → Promise<string>
```

- Read the file as text using `file.text()`.
- If `file.name` ends with `.ipynb`: run `parseNotebook(text)`.
- Otherwise: return the raw text string.

**`parseNotebook(text: string) → string`**

- Parse JSON. If parse fails, return raw text as fallback.
- Access `nb.cells` array (default to `[]`).
- For each cell:
  - Extract `cell.source`: if it's an array, join with `''`; if string, use as-is; fallback to `''`.
  - Build a header: `# ── Cell N [cell_type] ──` where N is 1-indexed.
  - Combine: `header + '\n' + source`.
- Join all cells with `'\n\n'` between them.

---

## 6. State (App.jsx)

| State variable | Type | Purpose |
|---|---|---|
| `left` | string | Current text in the left pane |
| `right` | string | Current text in the right pane |
| `leftFile` | string \| null | Filename of the uploaded left file |
| `rightFile` | string \| null | Filename of the uploaded right file |
| `viewType` | `'side-by-side'` \| `'unified'` | Which diff view to render |
| `compared` | boolean | Whether a diff has been computed and shown |
| `diffSnapshot` | `{ left, right, fileName }` | Frozen copy of content at Compare time |

**Key behavior:**
- `compared` resets to `false` whenever either `left` or `right` content changes (typing or new file).
- `compared` resets to `false` on Swap and Clear.
- `stats` (added/removed line counts) is derived via `useMemo` from `diffSnapshot` when `compared` is `true`.
- `isEmpty` is `true` when both `left.trim()` and `right.trim()` are empty strings — used to disable Compare and Clear.

---

## 7. Component Props

### `InputPane`

| Prop | Type | Description |
|---|---|---|
| `label` | string | `"Original"` or `"Modified"` — shown in pane header, used in textarea placeholder |
| `value` | string | Controlled text value |
| `onChange` | `(text: string) => void` | Called when text changes (paste or file upload) |
| `onFile` | `(name: string \| null) => void` | Called with filename when file is loaded, or `null` when removed |

Internal state: `tab` (`'paste'` \| `'upload'`), `fileName` (string \| null), `dragging` (boolean).

### `DiffViewer`

| Prop | Type | Description |
|---|---|---|
| `left` | string | Original text (from snapshot) |
| `right` | string | Modified text (from snapshot) |
| `viewType` | string | `'side-by-side'` or `'unified'` |
| `fileName` | string | Passed to `createPatch` as the file name |

Implementation: uses `useEffect` + `useRef`. On every prop change, calls `createPatch` from the `diff` library, then `Diff2Html.html()`, and sets `containerRef.current.innerHTML` to the result.

Import the diff2html CSS bundle: `import 'diff2html/bundles/css/diff2html.min.css'`

---

## 8. Design System

### Color Palette

| Role | Value |
|---|---|
| Page background | `#f0f2f5` |
| Primary text | `#1a1a2e` |
| Header background | `#1e1b4b` (dark indigo) |
| Header accent border | `#4f46e5` (indigo) |
| Header icon color | `#818cf8` |
| Header subtitle | `#a5b4fc` |
| Primary button / active states | `#4f46e5` |
| Primary button hover | `#4338ca` |
| Added lines stat | `#16a34a` (green) |
| Removed lines stat | `#dc2626` (red) |
| Panel background | `#ffffff` |
| Panel border | `#e2e8f0` |
| Muted text / labels | `#64748b` |
| Disabled / placeholder | `#94a3b8` |
| Pane header background | `#f8fafc` |
| Drop zone background | `#fafbfc` |
| Drop zone hover background | `#f5f3ff` |
| Drop zone dragging background | `#ede9fe` |

### Typography

- Body / UI: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- Code textarea and diff table: `'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace`
- Code textarea font size: `0.82rem`, line-height `1.6`

### Layout

- Max content width: `1600px`, centered with `margin: 0 auto`.
- Input section: two panes (`flex: 1`) separated by a 40px wide swap button column. No gap between panes — borders handle separation.
- Textarea minimum height: `280px`, `resize: vertical`.
- Drop zone minimum height: `280px`.
- Controls bar: `justify-content: space-between` with left group (Compare, Clear) and right group (stats badge + view toggle).

### diff2html CSS Overrides

Apply these overrides on `.diff-output` to integrate with the app style:
- Remove wrapper margins: `.d2h-wrapper { margin: 0 }`
- Remove file wrapper border/radius/margin
- Style `.d2h-file-header` with `#f8fafc` background, `0.8rem` font size
- Use monospace font on `.d2h-diff-table`
- Line number cells: `color: #94a3b8`, `background: #f8fafc` with `!important`

---

## 9. Build Configuration

### `vite.config.js`
```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',   // relative base — required for GitHub Pages subdirectory hosting
})
```

### `index.html`
Standard Vite HTML entry. Script tag: `<script type="module" src="/src/main.jsx"></script>`.

### `package.json` scripts
```json
"dev":     "vite",
"build":   "vite build",
"preview": "vite preview"
```

---

## 10. GitHub Pages Deployment

### GitHub Actions workflow (`.github/workflows/deploy.yml`)

Trigger: push to `main` branch.

Required permissions: `contents: read`, `pages: write`, `id-token: write`.

Steps:
1. `actions/checkout@v4`
2. `actions/setup-node@v4` — Node 20, cache `npm`
3. `npm ci`
4. `npm run build` — outputs to `dist/`
5. `actions/upload-pages-artifact@v3` — path: `dist`
6. `actions/deploy-pages@v4` — deploys artifact

Environment name: `github-pages`. Concurrency group: `pages`, cancel-in-progress: `false`.

### One-time GitHub repo setup

After pushing, go to:
**Repo → Settings → Pages → Build and deployment → Source → GitHub Actions**

The app will then auto-deploy on every push to `main`.

---

## 11. Known Behaviors & Edge Cases

- **Both-empty guard**: Compare and Clear buttons are disabled when both sides are empty (checked via `.trim()`).
- **Identical content**: diff2html renders a "no changes" message — this is acceptable behavior.
- **Binary files**: The browser's `file.text()` will attempt to decode them as UTF-8. No explicit binary detection is implemented; garbled output is acceptable.
- **Large files**: No size limit is enforced. Performance degrades gracefully in the browser.
- **`.ipynb` parse failure**: If JSON parsing fails, `parseNotebook` returns the raw text string as a fallback.
- **Changing view type** (side-by-side ↔ unified) does NOT re-snapshot; it re-renders from the existing `diffSnapshot` — this is intentional for instant toggling without re-clicking Compare.
- **Changing content after Compare**: `compared` is set to `false`, hiding the old diff. The user must click Compare again to see the new diff.
