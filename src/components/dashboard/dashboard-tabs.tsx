'use client'

import { useState } from 'react'

interface Tab {
  id: string
  label: string
}

interface Props {
  tabs: Tab[]
  children: React.ReactNode[]
}

export function DashboardTabs({ tabs, children }: Props) {
  const [active, setActive] = useState(tabs[0].id)
  const idx = tabs.findIndex((t) => t.id === active)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Tab bar */}
      <div
        style={{
          display: 'flex',
          gap: '4px',
          background: 'var(--pz-surface)',
          border: '1px solid var(--pz-border)',
          borderRadius: 'var(--pz-radius-pill)',
          padding: '4px',
          alignSelf: 'flex-start',
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            style={{
              padding: '6px 18px',
              borderRadius: 'var(--pz-radius-pill)',
              border: 'none',
              background: active === tab.id ? 'var(--pz-grad-primary)' : 'transparent',
              color: active === tab.id ? '#fff' : 'var(--pz-fg-3)',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all var(--pz-dur-base)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Active panel */}
      <div>{children[idx]}</div>
    </div>
  )
}
