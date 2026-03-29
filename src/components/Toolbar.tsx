import { useState, useRef, useEffect, useCallback } from 'react'
import {
  Bold,
  Italic,
  Heading,
  Quote,
  Code,
  Link,
  Columns,
  FileText,
  Eye,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react'

type ViewMode = 'split' | 'edit' | 'preview'
type Theme = 'light' | 'dark' | 'system'

interface ToolbarProps {
  viewMode: ViewMode
  onViewModeChange: () => void
  theme: Theme
  onThemeChange: (theme: Theme) => void
  onInsert: (before: string, after: string, placeholder: string) => void
}

interface TooltipState {
  visible: boolean
  text: string
  x: number
  y: number
}

export function Toolbar({
  viewMode,
  onViewModeChange,
  theme,
  onThemeChange,
  onInsert,
}: ToolbarProps) {
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, text: '', x: 0, y: 0 })
  const tooltipTimeoutRef = useRef<number | null>(null)

  const showTooltip = useCallback((text: string, e: React.MouseEvent) => {
    tooltipTimeoutRef.current = window.setTimeout(() => {
      setTooltip({
        visible: true,
        text,
        x: e.clientX,
        y: e.clientY,
      })
    }, 400)
  }, [])

  const hideTooltip = useCallback(() => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current)
      tooltipTimeoutRef.current = null
    }
    setTooltip(prev => ({ ...prev, visible: false }))
  }, [])

  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current)
      }
    }
  }, [])

  const handleBold = useCallback(() => onInsert('**', '**', 'bold'), [onInsert])
  const handleItalic = useCallback(() => onInsert('*', '*', 'italic'), [onInsert])
  const handleHeading = useCallback(() => onInsert('# ', '', 'Heading'), [onInsert])
  const handleQuote = useCallback(() => onInsert('> ', '', 'Quote'), [onInsert])
  const handleCode = useCallback(() => onInsert('`', '`', 'code'), [onInsert])
  const handleLink = useCallback(() => onInsert('[', '](url)', 'link text'), [onInsert])

  const buttons = [
    { icon: Bold, action: handleBold, tooltip: 'Bold (Cmd+B)', label: 'Bold' },
    { icon: Italic, action: handleItalic, tooltip: 'Italic (Cmd+I)', label: 'Italic' },
    { icon: Heading, action: handleHeading, tooltip: 'Heading (Cmd+Shift+1)', label: 'Heading' },
    { icon: Quote, action: handleQuote, tooltip: 'Quote (Cmd+Shift+Q)', label: 'Quote' },
    { icon: Code, action: handleCode, tooltip: 'Code (Cmd+` )', label: 'Code' },
    { icon: Link, action: handleLink, tooltip: 'Link (Cmd+K)', label: 'Link' },
  ]

  const viewModes: { icon: typeof Columns; mode: ViewMode; tooltip: string }[] = [
    { icon: Columns, mode: 'split', tooltip: 'Split View' },
    { icon: FileText, mode: 'edit', tooltip: 'Edit Only' },
    { icon: Eye, mode: 'preview', tooltip: 'Preview Only' },
  ]

  const themeIcons: { icon: typeof Sun; value: Theme; tooltip: string }[] = [
    { icon: Sun, value: 'light', tooltip: 'Light Mode' },
    { icon: Moon, value: 'dark', tooltip: 'Dark Mode' },
    { icon: Monitor, value: 'system', tooltip: 'System' },
  ]

  return (
    <>
      <header
        style={{
          height: 'var(--toolbar-height)',
          background: 'rgba(var(--bg-primary-rgb, 255, 255, 255), 0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          position: 'relative',
          zIndex: 100,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {buttons.map(({ icon: Icon, action, tooltip: btnTooltip, label }) => (
            <button
              key={label}
              onClick={action}
              onMouseEnter={e => showTooltip(btnTooltip, e)}
              onMouseLeave={hideTooltip}
              aria-label={label}
              style={{
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: 'none',
                borderRadius: '6px',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'background 150ms, color 150ms',
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = 'var(--bg-secondary)'
                e.currentTarget.style.color = 'var(--text-primary)'
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = 'var(--text-secondary)'
              }}
            >
              <Icon size={18} />
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {themeIcons.map(({ icon: Icon, value, tooltip: themeTooltip }) => (
            <button
              key={value}
              onClick={() => onThemeChange(value)}
              onMouseEnter={e => showTooltip(themeTooltip, e)}
              onMouseLeave={hideTooltip}
              aria-label={themeTooltip}
              style={{
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: theme === value ? 'var(--accent)' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                color: theme === value ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'background 150ms, color 150ms',
              }}
              onMouseOver={e => {
                if (theme !== value) {
                  e.currentTarget.style.background = 'var(--bg-secondary)'
                }
              }}
              onMouseOut={e => {
                if (theme !== value) {
                  e.currentTarget.style.background = 'transparent'
                }
              }}
            >
              <Icon size={16} />
            </button>
          ))}
          <div
            style={{
              width: '1px',
              height: '20px',
              background: 'var(--border-color)',
              margin: '0 8px',
            }}
          />
          {viewModes.map(({ icon: Icon, mode, tooltip: modeTooltip }) => (
            <button
              key={mode}
              onClick={onViewModeChange}
              onMouseEnter={e => showTooltip(modeTooltip, e)}
              onMouseLeave={hideTooltip}
              aria-label={modeTooltip}
              style={{
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: viewMode === mode ? 'var(--accent)' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                color: viewMode === mode ? '#fff' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'background 150ms, color 150ms',
              }}
              onMouseOver={e => {
                if (viewMode !== mode) {
                  e.currentTarget.style.background = 'var(--bg-secondary)'
                }
              }}
              onMouseOut={e => {
                if (viewMode !== mode) {
                  e.currentTarget.style.background = 'transparent'
                }
              }}
            >
              <Icon size={18} />
            </button>
          ))}
        </div>
      </header>

      {tooltip.visible && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y - 40,
            transform: 'translateX(-50%)',
            background: 'var(--bg-tertiary)',
            color: 'var(--text-primary)',
            padding: '6px 10px',
            borderRadius: '6px',
            fontSize: '12px',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 1000,
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          }}
        >
          {tooltip.text}
        </div>
      )}
    </>
  )
}
