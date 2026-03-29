import { useRef, useCallback, useEffect, useState } from 'react'

export type ScrollSource = 'editor' | 'preview' | 'user'

interface ScrollSyncOptions {
  onScrollStart?: () => void
  onScrollEnd?: () => void
}

export function useScrollSync(options: ScrollSyncOptions = {}) {
  const editorRef = useRef<HTMLDivElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const isScrollingRef = useRef(false)
  const scrollTimeoutRef = useRef<number | null>(null)
  const [scrollSource, setScrollSource] = useState<ScrollSource>('user')

  const clearScrollTimeout = useCallback(() => {
    if (scrollTimeoutRef.current !== null) {
      window.clearTimeout(scrollTimeoutRef.current)
      scrollTimeoutRef.current = null
    }
  }, [])

  const handleEditorScroll = useCallback(() => {
    if (isScrollingRef.current) return
    const editor = editorRef.current
    const preview = previewRef.current
    if (!editor || !preview) return

    const scrollPercent = editor.scrollTop / (editor.scrollHeight - editor.clientHeight)
    if (isNaN(scrollPercent)) return

    isScrollingRef.current = true
    setScrollSource('editor')
    options.onScrollStart?.()

    preview.scrollTop = scrollPercent * (preview.scrollHeight - preview.clientHeight)

    clearScrollTimeout()
    scrollTimeoutRef.current = window.setTimeout(() => {
      isScrollingRef.current = false
      setScrollSource('user')
      options.onScrollEnd?.()
    }, 150)
  }, [clearScrollTimeout, options])

  const handlePreviewScroll = useCallback(() => {
    if (isScrollingRef.current) return
    const editor = editorRef.current
    const preview = previewRef.current
    if (!editor || !preview) return

    const scrollPercent = preview.scrollTop / (preview.scrollHeight - preview.clientHeight)
    if (isNaN(scrollPercent)) return

    isScrollingRef.current = true
    setScrollSource('preview')
    options.onScrollStart?.()

    editor.scrollTop = scrollPercent * (editor.scrollHeight - editor.clientHeight)

    clearScrollTimeout()
    scrollTimeoutRef.current = window.setTimeout(() => {
      isScrollingRef.current = false
      setScrollSource('user')
      options.onScrollEnd?.()
    }, 150)
  }, [clearScrollTimeout, options])

  useEffect(() => {
    return () => clearScrollTimeout()
  }, [clearScrollTimeout])

  return {
    editorRef,
    previewRef,
    scrollSource,
    handleEditorScroll,
    handlePreviewScroll,
  }
}
