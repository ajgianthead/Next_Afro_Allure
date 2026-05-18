'use client'

import { Info } from 'lucide-react'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'

export function InfoTooltip({ text }: { text: string }) {
    return (
        <TooltipProvider delayDuration={100}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <span className="inline-flex items-center cursor-default">
                        <Info size={11} style={{ color: '#B8B0A8' }} />
                    </span>
                </TooltipTrigger>
                <TooltipContent
                    className="max-w-[200px] text-center text-[12px] leading-snug bg-white border shadow-sm"
                    style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E8E2D6',
                        color: '#1A1818',
                        fontFamily: 'Inter, sans-serif',
                    }}
                >
                    {text}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
