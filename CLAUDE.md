# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**MarkFlow** is a minimalist Markdown editor with a native Apple feel, built with React 18, TypeScript, and Vite. The project emphasizes a clean, immersive writing experience with real-time preview, split-pane editing, theme support, and scroll synchronization. It follows a local-first philosophy, storing data in IndexedDB.

The current implementation is **Phase 1 (MVP)** as outlined in PRD.md. The IndexedDB storage layer (`stores/`) is implemented and wired into `App.tsx` via `useFileTree` and `useAutoSave` hooks. File tree sidebar UI is functional with right-click context menu. Extended Markdown (KaTeX, Mermaid, GFM tables) and export features are planned for future phases.

## Development Commands

- `npm run dev` – Start Vite development server
- `npm run build` – TypeScript compilation (`tsc -b`) followed by Vite production build
- `npm run lint` – Run ESLint on all files (configuration in `eslint.config.js`)
- `npm run preview` – Preview production build locally

**Code Style**: Prettier is configured via `prettier.config.js` (no semicolons, single quotes, 100 print width). TypeScript strict mode is enabled.

**Testing**: No test suite is configured yet (`package.json` has no test script).

## Architecture Overview

### Component Structure

- `App.tsx` – Root component orchestrates layout, view modes, file tree, and content state.
- `components/Editor.tsx` – CodeMirror 6 wrapper with Markdown syntax highlighting and theme-aware styling.
- `components/Preview.tsx` – Renders Markdown as HTML using `markdown-it` with custom CSS for theming.
- `components/SplitPane.tsx` – Adjustable split-pane layout; drag divider adjusts `splitRatio`.
- `components/Toolbar.tsx` – Formatting buttons, view-mode toggle, theme switcher, sidebar toggle, with tooltips.
- `components/Sidebar/` – File tree UI with context menu (new file/folder, rename, delete), folder expand/collapse.
- Layout is a vertical flex: Toolbar (fixed height) + main area (flex:1) containing optional sidebar + editor/preview split.

### State Management (Custom Hooks)

- `useTheme` – Manages light/dark/system theme preference, persists to `localStorage`, applies CSS custom properties (`data-theme` attribute).
- `useSplitPane` – Manages `viewMode` (`split`|`edit`|`preview`) and `splitRatio` (persisted to localStorage). Handles divider drag events.
- `useScrollSync` – Synchronizes scrolling between editor and preview using percentage‑based mapping; prevents feedback loops with `isScrollingRef`.
- `useFileTree` – Manages file tree state from IndexedDB, selected file, expanded folders, CRUD operations.
- `useAutoSave` – Debounced (500ms) auto-save to IndexedDB when content changes.

Global React state in `App`:
- `content` – current Markdown text (synced with IndexedDB via `useAutoSave`).
- `sidebarOpen` – sidebar visibility state.
- View‑mode and split‑ratio are in `useSplitPane`.

### Storage Layer (`stores/`)

The IndexedDB storage layer is implemented in `src/stores/`:
- `db.ts` – Database initialization, core CRUD helpers, tree-building utilities, TypeScript interfaces (`FileNode`, `FolderNode`, `Settings`, `TreeItem`)
- `fileStore.ts` – File CRUD (create, update, delete, move, rename)
- `folderStore.ts` – Folder CRUD with recursive delete
- `settingsStore.ts` – Settings persistence (theme, sidebar/outline widths, split ratio, expanded folders, recent files)
- `index.ts` – Re-exports all store functions and types

The `stores` module is fully functional and connected to `App.tsx`.

### Theme System

- CSS custom properties defined in `src/styles/globals.css` under `:root` and `[data-theme="dark"]`.
- Theme switching toggles `document.documentElement.setAttribute('data-theme', theme)`.
- CodeMirror syntax highlighting styles are defined per‑theme in `Editor.tsx` (`lightHighlightStyle` / `darkHighlightStyle`).
- Preview component uses the same CSS variables; highlight.js colors are also themed via CSS custom properties.

### Editor Integration

- CodeMirror 6 is instantiated inside a `useEffect`; extensions include `markdown` language support, line‑wrapping, history, and a custom `updateListener` that calls `onChange`.
- External content changes (e.g., from toolbar insertion) are applied via `view.dispatch` with an `isExternalChange` guard to avoid loops.
- The editor container is a plain `<div>`; scrolling is delegated to the parent `div` that calls `useScrollSync`.

### Markdown Rendering

- `src/utils/markdown.ts` – exports `renderMarkdown` function using `markdown‑it` with `markdown‑it‑task‑lists` plugin, plus `WELCOME_CONTENT` constant for the initial demo document.
- Syntax highlighting for code blocks uses `highlight.js` (auto‑detection). Highlight.js themes are customized via CSS variables (`--hl‑*`).
- No KaTeX, Mermaid, or GFM table support yet (planned for Phase 1).

## Key Implementation Patterns

1. **Scroll‑sync** – Based on scroll percentage, not element mapping. A timeout resets the `isScrolling` flag after 150 ms.
2. **Toolbar insertion** – Buttons call `onInsert(before, after, placeholder)` which appends `before + selection + after` to content. *Future*: Should replace selected text and position cursor.
3. **Split‑pane dragging** – Mouse events are attached at the document level in `useSplitPane`; `isDraggingRef` tracks state.
4. **Theme‑aware styling** – All colors are CSS custom properties; components reference `var(--bg‑primary)` etc. No hard‑coded colors except in CodeMirror highlight definitions.
5. **Welcome content** – `WELCOME_CONTENT` in `markdown.ts` serves as initial demo.

## Future Development

Refer to PRD.md for the full roadmap. Immediate next steps:

- **File‑tree drag‑and‑drop** – Implement drag‑and‑drop to move files between folders
- **Extended Markdown** – KaTeX, Mermaid, GFM tables
- **Export options** – HTML, PDF, copy as HTML/plain text
- **Search & replace** – Current‑file search with regex

When adding new features, follow existing patterns: lift state into custom hooks, use CSS custom properties for theming, keep components focused on presentation.