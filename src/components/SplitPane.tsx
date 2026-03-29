import { type ReactNode } from 'react'

interface SplitPaneProps {
  left: ReactNode
  right: ReactNode
  ratio: number
  isSplit: boolean
  containerRef: React.RefObject<HTMLDivElement>
  onDividerMouseDown: (e: React.MouseEvent) => void
}

export function SplitPane({
  left,
  right,
  ratio,
  isSplit,
  containerRef,
  onDividerMouseDown,
}: SplitPaneProps) {
  if (!isSplit) {
    return (
      <div
        ref={containerRef as React.RefObject<HTMLDivElement>}
        style={{
          display: 'flex',
          height: '100%',
          width: '100%',
        }}
      >
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
          {left}
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        height: '100%',
        width: '100%',
      }}
    >
      <div
        style={{
          width: `${ratio * 100}%`,
          overflow: 'hidden',
          display: 'flex',
          flexShrink: 0,
        }}
      >
        {left}
      </div>

      <div
        onMouseDown={onDividerMouseDown}
        style={{
          width: '4px',
          cursor: 'col-resize',
          background: 'var(--border-subtle)',
          flexShrink: 0,
          position: 'relative',
          transition: 'background 150ms',
        }}
        onMouseOver={e => {
          e.currentTarget.style.background = 'var(--accent)'
        }}
        onMouseOut={e => {
          e.currentTarget.style.background = 'var(--border-subtle)'
        }}
      />

      <div
        style={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
        }}
      >
        {right}
      </div>
    </div>
  )
}
