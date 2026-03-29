import { useState, useCallback, useRef, useEffect } from 'react'

type ViewMode = 'split' | 'edit' | 'preview'

const STORAGE_KEY = 'markflow-split-ratio'
const MIN_RATIO = 0.2
const MAX_RATIO = 0.8

function getStoredRatio(): number {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    const ratio = parseFloat(stored)
    if (ratio >= MIN_RATIO && ratio <= MAX_RATIO) return ratio
  }
  return 0.5
}

interface SplitPaneState {
  viewMode: ViewMode
  splitRatio: number
}

export function useSplitPane() {
  const [state, setState] = useState<SplitPaneState>({
    viewMode: 'split',
    splitRatio: getStoredRatio(),
  })
  const isDraggingRef = useRef(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const setViewMode = useCallback((mode: ViewMode) => {
    setState(prev => ({ ...prev, viewMode: mode }))
  }, [])

  const cycleViewMode = useCallback(() => {
    setState(prev => {
      const modes: ViewMode[] = ['split', 'edit', 'preview']
      const currentIndex = modes.indexOf(prev.viewMode)
      const nextIndex = (currentIndex + 1) % modes.length
      return { ...prev, viewMode: modes[nextIndex] }
    })
  }, [])

  const setSplitRatio = useCallback((ratio: number) => {
    const clampedRatio = Math.min(MAX_RATIO, Math.max(MIN_RATIO, ratio))
    setState(prev => ({ ...prev, splitRatio: clampedRatio }))
    localStorage.setItem(STORAGE_KEY, String(clampedRatio))
  }, [])

  const handleDividerMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    isDraggingRef.current = true
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    setSplitRatio(ratio)
  }, [setSplitRatio])

  const handleMouseUp = useCallback(() => {
    if (isDraggingRef.current) {
      isDraggingRef.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [])

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  return {
    ...state,
    containerRef,
    setViewMode,
    cycleViewMode,
    setSplitRatio,
    handleDividerMouseDown,
    MIN_RATIO,
    MAX_RATIO,
  }
}
