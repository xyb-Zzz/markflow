import {
  FileNode,
  generateFileId,
  getFile,
  getFilesByParent,
  saveFile,
  deleteFile as dbDeleteFile,
  getAllFiles,
} from './db'

export interface CreateFileOptions {
  name: string
  parentId?: string | null
  content?: string
}

export interface UpdateFileOptions {
  id: string
  name?: string
  content?: string
  parentId?: string | null
}

export async function createFile(options: CreateFileOptions): Promise<FileNode> {
  const { name, parentId = null, content = '' } = options

  // Get existing files in the same parent to determine order
  const existingFiles = await getFilesByParent(parentId)
  const maxOrder = existingFiles.reduce((max, f) => Math.max(max, f.order), -1)

  const now = Date.now()
  const file: FileNode = {
    id: generateFileId(),
    name,
    type: 'file',
    parentId,
    order: maxOrder + 1,
    content,
    createdAt: now,
    updatedAt: now,
  }

  await saveFile(file)
  return file
}

export async function updateFile(options: UpdateFileOptions): Promise<FileNode | null> {
  const { id, name, content, parentId } = options

  const file = await getFile(id)
  if (!file) return null

  const updated: FileNode = {
    ...file,
    ...(name !== undefined && { name }),
    ...(content !== undefined && { content }),
    ...(parentId !== undefined && { parentId }),
    updatedAt: Date.now(),
  }

  await saveFile(updated)
  return updated
}

export async function deleteFile(id: string): Promise<boolean> {
  const file = await getFile(id)
  if (!file) return false

  await dbDeleteFile(id)
  return true
}

export async function getFileById(id: string): Promise<FileNode | undefined> {
  return getFile(id)
}

export async function getFilesInFolder(parentId: string | null): Promise<FileNode[]> {
  return getFilesByParent(parentId)
}

export async function getAllFilesSorted(): Promise<FileNode[]> {
  const files = await getAllFiles()
  return files.sort((a, b) => {
    // Sort by parentId first (root files first), then by order
    if (a.parentId !== b.parentId) {
      if (a.parentId === null) return -1
      if (b.parentId === null) return 1
      return a.parentId.localeCompare(b.parentId)
    }
    return a.order - b.order
  })
}

export async function moveFile(id: string, newParentId: string | null, newOrder: number): Promise<FileNode | null> {
  const file = await getFile(id)
  if (!file) return null

  const updated: FileNode = {
    ...file,
    parentId: newParentId,
    order: newOrder,
    updatedAt: Date.now(),
  }

  await saveFile(updated)
  return updated
}

export async function renameFile(id: string, newName: string): Promise<FileNode | null> {
  return updateFile({ id, name: newName })
}
