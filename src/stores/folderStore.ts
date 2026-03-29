import {
  FolderNode,
  generateFolderId,
  getFolder,
  getFoldersByParent,
  saveFolder,
  deleteFolder as dbDeleteFolder,
  getAllFolders,
  getFilesByParent,
  deleteFile,
  TreeItem,
  buildFileTree,
} from './db'

export interface CreateFolderOptions {
  name: string
  parentId?: string | null
}

export interface UpdateFolderOptions {
  id: string
  name?: string
  parentId?: string | null
}

export async function createFolder(options: CreateFolderOptions): Promise<FolderNode> {
  const { name, parentId = null } = options

  // Get existing folders in the same parent to determine order
  const existingFolders = await getFoldersByParent(parentId)
  const maxOrder = existingFolders.reduce((max, f) => Math.max(max, f.order), -1)

  const now = Date.now()
  const folder: FolderNode = {
    id: generateFolderId(),
    name,
    type: 'folder',
    parentId,
    order: maxOrder + 1,
    createdAt: now,
    updatedAt: now,
  }

  await saveFolder(folder)
  return folder
}

export async function updateFolder(options: UpdateFolderOptions): Promise<FolderNode | null> {
  const { id, name, parentId } = options

  const folder = await getFolder(id)
  if (!folder) return null

  const updated: FolderNode = {
    ...folder,
    ...(name !== undefined && { name }),
    ...(parentId !== undefined && { parentId }),
    updatedAt: Date.now(),
  }

  await saveFolder(updated)
  return updated
}

export async function deleteFolder(id: string): Promise<boolean> {
  const folder = await getFolder(id)
  if (!folder) return false

  // Recursively delete all contents
  await deleteFolderContents(id)

  await dbDeleteFolder(id)
  return true
}

async function deleteFolderContents(folderId: string): Promise<void> {
  // Get all subfolders
  const subfolders = await getFoldersByParent(folderId)
  for (const subfolder of subfolders) {
    await deleteFolderContents(subfolder.id)
  }

  // Delete all files in this folder
  const files = await getFilesByParent(folderId)
  for (const file of files) {
    await deleteFile(file.id)
  }

  // Delete all subfolders
  for (const subfolder of subfolders) {
    await dbDeleteFolder(subfolder.id)
  }
}

export async function getFolderById(id: string): Promise<FolderNode | undefined> {
  return getFolder(id)
}

export async function getFoldersInFolder(parentId: string | null): Promise<FolderNode[]> {
  return getFoldersByParent(parentId)
}

export async function getAllFoldersSorted(): Promise<FolderNode[]> {
  const folders = await getAllFolders()
  return folders.sort((a, b) => {
    // Sort by parentId first (root folders first), then by order
    if (a.parentId !== b.parentId) {
      if (a.parentId === null) return -1
      if (b.parentId === null) return 1
      return a.parentId.localeCompare(b.parentId)
    }
    return a.order - b.order
  })
}

export async function moveFolder(id: string, newParentId: string | null, newOrder: number): Promise<FolderNode | null> {
  const folder = await getFolder(id)
  if (!folder) return null

  // Prevent moving a folder into itself or its descendants
  if (newParentId !== null) {
    const isDescendant = await isDescendantOf(newParentId, id)
    if (isDescendant) {
      throw new Error('Cannot move a folder into itself or its descendants')
    }
  }

  const updated: FolderNode = {
    ...folder,
    parentId: newParentId,
    order: newOrder,
    updatedAt: Date.now(),
  }

  await saveFolder(updated)
  return updated
}

async function isDescendantOf(folderId: string, ancestorId: string): Promise<boolean> {
  const folder = await getFolder(folderId)
  if (!folder) return false
  if (folder.parentId === ancestorId) return true
  if (folder.parentId === null) return false
  return isDescendantOf(folder.parentId, ancestorId)
}

export async function renameFolder(id: string, newName: string): Promise<FolderNode | null> {
  return updateFolder({ id, name: newName })
}

export async function getFolderTree(): Promise<TreeItem[]> {
  return buildFileTree(null)
}

export async function reorderFoldersInParent(parentId: string | null, folderIds: string[]): Promise<void> {
  for (let i = 0; i < folderIds.length; i++) {
    const folder = await getFolder(folderIds[i])
    if (folder && folder.parentId === parentId) {
      const updated: FolderNode = {
        ...folder,
        order: i,
        updatedAt: Date.now(),
      }
      await saveFolder(updated)
    }
  }
}
