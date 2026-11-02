'use client'

import { useState } from 'react'
import { Palette, X } from 'lucide-react'
import { AnimationTab } from './AnimationTab'
import { usePuck } from './EditorContext'
import { LayoutTab } from './LayoutTab'
import { PropertiesTab } from './PropertiesTab'
import { ThemePanel } from './ThemePanel'
import { useSelectedSection } from './useSection'

type Tab = 'properties' | 'layout' | 'animation'
const TABS: { id: Tab; label: string }[] = [{ id: 'properties', label: 'Properties' }, { id: 'layout', label: 'Layout' }, { id: 'animation', label: 'Animation' }]

/** The right panel: the selected section's three tabs, or the site theme when nothing is selected. */
export function Inspector({ onClose }: { onClose?: () => void }) {
    const [tab, setTab] = useState<Tab>('properties')
    const { item, def, props, setContent, setStyle, setAnimation, setLayout } = useSelectedSection()
    const dispatch = usePuck(s => s.dispatch)
    const deselect = () => dispatch({ type: 'setUi', ui: { itemSelector: null } })

    if (!item || !def || !props) {
        return (
            <div className="flex h-full min-h-0 flex-col">
                <header className="flex items-center gap-2 px-3.5 py-3" style={{ borderBottom: '1px solid var(--b-line)' }}>
                    <Palette size={16} style={{ color: 'var(--b-coral)' }} />
                    <h2 className="flex-1 text-[14px] font-semibold">Site look</h2>
                    {onClose && <button type="button" className="bld-icon-btn" aria-label="Close" onClick={onClose}><X size={16} /></button>}
                </header>
                <p className="px-3.5 pt-3 text-[12px]" style={{ color: 'var(--b-muted)' }}>Click a section on the page to edit it.</p>
                <div className="min-h-0 flex-1 overflow-y-auto"><ThemePanel /></div>
            </div>
        )
    }

    const Icon = def.icon
    return (
        <div className="flex h-full min-h-0 flex-col">
            <header className="flex items-center gap-2 px-3.5 pt-3" >
                <Icon size={16} style={{ color: 'var(--b-coral)' }} />
                <h2 className="flex-1 text-[14px] font-semibold">{def.label}</h2>
                <button type="button" className="bld-icon-btn" title="Site look" aria-label="Done, show the site look" onClick={() => { deselect(); onClose?.() }}><X size={16} /></button>
            </header>
            <div role="tablist" aria-label="Section settings" className="flex gap-1 px-3 pt-2" style={{ borderBottom: '1px solid var(--b-line)' }}>
                {TABS.map(t => (
                    <button key={t.id} role="tab" type="button" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
                        className="-mb-px flex-1 px-2 py-2 text-[12.5px] font-semibold"
                        style={{ borderBottom: `2px solid ${tab === t.id ? 'var(--b-coral)' : 'transparent'}`, color: tab === t.id ? 'var(--b-ink)' : 'var(--b-muted)' }}>
                        {t.label}
                    </button>
                ))}
            </div>
            <div role="tabpanel" className="min-h-0 flex-1 overflow-y-auto">
                {tab === 'properties' && <PropertiesTab def={def} props={props} setContent={setContent} setStyle={setStyle} />}
                {tab === 'layout' && <LayoutTab def={def} layout={props.layout} setLayout={setLayout} />}
                {tab === 'animation' && <AnimationTab id={(item.props as { id: string }).id} animation={props.animation} setAnimation={setAnimation} />}
            </div>
        </div>
    )
}
