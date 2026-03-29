import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Folder, FolderOpen, FileText, ChevronRight, ChevronDown, MoreHorizontal, Plus, FolderPlus, Trash2, Pencil } from 'lucide-react'
import { TreeItem } from '../../stores'
import styles from './Sidebar.module.css'

interface ContextMenuState {
  visible: boolean
  x: number
  y: number
  targetId: string | null
  targetType: 'file' | 'folder' | 'root'
}

interface SidebarProps {
  tree: TreeItem[]
  selectedFileId: string | null
  expandedFolderIds: string[]
  onSelectFile: (id: string) => void
  onCreateFile: () => Promise<void>
  onCreateFolder: () => Promise<void>
  onRename: (id: string, newName: string, type: 'file' | 'folder') => Promise<void>
  onDelete: (id: string, type: 'file' | 'folder') => Promise<void>
  onToggleFolder: (folderId: string) => void
}

export function Sidebar({
  tree,
  selectedFileId,
  expandedFolderIds,
  onSelectFile,
  onCreateFile,
  onCreateFolder,
  onRename,
  onDelete,
  onToggleFolder,
}: SidebarProps) {
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    targetId: null,
    targetType: 'root',
  })
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renamingValue, setRenamingValue] = useState('')
  const renameInputRef = useRef<HTMLInputElement>(null)
  const contextMenuRef = useRef<HTMLDivElement>(null)

  // Close context menu on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target as Node)) {
        setContextMenu(prev => ({ ...prev, visible: false }))
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Focus rename input when renaming starts
  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus()
      renameInputRef.current.select()
    }
  }, [renamingId])

  const handleContextMenu = useCallback((e: React.MouseEvent, id: string | null, type: 'file' | 'folder' | 'root') => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      targetId: id,
      targetType: type,
    })
  }, [])

  const handleRenameStart = useCallback((id: string, currentName: string) => {
    setRenamingId(id)
    setRenamingValue(currentName)
    setContextMenu(prev => ({ ...prev, visible: false }))
  }, [])

  const handleRenameSubmit = useCallback(async () => {
    if (renamingId && renamingValue.trim()) {
      const item = findItemById(tree, renamingId)
      if (item) {
        await onRename(renamingId, renamingValue.trim(), item.type)
      }
    }
    setRenamingId(null)
    setRenamingValue('')
  }, [renamingId, renamingValue, tree, onRename])

  const handleRenameKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRenameSubmit()
    } else if (e.key === 'Escape') {
      setRenamingId(null)
      setRenamingValue('')
    }
  }, [handleRenameSubmit])

  const handleDoubleClick = useCallback((id: string, _name: string, type: 'file' | 'folder') => {
    if (type === 'file') {
      onSelectFile(id)
    } else {
      onToggleFolder(id)
    }
  }, [onSelectFile, onToggleFolder])

  const renderTreeItem = (item: TreeItem, depth: number = 0) => {
    const isFolder = item.type === 'folder'
    const isExpanded = expandedFolderIds.includes(item.id)
    const isSelected = item.id === selectedFileId
    const isRenaming = item.id === renamingId

    return (
      <div key={item.id}>
        <div
          className={`${styles.treeItem} ${isSelected ? styles.selected : ''}`}
          style={{ paddingLeft: `${12 + depth * 16}px` }}
          onClick={(e) => {
            e.stopPropagation()
            if (isFolder) {
              onToggleFolder(item.id)
            } else {
              onSelectFile(item.id)
            }
          }}
          onDoubleClick={() => handleDoubleClick(item.id, item.name, item.type)}
          onContextMenu={(e) => handleContextMenu(e, item.id, item.type)}
        >
          {isFolder ? (
            <>
              <span className={styles.chevron}>
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </span>
              <span className={styles.icon}>
                {isExpanded ? <FolderOpen size={16} /> : <Folder size={16} />}
              </span>
            </>
          ) : (
            <>
              <span className={styles.chevronPlaceholder} />
              <span className={styles.icon}>
                <FileText size={16} />
              </span>
            </>
          )}

          {isRenaming ? (
            <input
              ref={renameInputRef}
              type="text"
              className={styles.renameInput}
              value={renamingValue}
              onChange={(e) => setRenamingValue(e.target.value)}
              onBlur={handleRenameSubmit}
              onKeyDown={handleRenameKeyDown}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className={styles.name}>{item.name}</span>
          )}

          <button
            className={styles.moreBtn}
            onClick={(e) => {
              e.stopPropagation()
              handleContextMenu(e, item.id, item.type)
            }}
            aria-label="More options"
          >
            <MoreHorizontal size={14} />
          </button>
        </div>

        {isFolder && isExpanded && item.children && (
          <div className={styles.children}>
            {item.children.map(child => renderTreeItem(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={styles.sidebar} onContextMenu={(e) => handleContextMenu(e, null, 'root')}>
      <div className={styles.header}>
        <span className={styles.title}>Files</span>
        <div className={styles.headerActions}>
          <button
            className={styles.headerBtn}
            onClick={onCreateFile}
            aria-label="New file"
            title="New file"
          >
            <FileText size={14} />
          </button>
          <button
            className={styles.headerBtn}
            onClick={onCreateFolder}
            aria-label="New folder"
            title="New folder"
          >
            <FolderPlus size={14} />
          </button>
        </div>
      </div>

      <div className={styles.tree}>
        {tree.length === 0 ? (
          <div className={styles.empty}>
            <p>No files yet</p>
            <button onClick={onCreateFile} className={styles.emptyBtn}>
              <Plus size={14} />
              Create file
            </button>
          </div>
        ) : (
          tree.map(item => renderTreeItem(item))
        )}
      </div>

      {contextMenu.visible && (
        <div
          ref={contextMenuRef}
          className={styles.contextMenu}
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          {contextMenu.targetType === 'root' ? (
            <>
              <button onClick={() => { onCreateFile(); setContextMenu(prev => ({ ...prev, visible: false })) }}>
                <FileText size={14} />
                New File
              </button>
              <button onClick={() => { onCreateFolder(); setContextMenu(prev => ({ ...prev, visible: false })) }}>
                <FolderPlus size={14} />
                New Folder
              </button>
            </>
          ) : (
            <>
              <button onClick={() => {
                const item = contextMenu.targetId ? findItemById(tree, contextMenu.targetId) : null
                if (item && contextMenu.targetType === 'file') {
                  onSelectFile(item.id)
                } else if (item && contextMenu.targetType === 'folder') {
                  onToggleFolder(item.id)
                }
                setContextMenu(prev => ({ ...prev, visible: false }))
              }}>
                <FileText size={14} />
                {contextMenu.targetType === 'folder' ? 'Open' : 'Open File'}
              </button>
              <button onClick={() => {
                const item = findItemById(tree, contextMenu.targetId!)
                if (item) {
                  handleRenameStart(item.id, item.name)
                }
              }}>
                <Pencil size={14} />
                Rename
              </button>
              <div className={styles.divider} />
              <button
                className={styles.danger}
                onClick={() => {
                  if (contextMenu.targetId) {
                    onDelete(contextMenu.targetId, contextMenu.targetType as 'file' | 'folder')
                  }
                  setContextMenu(prev => ({ ...prev, visible: false }))
                }}
              >
                <Trash2 size={14} />
                Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function findItemById(tree: TreeItem[], id: string): TreeItem | null {
  for (const item of tree) {
    if (item.id === id) return item
    if (item.children) {
      const found = findItemById(item.children, id)
      if (found) return found
    }
  }
  return null
}
