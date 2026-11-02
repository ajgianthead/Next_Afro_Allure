'use client'

import { Lock } from 'lucide-react'
import type { SectionDefinition } from '../sections/types'
import { BASIC_LAYOUT_MAX, layoutTier } from '../types'
import { useEditor } from './EditorContext'
import { Wireframe, wireframeSection } from './Wireframe'

/** The section's 20 layouts as big cards. Starter can try a Growth layout here; publishing it needs Growth. */
export function LayoutTab({ def, layout, setLayout }: { def: SectionDefinition; layout: number; setLayout: (n: number) => void }) {
    const { plan } = useEditor()
    const wf = wireframeSection(def.wireframeId)
    const count = Math.max(def.layouts.length, 1)
    const starter = plan !== 'GROWTH'
    return (
        <div className="grid gap-3 p-3.5">
            {starter && layoutTier(layout) === 'pro' && <ProNotice what="This layout" />}
            <p className="bld-help">
                {starter
                    ? `Layouts 1–${BASIC_LAYOUT_MAX} come with every plan. The rest are Growth layouts: try them here, and upgrade to publish them.`
                    : 'Every layout keeps your text, photos and colors.'}
            </p>
            <div className="grid grid-cols-2 gap-2.5">
                {Array.from({ length: count }, (_, i) => i + 1).map(n => {
                    const pro = layoutTier(n) === 'pro'
                    const meta = wf?.layouts[n - 1]
                    return (
                        <button key={n} type="button" className="bld-card" aria-pressed={n === layout} data-locked={starter && pro ? '' : undefined}
                            title={meta?.desc} onClick={() => setLayout(n)}>
                            <Wireframe section={def.wireframeId} layout={n} />
                            <span className="bld-card-name">{n}. {meta?.name ?? `Layout ${n}`}</span>
                            {pro && <span className="bld-tag" data-pro="">{starter && <Lock size={8} className="mr-0.5 inline" />}Growth</span>}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}

export function ProNotice({ what }: { what: string }) {
    const { askUpgrade } = useEditor()
    return (
        <div className="flex items-start gap-2 rounded-lg p-2.5 text-[12px]" style={{ background: 'var(--b-coral-soft)', border: '1px solid #f6c2be' }}>
            <Lock size={14} className="mt-px flex-none" style={{ color: 'var(--b-coral)' }} />
            <span>
                {what} is part of Growth. You can keep editing; to publish it,{' '}
                <button type="button" className="font-semibold underline" style={{ color: 'var(--b-coral)' }} onClick={() => askUpgrade(what)}>upgrade to Growth</button>.
            </span>
        </div>
    )
}
