'use client'

import { MoveVertical } from 'lucide-react'
import { Item } from '../render/primitives'
import type { LayoutProps, SectionDefinition } from './types'

export interface SpacerContent {
    /** Height in px on computers; phones get two thirds. */
    height: number
}

const Gap = ({ c, children }: { c: SpacerContent; children?: React.ReactNode }) => (
    <div aria-hidden className="flex items-center justify-center [height:calc(var(--aa-gap)*0.66)] @3xl:[height:var(--aa-gap)]" style={{ ['--aa-gap' as string]: `${Math.min(400, Math.max(8, c.height || 64))}px` }}>{children}</div>
)

const LAYOUTS: React.ComponentType<LayoutProps<SpacerContent>>[] = [
    ({ content: c }) => <Gap c={c} />,
    ({ content: c }) => <Gap c={c}><Item className="h-px w-full" style={{ background: 'var(--s-border)' }}>{null}</Item></Gap>,
    ({ content: c }) => <Gap c={c}><Item className="h-[3px] w-16 rounded-full" style={{ background: 'var(--s-accent)' }}>{null}</Item></Gap>,
    ({ content: c }) => <Gap c={c}><Item className="flex gap-2">{[0, 1, 2].map(i => <span key={i} className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--s-accent)' }} />)}</Item></Gap>,
]

export const SpacerSection: SectionDefinition<SpacerContent> = {
    type: 'Spacer',
    label: 'Spacer',
    description: 'Room between two sections, with an optional line or dots.',
    icon: MoveVertical,
    wireframeId: 'spacer',
    textRoles: [],
    fields: [{ kind: 'number', key: 'height', label: 'Height (px)', min: 8, max: 400, step: 8, help: 'Phones get two thirds of this.' }],
    defaultContent: { height: 64 },
    layouts: LAYOUTS,
    defaultStyle: { spacing: { top: 'none', bottom: 'none', width: 'wide', shadow: false, border: false, dividerTop: 'none', dividerBottom: 'none' } },
    defaultAnimation: { entrance: 'none' },
}
