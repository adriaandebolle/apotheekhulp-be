'use client'

import { useState } from 'react'

interface Tab {
  key: string
  label: string
}

interface TabsProps {
  tabs: Tab[]
  children: (activeKey: string) => React.ReactNode
  defaultKey?: string
}

export function Tabs({ tabs, children, defaultKey }: TabsProps) {
  const [active, setActive] = useState(defaultKey ?? tabs[0]?.key)

  return (
    <div>
      <div className="flex border-b border-border">
        {tabs.map(tab => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActive(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px ${
              active === tab.key
                ? 'border-primary text-primary'
                : 'border-transparent text-text-muted hover:text-text'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="pt-4">
        {children(active)}
      </div>
    </div>
  )
}
