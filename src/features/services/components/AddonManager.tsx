'use client'

import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown } from 'lucide-react'
import { AddonData } from '../types'
import { formatPrice } from '../utils'

interface AddonManagerProps {
    addons: AddonData[]
    onCreateAddon: () => void
    onEditAddon: (addon: AddonData) => void
}

export function AddonManager({ addons, onCreateAddon, onEditAddon }: AddonManagerProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline">
                    Service Add-ons
                    <ChevronDown className="ml-2 size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <div className="p-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start"
                        onClick={onCreateAddon}
                    >
                        + Create Add-on
                    </Button>
                </div>
                <DropdownMenuSeparator />
                {addons.length === 0 ? (
                    <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                        No add-ons yet
                    </div>
                ) : (
                    addons.map((addon) => (
                        <DropdownMenuItem
                            key={addon.id}
                            className="flex justify-between items-center cursor-pointer"
                            onClick={() => onEditAddon(addon)}
                        >
                            <span className="text-sm">{addon.name}</span>
                            <span className="text-xs text-muted-foreground">{formatPrice(addon.price)}</span>
                        </DropdownMenuItem>
                    ))
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
