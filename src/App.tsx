import { useState, useCallback, useEffect, useRef } from 'react'
import { Toolbar } from './components/Toolbar'
import { Editor } from './components/Editor'
import { Preview } from './components/Preview'
import { SplitPane } from './components/SplitPane'
import { Sidebar } from './components/Sidebar'
import { useTheme } from './hooks/useTheme'
import { useSplitPane } from './hooks/useSplitPane'
import { useScrollSync } from './hooks/useScrollSync'
import { useFileTree } from './hooks/useFileTree'
import { useAutoSave } from './hooks/useAutoSave'
import { getLastOpenedFileId, setLastOpenedFileId } from './stores'
import { WELCOME_CONTENT } from './utils/markdown'
import { getAllFiles } from './stores/db'

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [content, setContent] = useState('')
  const [isDirty, setIsDirty] = useState(false)
  const contentRef = useRef(content)
  const isInitializedRef = useRef(false)

  const { theme, themePreference, setTheme } = useTheme()
  const {
    viewMode,
    splitRatio,
    containerRef,
    cycleViewMode,
    handleDividerMouseDown,
  } = useSplitPane()

  const {
    tree,
    selectedFileId,
    expandedFolderIds,
    loading: treeLoading,
    selectFile,
    createNewFile,
    createNewFolder,
    renameItem,
    deleteItem,
    toggleFolder,
    refreshTree,
    updateSelectedFileContent,
  } = useFileTree()

  const { flush: flushAutoSave } = useAutoSave(selectedFileId, content, isDirty)

  const { editorRef, previewRef, handleEditorScroll, handlePreviewScroll } = useScrollSync()

  // Sync content ref for callbacks
  useEffect(() => {
    contentRef.current = content
  }, [content])

  // Initialize: load last opened file or create default
  useEffect(() => {
    if (isInitializedRef.current || treeLoading) return

    const init = async () => {
      isInitializedRef.current = true

      // Check if there are any files
      const files = await getAllFiles()

      if (files.length === 0) {
        // Create default welcome file
        const defaultFile = await createNewFile('Welcome.md')
        // Update content with welcome markdown
        setContent(WELCOME_CONTENT)
        // Save the welcome content
        await import('./stores/fileStore').then(m => m.updateFile({
          id: defaultFile.id,
          content: WELCOME_CONTENT,
        }))
        await selectFile(defaultFile.id)
        await setLastOpenedFileId(defaultFile.id)
        await refreshTree()
      } else {
        // Load last opened file or first available
        const lastOpenedId = await getLastOpenedFileId()
        const lastOpened = lastOpenedId ? files.find(f => f.id === lastOpenedId) : null
        const fileToOpen = lastOpened || files[0]

        await selectFile(fileToOpen.id)
        setContent(fileToOpen.content)
        await setLastOpenedFileId(fileToOpen.id)
      }
    }

    init()
  }, [treeLoading, createNewFile, selectFile, refreshTree])

  // Cmd+B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault()
        setSidebarOpen(prev => !prev)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const handleSidebarToggle = useCallback(() => {
    setSidebarOpen(prev => !prev)
  }, [])

  const handleInsert = useCallback((before: string, after: string, _placeholder: string) => {
    setContent(prev => {
      const selection = window.getSelection()?.toString() || ''
      void _placeholder // kept for toolbar interface compatibility
      return prev + `\n${before}${selection || 'text'}${after}\n`
    })
    setIsDirty(true)
  }, [])

  const handleContentChange = useCallback((newContent: string) => {
    setContent(newContent)
    setIsDirty(true)
    updateSelectedFileContent(newContent)
  }, [updateSelectedFileContent])

  const handleSelectFile = useCallback(async (id: string) => {
    // Flush current file before switching
    await flushAutoSave()
    await selectFile(id)
    await setLastOpenedFileId(id)
  }, [selectFile, flushAutoSave])

  const handleCreateFile = useCallback(async () => {
    const newFile = await createNewFile()
    await handleSelectFile(newFile.id)
    setContent('')
    setIsDirty(false)
  }, [createNewFile, handleSelectFile])

  const handleCreateFolder = useCallback(async () => {
    await createNewFolder()
  }, [createNewFolder])

  const handleRename = useCallback(async (id: string, newName: string, type: 'file' | 'folder') => {
    await renameItem(id, newName, type)
  }, [renameItem])

  const handleDelete = useCallback(async (id: string, type: 'file' | 'folder') => {
    await flushAutoSave()
    await deleteItem(id, type)

    // If deleted file was selected, switch to another or create new
    if (type === 'file' && selectedFileId === id) {
      const files = await getAllFiles()
      if (files.length > 0) {
        const nextFile = files[0]
        await selectFile(nextFile.id)
        setContent(nextFile.content)
        await setLastOpenedFileId(nextFile.id)
        setIsDirty(false)
      } else {
        // Create new file if all deleted
        const newFile = await createNewFile()
        await selectFile(newFile.id)
        setContent('')
        setIsDirty(false)
      }
    }
  }, [flushAutoSave, deleteItem, selectedFileId, selectFile, createNewFile])

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
        sidebarOpen={sidebarOpen}
        onSidebarToggle={handleSidebarToggle}
      />

      <main
        style={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
        }}
      >
        {sidebarOpen && (
          <Sidebar
            tree={tree}
            selectedFileId={selectedFileId}
            expandedFolderIds={expandedFolderIds}
            onSelectFile={handleSelectFile}
            onCreateFile={handleCreateFile}
            onCreateFolder={handleCreateFolder}
            onRename={handleRename}
            onDelete={handleDelete}
            onToggleFolder={toggleFolder}
          />
        )}

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
