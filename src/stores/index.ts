// DB core
export {
  initDB,
  getDB,
  generateFileId,
  generateFolderId,
  buildFileTree,
  type FileNode,
  type FolderNode,
  type Settings,
  type TreeNode,
  type TreeItem,
  type BlobEntry,
} from './db'

// File operations
export {
  createFile,
  updateFile,
  deleteFile,
  getFileById,
  getFilesInFolder,
  getAllFilesSorted,
  moveFile,
  renameFile,
  type CreateFileOptions,
  type UpdateFileOptions,
} from './fileStore'

// Folder operations
export {
  createFolder,
  updateFolder,
  deleteFolder,
  getFolderById,
  getFoldersInFolder,
  getAllFoldersSorted,
  moveFolder,
  renameFolder,
  getFolderTree,
  reorderFoldersInParent,
  type CreateFolderOptions,
  type UpdateFolderOptions,
} from './folderStore'

// Settings operations
export {
  getThemeSetting,
  setThemeSetting,
  getSidebarWidth,
  setSidebarWidth,
  getOutlineWidth,
  setOutlineWidth,
  getSplitRatio,
  setSplitRatio,
  getExpandedFolders,
  setExpandedFolders,
  toggleFolderExpanded,
  getLastOpenedFileId,
  setLastOpenedFileId,
  getRecentFiles,
  addRecentFile,
  getAllSettings,
  updateSettings,
  type ThemeSetting,
} from './settingsStore'
