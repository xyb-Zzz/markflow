import { useState, useEffect, useCallback } from 'react'
import { TreeItem, FileNode } from '../stores'
import { buildFileTree } from '../stores/db'
import { createFile, deleteFile, renameFile, CreateFileOptions } from '../stores/fileStore'
import { createFolder, deleteFolder, renameFolder } from '../stores/folderStore'
import { getExpandedFolders, setExpandedFolders, toggleFolderExpanded as toggleFolderExpandedSetting } from '../stores/settingsStore'

export interface UseFileTreeReturn {
  tree: TreeItem[]
  selectedFileId: string | null
  selectedFile: FileNode | null
  expandedFolderIds: string[]
  loading: boolean
  selectFile: (id: string) => void
  createNewFile: (name?: string) => Promise<FileNode>
  createNewFolder: (name?: string) => Promise<void>
  renameItem: (id: string, newName: string, type: 'file' | 'folder') => Promise<void>
  deleteItem: (id: string, type: 'file' | 'folder') => Promise<void>
  toggleFolder: (folderId: string) => Promise<void>
  refreshTree: () => Promise<void>
  updateSelectedFileContent: (content: string) => void
}

export function useFileTree(): UseFileTreeReturn {
  const [tree, setTree] = useState<TreeItem[]>([])
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null)
  const [expandedFolderIds, setExpandedFolderIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const loadTree = useCallback(async () => {
    const newTree = await buildFileTree(null)
    setTree(newTree)
  }, [])

  const loadExpandedFolders = useCallback(async () => {
    const expanded = await getExpandedFolders()
    setExpandedFolderIds(expanded)
  }, [])

  const refreshTree = useCallback(async () => {
    await Promise.all([loadTree(), loadExpandedFolders()])
  }, [loadTree, loadExpandedFolders])

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await refreshTree()
      setLoading(false)
    }
    init()
  }, [refreshTree])

  const selectFile = useCallback(async (id: string) => {
    setSelectedFileId(id)
    const file = await import('../stores/db').then(m => m.getFile(id))
    if (file && file.type === 'file') {
      setSelectedFile(file as FileNode)
    }
  }, [])

  const createNewFile = useCallback(async (name?: string): Promise<FileNode> => {
    const fileName = name || `Untitled-${Date.now()}.md`
    const options: CreateFileOptions = {
      name: fileName,
      parentId: null,
      content: '',
    }
    const newFile = await createFile(options)
    await loadTree()
    return newFile
  }, [loadTree])

  const createNewFolder = useCallback(async (name?: string): Promise<void> => {
    const folderName = name || `New Folder`
    await createFolder({ name: folderName, parentId: null })
    await loadTree()
  }, [loadTree])

  const renameItem = useCallback(async (id: string, newName: string, type: 'file' | 'folder'): Promise<void> => {
    if (type === 'file') {
      await renameFile(id, newName)
    } else {
      await renameFolder(id, newName)
    }
    await loadTree()
  }, [loadTree])

  const deleteItem = useCallback(async (id: string, type: 'file' | 'folder'): Promise<void> => {
    if (type === 'file') {
      await deleteFile(id)
      if (selectedFileId === id) {
        setSelectedFileId(null)
        setSelectedFile(null)
      }
    } else {
      await deleteFolder(id)
      const newExpanded = expandedFolderIds.filter(fid => fid !== id)
      setExpandedFolderIds(newExpanded)
      await setExpandedFolders(newExpanded)
    }
    await loadTree()
  }, [loadTree, selectedFileId, expandedFolderIds])

  const toggleFolder = useCallback(async (folderId: string): Promise<void> => {
    const newExpanded = await toggleFolderExpandedSetting(folderId)
    setExpandedFolderIds(newExpanded)
  }, [])

  const updateSelectedFileContent = useCallback((content: string) => {
    if (selectedFile) {
      setSelectedFile(prev => prev ? { ...prev, content } : null)
    }
  }, [selectedFile])

  return {
    tree,
    selectedFileId,
    selectedFile,
    expandedFolderIds,
    loading,
    selectFile,
    createNewFile,
    createNewFolder,
    renameItem,
    deleteItem,
    toggleFolder,
    refreshTree,
    updateSelectedFileContent,
  }
}
