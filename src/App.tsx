import { useState, useCallback } from 'react'
import { Toolbar } from './components/Toolbar'
import { Editor } from './components/Editor'
import { Preview } from './components/Preview'
import { SplitPane } from './components/SplitPane'
import { useTheme } from './hooks/useTheme'
import { useSplitPane } from './hooks/useSplitPane'
import { useScrollSync } from './hooks/useScrollSync'
import { WELCOME_CONTENT } from './utils/markdown'

function App() {
  const [content, setContent] = useState(WELCOME_CONTENT)
  const { theme, themePreference, setTheme } = useTheme()
  const {
    viewMode,
    splitRatio,
    containerRef,
    cycleViewMode,
    handleDividerMouseDown,
  } = useSplitPane()

  const { editorRef, previewRef, handleEditorScroll, handlePreviewScroll } = useScrollSync()

  const handleInsert = useCallback((before: string, after: string, _placeholder: string) => {
    setContent(prev => {
      const selection = window.getSelection()?.toString() || ''
      return prev + `\n${before}${selection || 'text'}${after}\n`
    })
  }, [])

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent)
  }, [])

  const editorPanel = (
    <div
      ref={editorRef as React.RefObject<HTMLDivElement>}
      onScroll={handleEditorScroll}
      style={{ flex: 1, overflow: 'hidden' }}
    >
      <Editor
        value={content}
        onChange={handleContentChange}
        theme={theme}
        onScroll={handleEditorScroll}
      />
    </div>
  )

  const previewPanel = (
    <div
      ref={previewRef as React.RefObject<HTMLDivElement>}
      onScroll={handlePreviewScroll}
      style={{ flex: 1, overflow: 'hidden' }}
    >
      <Preview content={content} onScroll={handlePreviewScroll} />
    </div>
  )

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
      }}
    >
      <Toolbar
        viewMode={viewMode}
        onViewModeChange={cycleViewMode}
        theme={themePreference}
        onThemeChange={setTheme}
        onInsert={handleInsert}
      />

      <main
        style={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
        }}
      >
        {viewMode === 'edit' ? (
          editorPanel
        ) : viewMode === 'preview' ? (
          previewPanel
        ) : (
          <SplitPane
            left={editorPanel}
            right={previewPanel}
            ratio={splitRatio}
            isSplit={true}
            containerRef={containerRef}
            onDividerMouseDown={handleDividerMouseDown}
          />
        )}
      </main>
    </div>
  )
}

export default App
