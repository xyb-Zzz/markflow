# MarkFlow

A minimalist Markdown editor with a macOS-native aesthetic. Built for writers and knowledge workers who value distraction-free writing with structural clarity.

![Version](https://img.shields.io/badge/version-0.1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

- **Split View** — Edit and preview side-by-side with adjustable ratios (20%-80%)
- **Markdown Syntax Highlighting** — Powered by CodeMirror 6
- **Scroll Sync** — Editor and preview scroll in sync
- **File Tree** — Organize documents in folders, stored locally in IndexedDB
- **Outline Navigation** — Auto-generated heading structure for quick navigation
- **Theme Support** — Light/dark mode following system preference
- **Export** — Export as standalone HTML or PDF

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Editor**: CodeMirror 6
- **Markdown Parser**: markdown-it
- **Styling**: Pure CSS with CSS Variables

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + S` | Save |
| `Cmd/Ctrl + B` | Toggle bold |
| `Cmd/Ctrl + I` | Toggle italic |
| `Cmd/Ctrl + F` | Find/Replace |
| `Cmd/Ctrl + K` | Insert link |
| `Cmd/Ctrl + Shift + K` | Insert code block |
| `Cmd/Ctrl + B` | Toggle sidebar |
| `Cmd/Ctrl + Shift + O` | Toggle outline |

## Project Structure

```
src/
├── components/     # React components
├── hooks/          # Custom React hooks
├── styles/         # Global CSS
└── main.tsx        # Entry point
```

## License

MIT
