import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
// @ts-expect-error - markdown-it-task-lists doesn't have types
import taskLists from 'markdown-it-task-lists'

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

const md: MarkdownIt = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight(str: string, lang: string): string {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`
      } catch {
        // ignore
      }
    }
    return `<pre class="hljs"><code>${escapeHtml(str)}</code></pre>`
  },
})

md.use(taskLists, { enabled: true, label: true })

export function renderMarkdown(content: string): string {
  return md.render(content)
}

export const WELCOME_CONTENT = `# Welcome to MarkFlow

A minimalist Markdown editor with a native Apple feel.

## Text Formatting

You can write **bold text**, *italic text*, or ***both combined***. You can also use ~~strikethrough~~ for deleted content.

## Lists

Unordered lists:
- First item
- Second item
- Third item

Ordered lists:
1. First step
2. Second step
3. Third step

Task lists:
- [x] Completed task
- [ ] In progress
- [ ] Not started

## Blockquotes

> This is a blockquote.
> It can span multiple lines and emphasize important text.

## Code

Inline \`code\` looks like this.

Code blocks with syntax highlighting:

\`\`\`javascript
function greet(name) {
  console.log(\`Hello, \${name}!\`);
}

greet('MarkFlow');
\`\`\`

\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n - 1) + fibonacci(n - 2)

print([fibonacci(i) for i in range(10)])
\`\`\`

## Tables

| Feature | Status | Notes |
|---------|--------|-------|
| Editor | Complete | CodeMirror 6 |
| Preview | Complete | markdown-it |
| Themes | Complete | Light + Dark |
| Scroll Sync | Complete | Percentage-based |

## Links

Visit [MarkFlow Repository](https://github.com) for more information.

Internal links work too: [Back to top](#welcome-to-markflow)

## Horizontal Rule

---

## That's All!

This welcome document covers the basics. Start editing to see the live preview!
`
