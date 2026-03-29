import { useEffect, useRef, useCallback } from 'react'
import { updateFile } from '../stores/fileStore'

const DEBOUNCE_MS = 500

export function useAutoSave(fileId: string | null, content: string, isDirty: boolean) {
  const timeoutRef = useRef<number | null>(null)
  const lastSavedRef = useRef<string>(content)
  const pendingSaveRef = useRef<boolean>(false)

  const save = useCallback(async () => {
    if (!fileId || content === lastSavedRef.current) return

    try {
      await updateFile({ id: fileId, content })
      lastSavedRef.current = content
      pendingSaveRef.current = false
    } catch (error) {
      console.error('Auto-save failed:', error)
    }
  }, [fileId, content])

  useEffect(() => {
    if (!fileId || !isDirty || content === lastSavedRef.current) return

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = window.setTimeout(() => {
      save()
    }, DEBOUNCE_MS)

    pendingSaveRef.current = true

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [fileId, content, isDirty, save])

  // Save on unmount or beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (pendingSaveRef.current && fileId) {
        // Sync save for beforeunload
        const payload = { id: fileId, content: lastSavedRef.current }
        navigator.sendBeacon?.('/api/save', JSON.stringify(payload))
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [fileId, content])

  // Force save when fileId changes (switching files)
  const flush = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    if (pendingSaveRef.current) {
      await save()
    }
  }, [save])

  return { flush }
}
