'use client'

import { ReactNode } from 'react'

interface Props {
  children: ReactNode
  ariaLabel: string
  style?: React.CSSProperties
}

export function DemoCard({ children, ariaLabel, style }: Props) {
  return (
    <div
      role="img"
      aria-label={ariaLabel}
      style={{
        background: '#FFFFFF',
        borderRadius: 16,
        border: '1px solid #E8E2D6',
        padding: 24,
        boxShadow: '0 2px 20px rgba(0,0,0,0.06)',
        width: '100%',
        aspectRatio: '4 / 3',
        overflow: 'hidden',
        position: 'relative',
        maxWidth: 480,
        boxSizing: 'border-box',
        ...style,
      }}
    >
      <div aria-hidden="true" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  )
}
