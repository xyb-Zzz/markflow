import { useMemo } from 'react'
import { renderMarkdown } from '../utils/markdown'

interface PreviewProps {
  content: string
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void
}

export function Preview({ content, onScroll }: PreviewProps) {
  const html = useMemo(() => renderMarkdown(content), [content])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    onScroll?.(e)
  }

  return (
    <div
      className="preview-container"
      onScroll={handleScroll}
      style={{
        height: '100%',
        overflow: 'auto',
        background: 'var(--bg-primary)',
        padding: '20px 24px',
      }}
    >
      <style>{`
        .preview-container h1,
        .preview-container h2,
        .preview-container h3,
        .preview-container h4,
        .preview-container h5,
        .preview-container h6 {
          margin-top: 1.5em;
          margin-bottom: 0.5em;
          font-weight: 600;
          line-height: 1.3;
          color: var(--text-primary);
        }
        .preview-container h1 { font-size: 1.75em; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.3em; }
        .preview-container h2 { font-size: 1.5em; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.3em; }
        .preview-container h3 { font-size: 1.25em; }
        .preview-container h4 { font-size: 1.1em; }
        .preview-container h5 { font-size: 1em; }
        .preview-container h6 { font-size: 0.9em; color: var(--text-secondary); }
        .preview-container p { margin: 1em 0; }
        .preview-container strong { font-weight: 600; }
        .preview-container em { font-style: italic; }
        .preview-container del { text-decoration: line-through; color: var(--text-secondary); }
        .preview-container a { color: var(--accent); }
        .preview-container a:hover { text-decoration: underline; }
        .preview-container code {
          font-family: var(--font-mono);
          background: var(--code-bg);
          padding: 0.15em 0.35em;
          border-radius: 4px;
          font-size: 0.9em;
        }
        .preview-container pre {
          background: var(--hl-bg);
          border-radius: 8px;
          padding: 16px;
          overflow-x: auto;
          margin: 1em 0;
        }
        .preview-container pre code {
          background: none;
          padding: 0;
          font-size: 0.875em;
          line-height: 1.6;
        }
        .preview-container blockquote {
          border-left: 3px solid var(--blockquote-border);
          background: var(--blockquote-bg);
          margin: 1em 0;
          padding: 0.5em 1em;
          border-radius: 0 6px 6px 0;
        }
        .preview-container blockquote p { margin: 0.5em 0; }
        .preview-container ul, .preview-container ol {
          margin: 1em 0;
          padding-left: 1.5em;
        }
        .preview-container li { margin: 0.3em 0; }
        .preview-container ul li { list-style-type: disc; }
        .preview-container ol li { list-style-type: decimal; }
        .preview-container ul ul, .preview-container ol ul { list-style-type: circle; }
        .preview-container hr {
          border: none;
          border-top: 1px solid var(--border-color);
          margin: 2em 0;
        }
        .preview-container table {
          width: 100%;
          border-collapse: collapse;
          margin: 1em 0;
          font-size: 0.95em;
        }
        .preview-container th, .preview-container td {
          border: 1px solid var(--border-color);
          padding: 0.6em 0.8em;
          text-align: left;
        }
        .preview-container th {
          background: var(--bg-secondary);
          font-weight: 600;
        }
        .preview-container tr:nth-child(even) { background: var(--bg-secondary); }
        .preview-container input[type="checkbox"] {
          margin-right: 0.5em;
          accent-color: var(--accent);
        }
        .preview-container img {
          max-width: 100%;
          border-radius: 6px;
        }
        /* highlight.js styles */
        .preview-container .hljs { background: var(--hl-bg); color: var(--text-primary); }
        .preview-container .hljs-comment, .preview-container .hljs-quote { color: var(--hl-comment); font-style: italic; }
        .preview-container .hljs-keyword, .preview-container .hljs-selector-tag, .preview-container .hljs-addition { color: var(--hl-keyword); }
        .preview-container .hljs-string, .preview-container .hljs-doctag, .preview-container .hljs-regexp { color: var(--hl-string); }
        .preview-container .hljs-number, .preview-container .hljs-literal, .preview-container .hljs-type { color: var(--hl-number); }
        .preview-container .hljs-function, .preview-container .hljs-title, .preview-container .hljs-section { color: var(--hl-function); }
        .preview-container .hljs-variable, .preview-container .hljs-attr, .preview-container .hljs-template-variable { color: var(--hl-variable); }
        .preview-container .hljs-built_in, .preview-container .hljs-class .hljs-title { color: var(--hl-function); }
        .preview-container .hljs-deletion { color: var(--hl-variable); }
      `}</style>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  )
}
