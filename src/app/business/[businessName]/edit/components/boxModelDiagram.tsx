'use client'

import React, { useState } from 'react'
import { usePropsUpdater } from './compoundFields'

// A small interactive CSS box-model diagram (margin → border → padding →
// content), matching the DevTools-style mental model stylists already know
// from other tools. Purely visual + hover feedback — the numbers it shows
// come straight from the same props the Padding/Margin/Border fields edit,
// so it never drifts out of sync with them.

type Region = 'margin' | 'border' | 'padding' | 'content'

function regionLabel(r: Region) {
    switch (r) {
        case 'margin': return 'Margin — space outside the element'
        case 'border': return 'Border'
        case 'padding': return 'Padding — space inside the element'
        case 'content': return 'Content'
    }
}

export function BoxModelDiagram() {
    const { props } = usePropsUpdater()
    const [hovered, setHovered] = useState<Region | null>(null)

    const margin = props.marginExpanded === 'true'
        ? { t: props.marginTop, r: props.marginRight, b: props.marginBottom, l: props.marginLeft }
        : { t: props.margin, r: props.margin, b: props.margin, l: props.margin }
    const padding = props.paddingExpanded === 'true'
        ? { t: props.paddingTop, r: props.paddingRight, b: props.paddingBottom, l: props.paddingLeft }
        : { t: props.padding, r: props.padding, b: props.padding, l: props.padding }
    const border = props.borderWidth ?? 0

    const fill = (r: Region) => hovered === r ? '#FFE8E8' : r === 'margin' ? '#F0F4FF' : r === 'padding' ? '#EFFAF0' : '#FFFFFF'
    const stroke = (r: Region) => hovered === r ? '#FC6161' : '#D9D4C8'

    const num = (n: any) => (n == null ? 0 : n)

    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0 8px' }}>
            <svg width={120} height={80} viewBox="0 0 120 80">
                {/* Margin */}
                <rect
                    x={1} y={1} width={118} height={78} rx={4}
                    fill={fill('margin')} stroke={stroke('margin')} strokeWidth={1}
                    onMouseEnter={() => setHovered('margin')} onMouseLeave={() => setHovered(null)}
                    style={{ cursor: 'default' }}
                >
                    <title>{regionLabel('margin')}</title>
                </rect>
                <text x={60} y={11} textAnchor="middle" fontSize={7} fill="#6F6863">{num(margin.t)}</text>
                <text x={60} y={73} textAnchor="middle" fontSize={7} fill="#6F6863">{num(margin.b)}</text>
                <text x={8} y={43} textAnchor="middle" fontSize={7} fill="#6F6863">{num(margin.l)}</text>
                <text x={112} y={43} textAnchor="middle" fontSize={7} fill="#6F6863">{num(margin.r)}</text>

                {/* Border */}
                <rect
                    x={16} y={16} width={88} height={48} rx={3}
                    fill={fill('border')} stroke={stroke('border')} strokeWidth={Math.max(1, Math.min(border, 4))}
                    onMouseEnter={() => setHovered('border')} onMouseLeave={() => setHovered(null)}
                    style={{ cursor: 'default' }}
                >
                    <title>{regionLabel('border')}</title>
                </rect>

                {/* Padding */}
                <rect
                    x={22} y={21} width={76} height={38}
                    fill={fill('padding')} stroke={stroke('padding')} strokeWidth={1}
                    onMouseEnter={() => setHovered('padding')} onMouseLeave={() => setHovered(null)}
                    style={{ cursor: 'default' }}
                >
                    <title>{regionLabel('padding')}</title>
                </rect>
                <text x={60} y={29} textAnchor="middle" fontSize={7} fill="#6F6863">{num(padding.t)}</text>
                <text x={60} y={56} textAnchor="middle" fontSize={7} fill="#6F6863">{num(padding.b)}</text>
                <text x={30} y={43} textAnchor="middle" fontSize={7} fill="#6F6863">{num(padding.l)}</text>
                <text x={90} y={43} textAnchor="middle" fontSize={7} fill="#6F6863">{num(padding.r)}</text>

                {/* Content */}
                <rect
                    x={40} y={33} width={40} height={14} rx={2}
                    fill="#F5F6F8" stroke="#D9D4C8" strokeWidth={1}
                    onMouseEnter={() => setHovered('content')} onMouseLeave={() => setHovered(null)}
                    style={{ cursor: 'default' }}
                >
                    <title>{regionLabel('content')}</title>
                </rect>
            </svg>
        </div>
    )
}
