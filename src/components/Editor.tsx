import { useEffect, useRef } from 'react'
import { EditorState } from '@codemirror/state'
import { EditorView, keymap, lineNumbers, highlightActiveLine, drawSelection } from '@codemirror/view'
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands'
import { markdown, markdownLanguage } from '@codemirror/lang-markdown'
import { languages } from '@codemirror/language-data'
import { syntaxHighlighting, HighlightStyle } from '@codemirror/language'
import { tags } from '@lezer/highlight'

interface EditorProps {
  value: string
  onChange: (value: string) => void
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void
  theme: 'light' | 'dark'
}

const lightHighlightStyle = HighlightStyle.define([
  { tag: tags.heading1, fontWeight: '700', fontSize: '1.5em', color: '#1d1d1f' },
  { tag: tags.heading2, fontWeight: '700', fontSize: '1.3em', color: '#1d1d1f' },
  { tag: tags.heading3, fontWeight: '700', fontSize: '1.15em', color: '#1d1d1f' },
  { tag: tags.heading4, fontWeight: '600', fontSize: '1.1em', color: '#1d1d1f' },
  { tag: tags.heading5, fontWeight: '600', color: '#1d1d1f' },
  { tag: tags.heading6, fontWeight: '600', color: '#6e6e73' },
  { tag: tags.strong, fontWeight: '600' },
  { tag: tags.emphasis, fontStyle: 'italic' },
  { tag: tags.strikethrough, textDecoration: 'line-through', color: '#6e6e73' },
  { tag: tags.link, color: '#007aff' },
  { tag: tags.url, color: '#007aff' },
  { tag: tags.quote, color: '#6e6e73', fontStyle: 'italic' },
  { tag: tags.monospace, fontFamily: 'var(--font-mono)', backgroundColor: '#f4f4f4', padding: '0.1em 0.2em', borderRadius: '3px' },
  { tag: tags.comment, color: '#6a737d' },
  { tag: tags.keyword, color: '#d73a49' },
  { tag: tags.string, color: '#032f62' },
  { tag: tags.number, color: '#005cc5' },
  { tag: tags.function(tags.variableName), color: '#6f42c1' },
  { tag: tags.variableName, color: '#e36209' },
])

const darkHighlightStyle = HighlightStyle.define([
  { tag: tags.heading1, fontWeight: '700', fontSize: '1.5em', color: '#f5f5f7' },
  { tag: tags.heading2, fontWeight: '700', fontSize: '1.3em', color: '#f5f5f7' },
  { tag: tags.heading3, fontWeight: '700', fontSize: '1.15em', color: '#f5f5f7' },
  { tag: tags.heading4, fontWeight: '600', fontSize: '1.1em', color: '#f5f5f7' },
  { tag: tags.heading5, fontWeight: '600', color: '#f5f5f7' },
  { tag: tags.heading6, fontWeight: '600', color: '#a1a1a6' },
  { tag: tags.strong, fontWeight: '600' },
  { tag: tags.emphasis, fontStyle: 'italic' },
  { tag: tags.strikethrough, textDecoration: 'line-through', color: '#a1a1a6' },
  { tag: tags.link, color: '#0a84ff' },
  { tag: tags.url, color: '#0a84ff' },
  { tag: tags.quote, color: '#a1a1a6', fontStyle: 'italic' },
  { tag: tags.monospace, fontFamily: 'var(--font-mono)', backgroundColor: '#2c2c2e', padding: '0.1em 0.2em', borderRadius: '3px' },
  { tag: tags.comment, color: '#5c6370' },
  { tag: tags.keyword, color: '#c678dd' },
  { tag: tags.string, color: '#98c379' },
  { tag: tags.number, color: '#d19a66' },
  { tag: tags.function(tags.variableName), color: '#61afef' },
  { tag: tags.variableName, color: '#e06c75' },
])

const baseTheme = EditorView.theme({
  '&': {
    height: '100%',
    fontSize: 'var(--font-size-base)',
    fontFamily: 'var(--font-stack)',
  },
  '.cm-content': {
    padding: '20px 24px',
    caretColor: 'var(--accent)',
    lineHeight: 'var(--line-height-base)',
  },
  '.cm-cursor': {
    borderLeftColor: 'var(--accent)',
    borderLeftWidth: '2px',
  },
  '.cm-activeLine': {
    backgroundColor: 'transparent',
  },
  '.cm-gutters': {
    display: 'none',
  },
  '.cm-scroller': {
    overflow: 'auto',
    fontFamily: 'var(--font-stack)',
  },
  '.cm-selectionBackground': {
    backgroundColor: 'var(--selection-bg) !important',
  },
  '&.cm-focused .cm-selectionBackground': {
    backgroundColor: 'var(--selection-bg) !important',
  },
})

export function Editor({ value, onChange, onScroll, theme }: EditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const isExternalChange = useRef(false)

  useEffect(() => {
    if (!containerRef.current) return

    const extensions = [
      baseTheme,
      lineNumbers(),
      highlightActiveLine(),
      drawSelection(),
      history(),
      keymap.of([...defaultKeymap, ...historyKeymap]),
      markdown({
        base: markdownLanguage,
        codeLanguages: languages,
      }),
      syntaxHighlighting(theme === 'dark' ? darkHighlightStyle : lightHighlightStyle),
      EditorView.lineWrapping,
      EditorView.updateListener.of(update => {
        if (update.docChanged && !isExternalChange.current) {
          onChange(update.state.doc.toString())
        }
      }),
    ]

    const state = EditorState.create({
      doc: value,
      extensions,
    })

    const view = new EditorView({
      state,
      parent: containerRef.current,
    })

    viewRef.current = view

    return () => {
      view.destroy()
      viewRef.current = null
    }
  }, [theme])

  useEffect(() => {
    const view = viewRef.current
    if (!view) return

    const currentValue = view.state.doc.toString()
    if (currentValue !== value) {
      isExternalChange.current = true
      view.dispatch({
        changes: {
          from: 0,
          to: currentValue.length,
          insert: value,
        },
      })
      isExternalChange.current = false
    }
  }, [value])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    onScroll?.(e)
  }

  return (
    <div
      ref={containerRef}
      className="editor-container"
      onScroll={handleScroll}
      style={{
        height: '100%',
        overflow: 'auto',
        background: 'var(--bg-primary)',
      }}
    />
  )
}
