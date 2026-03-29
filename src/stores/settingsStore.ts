import { Settings, getSettings, saveSettings } from './db'

export type ThemeSetting = 'light' | 'dark' | 'system'

export async function getThemeSetting(): Promise<ThemeSetting> {
  const settings = await getSettings()
  return settings.theme
}

export async function setThemeSetting(theme: ThemeSetting): Promise<void> {
  await saveSettings({ theme })
}

export async function getSidebarWidth(): Promise<number> {
  const settings = await getSettings()
  return settings.sidebarWidth
}

export async function setSidebarWidth(width: number): Promise<void> {
  await saveSettings({ sidebarWidth: width })
}

export async function getOutlineWidth(): Promise<number> {
  const settings = await getSettings()
  return settings.outlineWidth
}

export async function setOutlineWidth(width: number): Promise<void> {
  await saveSettings({ outlineWidth: width })
}

export async function getSplitRatio(): Promise<number> {
  const settings = await getSettings()
  return settings.splitRatio
}

export async function setSplitRatio(ratio: number): Promise<void> {
  await saveSettings({ splitRatio: Math.max(0.2, Math.min(0.8, ratio)) })
}

export async function getExpandedFolders(): Promise<string[]> {
  const settings = await getSettings()
  return settings.expandedFolders
}

export async function setExpandedFolders(folders: string[]): Promise<void> {
  await saveSettings({ expandedFolders: folders })
}

export async function toggleFolderExpanded(folderId: string): Promise<string[]> {
  const settings = await getSettings()
  const expanded = new Set(settings.expandedFolders)

  if (expanded.has(folderId)) {
    expanded.delete(folderId)
  } else {
    expanded.add(folderId)
  }

  const newExpanded = Array.from(expanded)
  await saveSettings({ expandedFolders: newExpanded })
  return newExpanded
}

export async function getLastOpenedFileId(): Promise<string | null> {
  const settings = await getSettings()
  return settings.lastOpenedFileId
}

export async function setLastOpenedFileId(fileId: string | null): Promise<void> {
  await saveSettings({ lastOpenedFileId: fileId })
}

export async function getRecentFiles(): Promise<string[]> {
  const settings = await getSettings()
  return settings.recentFiles
}

export async function addRecentFile(fileId: string): Promise<string[]> {
  const settings = await getSettings()
  const recent = settings.recentFiles.filter((id) => id !== fileId)
  recent.unshift(fileId)

  // Keep only the last 20
  const newRecent = recent.slice(0, 20)
  await saveSettings({ recentFiles: newRecent })
  return newRecent
}

export async function getAllSettings(): Promise<Settings> {
  return getSettings()
}

export async function updateSettings(partial: Partial<Settings>): Promise<Settings> {
  await saveSettings(partial)
  return getSettings()
}
