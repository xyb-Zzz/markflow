const DB_NAME = 'markflow-db'
const DB_VERSION = 1

export interface FileNode {
  id: string
  name: string
  type: 'file'
  parentId: string | null
  order: number
  content: string
  createdAt: number
  updatedAt: number
}

export interface FolderNode {
  id: string
  name: string
  type: 'folder'
  parentId: string | null
  order: number
  createdAt: number
  updatedAt: number
}

export interface Settings {
  theme: 'light' | 'dark' | 'system'
  sidebarWidth: number
  outlineWidth: number
  splitRatio: number
  expandedFolders: string[]
  lastOpenedFileId: string | null
  recentFiles: string[]
}

export type TreeNode = FileNode | FolderNode

let dbInstance: IDBDatabase | null = null

function generateId(): string {
  return crypto.randomUUID()
}

export function generateFileId(): string {
  return generateId()
}

export function generateFolderId(): string {
  return generateId()
}

export async function initDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      reject(new Error('Failed to open database'))
    }

    request.onsuccess = () => {
      dbInstance = request.result
      resolve(dbInstance)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      // Files store
      if (!db.objectStoreNames.contains('files')) {
        const filesStore = db.createObjectStore('files', { keyPath: 'id' })
        filesStore.createIndex('parentId', 'parentId', { unique: false })
        filesStore.createIndex('order', 'order', { unique: false })
      }

      // Folders store
      if (!db.objectStoreNames.contains('folders')) {
        const foldersStore = db.createObjectStore('folders', { keyPath: 'id' })
        foldersStore.createIndex('parentId', 'parentId', { unique: false })
        foldersStore.createIndex('order', 'order', { unique: false })
      }

      // Settings store
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' })
      }

      // Blobs store for images
      if (!db.objectStoreNames.contains('blobs')) {
        db.createObjectStore('blobs', { keyPath: 'id' })
      }
    }
  })
}

export async function getDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance
  return initDB()
}

// Generic CRUD helpers
async function getAllFromStore<T>(storeName: string): Promise<T[]> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly')
    const store = transaction.objectStore(storeName)
    const request = store.getAll()
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function getFromStore<T>(storeName: string, id: string): Promise<T | undefined> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly')
    const store = transaction.objectStore(storeName)
    const request = store.get(id)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

async function putToStore<T>(storeName: string, item: T): Promise<void> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite')
    const store = transaction.objectStore(storeName)
    const request = store.put(item)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

async function deleteFromStore(storeName: string, id: string): Promise<void> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readwrite')
    const store = transaction.objectStore(storeName)
    const request = store.delete(id)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

async function getByIndex<T>(
  storeName: string,
  indexName: string,
  value: IDBValidKey
): Promise<T[]> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, 'readonly')
    const store = transaction.objectStore(storeName)
    const index = store.index(indexName)
    const request = index.getAll(value)
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// File operations
export async function getAllFiles(): Promise<FileNode[]> {
  return getAllFromStore<FileNode>('files')
}

export async function getFile(id: string): Promise<FileNode | undefined> {
  return getFromStore<FileNode>('files', id)
}

export async function getFilesByParent(parentId: string | null): Promise<FileNode[]> {
  if (parentId === null) {
    const allFiles = await getAllFiles()
    return allFiles.filter(f => f.parentId === null)
  }
  return getByIndex<FileNode>('files', 'parentId', parentId)
}

export async function saveFile(file: FileNode): Promise<void> {
  return putToStore('files', file)
}

export async function deleteFile(id: string): Promise<void> {
  return deleteFromStore('files', id)
}

// Folder operations
export async function getAllFolders(): Promise<FolderNode[]> {
  return getAllFromStore<FolderNode>('folders')
}

export async function getFolder(id: string): Promise<FolderNode | undefined> {
  return getFromStore<FolderNode>('folders', id)
}

export async function getFoldersByParent(parentId: string | null): Promise<FolderNode[]> {
  if (parentId === null) {
    const allFolders = await getAllFolders()
    return allFolders.filter(f => f.parentId === null)
  }
  return getByIndex<FolderNode>('folders', 'parentId', parentId)
}

export async function saveFolder(folder: FolderNode): Promise<void> {
  return putToStore('folders', folder)
}

export async function deleteFolder(id: string): Promise<void> {
  return deleteFromStore('folders', id)
}

// Settings operations
const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  sidebarWidth: 240,
  outlineWidth: 200,
  splitRatio: 0.5,
  expandedFolders: [],
  lastOpenedFileId: null,
  recentFiles: [],
}

export async function getSettings(): Promise<Settings> {
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('settings', 'readonly')
    const store = transaction.objectStore('settings')
    const request = store.get('settings')
    request.onsuccess = () => {
      resolve(request.result?.value || DEFAULT_SETTINGS)
    }
    request.onerror = () => reject(request.error)
  })
}

export async function saveSettings(settings: Partial<Settings>): Promise<void> {
  const current = await getSettings()
  const updated = { ...current, ...settings }
  const db = await getDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('settings', 'readwrite')
    const store = transaction.objectStore('settings')
    const request = store.put({ key: 'settings', value: updated })
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

// Blob operations for images
export interface BlobEntry {
  id: string
  file: Blob
  mimeType: string
  name: string
}

export async function saveBlob(blob: BlobEntry): Promise<void> {
  return putToStore('blobs', blob)
}

export async function getBlob(id: string): Promise<BlobEntry | undefined> {
  return getFromStore<BlobEntry>('blobs', id)
}

export async function deleteBlob(id: string): Promise<void> {
  return deleteFromStore('blobs', id)
}

// Build tree structure
export interface TreeItem {
  id: string
  name: string
  type: 'file' | 'folder'
  parentId: string | null
  order: number
  children?: TreeItem[]
}

export async function buildFileTree(parentId: string | null = null): Promise<TreeItem[]> {
  const [files, folders] = await Promise.all([
    getFilesByParent(parentId),
    getFoldersByParent(parentId),
  ])

  const items: TreeItem[] = [
    ...folders.map((f) => ({
      id: f.id,
      name: f.name,
      type: 'folder' as const,
      parentId: f.parentId,
      order: f.order,
    })),
    ...files.map((f) => ({
      id: f.id,
      name: f.name,
      type: 'file' as const,
      parentId: f.parentId,
      order: f.order,
    })),
  ]

  // Sort by order
  items.sort((a, b) => a.order - b.order)

  // Recursively build children for folders
  for (const item of items) {
    if (item.type === 'folder') {
      item.children = await buildFileTree(item.id)
    }
  }

  return items
}
