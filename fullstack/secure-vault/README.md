# SecureVault Dashboard

A dark-mode, keyboard-first file explorer for SecureVault's encrypted document vault. Built with **Vue 3 + Vite**

- **Live demo:** _add your deployed URL here_
- **Design file (Figma):** https://www.figma.com/design/R2tJUevQEKMYAmvw3RXw1m

## Setup

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
npm run preview  # serve the production build locally
```

Requires Node 18+.

## Features

| Area | What it does |
| --- | --- |
| Recursive tree | Renders `src/data.json` at any depth; click a folder to expand or collapse it. |
| Properties panel | Selecting a file shows its Name, Type and Size. Type is derived from the file extension. |
| Keyboard navigation | `↑` `↓` move focus, `→` expands (or enters) a folder, `←` collapses (or goes to the parent), `Enter` selects a file, `Home` / `End` jump to the ends. |
| Search | `/` focuses the search box. Matching items force their ancestor folders open; `↓` moves from the search box into the results; `Esc` clears the search. |
| **Pinned & Recent (wildcard)** 

## Design system

The tokens on the Figma "Design System" page are mirrored one-to-one as CSS custom properties at the top of `src/styles.css`: colors, 4px spacing scale, radii and type styles (Inter for UI text, JetBrains Mono for metadata). Keyboard focus is shown with an orange ring and soft glow; selection uses a mint tint with a left bar. The two are intentionally different so a user can see both at once. All text tokens meet WCAG AA (4.5:1) on every surface they appear on; the weakest pairing is `text-muted` on the selected-row tint at 4.58:1.

## Recursive strategy

The tree stays as plain, unmodified data. All UI state lives in one small store (`src/useVault.js`), so the data is never mutated.

1. **Flat index.** On load the tree is walked once into a `Map` of `id → { node, parent, path }`. Looking up a node, its parent or its full path is O(1), which is what keyboard navigation, Pinned and Recent need.
2. **Recursive rendering.** `TreeNode.vue` renders one row and, if the folder is open, renders itself again for each child. Depth only changes the indent (`8px + 16px × depth`), so 2 levels or 20 levels use the same code.
3. **Expansion state.** Open folders are a `Set` of ids, kept separate from the data. Search overrides it: a computed `filter` gives the ids that should stay visible and the folders that must be open.
4. **Keyboard model.** A computed `rows` list holds the currently visible nodes in display order. `↑` and `↓` move through it, and `←` uses the index to find the parent. This keeps the keyboard logic independent of the recursive DOM. The tree uses ARIA `tree`, `treeitem` and `group` roles with a roving `tabindex`, so only one row is in the tab order at a time.

## Wildcard feature: Pinned & Recent files

**The gap.** The brief covers browsing but not returning. In a vault with deeply nested case folders, people reopen the same few documents every day and have to dig through the same 4–5 levels each time.

**What it does.**
- **Pinned.** `P` or the "Pin file" button pins the file. Pinned files appear at the top of the explorer. The list is capped at **6 files** so it stays a shortcut list rather than a second tree: at the limit the Pin button is disabled with an explanation, the list header shows `6/6`, and unpinning is always allowed. The cap is enforced in the store (not only the UI), and older saved lists are trimmed on load.
- **Recent.** The last five files you selected are listed under Recent.
- Clicking either list opens every parent folder, then selects and focuses the file.
- Both lists persist in `localStorage`. Stored ids are validated against the index on load, so a file that no longer exists is silently dropped.
- Both lists hide while searching so results stay uncluttered.

**Business value.** It cuts the daily time spent navigating, which is the complaint behind this redesign ("can't manage nested files easily"). It costs the backend nothing because it is client-side only, and it works with the existing API shape.

## Project structure

```
src/
├── App.vue                    layout, search box, global "/" shortcut
├── useVault.js                data index, state, search, keyboard handling
├── styles.css                 design tokens + component styles
├── data.json                  vault data (unchanged)
└── components/
    ├── TreeNode.vue           the recursive tree row
    ├── QuickList.vue          Pinned / Recent lists
    ├── PropertiesPanel.vue    file details panel
    └── Icon.vue               small inline SVG icon set
```
