import { memo } from 'react'
import { WIREFRAME_SECTIONS } from '../wireframes'

const BY_ID = Object.fromEntries(WIREFRAME_SECTIONS.map(s => [s.id, s]))

export const wireframeSection = (id: string) => BY_ID[id]

/** A layout's thumbnail from the approved catalog (160×100). Static markup we generate, not user input. */
export const Wireframe = memo(function Wireframe({ section, layout }: { section: string; layout: number }) {
    const l = BY_ID[section]?.layouts[layout - 1]
    if (!l) return null
    return <svg viewBox="0 0 160 100" className="bld-wf" aria-hidden="true" dangerouslySetInnerHTML={{ __html: l.draw() }} />
})
